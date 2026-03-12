import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import {
    BookOpen, Plus, X, MapPin, Package, CheckCircle2,
    Clock, Truck, RefreshCw, ChevronRight, FileText, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Sparkline ──────────────────────────────────────────────────── */
function Sparkline({ data = [], color = '#3b82f6', height = 26, width = 60 }) {
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

const STATUS_STEPS = ['PENDING', 'APPROVED', 'DISPATCHED', 'DELIVERED'];

const stepMeta = [
    { key: 'PENDING',    label: 'Applied',   icon: <Clock size={14} />,        color: 'from-amber-500 to-orange-500',   glow: 'shadow-amber-500/40' },
    { key: 'APPROVED',   label: 'Approved',  icon: <CheckCircle2 size={14} />, color: 'from-blue-500 to-indigo-600',    glow: 'shadow-blue-500/40' },
    { key: 'DISPATCHED', label: 'Shipped',   icon: <Truck size={14} />,        color: 'from-violet-500 to-purple-600',  glow: 'shadow-violet-500/40' },
    { key: 'DELIVERED',  label: 'Delivered', icon: <Package size={14} />,      color: 'from-emerald-500 to-teal-600',   glow: 'shadow-emerald-500/40' },
];

export default function Checkbook() {
    const { isDark } = useTheme();
    const [requests, setRequests]   = useState([]);
    const [accounts, setAccounts]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData]   = useState({ accountNumber: '', numberOfLeaves: 25, deliveryAddress: '' });

    useEffect(() => { fetchRequests(); fetchAccounts(); }, []);

    const fetchRequests = async () => {
        try { const res = await API.get('/checkbook/my'); setRequests(res.data); }
        catch { toast.error('Failed to load requests!'); }
        finally { setLoading(false); }
    };
    const fetchAccounts = async () => {
        try {
            const res = await API.get('/accounts/my');
            setAccounts(res.data);
            if (res.data.length > 0) setFormData(f => ({...f, accountNumber: res.data[0].accountNumber}));
        } catch {}
    };
    const handleSubmit = async () => {
        if (!formData.accountNumber) { toast.error('Account select karo!'); return; }
        if (!formData.deliveryAddress.trim()) { toast.error('Delivery address required!'); return; }
        setSubmitting(true);
        try {
            await API.post('/checkbook/apply', formData);
            toast.success('Checkbook request submitted! 📒');
            setShowModal(false);
            setFormData(f => ({...f, deliveryAddress: ''}));
            fetchRequests();
        } catch (err) { toast.error(err.response?.data || 'Failed to apply!'); }
        finally { setSubmitting(false); }
    };

    const formatDate = (dateVal) => {
        if (!dateVal) return '—';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStepIdx = (status) => STATUS_STEPS.indexOf(status);

    const pending    = requests.filter(r => r.status === 'PENDING').length;
    const approved   = requests.filter(r => r.status === 'APPROVED').length;
    const dispatched = requests.filter(r => r.status === 'DISPATCHED').length;
    const delivered  = requests.filter(r => r.status === 'DELIVERED').length;

    const statCards = [
        { label: 'Total',      value: requests.length, color: '#3b82f6', bg: 'from-blue-500 to-indigo-600',   icon: <BookOpen size={15} />,      spark: [1,2,1,3,2,4,3,5,4,requests.length] },
        { label: 'Pending',    value: pending,          color: '#f59e0b', bg: 'from-amber-500 to-orange-500',  icon: <Clock size={15} />,         spark: [0,1,1,2,1,2,2,3,2,pending] },
        { label: 'Dispatched', value: dispatched,       color: '#8b5cf6', bg: 'from-violet-500 to-purple-600', icon: <Truck size={15} />,         spark: [0,0,1,0,1,1,2,1,2,dispatched] },
        { label: 'Delivered',  value: delivered,        color: '#10b981', bg: 'from-emerald-500 to-teal-600',  icon: <Package size={15} />,       spark: [0,1,1,2,1,3,2,3,3,delivered] },
    ];

    const statusBadge = (status) => {
        switch (status) {
            case 'APPROVED':   return 'bg-blue-100 text-blue-700';
            case 'PENDING':    return 'bg-amber-100 text-amber-700';
            case 'DISPATCHED': return 'bg-violet-100 text-violet-700';
            case 'DELIVERED':  return 'bg-emerald-100 text-emerald-700';
            case 'REJECTED':   return 'bg-red-100 text-red-700';
            default:           return 'bg-gray-100 text-gray-700';
        }
    };

    const input = `w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500/30
        ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`;
    const lbl = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
                .cb-wrap { font-family: 'DM Sans', sans-serif; }
                .syne { font-family: 'Syne', sans-serif; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0%   { background-position: -500px 0; }
                    100% { background-position: 500px 0; }
                }
                @keyframes glow {
                    0%, 100% { opacity: 0.5; }
                    50%       { opacity: 0.9; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-5px); }
                }
                @keyframes trackPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
                    50%       { box-shadow: 0 0 0 6px rgba(59,130,246,0); }
                }
                @keyframes dash {
                    from { stroke-dashoffset: 100; }
                    to   { stroke-dashoffset: 0; }
                }

                .fu  { animation: fadeUp 0.5s ease both; }
                .fu1 { animation: fadeUp 0.5s 0.05s ease both; }
                .fu2 { animation: fadeUp 0.5s 0.10s ease both; }
                .fu3 { animation: fadeUp 0.5s 0.15s ease both; }
                .fu4 { animation: fadeUp 0.5s 0.20s ease both; }
                .fu5 { animation: fadeUp 0.5s 0.25s ease both; }

                .hero-glow {
                    position: absolute; inset: 0; pointer-events: none;
                    background: radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.14) 0%, transparent 60%),
                                radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.10) 0%, transparent 50%);
                    animation: glow 5s ease-in-out infinite;
                }
                .hero-grid {
                    background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
                    background-size: 28px 28px;
                }

                .quick-btn {
                    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .quick-btn:hover  { transform: translateY(-3px) scale(1.03); }
                .quick-btn:active { transform: translateY(-1px) scale(0.98); }

                .req-card {
                    transition: all 0.3s ease;
                }
                .req-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                }

                .stat-card:hover .s-icon { animation: float 1.4s ease-in-out infinite; }
                .stat-card { transition: all 0.3s ease; }
                .stat-card:hover { transform: translateY(-3px); }

                .step-active { animation: trackPulse 2s ease-out infinite; }

                .progress-fill {
                    transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .leaves-btn {
                    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .leaves-btn:hover  { transform: scale(1.04); }
                .leaves-btn:active { transform: scale(0.97); }
            `}</style>

            <div className={`cb-wrap flex min-h-screen ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 overflow-auto">

                    {/* ══════ HERO BANNER ═════════════════════════════════════════ */}
                    <div className="fu relative overflow-hidden rounded-3xl mb-6 p-6 md:p-8"
                         style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0c1a2e 100%)' }}>
                        <div className="hero-glow" />
                        <div className="hero-grid absolute inset-0" />
                        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-blue-600/10 blur-3xl" />
                        <div className="absolute bottom-0 left-1/3 w-28 h-28 rounded-full bg-violet-600/10 blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/30">
                                        <BookOpen size={20} />
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/30 text-blue-300 bg-blue-500/10">
                                        CHECKBOOK SERVICE
                                    </span>
                                </div>
                                <h1 className="syne text-3xl font-bold text-white mb-1">My Checkbooks</h1>
                                <p className="text-gray-400 text-sm">Request and track your checkbook delivery</p>

                                {/* Info pills */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {[
                                        { icon: <Clock size={12} />, text: '5–7 working days delivery' },
                                        { icon: <FileText size={12} />, text: '25 or 50 leaves available' },
                                        { icon: <Zap size={12} />, text: 'Real-time tracking' },
                                    ].map((p, i) => (
                                        <span key={i} className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                                            <span className="text-blue-400">{p.icon}</span>{p.text}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={fetchRequests}
                                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all">
                                    <RefreshCw size={16} />
                                </button>
                                <button onClick={() => setShowModal(true)}
                                        className="quick-btn flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30">
                                    <Plus size={18} /> Request Checkbook
                                </button>
                            </div>
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
                                    <Sparkline data={sc.spark} color={sc.color} />
                                </div>
                                <p className={`syne text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{sc.value}</p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{sc.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* ══════ REQUESTS LIST ════════════════════════════════════════ */}
                    <div className="fu3">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`syne font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Request History</h2>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                {requests.length} total
                            </span>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                                ))}
                            </div>
                        ) : requests.length === 0 ? (
                            <div className={`text-center py-16 rounded-2xl border-2 border-dashed
                                ${isDark ? 'bg-gray-900/50 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <BookOpen size={32} className="opacity-40" />
                                </div>
                                <p className="font-semibold mb-1">No requests yet</p>
                                <p className="text-sm opacity-60 mb-5">Request a checkbook to get started</p>
                                <button onClick={() => setShowModal(true)}
                                        className="quick-btn inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/25">
                                    <Plus size={16} /> Request Now
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((req, idx) => {
                                    const stepIdx    = getStepIdx(req.status);
                                    const isRejected = req.status === 'REJECTED';
                                    const progress   = isRejected ? 0 : (stepIdx / (STATUS_STEPS.length - 1)) * 100;
                                    const currentStep = stepMeta[stepIdx] || stepMeta[0];

                                    return (
                                        <div key={req.id}
                                             className={`req-card p-5 rounded-2xl border
                                             ${isDark ? 'bg-gray-900 border-gray-800 hover:border-blue-500/20' : 'bg-white border-gray-100'}`}
                                             style={{ animationDelay: `${idx * 50}ms` }}>

                                            {/* Top row */}
                                            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                                                <div className="flex items-start gap-3">
                                                    {/* Status Icon */}
                                                    <div className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${isRejected ? 'from-red-500 to-rose-600' : currentStep.color} shadow-md ${isRejected ? 'shadow-red-500/30' : currentStep.glow}`}>
                                                        {isRejected ? <X size={16} /> : currentStep.icon}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{req.requestNumber}</p>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusBadge(req.status)}`}>{req.status}</span>
                                                        </div>
                                                        <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Account: <span className="font-mono">{req.accountNumber}</span> •{' '}
                                                            <span className="font-semibold text-blue-500">{req.numberOfLeaves} Leaves</span>
                                                        </p>
                                                        <div className={`flex items-center gap-1.5 mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                            <MapPin size={11} />
                                                            <span className="truncate max-w-[220px]">{req.deliveryAddress}</span>
                                                        </div>
                                                        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                            Requested: {formatDate(req.requestedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── Progress Tracker ── */}
                                            {!isRejected && (
                                                <div className={`mt-1 p-4 rounded-2xl ${isDark ? 'bg-gray-800/60' : 'bg-gray-50'}`}>
                                                    {/* Steps */}
                                                    <div className="relative flex items-start justify-between mb-2">
                                                        {/* Background line */}
                                                        <div className={`absolute top-4 left-4 right-4 h-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                                        {/* Progress line */}
                                                        <div className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 progress-fill transition-all duration-1000"
                                                             style={{ width: `calc(${progress}% - 2rem)` }} />

                                                        {stepMeta.map((step, i) => {
                                                            const done    = i < stepIdx;
                                                            const active  = i === stepIdx;
                                                            const future  = i > stepIdx;
                                                            return (
                                                                <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-500 shadow-md
                                                                        ${done   ? `bg-gradient-to-br ${step.color}` : ''}
                                                                        ${active ? `bg-gradient-to-br ${step.color} ${step.glow} step-active` : ''}
                                                                        ${future ? isDark ? 'bg-gray-700 text-gray-500 shadow-none' : 'bg-gray-200 text-gray-400 shadow-none' : ''}`}>
                                                                        {done
                                                                            ? <CheckCircle2 size={14} />
                                                                            : <span className={future ? (isDark ? 'text-gray-500' : 'text-gray-400') : 'text-white'}>{step.icon}</span>}
                                                                    </div>
                                                                    <p className={`text-xs mt-1.5 font-medium text-center whitespace-nowrap
                                                                        ${done || active
                                                                        ? isDark ? 'text-blue-400' : 'text-blue-600'
                                                                        : isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                                        {step.label}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Current status text */}
                                                    <div className="flex items-center justify-between mt-3">
                                                        <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {req.status === 'PENDING'    && '⏳ Waiting for admin approval'}
                                                            {req.status === 'APPROVED'   && '✅ Approved! Being prepared for dispatch'}
                                                            {req.status === 'DISPATCHED' && '🚚 On the way to your address'}
                                                            {req.status === 'DELIVERED'  && '🎉 Delivered successfully!'}
                                                        </p>
                                                        <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                            Step {stepIdx + 1} of {STATUS_STEPS.length}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Rejected banner */}
                                            {isRejected && (
                                                <div className={`mt-2 p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-red-950/40 border border-red-800/40' : 'bg-red-50 border border-red-100'}`}>
                                                    <X size={14} className="text-red-500 shrink-0" />
                                                    <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                                                        Request was rejected. Please submit a new request or contact support.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>

                {/* ══════ REQUEST MODAL ════════════════════════════════════════════ */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border fu
                            ${isDark ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-100'}`}>

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/25">
                                        <BookOpen size={18} />
                                    </div>
                                    <div>
                                        <h2 className="syne text-lg font-bold">Request Checkbook</h2>
                                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Delivered in 5–7 working days</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)}
                                        className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {/* Account */}
                                <div>
                                    <label className={lbl}>Select Account</label>
                                    <select value={formData.accountNumber}
                                            onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                                            className={input}>
                                        {accounts.length === 0 && <option value="">No active accounts</option>}
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.accountNumber}>{acc.accountNumber} — {acc.accountType}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Leaves selector */}
                                <div>
                                    <label className={lbl}>Number of Leaves</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { value: 25, label: '25 Leaves', desc: 'Standard',  icon: '📄' },
                                            { value: 50, label: '50 Leaves', desc: 'Extended',  icon: '📋' },
                                        ].map(opt => (
                                            <button key={opt.value} type="button"
                                                    onClick={() => setFormData({...formData, numberOfLeaves: opt.value})}
                                                    className={`leaves-btn p-4 rounded-xl border-2 text-left transition-all
                                                    ${formData.numberOfLeaves === opt.value
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <span className="text-2xl">{opt.icon}</span>
                                                <p className={`text-sm font-bold mt-1 ${formData.numberOfLeaves === opt.value ? 'text-blue-600' : isDark ? 'text-white' : 'text-gray-800'}`}>{opt.label}</p>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div>
                                    <label className={lbl}>
                                        <span className="flex items-center gap-1.5"><MapPin size={13} /> Delivery Address</span>
                                    </label>
                                    <textarea
                                        value={formData.deliveryAddress}
                                        onChange={e => setFormData({...formData, deliveryAddress: e.target.value})}
                                        placeholder="123 Main St, Mumbai - 400001"
                                        rows={3}
                                        className={`${input} resize-none`}
                                    />
                                </div>

                                {/* Preview */}
                                {formData.accountNumber && formData.deliveryAddress && (
                                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
                                        <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>📦 Delivery Summary</p>
                                        <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                            <span className="font-semibold text-blue-500">{formData.numberOfLeaves} leaves</span> checkbook for{' '}
                                            <span className="font-mono text-xs">{formData.accountNumber}</span>
                                        </p>
                                        <p className={`text-xs mt-0.5 flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            <MapPin size={10} /> {formData.deliveryAddress.slice(0, 50)}{formData.deliveryAddress.length > 50 ? '…' : ''}
                                        </p>
                                    </div>
                                )}

                                <button onClick={handleSubmit} disabled={submitting}
                                        className="quick-btn w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all">
                                    {submitting
                                        ? <><RefreshCw size={16} className="animate-spin" /> Submitting…</>
                                        : <><BookOpen size={16} /> Submit Request</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}