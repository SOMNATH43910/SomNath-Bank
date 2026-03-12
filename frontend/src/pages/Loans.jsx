import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import {
    Building2, Plus, X, CreditCard, RefreshCw, TrendingUp,
    CheckCircle2, Clock, XCircle, AlertCircle, Wallet, ChevronDown, ChevronUp,
    Home, Car, GraduationCap, Briefcase, User, Calendar, Target,
    DollarSign, BarChart3, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════════════════════════
   LOAN TYPE CONFIG
══════════════════════════════════════════════════════════════ */
const LOAN_TYPES = {
    PERSONAL:  { label:'Personal',  icon:<User          size={18}/>, grad:'linear-gradient(135deg,#7c3aed,#a855f7)', glow:'rgba(124,58,237,.45)',  accent:'#a78bfa' },
    HOME:      { label:'Home',      icon:<Home          size={18}/>, grad:'linear-gradient(135deg,#1d4ed8,#3b82f6)', glow:'rgba(29,78,216,.45)',   accent:'#60a5fa' },
    CAR:       { label:'Car',       icon:<Car           size={18}/>, grad:'linear-gradient(135deg,#7e22ce,#c026d3)', glow:'rgba(126,34,206,.45)',  accent:'#e879f9' },
    EDUCATION: { label:'Education', icon:<GraduationCap size={18}/>, grad:'linear-gradient(135deg,#0f766e,#14b8a6)', glow:'rgba(15,118,110,.45)',  accent:'#2dd4bf' },
    BUSINESS:  { label:'Business',  icon:<Briefcase     size={18}/>, grad:'linear-gradient(135deg,#c2410c,#f97316)', glow:'rgba(194,65,12,.45)',   accent:'#fb923c' },
};

const STATUS_CFG = {
    ACTIVE:   { label:'Active',   accent:'#34d399', bg:'rgba(52,211,153,.12)',  border:'rgba(52,211,153,.3)',  icon:<CheckCircle2 size={12}/>, step:3 },
    PENDING:  { label:'Pending',  accent:'#fbbf24', bg:'rgba(251,191,36,.12)',  border:'rgba(251,191,36,.3)',  icon:<Clock        size={12}/>, step:0 },
    APPROVED: { label:'Approved', accent:'#38bdf8', bg:'rgba(56,189,248,.12)',  border:'rgba(56,189,248,.3)',  icon:<CheckCircle2 size={12}/>, step:2 },
    REJECTED: { label:'Rejected', accent:'#f87171', bg:'rgba(248,113,113,.12)', border:'rgba(248,113,113,.3)', icon:<XCircle      size={12}/>, step:-1 },
    CLOSED:   { label:'Closed',   accent:'#94a3b8', bg:'rgba(148,163,184,.1)', border:'rgba(148,163,184,.25)',icon:<CheckCircle2 size={12}/>, step:4 },
};

/* Timeline steps */
const TIMELINE = [
    { label:'Applied',   icon:<Calendar  size={11}/> },
    { label:'Review',    icon:<Clock     size={11}/> },
    { label:'Approved',  icon:<CheckCircle2 size={11}/> },
    { label:'Active',    icon:<TrendingUp size={11}/> },
    { label:'Closed',    icon:<CheckCircle2 size={11}/> },
];

const EMPTY_FORM = { accountNumber:'', loanType:'PERSONAL', loanAmount:'', tenureMonths:12, purpose:'' };

/* ══════════════════════════════════════════════════════════════
   PROGRESS BAR — division-by-zero guard
══════════════════════════════════════════════════════════════ */
function LoanProgress({ paid=0, total=0, accent='#34d399' }) {
    const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
    return (
        <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:11, fontWeight:600 }}>
                <span style={{ color:accent }}>Paid ₹{paid.toLocaleString('en-IN')}</span>
                <span style={{ color:'#94a3b8' }}>{pct.toFixed(1)}% complete</span>
            </div>
            <div style={{ height:7, borderRadius:8, background:'rgba(255,255,255,.07)', overflow:'hidden', position:'relative' }}>
                <div style={{
                    height:'100%', borderRadius:8,
                    background:`linear-gradient(90deg,${accent}aa,${accent})`,
                    width:`${pct}%`,
                    transition:'width .8s cubic-bezier(.22,1,.36,1)',
                    boxShadow:`0 0 10px ${accent}60`,
                    position:'relative',
                }}>
                    {pct > 2 && (
                        <div style={{ position:'absolute', right:-1, top:-2, width:11, height:11, borderRadius:'50%', background:accent, boxShadow:`0 0 8px ${accent}` }}/>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   LOAN TIMELINE
══════════════════════════════════════════════════════════════ */
function LoanTimeline({ status, appliedAt, approvedAt }) {
    const step = STATUS_CFG[status]?.step ?? 0;
    const fmtDate = (v) => {
        if (!v) return null;
        const d = new Date(v);
        return isNaN(d) ? null : d.toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' });
    };
    const dates = [fmtDate(appliedAt), null, fmtDate(approvedAt), null, null];

    if (step < 0) return (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:12, background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.2)' }}>
            <XCircle size={14} color="#f87171"/>
            <span style={{ fontSize:12, color:'#f87171', fontWeight:600 }}>Application Rejected</span>
        </div>
    );

    return (
        <div style={{ display:'flex', alignItems:'flex-start', gap:0 }}>
            {TIMELINE.map((t, i) => {
                const done   = step > i;
                const active = step === i;
                return (
                    <div key={t.label} style={{ display:'flex', alignItems:'center', flex: i < TIMELINE.length-1 ? 1 : 'none' }}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                            <div style={{
                                width:26, height:26, borderRadius:'50%',
                                background: done ? '#34d399' : active ? '#6366f1' : 'rgba(255,255,255,.06)',
                                border:`2px solid ${done ? '#34d399' : active ? '#818cf8' : 'rgba(255,255,255,.12)'}`,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                color: done || active ? '#fff' : '#475569',
                                boxShadow: active ? '0 0 12px rgba(99,102,241,.6)' : done ? '0 0 8px rgba(52,211,153,.4)' : 'none',
                                transition:'all .4s ease', flexShrink:0,
                            }}>
                                {t.icon}
                            </div>
                            <span style={{ fontSize:9, fontWeight:700, color: active ? '#a5b4fc' : done ? '#6ee7b7' : '#334155', whiteSpace:'nowrap', letterSpacing:.3 }}>{t.label}</span>
                            {dates[i] && <span style={{ fontSize:8.5, color:'#475569', whiteSpace:'nowrap' }}>{dates[i]}</span>}
                        </div>
                        {i < TIMELINE.length-1 && (
                            <div style={{ flex:1, height:2, margin:'0 6px', marginBottom:24, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' }}>
                                <div style={{ height:'100%', borderRadius:2, background:'linear-gradient(90deg,#6366f1,#34d399)', width: step > i ? '100%' : '0%', transition:'width .6s cubic-bezier(.22,1,.36,1)' }}/>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Loans() {
    const { isDark } = useTheme();
    const [loans,      setLoans]      = useState([]);
    const [accounts,   setAccounts]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [paying,     setPaying]     = useState(false);
    const [showModal,  setShowModal]  = useState(false);
    const [showRepay,  setShowRepay]  = useState(false);
    const [selLoan,    setSelLoan]    = useState(null);
    const [repayAmt,   setRepayAmt]   = useState('');
    const [form,       setForm]       = useState(EMPTY_FORM);
    const [expandedId, setExpandedId] = useState(null);

    /* Escape key */
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') return;
            if (showRepay) closeRepay();
            else if (showModal) closeApply();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showModal, showRepay]);

    useEffect(() => { fetchLoans(); fetchAccounts(); }, []);

    const fetchLoans = useCallback(async (quiet=false) => {
        if (quiet) setRefreshing(true); else setLoading(true);
        try {
            const res = await API.get('/loans/my');
            setLoans(res.data);
            if (quiet) setExpandedId(null);
        } catch { toast.error('Failed to load loans!'); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    const fetchAccounts = useCallback(async () => {
        try {
            const res = await API.get('/accounts/my');
            setAccounts(res.data);
            if (res.data.length > 0)
                setForm(f => ({ ...f, accountNumber: res.data[0].accountNumber }));
        } catch { toast.error('Could not load accounts. Please refresh.'); }
    }, []);

    const closeApply = useCallback(() => { setShowModal(false); setForm(EMPTY_FORM); }, []);
    const closeRepay = useCallback(() => { setShowRepay(false); setRepayAmt(''); setSelLoan(null); }, []);
    const openRepay  = useCallback((loan) => { setSelLoan(loan); setRepayAmt(loan.emiAmount?.toString() ?? ''); setShowRepay(true); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.accountNumber)                          { toast.error('Please select an account!'); return; }
        if (!form.loanAmount || parseFloat(form.loanAmount) <= 0) { toast.error('Enter a valid loan amount!'); return; }
        if (!form.purpose.trim())                         { toast.error('Purpose is required!'); return; }
        setSubmitting(true);
        try {
            await API.post('/loans/apply', form);
            toast.success('Loan application submitted! 🎉');
            closeApply();
            fetchLoans(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply for loan!');
        } finally { setSubmitting(false); }
    };

    const handleRepay = async () => {
        const amt = parseFloat(repayAmt);
        if (!repayAmt || isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount!'); return; }
        const outstanding = selLoan?.outstandingAmount ?? 0;
        if (amt > outstanding) { toast.error(`Amount cannot exceed outstanding ₹${outstanding.toLocaleString('en-IN')}!`); return; }
        setPaying(true);
        try {
            await API.post(`/loans/repay/${selLoan.id}?amount=${amt}`);
            toast.success('EMI payment successful! ✅');
            closeRepay();
            fetchLoans(true);
            fetchAccounts();
        } catch (err) {
            const d = err.response?.data;
            toast.error(typeof d === 'string' ? d : d?.message || 'Payment failed!');
        } finally { setPaying(false); }
    };

    const set3Emi = useCallback(() => {
        const emi = selLoan?.emiAmount;
        if (!emi || isNaN(emi)) { toast.error('EMI amount not available'); return; }
        setRepayAmt(Math.min(emi * 3, selLoan?.outstandingAmount ?? emi * 3).toFixed(2));
    }, [selLoan]);

    const fmtDate = (v) => {
        if (!v) return '—';
        const d = new Date(v);
        return isNaN(d) ? '—' : d.toLocaleString('en-IN',{ day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    };

    const summary = useMemo(() => ({
        total:      loans.length,
        active:     loans.filter(l => l.status === 'ACTIVE').length,
        pending:    loans.filter(l => l.status === 'PENDING').length,
        closed:     loans.filter(l => l.status === 'CLOSED').length,
        totalOutstanding: loans.filter(l => l.status === 'ACTIVE').reduce((s,l) => s+(l.outstandingAmount??0),0),
        totalPaid:        loans.reduce((s,l) => s+(l.paidAmount??0),0),
    }), [loans]);

    const canSubmit = form.accountNumber && parseFloat(form.loanAmount) > 0 && form.purpose.trim().length >= 3;

    /* Theme tokens */
    const surface    = isDark ? '#0b1322'               : '#ffffff';
    const surfaceAlt = isDark ? '#0d1730'               : '#f8faff';
    const border     = isDark ? 'rgba(255,255,255,.07)' : 'rgba(59,130,246,.1)';
    const text       = isDark ? '#e2e8f0'               : '#0f172a';
    const muted      = isDark ? '#475569'               : '#94a3b8';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Syne:wght@700;800&family=JetBrains+Mono:wght@500;700&display=swap');
                .ln-root*,.ln-root *::before,.ln-root *::after{box-sizing:border-box}
                .ln-root{font-family:'Outfit',sans-serif}
                .syne{font-family:'Syne',sans-serif}
                .mono{font-family:'JetBrains Mono',monospace}

                @keyframes ln-fu   {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
                @keyframes ln-fi   {from{opacity:0}to{opacity:1}}
                @keyframes ln-dots {0%{background-position:0 0}100%{background-position:26px 26px}}
                @keyframes ln-scan {0%{transform:translateY(-100%)}100%{transform:translateY(400%)}}
                @keyframes ln-glow {0%,100%{opacity:.5}50%{opacity:1}}
                @keyframes ln-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
                @keyframes ln-spin {to{transform:rotate(360deg)}}
                @keyframes ln-grad {0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
                @keyframes ln-slide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
                @keyframes ln-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}

                .ln-fu0{animation:ln-fu .5s cubic-bezier(.22,1,.36,1) both}
                .ln-fu1{animation:ln-fu .5s .06s cubic-bezier(.22,1,.36,1) both}
                .ln-fu2{animation:ln-fu .5s .12s cubic-bezier(.22,1,.36,1) both}
                .ln-fu3{animation:ln-fu .5s .18s cubic-bezier(.22,1,.36,1) both}
                .ln-fu4{animation:ln-fu .5s .24s cubic-bezier(.22,1,.36,1) both}
                .ln-fu5{animation:ln-fu .5s .30s cubic-bezier(.22,1,.36,1) both}
                .ln-expand{animation:ln-slide .25s ease both}

                .ln-hero-dots{
                    background-image:radial-gradient(rgba(255,255,255,.035) 1px,transparent 1px);
                    background-size:24px 24px;
                    animation:ln-dots 12s linear infinite;
                }
                .ln-scan{
                    position:absolute;left:0;right:0;height:2px;
                    background:linear-gradient(90deg,transparent,rgba(99,102,241,.55),transparent);
                    animation:ln-scan 6s ease-in-out infinite;pointer-events:none;
                }
                .ln-ambient{animation:ln-glow 5s ease-in-out infinite}
                .ln-float{animation:ln-float 3.2s ease-in-out infinite}
                .ln-spin{animation:ln-spin .8s linear infinite}

                .ln-stat{transition:transform .25s ease,box-shadow .25s ease}
                .ln-stat:hover{transform:translateY(-4px)}
                .ln-stat:hover .ls-icon{animation:ln-float 1.4s ease-in-out infinite}

                .ln-card{transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}
                .ln-card:hover{transform:translateY(-2px)}

                .ln-btn{
                    transition:transform .2s cubic-bezier(.34,1.56,.64,1),filter .2s,box-shadow .2s;
                    border:none;cursor:pointer;font-family:'Outfit',sans-serif;font-weight:700;
                }
                .ln-btn:hover:not(:disabled){transform:translateY(-3px);filter:brightness(1.08)}
                .ln-btn:active:not(:disabled){transform:translateY(0)}
                .ln-btn:disabled{opacity:.45;cursor:not-allowed}

                .ln-apply-btn{
                    background:linear-gradient(135deg,#3730a3,#4f46e5,#6366f1);
                    background-size:200% 200%;
                    animation:ln-grad 3s ease infinite;
                    color:#fff;
                }
                .ln-apply-btn:hover:not(:disabled){box-shadow:0 14px 32px rgba(79,70,229,.5)}
                .ln-apply-btn:disabled{animation:none;background:${isDark?'#1e293b':'#e2e8f0'};color:${muted}}

                .ln-pay-btn{
                    background:linear-gradient(135deg,#065f46,#059669,#34d399);
                    background-size:200% 200%;
                    animation:ln-grad 3s ease infinite;
                    color:#fff;
                }
                .ln-pay-btn:hover:not(:disabled){box-shadow:0 14px 32px rgba(16,185,129,.5)}
                .ln-pay-btn:disabled{animation:none;background:${isDark?'#1e293b':'#e2e8f0'};color:${muted}}

                .ln-quick-btn{
                    transition:all .18s cubic-bezier(.34,1.56,.64,1);
                    cursor:pointer;font-family:'Outfit',sans-serif;
                }
                .ln-quick-btn:hover{transform:scale(1.05) translateY(-1px)}
                .ln-quick-btn:active{transform:scale(.97)}

                .ln-input{
                    width:100%;padding:12px 16px;border-radius:13px;
                    border:1.5px solid ${isDark?'rgba(255,255,255,.1)':'rgba(59,130,246,.15)'};
                    background:${isDark?'rgba(255,255,255,.04)':'#f8faff'};
                    color:${text};font-family:'Outfit',sans-serif;font-size:13.5px;
                    outline:none;transition:border-color .2s,box-shadow .2s;
                }
                .ln-input::placeholder{color:${muted}}
                .ln-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.18)}

                .ln-overlay{animation:ln-fi .2s ease both}
                .ln-modal{animation:ln-fu .35s cubic-bezier(.22,1,.36,1) both}

                .ln-scroll::-webkit-scrollbar{width:4px}
                .ln-scroll::-webkit-scrollbar-track{background:transparent}
                .ln-scroll::-webkit-scrollbar-thumb{background:rgba(99,102,241,.3);border-radius:4px}

                .ln-skeleton{
                    background:linear-gradient(90deg,
                        ${isDark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'} 0%,
                        ${isDark?'rgba(255,255,255,.09)':'rgba(0,0,0,.08)'} 50%,
                        ${isDark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'} 100%);
                    background-size:800px 100%;
                    animation:ln-shimmer 1.8s ease-in-out infinite;
                    border-radius:20px;
                }
                .ln-top-shimmer{
                    position:absolute;inset:0;
                    background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
                    animation:ln-shimmer 2.5s ease-in-out infinite;
                }
            `}</style>

            <div className="ln-root" style={{
                display:'flex', minHeight:'100vh',
                background: isDark ? '#060d1a' : '#f0f5ff',
                backgroundImage: isDark
                    ? 'radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)'
                    : 'radial-gradient(rgba(59,130,246,.055) 1px,transparent 1px)',
                backgroundSize:'20px 20px',
            }}>
                <Sidebar/>
                <main className="ln-scroll" style={{ flex:1, padding:'26px 28px', overflowX:'hidden', overflowY:'auto' }}>

                    {/* ══ HERO ══════════════════════════════════════════════ */}
                    <div className="ln-fu0" style={{
                        borderRadius:28, marginBottom:20, padding:'28px 30px',
                        background:'linear-gradient(135deg,#08091a 0%,#0d1140 45%,#160a28 85%,#08091a 100%)',
                        position:'relative', overflow:'hidden',
                        boxShadow:'0 20px 60px rgba(4,3,15,.78),0 0 0 1px rgba(99,102,241,.18)',
                    }}>
                        <div className="ln-hero-dots" style={{ position:'absolute',inset:0,pointerEvents:'none' }}/>
                        <div className="ln-scan"/>
                        <div className="ln-ambient" style={{ position:'absolute',inset:0,pointerEvents:'none',
                            background:'radial-gradient(ellipse at 10% 65%,rgba(99,102,241,.22) 0%,transparent 52%),radial-gradient(ellipse at 88% 22%,rgba(167,139,250,.14) 0%,transparent 48%)' }}/>
                        <div style={{ position:'absolute',top:-60,right:-40,width:260,height:260,borderRadius:'50%',background:'rgba(99,102,241,.07)',filter:'blur(50px)',pointerEvents:'none' }}/>

                        <div style={{ position:'relative',zIndex:2,display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16 }}>
                            <div>
                                <div style={{ display:'flex',alignItems:'center',gap:14,marginBottom:10 }}>
                                    <div className="ln-float" style={{ width:50,height:50,borderRadius:15,background:'linear-gradient(135deg,#3730a3,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 26px rgba(99,102,241,.55),inset 0 1px 0 rgba(255,255,255,.2)' }}>
                                        <Building2 size={22} color="#fff"/>
                                    </div>
                                    <div>
                                        <div style={{ fontSize:10,color:'rgba(255,255,255,.3)',letterSpacing:1.6,textTransform:'uppercase',fontWeight:700,marginBottom:4 }}>Loan Management</div>
                                        <div className="syne" style={{ fontSize:26,fontWeight:800,color:'#fff',letterSpacing:-.5,lineHeight:1 }}>My Loans</div>
                                    </div>
                                </div>
                                <p style={{ fontSize:12.5,color:'rgba(255,255,255,.32)',marginBottom:14 }}>Apply · Track · Repay — all in one place</p>
                                <div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>
                                    {[
                                        { label:`${summary.active} Active`,  color:'#34d399', pulse:true },
                                        { label:`${summary.pending} Pending`,color:'#fbbf24', pulse:true },
                                        { label:`${summary.closed} Closed`,  color:'#94a3b8', pulse:false },
                                        { label:`${summary.total} Total`,    color:'#818cf8', pulse:false },
                                    ].map((s,i) => (
                                        <div key={i} style={{ display:'flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:20,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',fontSize:11,color:'rgba(255,255,255,.5)',fontWeight:600 }}>
                                            <span style={{ width:6,height:6,borderRadius:'50%',background:s.color,animation:s.pulse?'ln-glow 2s ease-in-out infinite':'none' }}/>
                                            {s.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                                <button onClick={() => fetchLoans(true)} style={{ width:42,height:42,borderRadius:13,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.55)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background .2s' }}>
                                    <RefreshCw size={16} className={refreshing?'ln-spin':''}/>
                                </button>
                                <button className="ln-btn ln-apply-btn" onClick={() => setShowModal(true)}
                                        style={{ display:'flex',alignItems:'center',gap:7,padding:'10px 20px',borderRadius:13,fontSize:13,boxShadow:'0 8px 22px rgba(99,102,241,.4)' }}>
                                    <Plus size={16}/> Apply Loan
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ══ SUMMARY STATS ═════════════════════════════════════ */}
                    <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20 }}>
                        {[
                            { label:'Active Loans',      value:summary.active,           color:'#34d399', icon:<CheckCircle2 size={14}/>, prefix:'' },
                            { label:'Pending Review',    value:summary.pending,           color:'#fbbf24', icon:<Clock        size={14}/>, prefix:'' },
                            { label:'Total Outstanding', value:summary.totalOutstanding,  color:'#f87171', icon:<Wallet       size={14}/>, prefix:'₹' },
                            { label:'Total Paid',        value:summary.totalPaid,         color:'#818cf8', icon:<BarChart3    size={14}/>, prefix:'₹' },
                        ].map((sc,i) => (
                            <div key={sc.label} className={`ln-fu${i+1} ln-stat`} style={{ padding:'18px 18px 15px',borderRadius:20,background:surface,border:`1px solid ${border}`,boxShadow:isDark?'0 4px 18px rgba(0,0,0,.35)':'0 4px 18px rgba(59,130,246,.06)' }}>
                                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
                                    <div className="ls-icon" style={{ width:34,height:34,borderRadius:10,background:`${sc.color}1a`,border:`1px solid ${sc.color}44`,display:'flex',alignItems:'center',justifyContent:'center',color:sc.color,boxShadow:`0 4px 12px ${sc.color}30` }}>
                                        {sc.icon}
                                    </div>
                                    <div style={{ width:6,height:6,borderRadius:'50%',background:sc.color,animation:sc.color==='#34d399'||sc.color==='#fbbf24'?'ln-glow 2s ease-in-out infinite':'none' }}/>
                                </div>
                                <div className="mono" style={{ fontSize:22,fontWeight:700,color:text,lineHeight:1,marginBottom:4 }}>
                                    {sc.prefix}{sc.value.toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize:11.5,color:muted,fontWeight:600 }}>{sc.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* ══ LOANS LIST ════════════════════════════════════════ */}
                    <div className="ln-fu5">
                        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
                            <div className="syne" style={{ fontSize:17,fontWeight:800,color:text }}>All Loans</div>
                            <div style={{ padding:'3px 13px',borderRadius:20,fontSize:11,fontWeight:700,background:isDark?'rgba(255,255,255,.06)':'rgba(59,130,246,.08)',color:muted }}>{loans.length} total</div>
                        </div>

                        {loading ? (
                            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                                {[...Array(2)].map((_,i) => <div key={i} className="ln-skeleton" style={{ height:180 }}/>)}
                            </div>
                        ) : loans.length === 0 ? (
                            <div style={{ textAlign:'center',padding:'56px 20px',borderRadius:22,background:surface,border:`2px dashed ${border}` }}>
                                <div style={{ width:64,height:64,borderRadius:18,margin:'0 auto 16px',background:isDark?'rgba(255,255,255,.05)':'rgba(59,130,246,.07)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                                    <Building2 size={28} color={muted}/>
                                </div>
                                <div style={{ fontWeight:700,fontSize:15,color:text,marginBottom:6 }}>No loans yet</div>
                                <div style={{ fontSize:13,color:muted,marginBottom:20 }}>Apply for a loan to get started</div>
                                <button className="ln-btn ln-apply-btn" onClick={() => setShowModal(true)}
                                        style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'10px 20px',borderRadius:13,fontSize:13 }}>
                                    <Plus size={15}/> Apply Now
                                </button>
                            </div>
                        ) : (
                            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                                {loans.map((loan, idx) => {
                                    const lType = LOAN_TYPES[loan.loanType] || LOAN_TYPES['PERSONAL'];
                                    const st    = STATUS_CFG[loan.status]   || STATUS_CFG['PENDING'];
                                    const isExp = expandedId === loan.id;

                                    return (
                                        <div key={loan.id} className="ln-card" style={{
                                            borderRadius:22, overflow:'hidden',
                                            background:surface, border:`1px solid ${isExp ? lType.glow.replace('rgba','rgb').replace(',.45)',')')+'55' : border}`,
                                            boxShadow: isExp
                                                ? `0 8px 32px ${lType.glow.replace(',.45)',', .18)')}`
                                                : isDark?'0 4px 20px rgba(0,0,0,.35)':'0 4px 20px rgba(59,130,246,.07)',
                                            animation:`ln-fu .45s ${idx*.06}s ease both`,
                                        }}>
                                            {/* Gradient top bar */}
                                            <div style={{ height:4,background:lType.grad,position:'relative',overflow:'hidden' }}>
                                                <div className="ln-top-shimmer"/>
                                            </div>

                                            {/* Main card content — clickable to expand */}
                                            <div style={{ padding:'20px 22px',cursor:'pointer' }} onClick={() => setExpandedId(isExp ? null : loan.id)}>
                                                <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12,marginBottom:14 }}>
                                                    <div style={{ display:'flex',alignItems:'center',gap:13 }}>
                                                        <div style={{ width:48,height:48,borderRadius:14,flexShrink:0,background:lType.grad,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 6px 18px ${lType.glow}`,color:'#fff' }}>
                                                            {lType.icon}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight:800,fontSize:15,color:text,marginBottom:3 }}>{lType.label} Loan</div>
                                                            <div style={{ fontSize:11,color:muted,marginBottom:2 }}>{loan.accountNumber}</div>
                                                            {/* tenureInYears from backend directly */}
                                                            <div style={{ fontSize:11,color:muted }}>{loan.tenureInYears ?? `${loan.tenureMonths} months`} · {loan.interestRate ?? '—'}% p.a.</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign:'right' }}>
                                                        <div className="mono" style={{ fontSize:22,fontWeight:700,color:text,marginBottom:4 }}>
                                                            ₹{(loan.loanAmount ?? 0).toLocaleString('en-IN')}
                                                        </div>
                                                        <div style={{ fontSize:12,color:muted,marginBottom:7 }}>
                                                            EMI: <span style={{ color:lType.accent,fontWeight:700 }}>₹{(loan.emiAmount ?? 0).toLocaleString('en-IN')}/mo</span>
                                                        </div>
                                                        <div style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'3px 11px',borderRadius:20,background:st.bg,border:`1px solid ${st.border}` }}>
                                                            <span style={{ color:st.accent }}>{st.icon}</span>
                                                            <span style={{ fontSize:11,fontWeight:700,color:st.accent }}>{st.label}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress (ACTIVE) */}
                                                {loan.status === 'ACTIVE' && (
                                                    <LoanProgress paid={loan.paidAmount??0} total={loan.loanAmount??0} accent={lType.accent}/>
                                                )}

                                                {/* Expand chevron */}
                                                <div style={{ display:'flex',alignItems:'center',justifyContent:'center',marginTop:8,color:muted }}>
                                                    {isExp ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                                                </div>
                                            </div>

                                            {/* ── EXPANDED DETAILS ── */}
                                            {isExp && (
                                                <div className="ln-expand" style={{ borderTop:`1px solid ${border}`,padding:'18px 22px 22px',background:isDark?'rgba(255,255,255,.012)':surfaceAlt,display:'flex',flexDirection:'column',gap:18 }}>

                                                    {/* Timeline */}
                                                    <div>
                                                        <div style={{ fontSize:10,fontWeight:700,color:muted,letterSpacing:.8,textTransform:'uppercase',marginBottom:12 }}>Loan Journey</div>
                                                        <LoanTimeline status={loan.status} appliedAt={loan.appliedAt} approvedAt={loan.approvedAt}/>
                                                    </div>

                                                    {/* Detail tiles */}
                                                    <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10 }}>
                                                        {[
                                                            { label:'Loan Amount',   value:`₹${(loan.loanAmount??0).toLocaleString('en-IN')}`,       color:'#818cf8' },
                                                            { label:'Disbursed',     value:`₹${(loan.disbursedAmount??0).toLocaleString('en-IN')}`,   color:'#38bdf8' },
                                                            { label:'Outstanding',   value:`₹${(loan.outstandingAmount??0).toLocaleString('en-IN')}`, color:'#f87171' },
                                                            { label:'Paid So Far',   value:`₹${(loan.paidAmount??0).toLocaleString('en-IN')}`,        color:'#34d399' },
                                                            { label:'Monthly EMI',   value:`₹${(loan.emiAmount??0).toLocaleString('en-IN')}`,          color:lType.accent },
                                                            { label:'Interest Rate', value:`${loan.interestRate??'—'}% p.a.`,                          color:'#fbbf24' },
                                                        ].map(tile => (
                                                            <div key={tile.label} style={{ padding:'11px 13px',borderRadius:14,background:isDark?'rgba(255,255,255,.04)':surface,border:`1px solid ${border}` }}>
                                                                <div style={{ fontSize:9.5,fontWeight:700,color:muted,letterSpacing:.6,textTransform:'uppercase',marginBottom:5 }}>{tile.label}</div>
                                                                <div className="mono" style={{ fontSize:13.5,fontWeight:700,color:tile.color }}>{tile.value}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Purpose + dates */}
                                                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                                                        <div style={{ padding:'13px 15px',borderRadius:14,background:isDark?'rgba(255,255,255,.04)':surface,border:`1px solid ${border}`,gridColumn: loan.approvedAt ? '1' : '1 / -1' }}>
                                                            <div style={{ fontSize:9.5,fontWeight:700,color:muted,letterSpacing:.6,textTransform:'uppercase',marginBottom:5,display:'flex',alignItems:'center',gap:5 }}>
                                                                <Info size={10}/> Purpose
                                                            </div>
                                                            <div style={{ fontSize:13,color:text,fontWeight:500,lineHeight:1.4 }}>{loan.purpose || '—'}</div>
                                                        </div>
                                                        {loan.approvedAt && (
                                                            <div style={{ padding:'13px 15px',borderRadius:14,background:isDark?'rgba(255,255,255,.04)':surface,border:`1px solid ${border}` }}>
                                                                <div style={{ fontSize:9.5,fontWeight:700,color:muted,letterSpacing:.6,textTransform:'uppercase',marginBottom:5,display:'flex',alignItems:'center',gap:5 }}>
                                                                    <CheckCircle2 size={10}/> Approved On
                                                                </div>
                                                                <div style={{ fontSize:12,color:'#34d399',fontWeight:600 }}>{fmtDate(loan.approvedAt)}</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    {loan.status === 'ACTIVE' && (
                                                        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10,padding:'14px 16px',borderRadius:16,background:isDark?'rgba(52,211,153,.06)':'rgba(52,211,153,.04)',border:'1px solid rgba(52,211,153,.2)' }}>
                                                            <div style={{ fontSize:12.5,color:muted }}>
                                                                Outstanding: <span style={{ color:'#f87171',fontWeight:700 }}>₹{(loan.outstandingAmount??0).toLocaleString('en-IN')}</span>
                                                                <span style={{ marginLeft:10 }}>Next EMI: <span style={{ color:lType.accent,fontWeight:700 }}>₹{(loan.emiAmount??0).toLocaleString('en-IN')}</span></span>
                                                            </div>
                                                            <button className="ln-btn ln-pay-btn" onClick={(e) => { e.stopPropagation(); openRepay(loan); }}
                                                                    style={{ display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:13,fontSize:13,boxShadow:'0 6px 16px rgba(16,185,129,.35)' }}>
                                                                <CreditCard size={15}/> Pay EMI
                                                            </button>
                                                        </div>
                                                    )}

                                                    {loan.status === 'CLOSED' && (
                                                        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'14px',borderRadius:16,background:'rgba(52,211,153,.07)',border:'1px solid rgba(52,211,153,.2)' }}>
                                                            <CheckCircle2 size={16} color="#34d399"/>
                                                            <span style={{ fontSize:13,fontWeight:700,color:'#34d399' }}>Loan Fully Repaid! Total Paid: ₹{(loan.paidAmount??0).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    )}

                                                    {(loan.status === 'PENDING' || loan.status === 'APPROVED') && (
                                                        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'12px 15px',borderRadius:14,background: loan.status==='APPROVED'?'rgba(56,189,248,.07)':'rgba(251,191,36,.07)',border:`1px solid ${loan.status==='APPROVED'?'rgba(56,189,248,.2)':'rgba(251,191,36,.2)'}` }}>
                                                            <Clock size={14} color={loan.status==='APPROVED'?'#38bdf8':'#fbbf24'}/>
                                                            <span style={{ fontSize:12.5,color:muted }}>
                                                                {loan.status==='APPROVED' ? '🎉 Approved! Amount will be disbursed to your account shortly.' : '⏳ Application under review by admin. Usually takes 1-2 business days.'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {loan.status === 'REJECTED' && (
                                                        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'12px 15px',borderRadius:14,background:'rgba(248,113,113,.07)',border:'1px solid rgba(248,113,113,.2)' }}>
                                                            <AlertCircle size={14} color="#f87171"/>
                                                            <span style={{ fontSize:12.5,color:'#f87171',fontWeight:500 }}>Application rejected. Contact your branch for details or apply again.</span>
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

                {/* ══ APPLY LOAN MODAL ════════════════════════════════════ */}
                {showModal && (
                    <div className="ln-overlay" style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.72)',backdropFilter:'blur(7px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:16 }}
                         onClick={e => e.target===e.currentTarget && closeApply()}>
                        <div className="ln-modal ln-scroll" style={{ width:'100%',maxWidth:500,maxHeight:'92vh',overflowY:'auto',borderRadius:24,background:surface,border:`1px solid ${border}`,boxShadow:isDark?'0 30px 80px rgba(0,0,0,.7)':'0 30px 80px rgba(59,130,246,.13)' }}>
                            {/* Header */}
                            <div style={{ padding:'20px 24px 17px',background:isDark?'#0d1730':'#f0f4ff',borderBottom:`1px solid ${border}`,borderRadius:'24px 24px 0 0',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:1 }}>
                                <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                                    <div style={{ width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#3730a3,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 18px rgba(99,102,241,.4)' }}>
                                        <Building2 size={17} color="#fff"/>
                                    </div>
                                    <div>
                                        <div className="syne" style={{ fontSize:16,fontWeight:800,color:text }}>Apply for Loan</div>
                                        <div style={{ fontSize:11,color:muted,marginTop:1 }}>Fill in your details below</div>
                                    </div>
                                </div>
                                <button onClick={closeApply} style={{ width:34,height:34,borderRadius:10,border:`1px solid ${border}`,background:'transparent',color:muted,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                                    <X size={17}/>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ padding:'22px 24px 26px',display:'flex',flexDirection:'column',gap:16 }}>
                                {/* Account */}
                                <div>
                                    <div style={{ fontSize:12.5,fontWeight:700,color:text,marginBottom:8 }}>Account *</div>
                                    {accounts.length === 0 ? (
                                        <div style={{ padding:'12px 16px',borderRadius:13,background:isDark?'rgba(248,113,113,.08)':'rgba(248,113,113,.05)',border:'1px solid rgba(248,113,113,.25)',fontSize:13,color:'#f87171',fontWeight:500 }}>
                                            ⚠️ No active accounts found. Please open an account first.
                                        </div>
                                    ) : (
                                        <select className="ln-input" value={form.accountNumber} onChange={e => setForm({...form,accountNumber:e.target.value})}>
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.accountNumber}>{acc.accountNumber} — {acc.accountType}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Loan type grid with icons */}
                                <div>
                                    <div style={{ fontSize:12.5,fontWeight:700,color:text,marginBottom:10 }}>Loan Type</div>
                                    <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8 }}>
                                        {Object.entries(LOAN_TYPES).map(([key,lt]) => {
                                            const active = form.loanType === key;
                                            return (
                                                <button key={key} type="button" className="ln-quick-btn"
                                                        onClick={() => setForm({...form,loanType:key})}
                                                        style={{ padding:'11px 4px',borderRadius:13,textAlign:'center',border:`2px solid ${active?lt.accent:border}`,background:active?isDark?`${lt.accent}18`:`${lt.accent}10`:isDark?'rgba(255,255,255,.03)':'#f8faff',cursor:'pointer' }}>
                                                    <div style={{ display:'flex',justifyContent:'center',marginBottom:5,color:active?lt.accent:muted }}>{lt.icon}</div>
                                                    <div style={{ fontSize:10,fontWeight:700,color:active?lt.accent:muted,lineHeight:1.2 }}>{lt.label}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div>
                                    <div style={{ fontSize:12.5,fontWeight:700,color:text,marginBottom:8 }}>Loan Amount (₹) *</div>
                                    <input className="ln-input" type="number" min="1000" value={form.loanAmount}
                                           onChange={e => setForm({...form,loanAmount:e.target.value})}
                                           placeholder="e.g. 500000" required/>
                                    {/* Quick amount chips */}
                                    <div style={{ display:'flex',gap:6,marginTop:8,flexWrap:'wrap' }}>
                                        {[50000,100000,300000,500000,1000000].map(a => (
                                            <button key={a} type="button" className="ln-quick-btn"
                                                    onClick={() => setForm({...form,loanAmount:a.toString()})}
                                                    style={{ padding:'4px 10px',borderRadius:10,border:`1.5px solid ${form.loanAmount==a?'#6366f1':border}`,background:form.loanAmount==a?isDark?'rgba(99,102,241,.13)':'rgba(99,102,241,.07)':'transparent',fontSize:11,fontWeight:600,color:form.loanAmount==a?'#818cf8':muted,cursor:'pointer' }}>
                                                ₹{(a/1000).toFixed(0)}K
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tenure pills */}
                                <div>
                                    <div style={{ fontSize:12.5,fontWeight:700,color:text,marginBottom:8 }}>Tenure</div>
                                    <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                                        {[6,12,24,36,48,60].map(m => (
                                            <button key={m} type="button" className="ln-quick-btn"
                                                    onClick={() => setForm({...form,tenureMonths:m})}
                                                    style={{ padding:'7px 14px',borderRadius:12,border:`2px solid ${form.tenureMonths===m?'#6366f1':border}`,background:form.tenureMonths===m?isDark?'rgba(99,102,241,.13)':'rgba(99,102,241,.07)':'transparent',fontSize:12.5,fontWeight:700,color:form.tenureMonths===m?'#818cf8':muted,cursor:'pointer' }}>
                                                {m}mo
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Purpose */}
                                <div>
                                    <div style={{ fontSize:12.5,fontWeight:700,color:text,marginBottom:8 }}>Purpose *</div>
                                    <input className="ln-input" type="text" value={form.purpose}
                                           onChange={e => setForm({...form,purpose:e.target.value})}
                                           placeholder="e.g. Home renovation, Car purchase…" required/>
                                </div>

                                {/* Live preview */}
                                {canSubmit && (
                                    <div style={{ padding:'13px 15px',borderRadius:14,background:isDark?'rgba(99,102,241,.08)':'rgba(99,102,241,.05)',border:'1px solid rgba(99,102,241,.2)' }}>
                                        <div style={{ fontSize:10,fontWeight:700,color:'#818cf8',letterSpacing:.7,textTransform:'uppercase',marginBottom:8 }}>Application Preview</div>
                                        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6 }}>
                                            {[
                                                { k:'Type',    v:LOAN_TYPES[form.loanType]?.label },
                                                { k:'Amount',  v:`₹${parseFloat(form.loanAmount).toLocaleString('en-IN')}` },
                                                { k:'Tenure',  v:`${form.tenureMonths} months` },
                                                { k:'Purpose', v:form.purpose },
                                            ].map(r => (
                                                <div key={r.k}>
                                                    <div style={{ fontSize:10,color:muted,fontWeight:600 }}>{r.k}</div>
                                                    <div style={{ fontSize:12.5,color:text,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{r.v}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button type="submit" disabled={submitting || !canSubmit || accounts.length===0}
                                        className="ln-apply-btn ln-btn"
                                        style={{ width:'100%',padding:'14px',borderRadius:15,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                                    {submitting
                                        ? <><span style={{ width:16,height:16,borderRadius:'50%',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',display:'inline-block',animation:'ln-spin .7s linear infinite' }}/> Submitting…</>
                                        : <><TrendingUp size={16}/> Submit Application</>}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ══ PAY EMI MODAL ═══════════════════════════════════════ */}
                {showRepay && selLoan && (
                    <div className="ln-overlay" style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.72)',backdropFilter:'blur(7px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:16 }}
                         onClick={e => e.target===e.currentTarget && closeRepay()}>
                        <div className="ln-modal ln-scroll" style={{ width:'100%',maxWidth:420,maxHeight:'92vh',overflowY:'auto',borderRadius:24,background:surface,border:`1px solid ${border}`,boxShadow:isDark?'0 30px 80px rgba(0,0,0,.7)':'0 30px 80px rgba(16,185,129,.15)' }}>
                            <div style={{ padding:'20px 24px 17px',background:isDark?'#052e1a':'#f0fdf4',borderBottom:'1px solid rgba(52,211,153,.2)',borderRadius:'24px 24px 0 0',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:1 }}>
                                <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                                    <div style={{ width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#065f46,#10b981)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 18px rgba(16,185,129,.4)' }}>
                                        <CreditCard size={17} color="#fff"/>
                                    </div>
                                    <div>
                                        <div className="syne" style={{ fontSize:16,fontWeight:800,color:text }}>Pay EMI</div>
                                        <div style={{ fontSize:11,color:muted,marginTop:1 }}>{LOAN_TYPES[selLoan.loanType]?.label} Loan · {selLoan.accountNumber}</div>
                                    </div>
                                </div>
                                <button onClick={closeRepay} style={{ width:34,height:34,borderRadius:10,border:`1px solid ${border}`,background:'transparent',color:muted,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                                    <X size={17}/>
                                </button>
                            </div>

                            <div style={{ padding:'20px 24px 26px',display:'flex',flexDirection:'column',gap:16 }}>
                                {/* Info tiles */}
                                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                                    {[
                                        { label:'Monthly EMI',  value:`₹${(selLoan.emiAmount??0).toLocaleString('en-IN')}`,         color:'#818cf8' },
                                        { label:'Outstanding',  value:`₹${(selLoan.outstandingAmount??0).toLocaleString('en-IN')}`,  color:'#f87171' },
                                        { label:'Paid So Far',  value:`₹${(selLoan.paidAmount??0).toLocaleString('en-IN')}`,         color:'#34d399' },
                                        { label:'Tenure',       value: selLoan.tenureInYears ?? `${selLoan.tenureMonths} months`,    color:'#fbbf24' },
                                    ].map(tile => (
                                        <div key={tile.label} style={{ padding:'12px 14px',borderRadius:14,background:surfaceAlt,border:`1px solid ${border}`,textAlign:'center' }}>
                                            <div style={{ fontSize:10,fontWeight:700,color:muted,letterSpacing:.6,textTransform:'uppercase',marginBottom:5 }}>{tile.label}</div>
                                            <div className="mono" style={{ fontSize:15,fontWeight:700,color:tile.color }}>{tile.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress */}
                                <LoanProgress paid={selLoan.paidAmount??0} total={selLoan.loanAmount??0} accent="#34d399"/>

                                {/* Quick select */}
                                <div>
                                    <div style={{ fontSize:11,fontWeight:700,color:muted,marginBottom:8,letterSpacing:.5,textTransform:'uppercase' }}>Quick Select</div>
                                    <div style={{ display:'flex',gap:8 }}>
                                        {[
                                            { label:'1 EMI',    action:() => setRepayAmt((selLoan.emiAmount??0).toFixed(2)) },
                                            { label:'3 EMI',    action:set3Emi },
                                            { label:'Full Pay', action:() => setRepayAmt((selLoan.outstandingAmount??0).toString()) },
                                        ].map(qb => (
                                            <button key={qb.label} type="button" className="ln-quick-btn"
                                                    onClick={qb.action}
                                                    style={{ flex:1,padding:'9px 6px',borderRadius:12,border:`1.5px solid ${border}`,background:'transparent',fontSize:12.5,fontWeight:700,color:muted,cursor:'pointer' }}>
                                                {qb.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount input */}
                                <div>
                                    <div style={{ fontSize:12.5,fontWeight:700,color:text,marginBottom:8 }}>Payment Amount (₹)</div>
                                    <input className="ln-input" type="number" value={repayAmt}
                                           onChange={e => setRepayAmt(e.target.value)}
                                           placeholder="Enter amount" min="1"
                                           max={selLoan.outstandingAmount??undefined}/>
                                    {parseFloat(repayAmt) > (selLoan.outstandingAmount ?? Infinity) && (
                                        <div style={{ display:'flex',alignItems:'center',gap:5,marginTop:6,fontSize:11.5,color:'#f87171',fontWeight:600 }}>
                                            <AlertCircle size={12}/> Exceeds outstanding amount
                                        </div>
                                    )}
                                </div>

                                <button onClick={handleRepay}
                                        disabled={paying || !repayAmt || parseFloat(repayAmt)<=0 || parseFloat(repayAmt)>(selLoan.outstandingAmount??Infinity)}
                                        className="ln-pay-btn ln-btn"
                                        style={{ width:'100%',padding:'14px',borderRadius:15,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                                    {paying
                                        ? <><span style={{ width:16,height:16,borderRadius:'50%',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',display:'inline-block',animation:'ln-spin .7s linear infinite' }}/> Processing…</>
                                        : <><CreditCard size={15}/> Pay ₹{parseFloat(repayAmt||0).toLocaleString('en-IN')}</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}