import { useEffect, useState, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import {
    CreditCard, Plus, X, Eye, EyeOff, Shield, Wifi,
    TrendingUp, Lock, Unlock, Copy, Check,
    ArrowUpRight, Zap, RefreshCw, Sparkles, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Sparkline ──────────────────────────────────────────────────── */
function Sparkline({ data = [], color = '#3b82f6', height = 28, width = 64 }) {
    if (!data.length) return null;
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    const fillPts = `0,${height} ${pts} ${width},${height}`;
    return (
        <svg width={width} height={height}>
            <defs>
                <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
                    <stop offset="100%" stopColor={color} stopOpacity="0"/>
                </linearGradient>
            </defs>
            <polygon points={fillPts} fill={`url(#sg-${color.replace('#','')})`}/>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ─── Network Logo ───────────────────────────────────────────────── */
function NetworkLogo({ network, large = false }) {
    const sz = large ? '1.8rem' : '1.3rem';
    if (network === 'VISA') return (
        <span style={{ fontFamily: 'serif', fontStyle: 'italic', fontWeight: 900, fontSize: sz, letterSpacing: '-1px' }} className="text-white drop-shadow-md">VISA</span>
    );
    if (network === 'MASTERCARD') return (
        <div className="flex items-center">
            <div className={`${large ? 'w-9 h-9' : 'w-7 h-7'} rounded-full bg-red-500 opacity-95`} style={{boxShadow:'0 2px 8px rgba(239,68,68,0.5)'}}/>
            <div className={`${large ? 'w-9 h-9' : 'w-7 h-7'} rounded-full bg-yellow-400 opacity-95 ${large ? '-ml-4' : '-ml-3'}`} style={{boxShadow:'0 2px 8px rgba(250,204,21,0.4)'}}/>
        </div>
    );
    if (network === 'RUPAY') return (
        <span style={{ fontFamily: 'sans-serif', fontWeight: 900, fontSize: large ? '1.2rem' : '1rem', letterSpacing: '1px' }} className="text-white drop-shadow-md">RuPay</span>
    );
    return <span className="text-white font-bold">{network}</span>;
}

/* ─── EMV Chip ───────────────────────────────────────────────────── */
function ChipSVG({ size = 42 }) {
    const h = Math.round(size * 0.76);
    return (
        <svg width={size} height={h} viewBox="0 0 42 32" fill="none">
            <rect width="42" height="32" rx="5" fill="url(#chipGrad)"/>
            <defs>
                <linearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#e8c56a"/>
                    <stop offset="50%" stopColor="#d4a853"/>
                    <stop offset="100%" stopColor="#b8892e"/>
                </linearGradient>
            </defs>
            <rect x="14" y="0" width="14" height="32" fill="#c49a3a" opacity="0.35"/>
            <rect x="0" y="10" width="42" height="12" fill="#c49a3a" opacity="0.35"/>
            <rect x="14" y="10" width="14" height="12" rx="2" fill="#a07828" opacity="0.85"/>
            <line x1="14" y1="0" x2="14" y2="10" stroke="#9a7020" strokeWidth="0.8"/>
            <line x1="28" y1="0" x2="28" y2="10" stroke="#9a7020" strokeWidth="0.8"/>
            <line x1="14" y1="22" x2="14" y2="32" stroke="#9a7020" strokeWidth="0.8"/>
            <line x1="28" y1="22" x2="28" y2="32" stroke="#9a7020" strokeWidth="0.8"/>
        </svg>
    );
}

/* ─── Tilt Card Hook ─────────────────────────────────────────────── */
function useTilt(ref) {
    const handleMove = useCallback((e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
        ref.current.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) translateZ(8px)`;
        ref.current.style.transition = 'transform 0.08s ease';
        const shine = ref.current.querySelector('.tilt-shine');
        if (shine) {
            shine.style.background = `radial-gradient(circle at ${(e.clientX - rect.left)}px ${(e.clientY - rect.top)}px, rgba(255,255,255,0.18) 0%, transparent 65%)`;
        }
    }, []);
    const handleLeave = useCallback(() => {
        if (!ref.current) return;
        ref.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
        ref.current.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        const shine = ref.current.querySelector('.tilt-shine');
        if (shine) shine.style.background = 'transparent';
    }, []);
    return { onMouseMove: handleMove, onMouseLeave: handleLeave };
}

/* ─── Card Visual Component ──────────────────────────────────────── */
function CardVisual({ card, isVisible, onToggle, onCopy, copiedId }) {
    const ref = useRef(null);
    const tilt = useTilt(ref);

    const cfg = {
        VISA:       { bg: 'linear-gradient(135deg,#0a1628 0%,#0d2854 40%,#0a3080 70%,#05173d 100%)', accent: '#4f9cf9', glow: 'rgba(59,130,246,0.55)' },
        MASTERCARD: { bg: 'linear-gradient(135deg,#1a0500 0%,#3d1000 40%,#5c1a00 70%,#1a0500 100%)', accent: '#f97316', glow: 'rgba(249,115,22,0.55)' },
        RUPAY:      { bg: 'linear-gradient(135deg,#001a00 0%,#003d0d 40%,#005c1a 70%,#001a00 100%)', accent: '#34d399', glow: 'rgba(52,211,153,0.55)' },
    }[card.cardNetwork] || { bg: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', accent: '#818cf8', glow: 'rgba(129,140,248,0.5)' };

    const maskNumber = (num) => num
        ? num.replace(/(\d{4})\s?(\d{4})\s?(\d{4})\s?(\d{4})/, '$1 •••• •••• $4')
        : '•••• •••• •••• ••••';

    const statusCfg = {
        ACTIVE:  { txt: 'text-emerald-300', bg: 'rgba(16,185,129,0.2)', border: 'rgba(52,211,153,0.4)' },
        PENDING: { txt: 'text-amber-300',   bg: 'rgba(245,158,11,0.2)', border: 'rgba(251,191,36,0.4)' },
        BLOCKED: { txt: 'text-red-300',     bg: 'rgba(239,68,68,0.2)',  border: 'rgba(252,165,165,0.4)' },
    }[card.cardStatus] || { txt: 'text-gray-300', bg: 'rgba(156,163,175,0.2)', border: 'rgba(209,213,219,0.3)' };

    return (
        <div ref={ref} {...tilt}
             className="relative rounded-3xl overflow-hidden cursor-pointer select-none"
             style={{ background: cfg.bg, minHeight: '210px', padding: '1.5rem',
                 boxShadow: `0 25px 50px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), 0 0 40px -10px ${cfg.glow}` }}>

            {/* Holographic shimmer */}
            <div className="tilt-shine absolute inset-0 rounded-3xl pointer-events-none z-20 transition-all duration-100" />

            {/* Animated diagonal shimmer */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-10">
                <div className="card-holo-shimmer" style={{background: `linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)`, backgroundSize:'200% 100%'}}/>
            </div>

            {/* Glow orb */}
            <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none z-0 transition-all duration-500"
                 style={{ background: cfg.glow, opacity: 0.5 }} />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl pointer-events-none z-0"
                 style={{ background: cfg.accent, opacity: 0.15 }} />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10"
                 style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.07) 1px,transparent 1px)`, backgroundSize: '28px 28px' }}/>

            {/* ── Top row ── */}
            <div className="relative z-30 flex justify-between items-start mb-6">
                <div>
                    <p className="text-white/50 text-xs font-semibold tracking-[0.15em] uppercase mb-0.5">SomNath Bank</p>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.accent }} />
                        <p className="text-white font-bold text-sm tracking-wide">{card.cardType} Card</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Wifi size={16} className="text-white/50" style={{ filter: `drop-shadow(0 0 4px ${cfg.accent})` }} />
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{
                        background: statusCfg.bg, color: cfg.accent,
                        border: `1px solid ${statusCfg.border}`, backdropFilter: 'blur(8px)'
                    }}>{card.cardStatus}</span>
                </div>
            </div>

            {/* ── Chip + NFC ── */}
            <div className="relative z-30 flex items-center justify-between mb-5">
                <ChipSVG size={44}/>
                {/* Decorative circles (NFC rings) */}
                <div className="flex flex-col items-center gap-0.5 opacity-40">
                    {[20,15,10].map(sz => (
                        <div key={sz} className="rounded-full border border-white/60"
                             style={{ width: sz, height: sz, borderWidth: 1 }}/>
                    ))}
                </div>
            </div>

            {/* ── Card Number ── */}
            <div className="relative z-30 flex items-center gap-3 mb-6">
                <p className="card-mono flex-1 text-base tracking-[0.22em] text-white font-medium"
                   style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
                    {isVisible ? card.cardNumber : maskNumber(card.cardNumber)}
                </p>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => onToggle(card.id)}
                            className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
                            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        {isVisible ? <EyeOff size={13} className="text-white/80"/> : <Eye size={13} className="text-white/80"/>}
                    </button>
                    <button onClick={() => onCopy(card.cardNumber, card.id)}
                            className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
                            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        {copiedId === card.id ? <Check size={13} className="text-emerald-400"/> : <Copy size={13} className="text-white/80"/>}
                    </button>
                </div>
            </div>

            {/* ── Bottom row ── */}
            <div className="relative z-30 flex justify-between items-end">
                <div>
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Card Holder</p>
                    <p className="text-white font-bold text-sm tracking-wider" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{card.customerName}</p>
                </div>
                <div className="text-center">
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Expires</p>
                    <p className="card-mono text-white font-bold text-sm">{card.expiryDate}</p>
                </div>
                <NetworkLogo network={card.cardNetwork} large />
            </div>
        </div>
    );
}

/* ══════ MAIN COMPONENT ══════════════════════════════════════════════ */
export default function Cards() {
    const { isDark } = useTheme();
    const [cards, setCards] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [numberVisible, setNumberVisible] = useState({});
    const [copiedId, setCopiedId] = useState(null);
    const [formData, setFormData] = useState({ accountNumber: '', cardType: 'DEBIT', cardNetwork: 'VISA' });
    const [mounted, setMounted] = useState(false);

    useEffect(() => { fetchCards(); fetchAccounts(); setTimeout(() => setMounted(true), 50); }, []);

    const fetchCards = async () => {
        try { const res = await API.get('/cards/my'); setCards(res.data); }
        catch { toast.error('Failed to load cards!'); }
        finally { setLoading(false); }
    };
    const fetchAccounts = async () => {
        try {
            const res = await API.get('/accounts/my');
            setAccounts(res.data);
            if (res.data.length > 0) setFormData(f => ({ ...f, accountNumber: res.data[0].accountNumber }));
        } catch {}
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try { await API.post('/cards/apply', formData); toast.success('Card application submitted! 💳'); setShowModal(false); fetchCards(); }
        catch { toast.error('Failed to apply for card!'); }
    };

    const toggleNumber = (id) => setNumberVisible(prev => ({ ...prev, [id]: !prev[id] }));
    const copyNumber = (num, id) => {
        navigator.clipboard.writeText(num.replace(/\s/g, ''));
        setCopiedId(id); toast.success('Card number copied!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const totalCards  = cards.length;
    const activeCards = cards.filter(c => c.cardStatus === 'ACTIVE').length;
    const debitCards  = cards.filter(c => c.cardType === 'DEBIT').length;
    const creditCards = cards.filter(c => c.cardType === 'CREDIT').length;

    const statCards = [
        { label: 'Total Cards',  value: totalCards,   color: '#60a5fa', grad: 'from-blue-600 to-indigo-700',    icon: <CreditCard size={16}/>, spark: [1,2,1,3,2,3,3,4,3,totalCards || 4] },
        { label: 'Active',       value: activeCards,  color: '#34d399', grad: 'from-emerald-500 to-teal-600',   icon: <Shield size={16}/>,     spark: [0,1,1,2,1,2,2,3,2,activeCards || 2] },
        { label: 'Debit Cards',  value: debitCards,   color: '#a78bfa', grad: 'from-violet-600 to-purple-700',  icon: <Zap size={16}/>,        spark: [1,1,2,1,2,2,3,2,3,debitCards || 3] },
        { label: 'Credit Cards', value: creditCards,  color: '#fb923c', grad: 'from-orange-500 to-rose-600',    icon: <TrendingUp size={16}/>, spark: [0,0,1,0,1,1,1,2,1,creditCards || 1] },
    ];

    const previewCfg = {
        VISA:       'linear-gradient(135deg,#0a1628,#0d2854,#0a3080)',
        MASTERCARD: 'linear-gradient(135deg,#1a0500,#3d1000,#5c1a00)',
        RUPAY:      'linear-gradient(135deg,#001a00,#003d0d,#005c1a)',
    };

    const inputCls = `w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/25 text-sm font-medium
        ${isDark ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500/60' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-400'}`;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Clash+Display:wght@600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');

                .cards-wrap    { font-family: 'Plus Jakarta Sans', sans-serif; }
                .card-heading  { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
                .card-mono     { font-family: 'IBM Plex Mono', monospace; }

                /* ── Entry animations ── */
                @keyframes fadeUp {
                    from { opacity:0; transform:translateY(22px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                @keyframes fadeScale {
                    from { opacity:0; transform:scale(0.92); }
                    to   { opacity:1; transform:scale(1); }
                }
                @keyframes holoShimmer {
                    0%   { background-position:-600px 0; }
                    100% { background-position: 600px 0; }
                }
                @keyframes floatY {
                    0%,100% { transform:translateY(0); }
                    50%     { transform:translateY(-6px); }
                }
                @keyframes spinSlow {
                    from { transform:rotate(0deg); }
                    to   { transform:rotate(360deg); }
                }
                @keyframes pulseGlow {
                    0%,100% { box-shadow: 0 0 12px rgba(99,179,237,0.3); }
                    50%     { box-shadow: 0 0 24px rgba(99,179,237,0.6), 0 0 40px rgba(99,179,237,0.2); }
                }
                @keyframes borderSpin {
                    from { --angle: 0deg; }
                    to   { --angle: 360deg; }
                }
                @keyframes slideInRight {
                    from { opacity:0; transform:translateX(40px); }
                    to   { opacity:1; transform:translateX(0); }
                }
                @keyframes countUp {
                    from { opacity:0; transform:translateY(10px) scale(0.9); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
                @keyframes waveIn {
                    0%   { clip-path: inset(0 100% 0 0); }
                    100% { clip-path: inset(0 0% 0 0); }
                }

                .fu  { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
                .fu1 { animation: fadeUp 0.55s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
                .fu2 { animation: fadeUp 0.55s 0.10s cubic-bezier(0.22,1,0.36,1) both; }
                .fu3 { animation: fadeUp 0.55s 0.15s cubic-bezier(0.22,1,0.36,1) both; }
                .fu4 { animation: fadeUp 0.55s 0.20s cubic-bezier(0.22,1,0.36,1) both; }
                .fu5 { animation: fadeUp 0.55s 0.25s cubic-bezier(0.22,1,0.36,1) both; }
                .fs  { animation: fadeScale 0.45s cubic-bezier(0.22,1,0.36,1) both; }

                .card-holo-shimmer {
                    position: absolute; inset: 0;
                    background-size: 200% 100%;
                    animation: holoShimmer 4s ease-in-out infinite;
                }

                /* ── Stat card hover ── */
                .stat-tile {
                    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
                    position: relative; overflow: hidden;
                }
                .stat-tile::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
                    opacity: 0; transition: opacity 0.3s ease;
                }
                .stat-tile:hover { transform: translateY(-5px) scale(1.01); }
                .stat-tile:hover::before { opacity: 1; }
                .stat-tile:hover .s-icon { animation: floatY 1.5s ease-in-out infinite; }

                /* ── Quick buttons ── */
                .qbtn {
                    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
                    position: relative; overflow: hidden;
                }
                .qbtn::after {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
                    opacity: 0; transition: opacity 0.2s ease;
                }
                .qbtn:hover { transform: translateY(-3px) scale(1.04); }
                .qbtn:hover::after { opacity: 1; }
                .qbtn:active { transform: translateY(-1px) scale(0.97); }

                /* ── Network selectors ── */
                .net-sel {
                    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
                }
                .net-sel:hover  { transform: translateY(-3px) scale(1.03); }
                .net-sel:active { transform: scale(0.97); }

                /* ── Glowing border for active net ── */
                .net-active {
                    animation: pulseGlow 2.5s ease-in-out infinite;
                }

                /* ── Modal backdrop ── */
                .modal-enter { animation: fadeScale 0.3s cubic-bezier(0.22,1,0.36,1) both; }

                /* ── Background pattern ── */
                .bg-dots {
                    background-image: radial-gradient(rgba(100,116,139,0.15) 1px, transparent 1px);
                    background-size: 22px 22px;
                }
                .bg-dots-dark {
                    background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
                    background-size: 22px 22px;
                }
            `}</style>

            <div className={`cards-wrap flex min-h-screen ${isDark ? 'bg-[#060b14] bg-dots-dark' : 'bg-slate-50 bg-dots'}`}>
                <Sidebar />
                <main className="flex-1 p-5 md:p-8 overflow-auto">

                    {/* ══ HEADER ═══════════════════════════════════════════════════ */}
                    <div className="fu flex items-center justify-between mb-7 flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                                     style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                                    <CreditCard size={22}/>
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 flex items-center justify-center"
                                     style={{ borderColor: isDark ? '#060b14' : '#f8fafc' }}>
                                    <Check size={8} className="text-white" strokeWidth={3}/>
                                </div>
                            </div>
                            <div>
                                <h1 className={`card-heading text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>My Cards</h1>
                                <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Manage your debit & credit cards</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={fetchCards}
                                    className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800' : 'bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-700 border border-gray-200 shadow-sm'}`}>
                                <RefreshCw size={15}/>
                            </button>
                            <button onClick={() => setShowModal(true)}
                                    className="qbtn flex items-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg"
                                    style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 8px 24px rgba(79,70,229,0.4)' }}>
                                <Plus size={17}/> Apply Card
                            </button>
                        </div>
                    </div>

                    {/* ══ STAT TILES ═══════════════════════════════════════════════ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                        {statCards.map((sc, i) => (
                            <div key={sc.label}
                                 className={`stat-tile fu${i+1} p-4 rounded-2xl border
                                 ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`s-icon p-2.5 rounded-xl text-white bg-gradient-to-br ${sc.grad} shadow-md`}
                                         style={{ boxShadow: `0 4px 12px ${sc.color}40` }}>
                                        {sc.icon}
                                    </div>
                                    <Sparkline data={sc.spark} color={sc.color} width={56} height={26}/>
                                </div>
                                <p className={`card-heading text-2xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                   style={{ fontVariantNumeric: 'tabular-nums' }}>{sc.value}</p>
                                <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{sc.label}</p>
                                {/* Bottom accent line */}
                                <div className="mt-3 h-0.5 rounded-full opacity-40"
                                     style={{ background: `linear-gradient(90deg,${sc.color},transparent)` }}/>
                            </div>
                        ))}
                    </div>

                    {/* ══ CARDS GRID ════════════════════════════════════════════════ */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className={`h-52 rounded-3xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}/>
                                    <div className={`h-16 rounded-2xl animate-pulse ${isDark ? 'bg-gray-800/60' : 'bg-gray-100'}`}/>
                                </div>
                            ))}
                        </div>
                    ) : cards.length === 0 ? (
                        /* ── Empty State ── */
                        <div className={`fu3 text-center py-20 rounded-3xl border-2 border-dashed relative overflow-hidden
                            ${isDark ? 'border-gray-800 bg-gray-900/40' : 'border-gray-200 bg-white/60'}`}>
                            <div className="absolute top-6 right-8 opacity-10">
                                <CreditCard size={120} className={isDark ? 'text-gray-600' : 'text-gray-400'}/>
                            </div>
                            <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5
                                ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <CreditCard size={36} className={isDark ? 'text-gray-500' : 'text-gray-400'}/>
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
                                    <Plus size={12} className="text-white" strokeWidth={3}/>
                                </div>
                            </div>
                            <p className={`card-heading text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>No cards yet</p>
                            <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Apply for your first card to get started</p>
                            <button onClick={() => setShowModal(true)}
                                    className="qbtn inline-flex items-center gap-2 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg"
                                    style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 8px 24px rgba(79,70,229,0.4)' }}>
                                <Plus size={16}/> Apply Now
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {cards.map((card, idx) => (
                                <div key={card.id} className={`fu${Math.min(idx+1,5)} space-y-3`}>

                                    {/* ── 3D Card ── */}
                                    <CardVisual
                                        card={card}
                                        isVisible={numberVisible[card.id]}
                                        onToggle={toggleNumber}
                                        onCopy={copyNumber}
                                        copiedId={copiedId}
                                    />

                                    {/* ── Info Row ── */}
                                    <div className={`p-4 rounded-2xl border flex items-center gap-3 flex-wrap
                                        ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>

                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                                <CreditCard size={15} className={isDark ? 'text-gray-400' : 'text-gray-400'}/>
                                            </div>
                                            <div>
                                                <p className={`text-xs font-medium mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Linked Account</p>
                                                <p className={`card-mono text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{card.accountNumber}</p>
                                            </div>
                                        </div>

                                        {card.cardType === 'CREDIT' && card.creditLimit && (
                                            <div className="text-right">
                                                <p className={`text-xs font-medium mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Credit Limit</p>
                                                <p className="card-heading text-sm font-extrabold text-emerald-500">₹{card.creditLimit?.toLocaleString('en-IN')}</p>
                                            </div>
                                        )}

                                        <button className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105"
                                                style={{ background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                                            Details <ArrowUpRight size={12}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* ══ APPLY CARD MODAL ══════════════════════════════════════════ */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
                        <div className={`modal-enter w-full max-w-md rounded-3xl shadow-2xl overflow-hidden
                            ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'}`}>

                            {/* Modal Header */}
                            <div className="relative p-6 pb-5 overflow-hidden"
                                 style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)' }}>
                                <div className="absolute inset-0 opacity-10"
                                     style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px,transparent 1px)', backgroundSize: '18px 18px' }}/>
                                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ background: '#6366f1' }}/>
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                                             style={{ background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.5)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
                                            <CreditCard size={20} className="text-indigo-300"/>
                                        </div>
                                        <div>
                                            <h2 className="card-heading text-lg font-extrabold text-white">Apply for Card</h2>
                                            <p className="text-xs text-indigo-300/70 font-medium">Instant digital issuance</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowModal(false)}
                                            className="p-2 rounded-xl transition-all hover:scale-110"
                                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <X size={18} className="text-white/70"/>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5">
                                <form onSubmit={handleSubmit} className="space-y-5">

                                    {/* Account */}
                                    <div>
                                        <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Linked Account</label>
                                        <select value={formData.accountNumber}
                                                onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                                                className={inputCls}>
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.accountNumber}>{acc.accountNumber} — {acc.accountType}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Card Type */}
                                    <div>
                                        <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Card Type</label>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {[
                                                { value: 'DEBIT',  emoji: '⚡', label: 'Debit',  desc: 'Use your balance', activeGrad: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(99,102,241,0.08))', activeBorder: '#3b82f6' },
                                                { value: 'CREDIT', emoji: '💳', label: 'Credit', desc: 'Pay later',         activeGrad: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(168,85,247,0.08))', activeBorder: '#8b5cf6' },
                                            ].map(opt => {
                                                const active = formData.cardType === opt.value;
                                                return (
                                                    <button key={opt.value} type="button"
                                                            onClick={() => setFormData({ ...formData, cardType: opt.value })}
                                                            className="net-sel p-3.5 rounded-2xl text-left"
                                                            style={{
                                                                background: active ? opt.activeGrad : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                                border: `1.5px solid ${active ? opt.activeBorder : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                                                boxShadow: active ? `0 4px 16px ${opt.activeBorder}30` : 'none',
                                                            }}>
                                                        <div className="text-xl mb-1">{opt.emoji}</div>
                                                        <p className={`text-sm font-bold ${active ? (opt.value==='DEBIT' ? 'text-blue-500' : 'text-violet-500') : isDark ? 'text-white' : 'text-gray-800'}`}>{opt.label}</p>
                                                        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{opt.desc}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Card Network */}
                                    <div>
                                        <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Card Network</label>
                                        <div className="grid grid-cols-3 gap-2.5">
                                            {[
                                                { value: 'VISA',       bg: 'linear-gradient(135deg,#0a1628,#0d2854,#0a3080)', glow: 'rgba(59,130,246,0.5)' },
                                                { value: 'MASTERCARD', bg: 'linear-gradient(135deg,#1a0500,#3d1000,#5c1a00)', glow: 'rgba(249,115,22,0.5)' },
                                                { value: 'RUPAY',      bg: 'linear-gradient(135deg,#001a00,#003d0d,#005c1a)', glow: 'rgba(52,211,153,0.5)' },
                                            ].map(opt => {
                                                const active = formData.cardNetwork === opt.value;
                                                return (
                                                    <button key={opt.value} type="button"
                                                            onClick={() => setFormData({ ...formData, cardNetwork: opt.value })}
                                                            className={`net-sel py-4 px-2 rounded-2xl flex flex-col items-center gap-2 ${active ? 'net-active' : ''}`}
                                                            style={{
                                                                background: opt.bg,
                                                                boxShadow: active ? `0 8px 24px ${opt.glow}, 0 0 0 2px rgba(255,255,255,0.25)` : `0 4px 12px rgba(0,0,0,0.3)`,
                                                                opacity: active ? 1 : 0.55,
                                                                transform: active ? 'scale(1.06)' : 'scale(1)',
                                                            }}>
                                                        <NetworkLogo network={opt.value} />
                                                        {active && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Live Preview */}
                                    <div>
                                        <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Preview</label>
                                        <div className="relative rounded-2xl p-4 overflow-hidden"
                                             style={{ background: previewCfg[formData.cardNetwork] || previewCfg.VISA,
                                                 boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)' }}>
                                            <div className="card-holo-shimmer absolute inset-0 rounded-2xl"
                                                 style={{ background: 'linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.06) 50%,transparent 65%)', backgroundSize:'200% 100%' }}/>
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/40 text-xs tracking-widest uppercase mb-1">SomNath Bank</p>
                                                    <p className="text-white font-bold text-sm">{formData.cardType}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <ChipSVG size={36}/>
                                                    <NetworkLogo network={formData.cardNetwork} large/>
                                                </div>
                                            </div>
                                            <p className="card-mono text-white/40 text-xs tracking-[0.25em] mt-3">•••• •••• •••• ••••</p>
                                        </div>
                                    </div>

                                    <button type="submit"
                                            className="qbtn w-full text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-lg"
                                            style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 8px 28px rgba(79,70,229,0.5)' }}>
                                        <CreditCard size={17}/> Submit Application
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}