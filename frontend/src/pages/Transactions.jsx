import { useEffect, useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import {
    ArrowUpRight, ArrowDownLeft, Send, X,
    CheckCircle2, TrendingUp, TrendingDown, Zap,
    RefreshCw, Search, Wallet, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Static coin positions (BUG FIX: no Math.random — no hydration mismatch) ── */
const COIN_POSITIONS = [
    { left:'5%',  top:'5%',  size:20, delay:0,    symbol:'💰' },
    { left:'18%', top:'12%', size:16, delay:0.07, symbol:'✨' },
    { left:'30%', top:'3%',  size:22, delay:0.13, symbol:'💸' },
    { left:'42%', top:'15%', size:18, delay:0.06, symbol:'🪙' },
    { left:'55%', top:'7%',  size:20, delay:0.10, symbol:'⭐' },
    { left:'67%', top:'2%',  size:16, delay:0.04, symbol:'💰' },
    { left:'78%', top:'14%', size:24, delay:0.16, symbol:'✨' },
    { left:'88%', top:'6%',  size:18, delay:0.09, symbol:'💸' },
    { left:'12%', top:'20%', size:14, delay:0.12, symbol:'🪙' },
    { left:'50%', top:'18%', size:20, delay:0.05, symbol:'⭐' },
];

/* ─── Fonts + Global Styles ─────────────────────────────────────────────── */
const Styles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;600;700;800;900&family=Instrument+Sans:wght@400;500;600;700&display=swap');

        :root {
            --green:   #00C896;
            --green-d: #00A87F;
            --blue:    #3B7BFF;
            --blue-d:  #2460E0;
            --red:     #FF5C5C;
            --amber:   #F59E0B;
        }

        /* ── Keyframes ── */
        @keyframes txFadeUp {
            from { opacity:0; transform:translateY(22px); }
            to   { opacity:1; transform:translateY(0); }
        }
        @keyframes txFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes txSlideRight {
            from { opacity:0; transform:translateX(-14px); }
            to   { opacity:1; transform:translateX(0); }
        }
        @keyframes txModalIn {
            from { opacity:0; transform:scale(.93) translateY(18px); }
            to   { opacity:1; transform:scale(1)   translateY(0); }
        }
        @keyframes txOverlay {
            from { opacity:0; backdrop-filter:blur(0); }
            to   { opacity:1; backdrop-filter:blur(10px); }
        }
        @keyframes txGradShift {
            0%,100% { background-position:0% 50%; }
            50%      { background-position:100% 50%; }
        }
        @keyframes txSpinSlow { to { transform:rotate(360deg); } }
        @keyframes txSkeleton {
            0%,100% { opacity:.35; }
            50%      { opacity:.7; }
        }
        @keyframes txRowIn {
            from { opacity:0; transform:translateX(-10px); }
            to   { opacity:1; transform:translateX(0); }
        }
        @keyframes txSuccessPop {
            0%   { transform:scale(0) rotate(-25deg); opacity:0; }
            65%  { transform:scale(1.18) rotate(6deg); opacity:1; }
            100% { transform:scale(1) rotate(0deg); opacity:1; }
        }
        @keyframes txRipple {
            0%   { transform:scale(0); opacity:.5; }
            100% { transform:scale(3.8); opacity:0; }
        }
        @keyframes txCoinRain {
            0%   { transform:translateY(0)    rotate(0deg);   opacity:1; }
            100% { transform:translateY(90px) rotate(360deg); opacity:0; }
        }
        @keyframes txFloat {
            0%,100% { transform:translateY(0) rotate(0deg); }
            50%      { transform:translateY(-8px) rotate(10deg); }
        }
        @keyframes txSlideUpText {
            from { opacity:0; transform:translateY(12px); }
            to   { opacity:1; transform:translateY(0); }
        }
        @keyframes txPulseGlow {
            0%,100% { box-shadow:0 0 0 0 rgba(0,200,150,.4); }
            50%      { box-shadow:0 0 0 12px rgba(0,200,150,0); }
        }
        @keyframes txNumberCount {
            from { opacity:0; transform:translateY(6px); }
            to   { opacity:1; transform:translateY(0); }
        }
        @keyframes txBorderPulse {
            0%,100% { border-color:rgba(59,123,255,.3); }
            50%      { border-color:rgba(59,123,255,.7); }
        }
        @keyframes txSearchFocus {
            from { width: 180px; }
            to   { width: 260px; }
        }

        /* ── Base ── */
        .tx-wrap * { box-sizing:border-box; }
        .tx-wrap { font-family:'Instrument Sans', sans-serif; }
        .tx-syne { font-family:'Cabinet Grotesk', sans-serif; }

        /* ── Utility animations ── */
        .tx-fade-up   { animation:txFadeUp .5s cubic-bezier(.22,1,.36,1) both; }
        .tx-fade-up-1 { animation:txFadeUp .5s .07s cubic-bezier(.22,1,.36,1) both; }
        .tx-fade-up-2 { animation:txFadeUp .5s .14s cubic-bezier(.22,1,.36,1) both; }
        .tx-fade-up-3 { animation:txFadeUp .5s .21s cubic-bezier(.22,1,.36,1) both; }

        .tx-row {
            animation:txRowIn .35s ease both;
            transition:background .15s, border-left-color .15s, transform .15s;
            border-left:3px solid transparent;
        }
        .tx-row:hover {
            border-left-color:var(--blue);
            transform:translateX(3px);
        }

        /* ── Buttons ── */
        .tx-btn {
            border:none; cursor:pointer; font-family:'Cabinet Grotesk',sans-serif;
            font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px;
            transition:transform .2s cubic-bezier(.34,1.56,.64,1), filter .18s, box-shadow .2s;
            position:relative; overflow:hidden;
        }
        .tx-btn::after {
            content:''; position:absolute; inset:0;
            background:rgba(255,255,255,.14); opacity:0;
            transition:opacity .18s; border-radius:inherit;
        }
        .tx-btn:hover::after { opacity:1; }
        .tx-btn:hover  { transform:translateY(-3px) scale(1.02); }
        .tx-btn:active { transform:translateY(-1px) scale(.97); }
        .tx-btn:disabled { opacity:.65; cursor:not-allowed; transform:none; }

        .tx-btn-blue {
            background:linear-gradient(135deg,var(--blue-d),var(--blue),#60A5FA);
            background-size:200% 200%;
            animation:txGradShift 5s ease infinite;
            box-shadow:0 6px 20px rgba(59,123,255,.28);
            color:#fff;
        }
        .tx-btn-blue:hover { box-shadow:0 10px 28px rgba(59,123,255,.42); }

        .tx-btn-ghost {
            background:rgba(255,255,255,.06);
            border:1.5px solid rgba(255,255,255,.1) !important;
            color:inherit;
            backdrop-filter:blur(4px);
        }

        /* ── Cards ── */
        .tx-stat-card {
            transition:transform .22s cubic-bezier(.34,1.2,.64,1), box-shadow .22s;
        }
        .tx-stat-card:hover { transform:translateY(-5px); }

        /* ── Skeleton ── */
        .tx-skeleton { animation:txSkeleton 1.6s ease infinite; }

        /* ── Input ── */
        .tx-input {
            transition:border-color .2s, box-shadow .2s, background .2s;
        }
        .tx-input:focus {
            outline:none;
            box-shadow:0 0 0 3px rgba(59,123,255,.18);
            border-color:var(--blue) !important;
        }

        /* ── Success ── */
        .tx-success-icon { animation:txSuccessPop .55s cubic-bezier(.34,1.56,.64,1) both; }
        .tx-ripple-1 { animation:txRipple .9s .05s ease-out both; }
        .tx-ripple-2 { animation:txRipple .9s .22s ease-out both; }
        .tx-ripple-3 { animation:txRipple .9s .40s ease-out both; }
        .tx-float    { animation:txFloat 2.2s ease-in-out infinite; }
        .tx-slide-up-1 { animation:txSlideUpText .4s .18s ease both; }
        .tx-slide-up-2 { animation:txSlideUpText .4s .30s ease both; }
        .tx-slide-up-3 { animation:txSlideUpText .4s .42s ease both; }
        .tx-slide-up-4 { animation:txSlideUpText .4s .54s ease both; }

        /* ── Scroll ── */
        .tx-scroll::-webkit-scrollbar { width:4px; }
        .tx-scroll::-webkit-scrollbar-track { background:transparent; }
        .tx-scroll::-webkit-scrollbar-thumb { background:rgba(59,123,255,.25); border-radius:99px; }

        /* ── Amount pulse on stat ── */
        .tx-amount-in { animation:txNumberCount .4s .1s ease both; }

        /* ── Search expand ── */
        .tx-search-input:focus { animation:txSearchFocus .25s ease forwards; }
    `}</style>
);

/* ─── Coin Rain (BUG FIX: static positions, no Math.random) ─────────────── */
const CoinRain = () => (
    <>
        {COIN_POSITIONS.map((c, i) => (
            <div key={i} style={{
                position: 'absolute',
                left: c.left,
                top: c.top,
                fontSize: c.size,
                animation: `txCoinRain ${0.75 + i * 0.11}s ${c.delay}s ease-in both`,
                pointerEvents: 'none',
                zIndex: 10,
            }}>
                {c.symbol}
            </div>
        ))}
    </>
);

/* ─── Success Screen (Transfer only) ───────────────────────────────────── */
const SuccessView = ({ amount, toAccount, onClose, isDark }) => (
    <div style={{ textAlign:'center', padding:'24px 16px 16px', position:'relative', overflow:'hidden' }}>
        <CoinRain />
        <div style={{ position:'relative', width:110, height:110, margin:'0 auto 22px' }}>
            {[1,2,3].map(n => (
                <div key={n} className={`tx-ripple-${n}`} style={{
                    position:'absolute', inset:0, borderRadius:'50%',
                    background:'rgba(59,123,255,.22)',
                }} />
            ))}
            <div className="tx-success-icon" style={{
                position:'relative', zIndex:2,
                width:110, height:110, borderRadius:'50%',
                background:'linear-gradient(135deg,#2460E0,#3B7BFF,#60A5FA)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 12px 40px rgba(59,123,255,.4)',
                margin:'0 auto',
            }}>
                <CheckCircle2 size={50} color="#fff" strokeWidth={2.5} />
            </div>
        </div>
        <p className="tx-syne tx-slide-up-1" style={{ fontWeight:900, fontSize:24, marginBottom:6, color: isDark ? '#F1F5F9' : '#0F172A' }}>
            Transfer Sent! 🚀
        </p>
        <p className="tx-slide-up-2" style={{ fontSize:13, color: isDark ? '#64748B' : '#94A3B8', marginBottom:22 }}>
            ₹{parseFloat(amount).toLocaleString('en-IN')} sent to {toAccount}
        </p>
        <div className="tx-float tx-slide-up-3" style={{
            display:'inline-block', marginBottom:28,
            padding:'10px 28px', borderRadius:99,
            background:'rgba(59,123,255,.12)', border:'1.5px solid rgba(59,123,255,.3)',
        }}>
            <span className="tx-syne" style={{ fontWeight:900, fontSize:30, color:'#3B7BFF' }}>
                -₹{parseFloat(amount).toLocaleString('en-IN')}
            </span>
        </div>
        <div className="tx-slide-up-4">
            <button onClick={onClose} className="tx-btn tx-btn-blue"
                    style={{ width:'100%', padding:'14px', borderRadius:16, fontSize:15, letterSpacing:.3 }}>
                <Zap size={17} /> Done
            </button>
        </div>
    </div>
);

/* ─── Modal Wrapper ─────────────────────────────────────────────────────── */
const TxModal = ({ onClose, isDark, children }) => (
    <div onClick={e => e.target === e.currentTarget && onClose()}
         style={{
             position:'fixed', inset:0, background:'rgba(0,0,0,.55)',
             backdropFilter:'blur(10px)', display:'flex',
             alignItems:'center', justifyContent:'center',
             zIndex:200, padding:16,
             animation:'txOverlay .25s ease both',
         }}>
        <div style={{
            width:'100%', maxWidth:460,
            background: isDark ? '#0C1628' : '#FFFFFF',
            borderRadius:28, padding:'26px 26px 22px',
            border: isDark ? '1px solid rgba(255,255,255,.07)' : '1px solid rgba(59,123,255,.12)',
            boxShadow: isDark
                ? '0 32px 80px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.04)'
                : '0 32px 80px rgba(59,123,255,.16)',
            animation:'txModalIn .35s cubic-bezier(.22,1,.36,1) both',
            position:'relative', overflow:'hidden',
        }}>
            {/* Decorative top-right glow */}
            <div style={{
                position:'absolute', top:-50, right:-50, width:160, height:160,
                background:'radial-gradient(circle, rgba(59,123,255,.1) 0%, transparent 70%)',
                pointerEvents:'none',
            }} />
            <div style={{ position:'relative', zIndex:1 }}>{children}</div>
        </div>
    </div>
);

/* ─── Form Field ────────────────────────────────────────────────────────── */
const Field = ({ label, isDark, children }) => (
    <div style={{ marginBottom:14 }}>
        <label style={{
            display:'block', fontSize:10.5, fontWeight:700,
            marginBottom:6, color: isDark ? '#475569' : '#94A3B8',
            letterSpacing:.8, textTransform:'uppercase',
            fontFamily:"'Cabinet Grotesk', sans-serif",
        }}>{label}</label>
        {children}
    </div>
);

/* ─── Modal Header ──────────────────────────────────────────────────────── */
const ModalHeader = ({ icon, title, gradient, onClose, isDark }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
                width:40, height:40, borderRadius:13,
                background: gradient,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:`0 6px 18px ${gradient.includes('C896') ? 'rgba(0,200,150,.35)' : 'rgba(59,123,255,.35)'}`,
            }}>
                {icon}
            </div>
            <span className="tx-syne" style={{
                fontWeight:900, fontSize:19,
                color: isDark ? '#F1F5F9' : '#0F172A',
            }}>{title}</span>
        </div>
        <button onClick={onClose} style={{
            background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)',
            border:'none', cursor:'pointer', borderRadius:10,
            padding:'6px', display:'flex', alignItems:'center', justifyContent:'center',
            color: isDark ? '#64748B' : '#94A3B8',
            transition:'background .15s, color .15s',
        }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)'; e.currentTarget.style.color = isDark ? '#E2E8F0' : '#0F172A'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)'; e.currentTarget.style.color = isDark ? '#64748B' : '#94A3B8'; }}>
            <X size={18} />
        </button>
    </div>
);

/* ─── Animated Counter ──────────────────────────────────────────────────── */
function useAnimatedNumber(target, duration = 900) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!target && target !== 0) return;
        let start = 0;
        const step = target / (duration / 16);
        const t = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(t); }
            else setVal(Math.floor(start));
        }, 16);
        return () => clearInterval(t);
    }, [target]);
    return val;
}

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, color, icon, isDark, accentBg }) => {
    const animated = useAnimatedNumber(Math.abs(value));
    return (
        <div className="tx-stat-card" style={{
            borderRadius:22, padding:'20px 22px',
            background: isDark ? '#0C1628' : '#FFFFFF',
            border: isDark ? '1px solid rgba(255,255,255,.06)' : `1px solid ${color}22`,
            boxShadow: isDark ? '0 4px 24px rgba(0,0,0,.3)' : `0 4px 24px ${color}14`,
            position:'relative', overflow:'hidden',
        }}>
            {/* Accent bg blob */}
            <div style={{
                position:'absolute', right:-20, top:-20, width:80, height:80,
                borderRadius:'50%', background: accentBg || `${color}18`,
                filter:'blur(20px)', pointerEvents:'none',
            }} />
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{
                    fontSize:10.5, fontWeight:700, letterSpacing:.7, textTransform:'uppercase',
                    color: isDark ? '#475569' : '#94A3B8',
                    fontFamily:"'Cabinet Grotesk',sans-serif",
                }}>{label}</span>
                <div style={{
                    width:32, height:32, borderRadius:10,
                    background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center',
                }}>{icon}</div>
            </div>
            <div className="tx-syne tx-amount-in" style={{
                fontWeight:900, fontSize:22, color,
                marginBottom:4, letterSpacing:-.5,
            }}>
                {value < 0 ? '-' : value > 0 && label !== 'Net Balance' ? '+' : (value >= 0 ? '+' : '-')}₹{animated.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize:11, color: isDark ? '#334155' : '#CBD5E1', fontWeight:500 }}>{sub}</div>
        </div>
    );
};

/* ─── Preview Box ───────────────────────────────────────────────────────── */
const PreviewBox = ({ color, colorRgb, children }) => (
    <div style={{
        padding:'12px 15px', borderRadius:13, marginBottom:16,
        background:`rgba(${colorRgb},.08)`,
        border:`1.5px solid rgba(${colorRgb},.2)`,
        animation:'txFadeIn .3s ease',
    }}>
        <div style={{ fontSize:9.5, color:`rgb(${colorRgb})`, fontWeight:800, marginBottom:5, letterSpacing:.7, fontFamily:"'Cabinet Grotesk',sans-serif" }}>PREVIEW</div>
        <div style={{ fontSize:13, color:'inherit' }}>{children}</div>
    </div>
);

/* ─── Spinner ───────────────────────────────────────────────────────────── */
const Spinner = () => (
    <span style={{
        width:15, height:15,
        border:'2px solid rgba(255,255,255,.35)',
        borderTopColor:'#fff', borderRadius:'50%',
        animation:'txSpinSlow .65s linear infinite',
        display:'inline-block', flexShrink:0,
    }} />
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Transactions() {
    const { isDark } = useTheme();

    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts]         = useState([]);
    /* BUG FIX: separate loading states to avoid race condition */
    const [txLoading, setTxLoading]       = useState(true);
    const [accLoading, setAccLoading]     = useState(true);
    const [showTransfer, setShowTransfer] = useState(false);
    const [transferSuccess, setTransferSuccess] = useState(null);
    const [transferLoading, setTransferLoading] = useState(false);
    const [searchQuery, setSearchQuery]   = useState('');
    const [typeFilter, setTypeFilter]     = useState('ALL');

    const [transferForm, setTransferForm] = useState({
        fromAccountNumber:'', toAccountNumber:'', amount:'', description:'',
    });

    /* ── theme tokens ── */
    const bg      = isDark ? '#070E1C' : '#F0F5FF';
    const surface = isDark ? '#0C1628' : '#FFFFFF';
    const border  = isDark ? 'rgba(255,255,255,.06)' : 'rgba(59,123,255,.1)';
    const text     = isDark ? '#E2E8F0' : '#0F172A';
    const muted    = isDark ? '#475569' : '#94A3B8';
    const inputBg  = isDark ? '#111E32' : '#F7FAFF';
    const inputBorderC = isDark ? 'rgba(255,255,255,.09)' : 'rgba(59,123,255,.2)';

    const inputStyle = {
        width:'100%', padding:'11px 14px',
        background:inputBg, border:`1.5px solid ${inputBorderC}`,
        borderRadius:13, color:text, fontSize:13,
        fontFamily:"'Instrument Sans',sans-serif",
    };

    useEffect(() => {
        fetchTransactions();
        fetchAccounts();
    }, []);

    const fetchTransactions = async () => {
        setTxLoading(true);
        try {
            const r = await API.get('/transactions/my');
            setTransactions(r.data ?? []);
        } catch { toast.error('Failed to load transactions!'); }
        finally { setTxLoading(false); }
    };

    const fetchAccounts = async () => {
        setAccLoading(true);
        try {
            const r = await API.get('/accounts/my');
            const active = (r.data ?? []).filter(a => a.status === 'ACTIVE');
            setAccounts(active);
            if (active.length > 0) {
                const num = active[0].accountNumber.trim();
                setTransferForm(f => ({ ...f, fromAccountNumber: num }));
            }
        } catch {}
        finally { setAccLoading(false); }
    };

    const getErrorMsg = (err, fb) => {
        const d = err?.response?.data;
        if (!d) return fb;
        if (typeof d === 'string') return d;
        return d.message || d.error || fb;
    };

    const handleTransfer = async () => {
        if (!transferForm.toAccountNumber || !transferForm.amount) { toast.error('Fill all required fields!'); return; }
        if (parseFloat(transferForm.amount) <= 0) { toast.error('Amount must be greater than 0!'); return; }
        setTransferLoading(true);
        try {
            await API.post('/transactions/transfer', {
                ...transferForm,
                fromAccountNumber: transferForm.fromAccountNumber.trim(),
                toAccountNumber:   transferForm.toAccountNumber.trim(),
                amount: parseFloat(transferForm.amount),
            });
            /* BUG FIX: set only transfer success, not shared state */
            setTransferSuccess({ type:'transfer', amount:transferForm.amount, toAccount:transferForm.toAccountNumber.trim() });
            setTransferForm(f => ({ ...f, toAccountNumber:'', amount:'', description:'' }));
            fetchTransactions();
            fetchAccounts();
        } catch (err) { toast.error(getErrorMsg(err, 'Transfer failed!')); }
        finally { setTransferLoading(false); }
    };

    const closeTransfer = () => { setTransferSuccess(null); setShowTransfer(false); };

    const formatDate = (v) => {
        if (!v) return '—';
        const d = new Date(v);
        if (isNaN(d)) return '—';
        return d.toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });
    };

    /* BUG FIX: safe access with ?. and ?? 0 consistently */
    const totalCredit = transactions
        .filter(t => t.transactionType === 'CREDIT')
        .reduce((s,t) => s + (t.amount ?? 0), 0);
    const totalDebit = transactions
        .filter(t => t.transactionType === 'DEBIT')
        .reduce((s,t) => s + (t.amount ?? 0), 0);
    const net = totalCredit - totalDebit;

    /* Filtered transactions */
    const filtered = transactions.filter(t => {
        const matchType = typeFilter === 'ALL' || t.transactionType === typeFilter;
        const matchSearch = !searchQuery ||
            (t.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.referenceNumber ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchType && matchSearch;
    });

    const loading = txLoading || accLoading;

    return (
        <>
            <Styles />
            <div className="tx-wrap" style={{ display:'flex', minHeight:'100vh', background:bg }}>
                <Sidebar />

                <main className="tx-scroll" style={{ flex:1, padding:'28px 30px', overflowX:'hidden', overflowY:'auto' }}>

                    {/* ── Header ── */}
                    <div className="tx-fade-up" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:14 }}>
                        <div>
                            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:5 }}>
                                {/* Icon */}
                                <div style={{
                                    width:44, height:44, borderRadius:14,
                                    background:'linear-gradient(135deg,#2460E0,#3B7BFF,#60A5FA)',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    boxShadow:'0 8px 24px rgba(59,123,255,.35)',
                                }}>
                                    <Wallet size={20} color="#fff" />
                                </div>
                                <div>
                                    <h1 className="tx-syne" style={{
                                        fontWeight:900, fontSize:24,
                                        color:text, letterSpacing:-.6, lineHeight:1,
                                    }}>
                                        Transactions
                                    </h1>
                                    <p style={{ fontSize:12, color:muted, marginTop:2 }}>
                                        {transactions.length} records · Real-time sync
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                            {/* Refresh */}
                            <button onClick={() => { fetchTransactions(); fetchAccounts(); }}
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(59,123,255,.08)',
                                        border: isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(59,123,255,.15)',
                                        borderRadius:12, padding:'9px 12px', cursor:'pointer', color:muted,
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        transition:'all .2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = text; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = muted; }}>
                                <RefreshCw size={15} />
                            </button>

                            <button onClick={() => setShowTransfer(true)} className="tx-btn tx-btn-blue"
                                    style={{ padding:'10px 18px', borderRadius:14, fontSize:13, letterSpacing:.2 }}>
                                <Send size={16} /> Send Money
                            </button>
                        </div>
                    </div>

                    {/* ── Stat Cards ── */}
                    <div className="tx-fade-up-1" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:22 }}>
                        <StatCard
                            label="Total Credited" value={totalCredit} isDark={isDark}
                            color="#00C896" icon={<TrendingUp size={16} color="#00C896" />}
                            sub={`${transactions.filter(t=>t.transactionType==='CREDIT').length} incoming`}
                        />
                        <StatCard
                            label="Total Debited" value={-totalDebit} isDark={isDark}
                            color="#FF5C5C" icon={<TrendingDown size={16} color="#FF5C5C" />}
                            sub={`${transactions.filter(t=>t.transactionType==='DEBIT').length} outgoing`}
                        />
                        <StatCard
                            label="Net Balance" value={net} isDark={isDark}
                            color={net >= 0 ? '#3B7BFF' : '#FF5C5C'}
                            icon={<Zap size={16} color={net >= 0 ? '#3B7BFF' : '#FF5C5C'} />}
                            sub={`${transactions.length} total transactions`}
                        />
                    </div>

                    {/* ── Transactions Panel ── */}
                    <div className="tx-fade-up-2" style={{
                        borderRadius:24, overflow:'hidden',
                        background:surface, border:`1px solid ${border}`,
                        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,.35)' : '0 8px 32px rgba(59,123,255,.07)',
                    }}>
                        {/* Toolbar */}
                        <div style={{
                            padding:'14px 20px', display:'flex', justifyContent:'space-between',
                            alignItems:'center', gap:12, flexWrap:'wrap',
                            borderBottom:`1px solid ${border}`,
                            background: isDark ? 'rgba(255,255,255,.025)' : 'rgba(59,123,255,.03)',
                        }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <span className="tx-syne" style={{ fontWeight:800, fontSize:14.5, color:text }}>
                                    Recent Activity
                                </span>
                                <span style={{
                                    fontSize:10, fontWeight:700, padding:'2px 8px',
                                    borderRadius:99, background: isDark ? 'rgba(59,123,255,.15)' : 'rgba(59,123,255,.1)',
                                    color:'#3B7BFF', letterSpacing:.5,
                                }}>
                                    {filtered.length}
                                </span>
                            </div>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                {/* Search */}
                                <div style={{ position:'relative' }}>
                                    <Search size={13} style={{
                                        position:'absolute', left:10, top:'50%',
                                        transform:'translateY(-50%)', color:muted, pointerEvents:'none',
                                    }} />
                                    <input
                                        className="tx-input tx-search-input"
                                        placeholder="Search…"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        style={{
                                            ...inputStyle,
                                            paddingLeft:30, fontSize:12,
                                            width:searchQuery ? 220 : 160,
                                            borderRadius:10, padding:'7px 10px 7px 28px',
                                            transition:'width .25s ease, border-color .2s',
                                        }}
                                    />
                                </div>
                                {/* Type filter */}
                                {['ALL','CREDIT','DEBIT'].map(t => (
                                    <button key={t} onClick={() => setTypeFilter(t)} style={{
                                        padding:'5px 12px', borderRadius:8, fontSize:11, fontWeight:700,
                                        cursor:'pointer', letterSpacing:.4,
                                        fontFamily:"'Cabinet Grotesk',sans-serif",
                                        transition:'all .18s',
                                        border:'none',
                                        background: typeFilter === t
                                            ? (t === 'CREDIT' ? '#00C896' : t === 'DEBIT' ? '#FF5C5C' : '#3B7BFF')
                                            : isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.05)',
                                        color: typeFilter === t ? '#fff' : muted,
                                    }}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Loading Skeletons */}
                        {loading && [...Array(5)].map((_,i) => (
                            <div key={i} className="tx-skeleton" style={{
                                display:'flex', alignItems:'center', gap:14,
                                padding:'16px 20px', borderBottom:`1px solid ${border}`,
                                animationDelay:`${i * 0.1}s`,  /* BUG FIX: proper string format */
                            }}>
                                <div style={{ width:44, height:44, borderRadius:13, flexShrink:0, background: isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.06)' }} />
                                <div style={{ flex:1 }}>
                                    <div style={{ height:12, borderRadius:6, width:160, background: isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.05)', marginBottom:8 }} />
                                    <div style={{ height:10, borderRadius:6, width:110, background: isDark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)' }} />
                                </div>
                                <div style={{ width:80, height:14, borderRadius:6, background: isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.05)' }} />
                            </div>
                        ))}

                        {/* Empty State */}
                        {!loading && filtered.length === 0 && (
                            <div style={{ padding:'64px 20px', textAlign:'center', animation:'txFadeIn .4s ease' }}>
                                <div style={{
                                    width:72, height:72, borderRadius:22, margin:'0 auto 16px',
                                    background: isDark?'rgba(59,123,255,.08)':'rgba(59,123,255,.06)',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                }}>
                                    <Wallet size={30} color={muted} />
                                </div>
                                <div className="tx-syne" style={{ fontWeight:800, fontSize:16, color:text, marginBottom:6 }}>
                                    {searchQuery || typeFilter !== 'ALL' ? 'No results found' : 'No transactions yet'}
                                </div>
                                <div style={{ fontSize:13, color:muted }}>
                                    {searchQuery ? 'Try a different search term' : 'Send money or add funds to get started.'}
                                </div>
                            </div>
                        )}

                        {/* Transaction Rows */}
                        {!loading && filtered.map((txn, i) => {
                            const isCredit = txn.transactionType === 'CREDIT';
                            return (
                                <div key={txn.id ?? i} className="tx-row"
                                     style={{
                                         display:'flex', alignItems:'center', justifyContent:'space-between',
                                         padding:'14px 20px', gap:12, cursor:'default',
                                         borderBottom: i < filtered.length-1 ? `1px solid ${border}` : 'none',
                                         /* BUG FIX: correct template literal for animationDelay */
                                         animationDelay: `${Math.min(i * 0.035, 0.45)}s`,
                                     }}
                                     onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(59,123,255,.055)' : 'rgba(59,123,255,.03)'; }}
                                     onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>

                                    {/* Left: icon + info */}
                                    <div style={{ display:'flex', alignItems:'center', gap:13 }}>
                                        <div style={{
                                            width:44, height:44, borderRadius:13, flexShrink:0,
                                            background: isCredit ? 'rgba(0,200,150,.12)' : 'rgba(255,92,92,.1)',
                                            display:'flex', alignItems:'center', justifyContent:'center',
                                            border: `1px solid ${isCredit ? 'rgba(0,200,150,.2)' : 'rgba(255,92,92,.18)'}`,
                                        }}>
                                            {isCredit
                                                ? <ArrowDownLeft size={18} color="#00C896" />
                                                : <ArrowUpRight  size={18} color="#FF5C5C" />
                                            }
                                        </div>
                                        <div>
                                            <div style={{ fontWeight:600, fontSize:13.5, color:text, marginBottom:3 }}>
                                                {txn.description || 'Transaction'}
                                            </div>
                                            <div style={{ fontSize:11, color:muted, display:'flex', alignItems:'center', gap:6 }}>
                                                <span style={{
                                                    fontFamily:'monospace', fontSize:10,
                                                    background: isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)',
                                                    padding:'1px 7px', borderRadius:5,
                                                }}>{txn.referenceNumber || '—'}</span>
                                                <span style={{ color: isDark ? '#1E3A5F' : '#CBD5E1' }}>·</span>
                                                <Clock size={10} style={{ flexShrink:0 }} />
                                                {formatDate(txn.createdAt || txn.transactionDate)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: amount + balance */}
                                    <div style={{ textAlign:'right', flexShrink:0 }}>
                                        <div className="tx-syne" style={{
                                            fontWeight:900, fontSize:15.5, marginBottom:3,
                                            color: isCredit ? '#00C896' : '#FF5C5C',
                                        }}>
                                            {isCredit ? '+' : '-'}₹{(txn.amount ?? 0).toLocaleString('en-IN')}
                                        </div>
                                        <div style={{ fontSize:11, color:muted }}>
                                            {/* BUG FIX: safe access with ?. */}
                                            Bal: ₹{(txn.balanceAfter ?? 0).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>

            {/* ══ TRANSFER MODAL ══ */}
            {showTransfer && (
                <TxModal onClose={closeTransfer} isDark={isDark}>
                    {transferSuccess ? (
                        <SuccessView {...transferSuccess} onClose={closeTransfer} isDark={isDark} />
                    ) : (
                        <>
                            <ModalHeader
                                icon={<Send size={18} color="#fff" />}
                                title="Send Money"
                                gradient="linear-gradient(135deg,#2460E0,#3B7BFF)"
                                onClose={closeTransfer}
                                isDark={isDark}
                            />

                            <Field label="From Account" isDark={isDark}>
                                <select value={transferForm.fromAccountNumber}
                                        onChange={e => setTransferForm({...transferForm, fromAccountNumber:e.target.value})}
                                        className="tx-input" style={inputStyle}>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.accountNumber}>
                                            {acc.accountNumber} — ₹{acc.balance?.toLocaleString('en-IN')}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="To Account Number" isDark={isDark}>
                                <input type="text" placeholder="SNB123456789"
                                       value={transferForm.toAccountNumber}
                                       onChange={e => setTransferForm({...transferForm, toAccountNumber:e.target.value.trim()})}
                                       className="tx-input" style={inputStyle} />
                            </Field>

                            <Field label="Amount (₹)" isDark={isDark}>
                                <input type="number" placeholder="1000" min="1"
                                       value={transferForm.amount}
                                       onChange={e => setTransferForm({...transferForm, amount:e.target.value})}
                                       className="tx-input" style={inputStyle} />
                            </Field>

                            <Field label="Description (Optional)" isDark={isDark}>
                                <input type="text" placeholder="Rent, Bill, Gift…"
                                       value={transferForm.description}
                                       onChange={e => setTransferForm({...transferForm, description:e.target.value})}
                                       className="tx-input" style={inputStyle} />
                            </Field>

                            {transferForm.amount && transferForm.toAccountNumber && (
                                <PreviewBox colorRgb="59,123,255">
                                    <span style={{ color:'#3B7BFF', fontWeight:700 }}>{transferForm.toAccountNumber}</span>
                                    {' ko '}
                                    <span className="tx-syne" style={{ color:'#FF5C5C', fontWeight:900, fontSize:15 }}>
                                        ₹{parseFloat(transferForm.amount||0).toLocaleString('en-IN')}
                                    </span>
                                    {' bheja jayega'}
                                </PreviewBox>
                            )}

                            <button onClick={handleTransfer} disabled={transferLoading}
                                    className="tx-btn tx-btn-blue"
                                /* BUG FIX: was opacity:transferLoading?.75:1 — broken ternary */
                                    style={{ width:'100%', padding:'14px', borderRadius:16, fontSize:14, letterSpacing:.3, opacity: transferLoading ? 0.72 : 1 }}>
                                {transferLoading ? <><Spinner /> Sending…</> : <><Send size={16} /> Send Money</>}
                            </button>
                        </>
                    )}
                </TxModal>
            )}

        </>
    );
}