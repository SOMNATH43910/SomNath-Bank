import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import {
    MessageSquare, Plus, X, Send, RefreshCw, ChevronDown, ChevronUp,
    Clock, CheckCircle2, XCircle, Activity, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════════════════════════
   SPARKLINE — FIX #5: real data, area fill added
══════════════════════════════════════════════════════════════ */
function Sparkline({ data = [], color = '#f59e0b', height = 28, width = 64 }) {
    if (data.length < 2) return null;
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 6) - 3;
        return `${x},${y}`;
    });
    const ptsStr = pts.map(p => p).join(' ');
    const fillPts = `${pts[0]} ${ptsStr} ${width},${height} 0,${height}`;
    return (
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={fillPts} fill={`url(#sg-${color.replace('#', '')})`} />
            <polyline points={ptsStr} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ══════════════════════════════════════════════════════════════
   CONFIG
   FIX #7: 8 categories instead of 7 → grid-cols-4 = 2 full rows
══════════════════════════════════════════════════════════════ */
const CATEGORIES = [
    { value: 'ACCOUNT',     label: 'Account',     emoji: '🏦' },
    { value: 'CARD',        label: 'Card',         emoji: '💳' },
    { value: 'LOAN',        label: 'Loan',         emoji: '💰' },
    { value: 'TRANSACTION', label: 'Transaction',  emoji: '🔄' },
    { value: 'STAFF',       label: 'Staff',        emoji: '👤' },
    { value: 'TECHNICAL',   label: 'Technical',    emoji: '🖥️' },
    { value: 'OTHER',       label: 'Other',        emoji: '📋' },
    { value: 'BRANCH',      label: 'Branch',       emoji: '🏢' },
];

const STATUS_CFG = {
    OPEN:        { label: 'Open',        accent: '#fbbf24', bg: 'rgba(251,191,36,.12)',  border: 'rgba(251,191,36,.3)',  glow: 'rgba(251,191,36,.35)', icon: <Clock        size={13} /> },
    IN_PROGRESS: { label: 'In Progress', accent: '#38bdf8', bg: 'rgba(56,189,248,.12)',  border: 'rgba(56,189,248,.3)',  glow: 'rgba(56,189,248,.35)', icon: <Activity     size={13} /> },
    RESOLVED:    { label: 'Resolved',    accent: '#34d399', bg: 'rgba(52,211,153,.12)',  border: 'rgba(52,211,153,.3)',  glow: 'rgba(52,211,153,.35)', icon: <CheckCircle2 size={13} /> },
    CLOSED:      { label: 'Closed',      accent: '#94a3b8', bg: 'rgba(148,163,184,.1)', border: 'rgba(148,163,184,.25)',glow: 'rgba(148,163,184,.25)',icon: <XCircle      size={13} /> },
};

const EMPTY_FORM = { subject: '', description: '', category: 'ACCOUNT' };

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
const fmtDate = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// handles null, undefined, and "" (FIX for original hasReply logic)
const hasReply = (r) => r && r.trim() !== '';

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Complaints() {
    const { isDark } = useTheme();
    const [complaints, setComplaints] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal,  setShowModal]  = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    /* FIX #8: Escape key closes modal */
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape' && showModal) closeModal(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showModal]);

    useEffect(() => { fetchComplaints(); }, []);

    /* FIX #1: sets loading/refreshing correctly on every fetch */
    const fetchComplaints = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await API.get('/complaints/my');
            setComplaints(res.data);
            // FIX #4: reset expandedId on refresh to avoid stale pointer
            if (isRefresh) setExpandedId(null);
        } catch {
            toast.error('Failed to load complaints!');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    /* FIX #2: X button properly resets form */
    const closeModal = useCallback(() => {
        setShowModal(false);
        setForm(EMPTY_FORM);
    }, []);

    /* FIX #10 + #11: trim before validate, canSubmit drives button disabled state */
    const handleSubmit = async () => {
        const subj = form.subject.trim();
        const desc = form.description.trim();
        if (!subj || subj.length < 5)  { toast.error('Subject too short (min 5 chars)!'); return; }
        if (!desc || desc.length < 10) { toast.error('Description too short (min 10 chars)!'); return; }
        setSubmitting(true);
        try {
            await API.post('/complaints/submit', { ...form, subject: subj, description: desc });
            toast.success('Complaint submitted! ✅');
            closeModal();
            fetchComplaints(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit!');
        } finally {
            setSubmitting(false);
        }
    };

    /* FIX #6: useMemo for all derived stats */
    const stats = useMemo(() => ({
        total:      complaints.length,
        open:       complaints.filter(c => c.status === 'OPEN').length,
        inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved:   complaints.filter(c => c.status === 'RESOLVED').length,
        closed:     complaints.filter(c => c.status === 'CLOSED').length, // FIX #9
    }), [complaints]);

    /* FIX #5: real sparkline data — monthly complaint counts (last 8 months) */
    const spark = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 8 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 7 + i, 1);
            return complaints.filter(c => {
                const cd = new Date(c.createdAt);
                return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
            }).length;
        });
    }, [complaints]);

    const statCards = [
        { label: 'Total',       value: stats.total,      color: '#f59e0b', icon: <MessageSquare size={14} /> },
        { label: 'Open',        value: stats.open,        color: '#fbbf24', icon: <Clock        size={14} /> },
        { label: 'In Progress', value: stats.inProgress,  color: '#38bdf8', icon: <Activity     size={14} /> },
        { label: 'Resolved',    value: stats.resolved,    color: '#34d399', icon: <CheckCircle2 size={14} /> },
    ];

    /* FIX #11: button disabled when form invalid */
    const canSubmit = form.subject.trim().length >= 5 && form.description.trim().length >= 10;

    const sel = CATEGORIES.find(c => c.value === form.category);

    // Theme tokens
    const surface    = isDark ? '#0b1322' : '#ffffff';
    const surfaceAlt = isDark ? '#0d1730' : '#f8faff';
    const border     = isDark ? 'rgba(255,255,255,.07)' : 'rgba(59,130,246,.1)';
    const text       = isDark ? '#e2e8f0' : '#0f172a';
    const muted      = isDark ? '#475569' : '#94a3b8';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Syne:wght@700;800&family=JetBrains+Mono:wght@500;700&display=swap');

                .cmp-root *, .cmp-root *::before, .cmp-root *::after { box-sizing:border-box; }
                .cmp-root { font-family:'Outfit',sans-serif; }
                .syne { font-family:'Syne',sans-serif; }
                .mono { font-family:'JetBrains Mono',monospace; }

                @keyframes cmp-fu    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes cmp-fi    { from{opacity:0} to{opacity:1} }
                @keyframes cmp-dots  { 0%{background-position:0 0} 100%{background-position:26px 26px} }
                @keyframes cmp-scan  { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
                @keyframes cmp-glow  { 0%,100%{opacity:.5} 50%{opacity:1} }
                @keyframes cmp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
                @keyframes cmp-spin  { to{transform:rotate(360deg)} }
                @keyframes cmp-pop   { 0%{transform:scale(0) rotate(-25deg);opacity:0} 65%{transform:scale(1.3) rotate(4deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
                @keyframes cmp-slide { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
                @keyframes cmp-reply { from{opacity:0;transform:translateX(-12px) scale(.97)} to{opacity:1;transform:translateX(0) scale(1)} }
                @keyframes cmp-td    { 0%,80%,100%{transform:scale(.8);opacity:.4} 40%{transform:scale(1.25);opacity:1} }
                @keyframes cmp-grad  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

                .cmp-fu0 { animation:cmp-fu .5s cubic-bezier(.22,1,.36,1) both; }
                .cmp-fu1 { animation:cmp-fu .5s .06s cubic-bezier(.22,1,.36,1) both; }
                .cmp-fu2 { animation:cmp-fu .5s .12s cubic-bezier(.22,1,.36,1) both; }
                .cmp-fu3 { animation:cmp-fu .5s .18s cubic-bezier(.22,1,.36,1) both; }
                .cmp-fu4 { animation:cmp-fu .5s .24s cubic-bezier(.22,1,.36,1) both; }
                .cmp-pop  { animation:cmp-pop  .4s cubic-bezier(.34,1.56,.64,1) both; }
                .cmp-slide{ animation:cmp-slide .25s ease both; }
                .cmp-reply{ animation:cmp-reply .3s ease both; }
                .cmp-expand{ animation:cmp-slide .25s ease both; }

                .cmp-hero-dots {
                    background-image:radial-gradient(rgba(255,255,255,.035) 1px,transparent 1px);
                    background-size:24px 24px;
                    animation:cmp-dots 12s linear infinite;
                }
                .cmp-scan-line {
                    position:absolute; left:0; right:0; height:2px;
                    background:linear-gradient(90deg,transparent,rgba(245,158,11,.5),transparent);
                    animation:cmp-scan 6s ease-in-out infinite; pointer-events:none;
                }
                .cmp-ambient { animation:cmp-glow 5s ease-in-out infinite; }
                .cmp-float  { animation:cmp-float 3s ease-in-out infinite; }
                .cmp-spin   { animation:cmp-spin  .8s linear infinite; }

                .cmp-stat { transition:transform .25s ease,box-shadow .25s ease; }
                .cmp-stat:hover { transform:translateY(-4px); }
                .cmp-stat:hover .c-stat-icon { animation:cmp-float 1.4s ease-in-out infinite; }

                .cmp-card { transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease; }
                .cmp-card:hover { transform:translateY(-2px); }

                .cmp-cat-btn { transition:transform .18s cubic-bezier(.34,1.56,.64,1),border-color .18s ease,background .18s ease; }
                .cmp-cat-btn:hover { transform:scale(1.05) translateY(-2px); }
                .cmp-cat-btn:active { transform:scale(.97); }

                .cmp-icon-btn { transition:background .2s,color .2s,transform .2s; }
                .cmp-icon-btn:hover { transform:scale(1.08); }

                .cmp-new-btn {
                    transition:transform .2s cubic-bezier(.34,1.56,.64,1),filter .2s,box-shadow .2s;
                }
                .cmp-new-btn:hover { transform:translateY(-3px); filter:brightness(1.1); box-shadow:0 14px 32px rgba(245,158,11,.5) !important; }
                .cmp-new-btn:active { transform:translateY(0); }

                .cmp-submit-btn {
                    background:linear-gradient(135deg,#b45309,#d97706,#f59e0b,#fbbf24);
                    background-size:200% 200%;
                    animation:cmp-grad 3s ease infinite;
                    border:none; cursor:pointer; color:#fff;
                    font-family:'Outfit',sans-serif; font-weight:700;
                    transition:transform .2s,filter .2s,box-shadow .2s;
                }
                .cmp-submit-btn:hover:not(:disabled) {
                    transform:translateY(-3px); filter:brightness(1.08);
                    box-shadow:0 14px 34px rgba(245,158,11,.5);
                }
                .cmp-submit-btn:disabled {
                    opacity:.45; cursor:not-allowed; animation:none;
                    background:${isDark ? '#1e293b' : '#e2e8f0'};
                    color:${muted};
                }

                .cmp-td { animation:cmp-td 1.4s ease-in-out infinite; display:inline-block; }
                .cmp-td:nth-child(2) { animation-delay:.2s; }
                .cmp-td:nth-child(3) { animation-delay:.4s; }

                .cmp-input {
                    width:100%; padding:12px 16px; border-radius:13px;
                    border:1.5px solid ${isDark ? 'rgba(255,255,255,.1)' : 'rgba(59,130,246,.15)'};
                    background:${isDark ? 'rgba(255,255,255,.04)' : '#f8faff'};
                    color:${text}; font-family:'Outfit',sans-serif; font-size:13.5px;
                    outline:none; transition:border-color .2s,box-shadow .2s;
                }
                .cmp-input::placeholder { color:${muted}; }
                .cmp-input:focus {
                    border-color:#f59e0b;
                    box-shadow:0 0 0 3px rgba(245,158,11,.18);
                }

                .cmp-scroll::-webkit-scrollbar { width:4px; }
                .cmp-scroll::-webkit-scrollbar-track { background:transparent; }
                .cmp-scroll::-webkit-scrollbar-thumb { background:rgba(245,158,11,.3); border-radius:4px; }

                .cmp-overlay { animation:cmp-fi .2s ease both; }
                .cmp-modal   { animation:cmp-fu .35s cubic-bezier(.22,1,.36,1) both; }
            `}</style>

            <div className="cmp-root" style={{
                display: 'flex', minHeight: '100vh',
                background: isDark ? '#060d1a' : '#f0f5ff',
                backgroundImage: isDark
                    ? 'radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)'
                    : 'radial-gradient(rgba(59,130,246,.055) 1px,transparent 1px)',
                backgroundSize: '20px 20px',
            }}>
                <Sidebar />
                <main className="cmp-scroll" style={{ flex: 1, padding: '26px 28px', overflowX: 'hidden', overflowY: 'auto' }}>

                    {/* ══ HERO ══════════════════════════════════════════════ */}
                    <div className="cmp-fu0" style={{
                        borderRadius: 28, marginBottom: 20, padding: '28px 30px',
                        background: 'linear-gradient(135deg,#090a12 0%,#130c00 45%,#0b1826 85%,#090a12 100%)',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(4,2,12,.78),0 0 0 1px rgba(245,158,11,.15)',
                    }}>
                        <div className="cmp-hero-dots" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
                        <div className="cmp-scan-line" />
                        <div className="cmp-ambient" style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: 'radial-gradient(ellipse at 12% 65%,rgba(245,158,11,.18) 0%,transparent 52%),' +
                                'radial-gradient(ellipse at 86% 25%,rgba(59,130,246,.14) 0%,transparent 46%)',
                        }} />
                        <div style={{ position: 'absolute', top: -60, right: -40, width: 260, height: 260, borderRadius: '50%', background: 'rgba(245,158,11,.06)', filter: 'blur(50px)', pointerEvents: 'none' }} />

                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                                    <div className="cmp-float" style={{
                                        width: 50, height: 50, borderRadius: 15, flexShrink: 0,
                                        background: 'linear-gradient(135deg,#b45309,#f59e0b)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 8px 26px rgba(245,158,11,.55),inset 0 1px 0 rgba(255,255,255,.18)',
                                    }}>
                                        <MessageSquare size={22} color="#fff" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                                            Grievance Portal
                                        </div>
                                        <div className="syne" style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -.5, lineHeight: 1 }}>
                                            My Complaints
                                        </div>
                                    </div>
                                </div>
                                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.32)', marginBottom: 14, fontWeight: 500 }}>
                                    Submit issues · Track responses · Get resolution
                                </p>

                                {/* FIX #9: shows Closed count too */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                    {[
                                        { label: `${stats.open} Open`,         color: '#fbbf24', pulse: true },
                                        { label: `${stats.inProgress} Active`, color: '#38bdf8', pulse: true },
                                        { label: `${stats.resolved} Resolved`, color: '#34d399', pulse: false },
                                        { label: `${stats.closed} Closed`,     color: '#94a3b8', pulse: false },
                                    ].map((s, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '4px 12px', borderRadius: 20,
                                            background: 'rgba(255,255,255,.06)',
                                            border: '1px solid rgba(255,255,255,.1)',
                                            fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600,
                                        }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0, animation: s.pulse ? 'cmp-glow 2s ease-in-out infinite' : 'none' }} />
                                            {s.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <button className="cmp-icon-btn" onClick={() => fetchComplaints(true)} title="Refresh" style={{
                                    width: 42, height: 42, borderRadius: 13, border: '1px solid rgba(255,255,255,.1)',
                                    background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.55)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <RefreshCw size={16} className={refreshing ? 'cmp-spin' : ''} />
                                </button>
                                <button className="cmp-new-btn" onClick={() => setShowModal(true)} style={{
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    padding: '10px 20px', borderRadius: 13, border: 'none',
                                    background: 'linear-gradient(135deg,#b45309,#f59e0b)',
                                    color: '#fff', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13,
                                    cursor: 'pointer', boxShadow: '0 8px 22px rgba(245,158,11,.4)',
                                }}>
                                    <Plus size={16} /> New Complaint
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ══ STAT CARDS ════════════════════════════════════════ */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                        {statCards.map((sc, i) => (
                            <div key={sc.label} className={`cmp-fu${i + 1} cmp-stat`} style={{
                                padding: '18px 18px 15px', borderRadius: 20,
                                background: surface, border: `1px solid ${border}`,
                                boxShadow: isDark ? '0 4px 18px rgba(0,0,0,.35)' : '0 4px 18px rgba(59,130,246,.06)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div className="c-stat-icon" style={{
                                        width: 34, height: 34, borderRadius: 10,
                                        background: `${sc.color}1a`, border: `1px solid ${sc.color}44`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: sc.color,
                                        boxShadow: `0 4px 12px ${sc.color}30`,
                                    }}>
                                        {sc.icon}
                                    </div>
                                    <Sparkline data={spark} color={sc.color} />
                                </div>
                                <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: text, lineHeight: 1, marginBottom: 4 }}>{sc.value}</div>
                                <div style={{ fontSize: 11.5, color: muted, fontWeight: 600 }}>{sc.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* ══ LIST ══════════════════════════════════════════════ */}
                    <div className="cmp-fu4">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <div className="syne" style={{ fontSize: 17, fontWeight: 800, color: text }}>All Complaints</div>
                            <div style={{ padding: '3px 13px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(59,130,246,.08)', color: muted }}>
                                {stats.total} total
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} style={{ height: 90, borderRadius: 20, background: isDark ? 'rgba(255,255,255,.05)' : 'rgba(59,130,246,.05)', animation: `cmp-glow 1.5s ${i * .15}s ease infinite` }} />
                                ))}
                            </div>
                        ) : complaints.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '56px 20px', borderRadius: 22, background: surface, border: `2px dashed ${border}` }}>
                                <div style={{ width: 62, height: 62, borderRadius: 18, margin: '0 auto 16px', background: isDark ? 'rgba(255,255,255,.05)' : 'rgba(59,130,246,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageSquare size={28} color={muted} />
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: text, marginBottom: 6 }}>No complaints yet</div>
                                <div style={{ fontSize: 13, color: muted, marginBottom: 20 }}>Raise an issue to get help from our team</div>
                                <button className="cmp-new-btn cmp-submit-btn" onClick={() => setShowModal(true)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 13, fontSize: 13 }}>
                                    <Plus size={15} /> Submit Complaint
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {complaints.map((c, idx) => {
                                    const st  = STATUS_CFG[c.status] || STATUS_CFG['OPEN'];
                                    const cat = CATEGORIES.find(x => x.value === c.category);
                                    const isExp = expandedId === c.id;

                                    return (
                                        <div key={c.id} className="cmp-card" style={{
                                            borderRadius: 20, overflow: 'hidden',
                                            background: surface,
                                            border: `1px solid ${isExp ? st.border : border}`,
                                            boxShadow: isExp
                                                ? `0 8px 28px ${st.glow}28`
                                                : isDark ? '0 2px 12px rgba(0,0,0,.3)' : '0 2px 12px rgba(59,130,246,.05)',
                                            animation: `cmp-fu .45s ${idx * .04}s ease both`,
                                        }}>
                                            {/* Header */}
                                            <div style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => setExpandedId(isExp ? null : c.id)}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                                                            background: st.bg, border: `1px solid ${st.border}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.accent,
                                                            boxShadow: `0 4px 12px ${st.glow}28`,
                                                        }}>
                                                            {st.icon}
                                                        </div>
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <div style={{ fontWeight: 700, fontSize: 14, color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                                                                {c.subject}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)', color: muted }}>
                                                                    {cat?.emoji} {cat?.label || c.category}
                                                                </span>
                                                                <span style={{ fontSize: 11, color: muted }}>{fmtDate(c.createdAt)}</span>
                                                            </div>
                                                            <p style={{ fontSize: 12.5, color: muted, marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {c.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 20, background: st.bg, border: `1px solid ${st.border}` }}>
                                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.accent, animation: c.status === 'IN_PROGRESS' ? 'cmp-glow 2s ease-in-out infinite' : 'none' }} />
                                                            <span style={{ fontSize: 11, fontWeight: 700, color: st.accent }}>{st.label}</span>
                                                        </div>
                                                        {hasReply(c.adminReply) && (
                                                            <div className="cmp-pop" style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,.6)' }} title="Admin replied!" />
                                                        )}
                                                        <div style={{ color: muted }}>{isExp ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded chat */}
                                            {isExp && (
                                                <div className="cmp-expand" style={{
                                                    borderTop: `1px solid ${border}`,
                                                    padding: '16px 20px 20px',
                                                    background: isDark ? 'rgba(255,255,255,.012)' : surfaceAlt,
                                                    display: 'flex', flexDirection: 'column', gap: 12,
                                                }}>
                                                    {/* User bubble */}
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <div style={{ maxWidth: '78%' }}>
                                                            <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#38bdf8' : '#0891b2', textAlign: 'right', marginBottom: 5, letterSpacing: .5 }}>YOU</div>
                                                            <div style={{ padding: '12px 16px', borderRadius: '16px 4px 16px 16px', background: isDark ? 'rgba(56,189,248,.1)' : 'rgba(14,165,233,.07)', border: `1px solid ${isDark ? 'rgba(56,189,248,.18)' : 'rgba(14,165,233,.15)'}` }}>
                                                                <p style={{ fontSize: 13, color: text, margin: '0 0 6px', lineHeight: 1.55 }}>{c.description}</p>
                                                                <p style={{ fontSize: 10.5, color: muted, margin: 0 }}>{fmtDate(c.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Admin reply or typing indicator */}
                                                    {hasReply(c.adminReply) ? (
                                                        <div className="cmp-reply" style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                            <div style={{ maxWidth: '78%' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', boxShadow: '0 3px 10px rgba(79,70,229,.45)' }}>A</div>
                                                                    <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? '#a5b4fc' : '#4f46e5', letterSpacing: .5 }}>ADMIN</span>
                                                                    <span style={{ fontSize: 10, color: muted }}>{fmtDate(c.repliedAt)}</span>
                                                                </div>
                                                                <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: isDark ? 'rgba(99,102,241,.1)' : 'rgba(99,102,241,.06)', border: `1px solid ${isDark ? 'rgba(99,102,241,.22)' : 'rgba(99,102,241,.14)'}` }}>
                                                                    <p style={{ fontSize: 13, color: text, margin: 0, lineHeight: 1.55 }}>{c.adminReply}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 16, background: isDark ? 'rgba(255,255,255,.04)' : surfaceAlt, border: `1px solid ${border}` }}>
                                                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: muted }}>A</div>
                                                                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                                    {[0, 1, 2].map(i => <span key={i} className="cmp-td" style={{ width: 7, height: 7, borderRadius: '50%', background: muted, animationDelay: `${i * .2}s` }} />)}
                                                                </div>
                                                                <span style={{ fontSize: 12, color: muted, fontWeight: 500 }}>Admin is reviewing…</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>

                {/* ══ MODAL ═════════════════════════════════════════════════ */}
                {showModal && (
                    <div
                        className="cmp-overlay"
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(7px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
                        onClick={(e) => e.target === e.currentTarget && closeModal()}
                    >
                        <div className="cmp-modal cmp-scroll" style={{
                            width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto',
                            borderRadius: 24, background: surface,
                            border: `1px solid ${border}`,
                            boxShadow: isDark ? '0 30px 80px rgba(0,0,0,.72)' : '0 30px 80px rgba(59,130,246,.13)',
                        }}>
                            {/* Sticky header */}
                            <div style={{
                                padding: '20px 24px 17px',
                                background: isDark ? '#0d1730' : '#f8faff',
                                borderBottom: `1px solid ${border}`,
                                borderRadius: '24px 24px 0 0',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                position: 'sticky', top: 0, zIndex: 1,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#b45309,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(245,158,11,.4)' }}>
                                        <MessageSquare size={17} color="#fff" />
                                    </div>
                                    <div>
                                        <div className="syne" style={{ fontSize: 16, fontWeight: 800, color: text }}>New Complaint</div>
                                        <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>We'll respond within 24 hours</div>
                                    </div>
                                </div>
                                {/* FIX #2: closeModal resets form */}
                                <button onClick={closeModal} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
                                    <X size={17} />
                                </button>
                            </div>

                            <div style={{ padding: '22px 24px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                                {/* Category — FIX #7: 8 items = 4×2 perfect grid */}
                                <div>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: text, marginBottom: 10 }}>Category</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                                        {CATEGORIES.map(cat => {
                                            const active = form.category === cat.value;
                                            return (
                                                <button key={cat.value} type="button" className="cmp-cat-btn"
                                                        onClick={() => setForm({ ...form, category: cat.value })}
                                                        style={{
                                                            padding: '10px 6px', borderRadius: 13, textAlign: 'center',
                                                            border: `2px solid ${active ? '#f59e0b' : border}`,
                                                            /* FIX #3: isDark conditional instead of Tailwind dark: */
                                                            background: active
                                                                ? isDark ? 'rgba(245,158,11,.13)' : 'rgba(245,158,11,.07)'
                                                                : isDark ? 'rgba(255,255,255,.03)' : '#f8faff',
                                                            cursor: 'pointer',
                                                        }}>
                                                    <div style={{ fontSize: 18, marginBottom: 4 }}>{cat.emoji}</div>
                                                    <div style={{ fontSize: 10, fontWeight: 600, color: active ? '#f59e0b' : muted, lineHeight: 1.2 }}>{cat.label}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: text, marginBottom: 8 }}>Subject *</div>
                                    <input className="cmp-input" type="text" value={form.subject}
                                           onChange={e => setForm({ ...form, subject: e.target.value })}
                                           placeholder="e.g. Transaction issue on 5th March"
                                           maxLength={120} />
                                    <div style={{ textAlign: 'right', fontSize: 10.5, color: form.subject.length > 0 && form.subject.trim().length < 5 ? '#f87171' : muted, marginTop: 4 }}>
                                        {form.subject.length} / 120
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: text, marginBottom: 8 }}>Description *</div>
                                    <textarea className="cmp-input" value={form.description}
                                              onChange={e => setForm({ ...form, description: e.target.value })}
                                              placeholder="Describe your issue in detail — the more info you give, the faster we resolve it."
                                              rows={4} style={{ resize: 'vertical', minHeight: 92 }}
                                              maxLength={1000} />
                                    <div style={{ textAlign: 'right', fontSize: 10.5, color: form.description.length > 0 && form.description.trim().length < 10 ? '#f87171' : muted, marginTop: 4 }}>
                                        {form.description.length} / 1000
                                    </div>
                                </div>

                                {/* Live preview */}
                                {canSubmit && (
                                    <div className="cmp-slide" style={{ padding: '13px 15px', borderRadius: 15, background: isDark ? 'rgba(245,158,11,.08)' : 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.22)' }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', letterSpacing: .7, textTransform: 'uppercase', marginBottom: 6 }}>
                                            {sel?.emoji} Preview — {sel?.label}
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: text, marginBottom: 3 }}>{form.subject.trim()}</div>
                                        <div style={{ fontSize: 12, color: muted, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {form.description.trim()}
                                        </div>
                                    </div>
                                )}

                                {/* Submit — FIX #11: disabled when canSubmit false */}
                                <button onClick={handleSubmit} disabled={submitting || !canSubmit}
                                        className="cmp-submit-btn"
                                        style={{ width: '100%', padding: '14px', borderRadius: 15, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    {submitting ? (
                                        <>
                                            <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'cmp-spin .7s linear infinite' }} />
                                            Submitting…
                                        </>
                                    ) : !canSubmit ? (
                                        <><AlertCircle size={15} /> Fill in subject & description</>
                                    ) : (
                                        <><Send size={15} /> Submit Complaint</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}