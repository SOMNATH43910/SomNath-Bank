import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import {
    PiggyBank, Plus, X, TrendingUp, RefreshCw,
    Calendar, Percent, ShieldCheck, AlertTriangle,
    ArrowRight, Clock, Zap, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Animated Counter ───────────────────────────────────────────── */
function useAnimatedCounter(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!target && target !== 0) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setValue(target); clearInterval(timer); }
            else setValue(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target]);
    return value;
}

/* ─── Sparkline ──────────────────────────────────────────────────── */
function Sparkline({ data = [], color = '#10b981', height = 26, width = 60 }) {
    if (!data.length) return null;
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={width} height={height}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ─── FD Maturity Progress Bar ───────────────────────────────────── */
function MaturityProgress({ startDate, maturityDate, isDark }) {
    const start   = new Date(startDate).getTime();
    const end     = new Date(maturityDate).getTime();
    const now     = Date.now();
    const total   = end - start;
    const elapsed = Math.min(Math.max(now - start, 0), total);
    const pct     = total > 0 ? Math.round((elapsed / total) * 100) : 0;
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{pct}% elapsed</span>
                <span className={`text-xs font-semibold ${daysLeft === 0 ? 'text-emerald-500' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {daysLeft === 0 ? '🎉 Matured!' : `${daysLeft.toLocaleString()} days left`}
                </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 progress-fill transition-all duration-1000"
                     style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

const RATE_TABLE = [
    { tenure: '1 Year',   tenureYears: 1, rate: '6.5%', rateNum: 6.5 },
    { tenure: '2 Years',  tenureYears: 2, rate: '7.0%', rateNum: 7.0 },
    { tenure: '3 Years',  tenureYears: 3, rate: '7.5%', rateNum: 7.5 },
    { tenure: '5+ Years', tenureYears: 5, rate: '8.0%', rateNum: 8.0 },
];

function getRate(years) {
    if (years >= 5) return 8.0;
    if (years >= 3) return 7.5;
    if (years >= 2) return 7.0;
    return 6.5;
}

export default function FixedDeposits() {
    const { isDark } = useTheme();
    const [fds, setFds]             = useState([]);
    const [accounts, setAccounts]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData]   = useState({ accountNumber: '', amount: '', tenureYears: 1 });

    useEffect(() => { fetchFds(); fetchAccounts(); }, []);

    const fetchFds = async () => {
        try { const res = await API.get('/fd/my'); setFds(res.data); }
        catch { toast.error('Failed to load FDs!'); }
        finally { setLoading(false); }
    };
    const fetchAccounts = async () => {
        try {
            const res = await API.get('/accounts/my');
            setAccounts(res.data);
            if (res.data.length > 0) setFormData(f => ({...f, accountNumber: res.data[0].accountNumber}));
        } catch {}
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/fd/open', formData);
            toast.success('Fixed Deposit opened! 🎉');
            setShowModal(false);
            fetchFds();
        } catch { toast.error('Failed to open FD!'); }
    };
    const handleBreak = async (id) => {
        if (!window.confirm('Break this FD? A 1% penalty will apply on the principal.')) return;
        try { await API.put(`/fd/break/${id}`); toast.success('FD broken successfully!'); fetchFds(); }
        catch { toast.error('Failed to break FD!'); }
    };

    const totalPrincipal = fds.reduce((s, f) => s + (f.principalAmount || 0), 0);
    const totalMaturity  = fds.reduce((s, f) => s + (f.maturityAmount  || 0), 0);
    const totalGain      = totalMaturity - totalPrincipal;
    const activeFDs      = fds.filter(f => f.status === 'ACTIVE').length;

    const animPrincipal  = useAnimatedCounter(totalPrincipal);
    const animMaturity   = useAnimatedCounter(totalMaturity);

    // Projected maturity for modal preview
    const previewRate    = getRate(formData.tenureYears);
    const previewGain    = formData.amount
        ? Math.round(parseFloat(formData.amount) * (previewRate / 100) * formData.tenureYears)
        : 0;
    const previewMaturity = formData.amount ? parseFloat(formData.amount) + previewGain : 0;

    const statusCfg = {
        ACTIVE:  { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400', card: 'from-emerald-500 to-teal-600',   glow: 'shadow-emerald-500/30' },
        MATURED: { bg: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-400',    card: 'from-blue-500 to-indigo-600',    glow: 'shadow-blue-500/30' },
        BROKEN:  { bg: 'bg-red-100 text-red-700',         dot: 'bg-red-400',     card: 'from-red-500 to-rose-600',       glow: 'shadow-red-500/30' },
    };

    const statCards = [
        { label: 'Active FDs',      value: activeFDs,                  color: '#10b981', bg: 'from-emerald-500 to-teal-600',   icon: <PiggyBank size={15} />,   spark: [1,2,1,3,2,4,3,5,4,activeFDs] },
        { label: 'Total Invested',  value: `₹${(totalPrincipal/1000).toFixed(0)}K`, color: '#3b82f6', bg: 'from-blue-500 to-indigo-600', icon: <DollarSign size={15} />,  spark: [10,20,15,30,25,40,35,50,45,60], raw: true },
        { label: 'Expected Return', value: `₹${(totalMaturity/1000).toFixed(0)}K`,  color: '#8b5cf6', bg: 'from-violet-500 to-purple-600', icon: <TrendingUp size={15} />, spark: [12,22,18,33,28,44,38,55,50,66], raw: true },
        { label: 'Total Gain',      value: `₹${(totalGain/1000).toFixed(1)}K`,      color: '#f59e0b', bg: 'from-amber-500 to-orange-500', icon: <Zap size={15} />,        spark: [0,1,1,2,2,3,3,4,4,5], raw: true },
    ];

    const input = `w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-emerald-500/30
        ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`;
    const lbl = `block text-sm font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
                .fd-wrap { font-family: 'DM Sans', sans-serif; }
                .syne { font-family: 'Syne', sans-serif; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0%   { background-position: -600px 0; }
                    100% { background-position: 600px 0; }
                }
                @keyframes glow {
                    0%, 100% { opacity: 0.5; }
                    50%       { opacity: 0.9; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-5px); }
                }
                @keyframes countUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes rateGlow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.3); }
                    50%       { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
                }

                .fu  { animation: fadeUp 0.5s ease both; }
                .fu1 { animation: fadeUp 0.5s 0.05s ease both; }
                .fu2 { animation: fadeUp 0.5s 0.10s ease both; }
                .fu3 { animation: fadeUp 0.5s 0.15s ease both; }
                .fu4 { animation: fadeUp 0.5s 0.20s ease both; }
                .fu5 { animation: fadeUp 0.5s 0.25s ease both; }

                .hero-glow {
                    position: absolute; inset: 0; pointer-events: none;
                    background: radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.12) 0%, transparent 55%),
                                radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.10) 0%, transparent 50%);
                    animation: glow 5s ease-in-out infinite;
                }
                .hero-grid {
                    background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
                    background-size: 28px 28px;
                }
                .shimmer-text {
                    background: linear-gradient(90deg, #fff 0%, #6ee7b7 35%, #fff 55%, #93c5fd 80%, #fff 100%);
                    background-size: 500px auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 3s linear infinite;
                }

                .quick-btn {
                    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .quick-btn:hover  { transform: translateY(-3px) scale(1.03); }
                .quick-btn:active { transform: translateY(-1px) scale(0.98); }

                .fd-card { transition: all 0.3s ease; }
                .fd-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }

                .stat-card { transition: all 0.3s ease; }
                .stat-card:hover { transform: translateY(-3px); }
                .stat-card:hover .s-icon { animation: float 1.4s ease-in-out infinite; }

                .rate-card { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
                .rate-card:hover { transform: translateY(-4px) scale(1.03); }
                .rate-card.active-rate { animation: rateGlow 2s ease-in-out infinite; }

                .progress-fill { transition: width 1.2s cubic-bezier(0.34,1.56,0.64,1); }

                .tenure-btn { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
                .tenure-btn:hover  { transform: scale(1.04); }
                .tenure-btn:active { transform: scale(0.97); }

                .gain-text {
                    background: linear-gradient(135deg, #10b981, #06b6d4);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>

            <div className={`fd-wrap flex min-h-screen ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 overflow-auto">

                    {/* ══════ HERO BANNER ═════════════════════════════════════════ */}
                    <div className="fu relative overflow-hidden rounded-3xl mb-6 p-6 md:p-8"
                         style={{ background: 'linear-gradient(135deg, #0f172a 0%, #052e16 55%, #0c1a2e 100%)' }}>
                        <div className="hero-glow" />
                        <div className="hero-grid absolute inset-0" />
                        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-emerald-600/10 blur-3xl" />
                        <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-teal-600/10 blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-600/30">
                                        <PiggyBank size={20} />
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                                        FIXED DEPOSITS
                                    </span>
                                </div>
                                <h1 className="syne text-3xl font-bold shimmer-text mb-1">Grow Your Savings</h1>
                                <p className="text-gray-400 text-sm mb-4">Secure returns up to 8% p.a. on your deposits</p>

                                {/* Portfolio summary */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/10 border border-white/20'}`}>
                                        <p className="text-gray-400 text-xs mb-0.5">Total Invested</p>
                                        <p className="syne text-lg font-bold text-white">₹{animPrincipal.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/10 border border-white/20'}`}>
                                        <p className="text-gray-400 text-xs mb-0.5">At Maturity</p>
                                        <p className="syne text-lg font-bold text-emerald-400">₹{animMaturity.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className={`p-3 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/10 border border-white/20'}`}>
                                        <p className="text-gray-400 text-xs mb-0.5">Total Gain</p>
                                        <p className="syne text-lg font-bold text-teal-400">+₹{(totalGain).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <button onClick={fetchFds}
                                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all">
                                    <RefreshCw size={16} />
                                </button>
                                <button onClick={() => setShowModal(true)}
                                        className="quick-btn flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/30">
                                    <Plus size={18} /> Open FD
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ══════ INTEREST RATE CARDS ══════════════════════════════════ */}
                    <div className="fu1 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Percent size={15} className="text-emerald-500" />
                            <h2 className={`syne font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Current Interest Rates</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {RATE_TABLE.map((r) => (
                                <div key={r.tenure}
                                     className={`rate-card p-4 rounded-2xl border text-center cursor-pointer
                                     ${isDark ? 'bg-gray-900 border-gray-800 hover:border-emerald-500/40' : 'bg-white border-gray-100 hover:border-emerald-300'}`}>
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-2 shadow-md shadow-emerald-500/25">
                                        <TrendingUp size={16} className="text-white" />
                                    </div>
                                    <p className="syne text-xl font-bold text-emerald-500">{r.rate}</p>
                                    <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{r.tenure}</p>
                                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>per annum</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ══════ STAT CARDS ══════════════════════════════════════════ */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {statCards.map((sc, i) => (
                            <div key={sc.label}
                                 className={`stat-card fu${i+1} p-4 rounded-2xl border
                                 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`s-icon p-2 rounded-xl text-white bg-gradient-to-br ${sc.bg} shadow-md`}>{sc.icon}</div>
                                    {!sc.raw && <Sparkline data={sc.spark} color={sc.color} />}
                                </div>
                                <p className={`syne text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{sc.value}</p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{sc.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* ══════ FD LIST ═════════════════════════════════════════════ */}
                    <div className="fu3">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`syne font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>My Fixed Deposits</h2>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                {fds.length} total
                            </span>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className={`h-40 rounded-2xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                                ))}
                            </div>
                        ) : fds.length === 0 ? (
                            <div className={`text-center py-16 rounded-2xl border-2 border-dashed
                                ${isDark ? 'bg-gray-900/50 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <PiggyBank size={32} className="opacity-40" />
                                </div>
                                <p className="font-semibold mb-1">No FDs yet</p>
                                <p className="text-sm opacity-60 mb-5">Start earning up to 8% p.a. on your savings</p>
                                <button onClick={() => setShowModal(true)}
                                        className="quick-btn inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/25">
                                    <Plus size={16} /> Open First FD
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {fds.map((fd, idx) => {
                                    const st = statusCfg[fd.status] || statusCfg['ACTIVE'];
                                    const gain = (fd.maturityAmount || 0) - (fd.principalAmount || 0);
                                    return (
                                        <div key={fd.id}
                                             className={`fd-card p-5 rounded-2xl border
                                             ${isDark ? 'bg-gray-900 border-gray-800 hover:border-emerald-500/20' : 'bg-white border-gray-100'}`}
                                             style={{ animationDelay: `${idx * 60}ms` }}>

                                            {/* Top row */}
                                            <div className="flex items-start justify-between flex-wrap gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl text-white bg-gradient-to-br ${st.card} shadow-lg ${st.glow}`}>
                                                        <PiggyBank size={22} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{fd.fdNumber}</p>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${st.bg}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                                                {fd.status}
                                                            </span>
                                                        </div>
                                                        <p className={`text-sm font-mono mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{fd.accountNumber}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                                                                {fd.tenureYears} Year{fd.tenureYears > 1 ? 's' : ''}
                                                            </span>
                                                            <span className="text-xs font-semibold text-emerald-500">{fd.interestRate}% p.a.</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Amounts */}
                                                <div className="text-right">
                                                    <p className={`text-xs mb-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Principal</p>
                                                    <p className={`syne text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        ₹{fd.principalAmount?.toLocaleString('en-IN')}
                                                    </p>
                                                    <p className="text-sm font-semibold text-emerald-500 mt-0.5">
                                                        → ₹{fd.maturityAmount?.toLocaleString('en-IN')}
                                                    </p>
                                                    <p className="gain-text text-xs font-bold mt-0.5">
                                                        +₹{gain.toLocaleString('en-IN')} gain
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Maturity progress */}
                                            {fd.status === 'ACTIVE' && fd.startDate && fd.maturityDate && (
                                                <MaturityProgress startDate={fd.startDate} maturityDate={fd.maturityDate} isDark={isDark} />
                                            )}

                                            {/* Dates + actions */}
                                            <div className={`mt-4 pt-4 border-t flex justify-between items-center flex-wrap gap-3
                                                ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                                                <div className="flex gap-5">
                                                    <div>
                                                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Start Date</p>
                                                        <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{fd.startDate}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Maturity Date</p>
                                                        <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{fd.maturityDate}</p>
                                                    </div>
                                                </div>
                                                {fd.status === 'ACTIVE' && (
                                                    <button onClick={() => handleBreak(fd.id)}
                                                            className="quick-btn flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 dark:border-red-800 px-3 py-1.5 rounded-xl transition-all">
                                                        <AlertTriangle size={13} /> Break FD
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>

                {/* ══════ OPEN FD MODAL ═══════════════════════════════════════════ */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border fu max-h-[90vh] overflow-y-auto
                            ${isDark ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-100'}`}>

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-600/25">
                                        <PiggyBank size={18} />
                                    </div>
                                    <div>
                                        <h2 className="syne text-lg font-bold">Open Fixed Deposit</h2>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Secure, guaranteed returns</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)}
                                        className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Account */}
                                <div>
                                    <label className={lbl}>Select Account</label>
                                    <select value={formData.accountNumber}
                                            onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                                            className={input}>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.accountNumber}>
                                                {acc.accountNumber} — ₹{acc.balance?.toLocaleString('en-IN')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className={lbl}>Amount <span className={`text-xs font-normal ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>(Min ₹1,000)</span></label>
                                    <div className="relative">
                                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>₹</span>
                                        <input type="number" value={formData.amount}
                                               onChange={e => setFormData({...formData, amount: e.target.value})}
                                               placeholder="10,000" min="1000" required
                                               className={`${input} pl-8`} />
                                    </div>
                                    {/* Quick amount chips */}
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {[10000, 25000, 50000, 100000].map(amt => (
                                            <button key={amt} type="button"
                                                    onClick={() => setFormData({...formData, amount: amt})}
                                                    className={`tenure-btn text-xs px-3 py-1 rounded-full border font-medium transition-all
                                                    ${parseFloat(formData.amount) === amt
                                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                                        : isDark ? 'border-gray-700 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                                                ₹{(amt/1000).toFixed(0)}K
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tenure */}
                                <div>
                                    <label className={lbl}>Tenure</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 2, 3, 5].map(y => (
                                            <button key={y} type="button"
                                                    onClick={() => setFormData({...formData, tenureYears: y})}
                                                    className={`tenure-btn p-3 rounded-xl border-2 text-center transition-all
                                                    ${formData.tenureYears === y
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                        : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <p className={`syne text-lg font-bold ${formData.tenureYears === y ? 'text-emerald-600' : isDark ? 'text-white' : 'text-gray-800'}`}>{y}</p>
                                                <p className={`text-xs ${formData.tenureYears === y ? 'text-emerald-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>Yr{y > 1 ? 's' : ''}</p>
                                                <p className={`text-xs font-semibold mt-0.5 ${formData.tenureYears === y ? 'text-emerald-500' : 'text-emerald-500'}`}>{getRate(y)}%</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Live Calculator Preview */}
                                {formData.amount && parseFloat(formData.amount) >= 1000 && (
                                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-emerald-50 border-emerald-100'}`}>
                                        <p className={`text-xs font-semibold mb-3 flex items-center gap-1.5 ${isDark ? 'text-gray-300' : 'text-emerald-700'}`}>
                                            <Zap size={12} /> Returns Calculator
                                        </p>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Principal</p>
                                                <p className={`syne font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>₹{parseFloat(formData.amount).toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <ArrowRight size={16} className="text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>At Maturity</p>
                                                <p className="syne font-bold text-sm text-emerald-500">₹{previewMaturity.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                        <div className={`mt-2 pt-2 border-t text-center ${isDark ? 'border-gray-700' : 'border-emerald-200'}`}>
                                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                You earn <span className="gain-text font-bold text-sm">+₹{previewGain.toLocaleString('en-IN')}</span> over {formData.tenureYears} year{formData.tenureYears > 1 ? 's' : ''} at {previewRate}% p.a.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <button type="submit"
                                        className="quick-btn w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2">
                                    <PiggyBank size={18} /> Open Fixed Deposit
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}