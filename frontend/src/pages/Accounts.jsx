import { useEffect, useState, useMemo, useCallback, useRef, useId } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import {
    Landmark, Plus, X, Eye, EyeOff, ArrowUpRight, ArrowDownLeft,
    TrendingUp, CreditCard, ShieldCheck, RefreshCw, ChevronRight,
    Wallet, Building2, Zap, Copy, Check, LayoutDashboard, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/* ══════════════════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK — memoized, no re-run on unrelated renders
══════════════════════════════════════════════════════════════════ */
function useAnimatedCounter(target, duration = 1200) {
    const [value, setValue] = useState(0);
    const prev = useRef(0);
    useEffect(() => {
        const from = prev.current;
        prev.current = target;
        if (from === target) return;
        let raf;
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            setValue(Math.round(from + (target - from) * ease));
            if (p < 1) raf = requestAnimationFrame(step);
            else setValue(target);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return value;
}

/* ══════════════════════════════════════════════════════════════════
   SPARKLINE
══════════════════════════════════════════════════════════════════ */
function Sparkline({ data = [], color = '#38bdf8', height = 30, width = 70 }) {
    if (data.length < 2) return null;
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const pts = data.map((v, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((v - min) / range) * (height - 4) - 2,
    }));
    const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
    const fill = `M${pts[0].x},${pts[0].y} ${pts.slice(1).map(p => `L${p.x},${p.y}`).join(' ')} L${width},${height} L0,${height} Z`;
    const uid = color.replace(/[^a-z0-9]/gi, '');
    return (
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={`spk-${uid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity=".35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fill} fill={`url(#spk-${uid})`} />
            <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
            {/* dot at last point */}
            <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2.5" fill={color} />
        </svg>
    );
}

/* ══════════════════════════════════════════════════════════════════
   STATUS CONFIG
══════════════════════════════════════════════════════════════════ */
const STATUS = {
    ACTIVE:  { bg: 'rgba(16,185,129,.15)',  fg: '#34d399', border: 'rgba(52,211,153,.3)',  dot: '#10b981' },
    PENDING: { bg: 'rgba(245,158,11,.14)',  fg: '#fbbf24', border: 'rgba(251,191,36,.3)',  dot: '#f59e0b' },
    BLOCKED: { bg: 'rgba(239,68,68,.14)',   fg: '#f87171', border: 'rgba(248,113,113,.3)', dot: '#ef4444' },
    DEFAULT: { bg: 'rgba(100,116,139,.1)',  fg: '#94a3b8', border: 'rgba(148,163,184,.2)', dot: '#64748b' },
};
const getStatus = s => STATUS[s] || STATUS.DEFAULT;

/* ══════════════════════════════════════════════════════════════════
   LABEL COMPONENT — properly linked with htmlFor
══════════════════════════════════════════════════════════════════ */
function FieldLabel({ htmlFor, children }) {
    return (
        <label htmlFor={htmlFor} style={{
            display: 'block', fontSize: 10.5, fontWeight: 700, marginBottom: 7,
            letterSpacing: 0.8, textTransform: 'uppercase', color: '#64748b',
            fontFamily: "'Outfit', sans-serif", cursor: 'default',
        }}>{children}</label>
    );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function Accounts() {
    const { isDark } = useTheme();
    const navigate   = useNavigate();
    const uid        = useId();

    const [accounts,       setAccounts]       = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [showModal,      setShowModal]      = useState(false);
    const [balVisible,     setBalVisible]     = useState(true);
    const [copiedId,       setCopiedId]       = useState(null);
    const [refreshing,     setRefreshing]     = useState(false);
    const [submitting,     setSubmitting]     = useState(false);
    const [hoveredCard,    setHoveredCard]    = useState(null);
    const [formData,       setFormData]       = useState({ accountType: 'SAVINGS', branchName: '', ifscCode: '' });
    const [formErrors,     setFormErrors]     = useState({});

    /* ── Memoized derived values — FIX #4 ── */
    const totalBalance = useMemo(() => accounts.reduce((s, a) => s + (a.balance || 0), 0), [accounts]);
    const activeCount  = useMemo(() => accounts.filter(a => a.status === 'ACTIVE').length, [accounts]);
    const savingsCount = useMemo(() => accounts.filter(a => a.accountType === 'SAVINGS').length, [accounts]);
    const currentCount = useMemo(() => accounts.filter(a => a.accountType === 'CURRENT').length, [accounts]);

    const animBalance  = useAnimatedCounter(totalBalance);

    /* ── Stable input style via useMemo — FIX #9 ── */
    const inputStyle = useMemo(() => ({
        width: '100%', padding: '11px 14px', borderRadius: 12,
        fontSize: 13, fontFamily: "'Outfit', sans-serif",
        background: isDark ? '#0d1526' : '#f1f5fd',
        border: `1.5px solid ${isDark ? 'rgba(255,255,255,.07)' : 'rgba(59,130,246,.15)'}`,
        color: isDark ? '#e2e8f0' : '#0f172a',
        outline: 'none', transition: 'border-color .2s, box-shadow .2s',
        boxSizing: 'border-box',
    }), [isDark]);

    /* ── Fetch ── */
    const fetchAccounts = useCallback(async () => {
        setRefreshing(true);
        try {
            const r = await API.get('/accounts/my');
            setAccounts(r.data);
        } catch {
            toast.error('Failed to load accounts!');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

    /* ── Validate — FIX #1: proper validation without relying on HTML5 required ── */
    const validate = () => {
        const errs = {};
        if (!formData.branchName.trim()) errs.branchName = 'Branch name is required';
        if (!formData.ifscCode.trim())   errs.ifscCode   = 'IFSC code is required';
        if (formData.ifscCode.trim() && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.trim()))
            errs.ifscCode = 'Invalid IFSC format (e.g. SBIN0001234)';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    /* ── Submit — FIX #1: no e.preventDefault() needed, no form tag ── */
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            await API.post('/accounts/apply', formData);
            toast.success('Account application submitted! 🎉');
            setShowModal(false);
            setFormData({ accountType: 'SAVINGS', branchName: '', ifscCode: '' });
            setFormErrors({});
            fetchAccounts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply for account!');
        } finally {
            setSubmitting(false);  /* FIX #10: always reset */
        }
    };

    /* ── Copy — FIX #5: use id not accountNumber as key ── */
    const handleCopy = useCallback((id, num) => {
        navigator.clipboard.writeText(num.replace(/\s/g, ''));
        setCopiedId(id);
        toast.success('Copied!');
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    /* ── Quick actions with real navigation — FIX #2 ── */
    const quickActions = useMemo(() => [
        { label: 'Transfer',  icon: <ArrowUpRight size={16}/>,   grad: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', glow: 'rgba(99,102,241,.45)', action: () => navigate('/transactions') },
        { label: 'Dashboard', icon: <LayoutDashboard size={16}/>,grad: 'linear-gradient(135deg,#0369a1,#06b6d4)', glow: 'rgba(6,182,212,.40)',  action: () => navigate('/dashboard') },
        { label: 'Cards',     icon: <CreditCard size={16}/>,     grad: 'linear-gradient(135deg,#6d28d9,#db2777)', glow: 'rgba(139,92,246,.40)', action: () => navigate('/cards') },
        { label: 'Loans',     icon: <Building2 size={16}/>,      grad: 'linear-gradient(135deg,#b45309,#dc2626)', glow: 'rgba(245,158,11,.40)', action: () => navigate('/loans') },
        { label: 'KYC',       icon: <ShieldCheck size={16}/>,    grad: 'linear-gradient(135deg,#be185d,#ea580c)', glow: 'rgba(236,72,153,.40)', action: () => navigate('/kyc') },
        { label: 'Statement', icon: <FileText size={16}/>,       grad: 'linear-gradient(135deg,#0e7490,#6366f1)', glow: 'rgba(6,182,212,.40)',  action: () => navigate('/statement') },
    ], [navigate]);

    const statCards = useMemo(() => [
        { label: 'Total Accounts', value: accounts.length, color: '#38bdf8', grad: 'linear-gradient(135deg,#0284c7,#38bdf8)', icon: <Landmark size={15}/>,    spark: [1,2,2,3,2,4,3,5,4,accounts.length||4] },
        { label: 'Active',         value: activeCount,     color: '#34d399', grad: 'linear-gradient(135deg,#059669,#34d399)', icon: <ShieldCheck size={15}/>,  spark: [0,1,1,2,1,2,2,3,2,activeCount||2] },
        { label: 'Savings',        value: savingsCount,    color: '#a78bfa', grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)', icon: <Wallet size={15}/>,       spark: [1,1,2,1,2,2,3,2,3,savingsCount||3] },
        { label: 'Current',        value: currentCount,    color: '#fb923c', grad: 'linear-gradient(135deg,#c2410c,#fb923c)', icon: <TrendingUp size={15}/>,   spark: [0,0,1,0,1,1,2,1,2,currentCount||1] },
    ], [accounts.length, activeCount, savingsCount, currentCount]);

    /* ── Color tokens ── */
    const surface = isDark ? '#0b1322' : '#ffffff';
    const bg      = isDark ? '#060d1a' : '#f0f5ff';
    const border  = isDark ? 'rgba(255,255,255,.06)' : 'rgba(59,130,246,.1)';
    const text     = isDark ? '#e2e8f0' : '#0f172a';
    const muted    = isDark ? '#475569' : '#94a3b8';

    return (
        <>
            {/* ══ GLOBAL STYLES ══════════════════════════════════════════════ */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');

                *, *::before, *::after { box-sizing: border-box; }

                .ac-root { font-family: 'Outfit', sans-serif; }
                .ac-mono  { font-family: 'JetBrains Mono', monospace; }

                /* ── Entry ── */
                @keyframes ac-fadeUp {
                    from { opacity:0; transform:translateY(20px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes ac-slideUp {
                    from { opacity:0; transform:translateY(28px) scale(.96); }
                    to   { opacity:1; transform:translateY(0)   scale(1); }
                }
                @keyframes ac-fadeIn { from{opacity:0} to{opacity:1} }

                /* ── Shimmer balance text ── */
                @keyframes ac-shimmerBal {
                    0%   { background-position:-700px 0; }
                    100% { background-position: 700px 0; }
                }
                /* ── Hero ambient glow ── */
                @keyframes ac-ambientGlow {
                    0%,100% { opacity:.55; } 50% { opacity:.85; }
                }
                /* ── Dot pulse ── */
                @keyframes ac-dotPulse {
                    0%,100% { transform:scale(1); opacity:1; }
                    50%      { transform:scale(1.7); opacity:.5; }
                }
                /* ── Float ── */
                @keyframes ac-floatY {
                    0%,100% { transform:translateY(0); }
                    50%      { transform:translateY(-5px); }
                }
                /* ── Grad shift ── */
                @keyframes ac-gradShift {
                    0%,100% { background-position:0% 50%; }
                    50%      { background-position:100% 50%; }
                }
                /* ── Spin ── */
                @keyframes ac-spin { to { transform:rotate(360deg); } }
                /* ── Check pop ── */
                @keyframes ac-checkPop {
                    0%   { transform:scale(0) rotate(-20deg); opacity:0; }
                    70%  { transform:scale(1.3) rotate(5deg); opacity:1; }
                    100% { transform:scale(1) rotate(0); opacity:1; }
                }
                /* ── Skeleton ── */
                @keyframes ac-skeleton {
                    0%,100% { opacity:.3; } 50% { opacity:.6; }
                }
                /* ── Moving dots bg ── */
                @keyframes ac-moveDots {
                    0%   { background-position: 0 0; }
                    100% { background-position: 24px 24px; }
                }
                /* ── Scan line ── */
                @keyframes ac-scan {
                    0%   { transform:translateY(-100%); }
                    100% { transform:translateY(200%); }
                }

                .ac-fu0 { animation:ac-fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
                .ac-fu1 { animation:ac-fadeUp .5s .07s cubic-bezier(.22,1,.36,1) both; }
                .ac-fu2 { animation:ac-fadeUp .5s .14s cubic-bezier(.22,1,.36,1) both; }
                .ac-fu3 { animation:ac-fadeUp .5s .21s cubic-bezier(.22,1,.36,1) both; }
                .ac-fu4 { animation:ac-fadeUp .5s .28s cubic-bezier(.22,1,.36,1) both; }
                .ac-fu5 { animation:ac-fadeUp .5s .35s cubic-bezier(.22,1,.36,1) both; }

                /* Shimmer balance */
                .ac-shimmer-on {
                    background: linear-gradient(90deg, #fff 0%, #93c5fd 30%, #fff 45%, #c4b5fd 70%, #fff 100%);
                    background-size: 700px auto;
                    -webkit-background-clip: text; background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: ac-shimmerBal 3s linear infinite;
                }
                /* FIX #3: properly reset text fill when hidden */
                .ac-shimmer-off {
                    -webkit-text-fill-color: currentColor;
                    filter: blur(10px);
                    user-select: none;
                    transition: filter .35s ease;
                }

                /* Quick action buttons */
                .ac-qa-btn {
                    transition: transform .25s cubic-bezier(.34,1.56,.64,1), filter .2s, box-shadow .2s;
                }
                .ac-qa-btn:hover  { transform: translateY(-7px) scale(1.07); filter: brightness(1.12); }
                .ac-qa-btn:active { transform: translateY(-2px) scale(.96); }

                /* Account cards — CSS hover, no JS style mutation FIX #7 */
                .ac-acc-card {
                    transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
                    will-change: transform;
                }
                .ac-acc-card:hover {
                    transform: translateY(-4px);
                }

                /* Stat tiles */
                .ac-stat-tile {
                    transition: transform .25s ease, box-shadow .25s ease;
                    overflow: hidden; position: relative;
                }
                .ac-stat-tile::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 60%);
                    opacity: 0; transition: opacity .25s;
                }
                .ac-stat-tile:hover { transform: translateY(-5px); }
                .ac-stat-tile:hover::before { opacity: 1; }
                .ac-stat-tile:hover .ac-stat-icon { animation: ac-floatY 1.4s ease-in-out infinite; }

                /* Submit button */
                .ac-submit {
                    background: linear-gradient(135deg, #1d4ed8, #0891b2, #6366f1);
                    background-size: 200% 200%;
                    animation: ac-gradShift 4s ease infinite;
                    transition: transform .2s, filter .2s, box-shadow .2s;
                    border: none; cursor: pointer; color: #fff;
                    font-family: 'Outfit', sans-serif; font-weight: 700;
                }
                .ac-submit:hover:not(:disabled) {
                    transform: translateY(-3px);
                    filter: brightness(1.1);
                    box-shadow: 0 14px 32px rgba(59,130,246,.42);
                }
                .ac-submit:disabled { opacity: .65; cursor: not-allowed; }

                /* Input focus glow */
                .ac-field-input:focus {
                    outline: none;
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 3px rgba(59,130,246,.18);
                }

                /* Ambient glow animation */
                .ac-glow-anim { animation: ac-ambientGlow 5s ease-in-out infinite; }

                /* Dot bg */
                .ac-dot-bg {
                    background-image: radial-gradient(rgba(255,255,255,.045) 1px, transparent 1px);
                    background-size: 22px 22px;
                    animation: ac-moveDots 10s linear infinite;
                }

                /* Check pop */
                .ac-check-pop { animation: ac-checkPop .35s cubic-bezier(.34,1.56,.64,1) both; }

                /* Skeleton */
                .ac-skel { animation: ac-skeleton 1.5s ease infinite; }

                /* Refreshing spin */
                .ac-spinning { animation: ac-spin .7s linear infinite; }

                /* Scan line on hero */
                .ac-scan-line {
                    position: absolute; left: 0; right: 0; height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(56,189,248,.4), transparent);
                    animation: ac-scan 4s ease-in-out infinite;
                    pointer-events: none;
                }

                /* Error shake */
                @keyframes ac-shake {
                    0%,100%{transform:translateX(0)}
                    20%,60%{transform:translateX(-4px)}
                    40%,80%{transform:translateX(4px)}
                }
                .ac-shake { animation: ac-shake .3s ease; }

                /* Modal overlay */
                @keyframes ac-overlayIn { from{opacity:0} to{opacity:1} }
                .ac-overlay { animation: ac-overlayIn .2s ease both; }
                .ac-modal   { animation: ac-slideUp .35s cubic-bezier(.34,1.2,.64,1) both; }

                /* Scroll bar */
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(99,102,241,.3); border-radius: 4px; }
            `}</style>

            <div className="ac-root" style={{ display: 'flex', minHeight: '100vh', background: bg }}>
                <Sidebar />

                <main style={{ flex: 1, padding: '26px 28px', overflowX: 'hidden', overflowY: 'auto' }}>

                    {/* ══ HERO BANNER ══════════════════════════════════════════════ */}
                    <div className="ac-fu0" style={{
                        borderRadius: 26, marginBottom: 22, padding: '28px 30px',
                        background: 'linear-gradient(135deg, #060d1f 0%, #0d1e40 40%, #1a0a2e 75%, #060d1f 100%)',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(15,23,60,.7), 0 0 0 1px rgba(99,102,241,.18)',
                    }}>
                        {/* Dot grid */}
                        <div className="ac-dot-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
                        {/* Scan line */}
                        <div className="ac-scan-line" />
                        {/* Ambient glows */}
                        <div className="ac-glow-anim" style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: 'radial-gradient(ellipse at 8% 65%, rgba(56,189,248,.18) 0%,transparent 50%),' +
                                'radial-gradient(ellipse at 88% 15%, rgba(167,139,250,.16) 0%,transparent 45%)',
                        }} />
                        <div style={{ position: 'absolute', top: -70, right: -50, width: 250, height: 250, borderRadius: '50%', background: 'rgba(56,189,248,.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', bottom: -40, left: '25%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(167,139,250,.08)', filter: 'blur(30px)', pointerEvents: 'none' }} />

                        <div style={{ position: 'relative', zIndex: 2 }}>
                            {/* Top row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 14,
                                        background: 'linear-gradient(135deg,#1d4ed8,#0891b2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 6px 22px rgba(29,78,216,.5), inset 0 1px 0 rgba(255,255,255,.15)',
                                    }}>
                                        <Landmark size={20} color="#fff" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 2 }}>My Accounts</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                                            {accounts.length} account{accounts.length !== 1 ? 's' : ''} linked
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button onClick={fetchAccounts}
                                            title="Refresh accounts"
                                            style={{
                                                width: 36, height: 36, borderRadius: 11, border: 'none',
                                                background: 'rgba(255,255,255,.08)', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#94a3b8', backdropFilter: 'blur(8px)',
                                                boxShadow: '0 1px 0 rgba(255,255,255,.05) inset',
                                                transition: 'background .2s',
                                            }}>
                                        <RefreshCw size={14} className={refreshing ? 'ac-spinning' : ''} />
                                    </button>
                                    <button onClick={() => setBalVisible(v => !v)} style={{
                                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px',
                                        borderRadius: 11, border: 'none',
                                        background: 'rgba(255,255,255,.08)', cursor: 'pointer',
                                        color: 'rgba(255,255,255,.65)', fontSize: 12, fontWeight: 600,
                                        fontFamily: "'Outfit',sans-serif", backdropFilter: 'blur(8px)',
                                        transition: 'background .2s',
                                    }}>
                                        {balVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                        {balVisible ? 'Hide' : 'Show'}
                                    </button>
                                    <button onClick={() => setShowModal(true)} className="ac-qa-btn" style={{
                                        display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px',
                                        borderRadius: 12, border: '1px solid rgba(255,255,255,.12)', cursor: 'pointer',
                                        background: 'linear-gradient(135deg,#1d4ed8,#0891b2)',
                                        color: '#fff', fontFamily: "'Outfit',sans-serif",
                                        fontWeight: 700, fontSize: 13,
                                        boxShadow: '0 6px 22px rgba(29,78,216,.45)',
                                    }}>
                                        <Plus size={15} /> New Account
                                    </button>
                                </div>
                            </div>

                            {/* Balance */}
                            <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.35)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>
                                    Total Portfolio Balance
                                </div>
                                {/* FIX #3: separate class for shown/hidden, no WebkitTextFillColor conflict */}
                                <div className={balVisible ? 'ac-shimmer-on' : 'ac-shimmer-off'}
                                     style={{
                                         fontFamily: "'Outfit',sans-serif", fontWeight: 900,
                                         fontSize: 44, letterSpacing: -1.5, lineHeight: 1,
                                         color: balVisible ? undefined : 'rgba(255,255,255,.6)',
                                     }}>
                                    ₹{animBalance.toLocaleString('en-IN')}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                    background: 'rgba(16,185,129,.15)', color: '#34d399',
                                    border: '1px solid rgba(52,211,153,.25)',
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'ac-dotPulse 2s infinite' }} />
                                    {activeCount} Active
                                </span>
                                <span style={{ color: 'rgba(255,255,255,.15)' }}>•</span>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', fontWeight: 500 }}>Updated just now</span>
                            </div>

                            {/* Quick Actions — FIX #2: all have real onClick handlers */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 18 }}>
                                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,.25)', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
                                    Quick Actions
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
                                    {quickActions.map((qa, i) => (
                                        <button key={qa.label} onClick={qa.action}
                                                className="ac-qa-btn"
                                                style={{
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                                    padding: '13px 6px', borderRadius: 16, border: 'none', cursor: 'pointer',
                                                    background: qa.grad, color: '#fff',
                                                    boxShadow: `0 6px 18px ${qa.glow}`,
                                                    fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 11,
                                                }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 9,
                                                background: 'rgba(255,255,255,.18)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>{qa.icon}</div>
                                            {qa.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ STAT TILES ═══════════════════════════════════════════════ */}
                    <div className="ac-fu1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 22 }}>
                        {statCards.map((sc, i) => (
                            <div key={sc.label} className="ac-stat-tile" style={{
                                borderRadius: 18, padding: '16px 18px',
                                background: surface,
                                border: `1px solid ${border}`,
                                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.4)' : '0 4px 20px rgba(59,130,246,.06)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <div className="ac-stat-icon" style={{
                                        width: 34, height: 34, borderRadius: 10,
                                        background: sc.grad,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                        boxShadow: `0 4px 12px ${sc.color}50`,
                                    }}>{sc.icon}</div>
                                    <Sparkline data={sc.spark} color={sc.color} width={60} height={26} />
                                </div>
                                <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 24, color: text, marginBottom: 2 }}>
                                    {sc.value}
                                </div>
                                <div style={{ fontSize: 11.5, color: muted, fontWeight: 500 }}>{sc.label}</div>
                                {/* Bottom accent */}
                                <div style={{ marginTop: 10, height: 2, borderRadius: 2, background: `linear-gradient(90deg,${sc.color},transparent)`, opacity: .5 }} />
                            </div>
                        ))}
                    </div>

                    {/* ══ ACCOUNTS LIST ════════════════════════════════════════════ */}
                    <div className="ac-fu2">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 17, color: text, margin: 0 }}>
                                All Accounts
                            </h2>
                            <span style={{
                                padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(59,130,246,.08)', color: muted,
                            }}>{accounts.length} total</span>
                        </div>

                        {/* Skeleton */}
                        {loading && (
                            <div>
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="ac-skel" style={{
                                        height: 88, borderRadius: 18, marginBottom: 10,
                                        background: isDark ? 'rgba(255,255,255,.05)' : 'rgba(59,130,246,.05)',
                                        animationDelay: `${i * .15}s`,
                                    }} />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && accounts.length === 0 && (
                            <div className="ac-fu3" style={{
                                textAlign: 'center', padding: '56px 20px',
                                borderRadius: 22, border: `2px dashed ${border}`,
                                background: isDark ? 'rgba(255,255,255,.01)' : 'rgba(59,130,246,.02)',
                            }}>
                                <div style={{
                                    width: 68, height: 68, borderRadius: 20, margin: '0 auto 16px',
                                    background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(59,130,246,.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Landmark size={30} color={muted} />
                                </div>
                                <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 16, color: text, marginBottom: 5 }}>
                                    No accounts yet
                                </div>
                                <div style={{ fontSize: 13, color: muted, marginBottom: 20 }}>Apply for your first account to get started</div>
                                <button onClick={() => setShowModal(true)} className="ac-submit" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '11px 22px', borderRadius: 14, fontSize: 13,
                                }}>
                                    <Plus size={16} /> Apply Now
                                </button>
                            </div>
                        )}

                        {/* Account cards — FIX #7: CSS hover only, no JS style mutation */}
                        {!loading && accounts.map((acc, idx) => {
                            const sc       = getStatus(acc.status);
                            const isSaving = acc.accountType === 'SAVINGS';
                            const cardGrad = isSaving
                                ? 'linear-gradient(135deg,#1d4ed8,#4f46e5)'
                                : 'linear-gradient(135deg,#7c3aed,#db2777)';
                            const cardGlow = isSaving ? 'rgba(29,78,216,.4)' : 'rgba(124,58,237,.4)';
                            const accentGrad = isSaving
                                ? 'linear-gradient(180deg,#38bdf8,#6366f1)'
                                : 'linear-gradient(180deg,#a78bfa,#ec4899)';

                            return (
                                <div key={acc.id} className="ac-acc-card" style={{
                                    borderRadius: 20, padding: '20px 22px', marginBottom: 10,
                                    background: surface,
                                    border: `1px solid ${hoveredCard === acc.id
                                        ? (isDark ? 'rgba(56,189,248,.25)' : 'rgba(56,189,248,.35)')
                                        : border}`,
                                    boxShadow: hoveredCard === acc.id
                                        ? (isDark ? '0 14px 40px rgba(0,0,0,.45)' : '0 14px 40px rgba(56,189,248,.12)')
                                        : (isDark ? '0 4px 20px rgba(0,0,0,.3)' : '0 4px 20px rgba(59,130,246,.06)'),
                                    position: 'relative', overflow: 'hidden',
                                    animationDelay: `${idx * .07}s`,
                                    animation: 'ac-fadeUp .45s ease both',
                                }}
                                     onMouseEnter={() => setHoveredCard(acc.id)}
                                     onMouseLeave={() => setHoveredCard(null)}
                                >
                                    {/* Left accent bar */}
                                    <div style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                                        background: accentGrad, borderRadius: '20px 0 0 20px',
                                    }} />

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                                        {/* Left: icon + info */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{
                                                width: 50, height: 50, borderRadius: 15, flexShrink: 0,
                                                position: 'relative',
                                                background: cardGrad,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: `0 6px 20px ${cardGlow}`,
                                            }}>
                                                <Landmark size={22} color="#fff" />
                                                {acc.status === 'ACTIVE' && (
                                                    <span style={{
                                                        position: 'absolute', top: -3, right: -3,
                                                        width: 12, height: 12, borderRadius: '50%',
                                                        background: '#10b981',
                                                        border: `2.5px solid ${surface}`,
                                                        animation: 'ac-dotPulse 2.2s ease-in-out infinite',
                                                    }} />
                                                )}
                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                                    <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: text }}>
                                                        {acc.accountType} Account
                                                    </span>
                                                    <span style={{
                                                        padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                                                        background: sc.bg, color: sc.fg, border: `1px solid ${sc.border}`,
                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    }}>
                                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                                                        {acc.status}
                                                    </span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                    <span className="ac-mono" style={{ fontSize: 12, color: muted, letterSpacing: .5 }}>
                                                        {acc.accountNumber}
                                                    </span>
                                                    {/* FIX #5: use acc.id as copiedId key, not accountNumber */}
                                                    <button onClick={() => handleCopy(acc.id, acc.accountNumber)}
                                                            style={{
                                                                background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                                                                color: copiedId === acc.id ? '#10b981' : muted,
                                                                transition: 'transform .2s, color .2s',
                                                            }}
                                                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                                                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                                                        {copiedId === acc.id
                                                            ? <Check size={13} className="ac-check-pop" />
                                                            : <Copy size={13} />}
                                                    </button>
                                                </div>

                                                {(acc.branchName || acc.ifscCode) && (
                                                    <div style={{ fontSize: 11, color: muted }}>
                                                        {acc.branchName}{acc.branchName && acc.ifscCode && ' • '}{acc.ifscCode}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: balance */}
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 11, color: muted, marginBottom: 4, fontWeight: 500 }}>Available Balance</div>
                                            {/* FIX #3: use class, no shimmer when hidden */}
                                            <div className={balVisible ? undefined : 'ac-shimmer-off'}
                                                 style={{
                                                     fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 24,
                                                     color: acc.status === 'ACTIVE' ? text : muted,
                                                     transition: 'filter .3s',
                                                 }}>
                                                ₹{acc.balance?.toLocaleString('en-IN') ?? '—'}
                                            </div>
                                            <button onClick={() => navigate('/transactions')}
                                                    style={{
                                                        marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        color: '#38bdf8', fontSize: 12, fontWeight: 600,
                                                        fontFamily: "'Outfit',sans-serif", transition: 'gap .2s, color .2s',
                                                        padding: 0,
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.gap = '8px'; e.currentTarget.style.color = '#7dd3fc'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.gap = '4px'; e.currentTarget.style.color = '#38bdf8'; }}>
                                                View Transactions <ChevronRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>

            {/* ══ APPLY MODAL ═════════════════════════════════════════════════ */}
            {showModal && (
                <div className="ac-overlay"
                     onClick={e => e.target === e.currentTarget && setShowModal(false)}
                     style={{
                         position: 'fixed', inset: 0,
                         background: 'rgba(0,0,0,.72)',
                         backdropFilter: 'blur(10px)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         zIndex: 200, padding: 16,
                     }}>
                    <div className="ac-modal" style={{
                        width: '100%', maxWidth: 440,
                        background: surface, borderRadius: 24, overflow: 'hidden',
                        border: `1px solid ${border}`,
                        boxShadow: isDark ? '0 28px 70px rgba(0,0,0,.65)' : '0 28px 70px rgba(29,78,216,.15)',
                    }}>
                        {/* Modal header */}
                        <div style={{
                            padding: '20px 24px 18px',
                            background: 'linear-gradient(135deg,#060d1f,#0d1e40,#0a0e20)',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{
                                position: 'absolute', inset: 0, pointerEvents: 'none',
                                backgroundImage: 'radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px)',
                                backgroundSize: '18px 18px',
                            }} />
                            <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(56,189,248,.08)', filter: 'blur(30px)', pointerEvents: 'none' }} />
                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 12,
                                        background: 'linear-gradient(135deg,#1d4ed8,#0891b2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 16px rgba(29,78,216,.5)',
                                    }}>
                                        <Landmark size={18} color="#fff" />
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 17, color: '#fff' }}>Apply for Account</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Fill in the details below</div>
                                    </div>
                                </div>
                                <button onClick={() => { setShowModal(false); setFormErrors({}); }}
                                        style={{
                                            background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)',
                                            borderRadius: 10, cursor: 'pointer', padding: 6,
                                            color: 'rgba(255,255,255,.5)', display: 'flex',
                                            transition: 'background .2s',
                                        }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: '22px 24px 24px' }}>
                            {/* Account Type — FIX #6: proper id/htmlFor */}
                            <FieldLabel htmlFor={`${uid}-acctype`}>Account Type</FieldLabel>
                            <div id={`${uid}-acctype`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                                {[
                                    { value: 'SAVINGS', emoji: '🏦', label: 'Savings', desc: 'For personal use', ac: '#38bdf8' },
                                    { value: 'CURRENT', emoji: '💼', label: 'Current', desc: 'For business',     ac: '#a78bfa' },
                                ].map(opt => {
                                    const active = formData.accountType === opt.value;
                                    return (
                                        <button key={opt.value} type="button"
                                                onClick={() => setFormData(f => ({ ...f, accountType: opt.value }))}
                                                style={{
                                                    padding: '12px 14px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                                                    background: active
                                                        ? isDark ? `rgba(${opt.value==='SAVINGS'?'56,189,248':'167,139,250'},.1)` : `rgba(${opt.value==='SAVINGS'?'56,189,248':'167,139,250'},.07)`
                                                        : 'transparent',
                                                    border: `2px solid ${active ? opt.ac : border}`,
                                                    fontFamily: "'Outfit',sans-serif",
                                                    transition: 'all .2s cubic-bezier(.34,1.56,.64,1)',
                                                    transform: active ? 'scale(1.02)' : 'scale(1)',
                                                    boxShadow: active ? `0 4px 14px ${opt.ac}25` : 'none',
                                                }}>
                                            <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.emoji}</div>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: active ? opt.ac : text, marginBottom: 2 }}>{opt.label}</div>
                                            <div style={{ fontSize: 11, color: muted }}>{opt.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Branch Name — FIX #6 */}
                            <div style={{ marginBottom: formErrors.branchName ? 6 : 16 }}>
                                <FieldLabel htmlFor={`${uid}-branch`}>Branch Name</FieldLabel>
                                <input
                                    id={`${uid}-branch`}
                                    className="ac-field-input"
                                    type="text"
                                    value={formData.branchName}
                                    placeholder="Mumbai Main Branch"
                                    onChange={e => { setFormData(f => ({ ...f, branchName: e.target.value })); setFormErrors(er => ({ ...er, branchName: '' })); }}
                                    style={{
                                        ...inputStyle,
                                        borderColor: formErrors.branchName ? '#ef4444' : (isDark ? 'rgba(255,255,255,.07)' : 'rgba(59,130,246,.15)'),
                                    }}
                                />
                                {formErrors.branchName && (
                                    <div style={{ fontSize: 11, color: '#f87171', marginTop: 5, fontWeight: 500 }}>{formErrors.branchName}</div>
                                )}
                            </div>

                            {/* IFSC Code — FIX #6 */}
                            <div style={{ marginBottom: formErrors.ifscCode ? 6 : 18 }}>
                                <FieldLabel htmlFor={`${uid}-ifsc`}>IFSC Code</FieldLabel>
                                <input
                                    id={`${uid}-ifsc`}
                                    className="ac-field-input ac-mono"
                                    type="text"
                                    value={formData.ifscCode}
                                    placeholder="SBIN0001234"
                                    onChange={e => { setFormData(f => ({ ...f, ifscCode: e.target.value.toUpperCase() })); setFormErrors(er => ({ ...er, ifscCode: '' })); }}
                                    style={{ ...inputStyle, letterSpacing: 1 }}
                                />
                                {formErrors.ifscCode && (
                                    <div style={{ fontSize: 11, color: '#f87171', marginTop: 5, fontWeight: 500 }}>{formErrors.ifscCode}</div>
                                )}
                            </div>

                            {/* Live preview */}
                            {formData.branchName && (
                                <div style={{
                                    padding: '11px 14px', borderRadius: 12, marginBottom: 18,
                                    background: isDark ? 'rgba(56,189,248,.08)' : 'rgba(56,189,248,.06)',
                                    border: '1px solid rgba(56,189,248,.2)',
                                    animation: 'ac-fadeIn .25s ease',
                                }}>
                                    <div style={{ fontSize: 9.5, color: '#38bdf8', fontWeight: 700, marginBottom: 4, letterSpacing: .8, textTransform: 'uppercase' }}>Preview</div>
                                    <div style={{ fontSize: 13, color: text }}>
                                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>{formData.accountType}</span> account at{' '}
                                        <span style={{ fontWeight: 600 }}>{formData.branchName}</span>
                                        {formData.ifscCode && <span style={{ color: muted }}> ({formData.ifscCode})</span>}
                                    </div>
                                </div>
                            )}

                            {/* Submit — FIX #1: no form tag needed, validate() handles required fields */}
                            <button onClick={handleSubmit}
                                    disabled={submitting}
                                    className="ac-submit"
                                    style={{
                                        width: '100%', padding: '13px', borderRadius: 14, fontSize: 14,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    }}>
                                {submitting ? (
                                    <>
                                        <span style={{
                                            width: 16, height: 16,
                                            border: '2px solid rgba(255,255,255,.3)',
                                            borderTopColor: '#fff', borderRadius: '50%',
                                            display: 'inline-block', animation: 'ac-spin .7s linear infinite',
                                        }} />
                                        Submitting…
                                    </>
                                ) : (
                                    <><Plus size={16} /> Submit Application</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}