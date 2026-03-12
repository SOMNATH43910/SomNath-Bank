import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
    Landmark, CreditCard, Building2, PiggyBank,
    Bell, TrendingUp, ArrowUpRight, ArrowDownLeft,
    Send, Plus, FileText, ArrowLeftRight, Zap,
    Shield, Users, Activity, ChevronRight,
    Wallet, BarChart3, Clock, CheckCircle2,
    AlertCircle, Sparkles, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

// Animated counter hook
function useCounter(target, duration = 1200) {
    const [count, setCount] = useState(0);
    const startTime = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        if (target === 0 || target == null) return;
        const animate = (ts) => {
            if (!startTime.current) startTime.current = ts;
            const elapsed = ts - startTime.current;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * target));
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);

    return count;
}

// Mini sparkline component
function Sparkline({ data = [], color = '#3b82f6' }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80, height = 28;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function Dashboard() {
    const { user, isAdmin } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balanceVisible, setBalanceVisible] = useState(true);
    const [mounted, setMounted] = useState(false);

    const balance = useCounter(data?.totalBalance ?? 0, 1400);

    useEffect(() => {
        fetchDashboard();
        if (!isAdmin()) fetchRecentTransactions();
        setTimeout(() => setMounted(true), 100);
    }, []);

    const fetchDashboard = async () => {
        try {
            const url = isAdmin() ? '/admin/dashboard' : '/admin/dashboard/customer';
            const res = await API.get(url);
            setData(res.data);
        } catch {
            toast.error('Failed to load dashboard!');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentTransactions = async () => {
        try {
            const res = await API.get('/transactions/my');
            setTransactions(res.data.slice(0, 6));
        } catch {}
    };

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    // ─── CUSTOMER STATS ───────────────────────────────────────────────────────

    const customerStats = data ? [
        {
            title: 'Active Cards',
            value: data.activeCards ?? 0,
            sub: `${data.totalCards ?? 0} total`,
            icon: <CreditCard size={20} />,
            grad: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            sparkData: [2, 3, 2, 4, 3, 4, data.activeCards ?? 3],
            sparkColor: '#a855f7',
        },
        {
            title: 'Active Loans',
            value: data.activeLoans ?? 0,
            sub: `₹${(data.totalLoanAmount ?? 0).toLocaleString('en-IN')} pending`,
            icon: <Building2 size={20} />,
            grad: 'linear-gradient(135deg, #ea580c, #f97316)',
            sparkData: [1, 2, 1, 2, 1, 1, data.activeLoans ?? 1],
            sparkColor: '#f97316',
        },
        {
            title: 'Fixed Deposits',
            value: data.totalFds ?? 0,
            sub: `₹${(data.totalFdAmount ?? 0).toLocaleString('en-IN')} invested`,
            icon: <PiggyBank size={20} />,
            grad: 'linear-gradient(135deg, #059669, #10b981)',
            sparkData: [1, 1, 2, 2, 3, 3, data.totalFds ?? 2],
            sparkColor: '#10b981',
        },
        {
            title: 'Notifications',
            value: data.unreadNotifications ?? 0,
            sub: 'Unread messages',
            icon: <Bell size={20} />,
            grad: 'linear-gradient(135deg, #dc2626, #ef4444)',
            sparkData: [3, 5, 2, 6, 4, 7, data.unreadNotifications ?? 0],
            sparkColor: '#ef4444',
        },
    ] : [];

    const quickActions = [
        { label: 'Send Money',   icon: <Send size={18} />,           path: '/transactions',  grad: 'linear-gradient(135deg,#2563eb,#3b82f6)' },
        { label: 'Add Money',    icon: <Plus size={18} />,           path: '/transactions',  grad: 'linear-gradient(135deg,#059669,#10b981)' },
        { label: 'Statement',    icon: <FileText size={18} />,       path: '/statement',     grad: 'linear-gradient(135deg,#7c3aed,#8b5cf6)' },
        { label: 'History',      icon: <ArrowLeftRight size={18} />, path: '/transactions',  grad: 'linear-gradient(135deg,#d97706,#f59e0b)' },
        { label: 'Checkbook',    icon: <FileText size={18} />,       path: '/checkbook',     grad: 'linear-gradient(135deg,#0891b2,#06b6d4)' },
        { label: 'KYC',          icon: <Shield size={18} />,         path: '/kyc',           grad: 'linear-gradient(135deg,#be185d,#ec4899)' },
    ];

    // ─── ADMIN STATS ──────────────────────────────────────────────────────────

    const adminStats = data ? [
        {
            title: 'Total Customers',
            value: data.totalCustomers ?? 0,
            icon: <Users size={20} />,
            grad: 'linear-gradient(135deg,#2563eb,#3b82f6)',
            sparkData: [10,15,12,18,20,22, data.totalCustomers ?? 0],
            sparkColor: '#3b82f6',
            change: '+12%',
            up: true,
        },
        {
            title: 'Pending Accounts',
            value: data.pendingAccounts ?? 0,
            icon: <Clock size={20} />,
            grad: 'linear-gradient(135deg,#d97706,#f59e0b)',
            sparkData: [3,5,4,6,5,4, data.pendingAccounts ?? 0],
            sparkColor: '#f59e0b',
            change: 'needs action',
            up: false,
        },
        {
            title: 'Pending Loans',
            value: data.pendingLoans ?? 0,
            icon: <AlertCircle size={20} />,
            grad: 'linear-gradient(135deg,#ea580c,#f97316)',
            sparkData: [1,3,2,4,3,5, data.pendingLoans ?? 0],
            sparkColor: '#f97316',
            change: 'review now',
            up: false,
        },
        {
            title: 'Total Transactions',
            value: data.totalTransactions ?? 0,
            icon: <Activity size={20} />,
            grad: 'linear-gradient(135deg,#059669,#10b981)',
            sparkData: [20,35,28,42,38,50, data.totalTransactions ?? 0],
            sparkColor: '#10b981',
            change: '+8%',
            up: true,
        },
        {
            title: 'Total Balance',
            value: `₹${((data.totalBalance ?? 0)/100000).toFixed(1)}L`,
            icon: <Wallet size={20} />,
            grad: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
            sparkData: [40,55,48,62,58,70,75],
            sparkColor: '#8b5cf6',
            change: '+5.2%',
            up: true,
            isString: true,
        },
        {
            title: 'Active Cards',
            value: data.activeCards ?? 0,
            icon: <CreditCard size={20} />,
            grad: 'linear-gradient(135deg,#be185d,#ec4899)',
            sparkData: [5,8,7,10,9,11, data.activeCards ?? 0],
            sparkColor: '#ec4899',
            change: '+3 this month',
            up: true,
        },
    ] : [];

    // ─── CSS KEYFRAMES ────────────────────────────────────────────────────────
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
        .dash-root { font-family: 'DM Sans', sans-serif; }
        .dash-heading { font-family: 'Syne', sans-serif; }

        @keyframes fadeUp {
            from { opacity:0; transform:translateY(20px); }
            to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity:0; } to { opacity:1; }
        }
        @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
            0%   { transform:scale(1);   opacity:.6; }
            100% { transform:scale(1.5); opacity:0; }
        }
        @keyframes floatY {
            0%,100% { transform:translateY(0); }
            50%     { transform:translateY(-6px); }
        }
        @keyframes rotateGlow {
            0%   { transform:rotate(0deg); }
            100% { transform:rotate(360deg); }
        }

        .anim-fade-up { animation: fadeUp 0.5s ease both; }
        .anim-fade-in { animation: fadeIn 0.4s ease both; }

        .balance-card {
            position:relative;
            overflow:hidden;
            border-radius:24px;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #2563eb 70%, #3b82f6 100%);
        }
        .balance-card::before {
            content:'';
            position:absolute;
            width:280px; height:280px;
            background:rgba(255,255,255,0.07);
            border-radius:50%;
            top:-80px; right:-60px;
        }
        .balance-card::after {
            content:'';
            position:absolute;
            width:200px; height:200px;
            background:rgba(255,255,255,0.05);
            border-radius:50%;
            bottom:-60px; left:20px;
        }

        .balance-card-dark {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #1e3a8a 80%, #2563eb 100%);
        }

        .stat-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor:default;
        }
        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }

        .quick-btn {
            transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .quick-btn:hover {
            transform: translateY(-4px) scale(1.04);
            box-shadow: 0 10px 24px rgba(0,0,0,0.2);
        }

        .txn-row {
            transition: background 0.15s ease, transform 0.15s ease;
        }
        .txn-row:hover {
            transform: translateX(4px);
        }

        .live-dot {
            width:8px; height:8px; border-radius:50%; background:#22c55e;
            position:relative; display:inline-block;
        }
        .live-dot::after {
            content:''; position:absolute;
            inset:-3px; border-radius:50%;
            background:#22c55e;
            animation: pulse-ring 1.4s ease-out infinite;
        }

        .shimmer-text {
            background: linear-gradient(90deg, #fff 0%, #93c5fd 50%, #fff 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 3s linear infinite;
        }

        .admin-hero {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2d5e 100%);
            border-radius: 24px;
            position: relative;
            overflow: hidden;
        }
        .admin-hero::before {
            content:'';
            position:absolute;
            width:400px; height:400px;
            background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
            top:-100px; right:-100px;
            border-radius:50%;
        }

        .glow-blue { box-shadow: 0 0 20px rgba(59,130,246,0.3); }
        .glow-green { box-shadow: 0 0 20px rgba(16,185,129,0.3); }
    `;

    // ─── LOADING SKELETON ─────────────────────────────────────────────────────
    if (loading) return (
        <div className={`flex min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
            <style>{styles}</style>
            <Sidebar />
            <main className="flex-1 p-6 md:p-8">
                <div className="animate-pulse space-y-4">
                    <div className={`h-8 w-64 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                    <div className={`h-48 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_,i) => (
                            <div key={i} className={`h-32 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );

    // ─── CUSTOMER DASHBOARD ───────────────────────────────────────────────────
    if (!isAdmin()) return (
        <div className={`flex min-h-screen dash-root ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
            <style>{styles}</style>
            <Sidebar />

            <main className="flex-1 p-5 md:p-8 overflow-auto">

                {/* Greeting */}
                <div className="anim-fade-up mb-7" style={{ animationDelay: '0ms' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="live-dot" />
                        <span className={`text-xs font-medium uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            Live Banking
                        </span>
                    </div>
                    <h1 className={`dash-heading text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {greeting()}, {user?.fullName?.split(' ')[0]}
                        <span style={{ display:'inline-block', marginLeft:'8px' }}>👋</span>
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date().toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
                    </p>
                </div>

                {/* HERO BALANCE CARD */}
                <div className={`balance-card ${isDark ? 'balance-card-dark' : ''} p-7 mb-6 anim-fade-up`}
                     style={{ animationDelay:'80ms' }}>
                    <div style={{ position:'relative', zIndex:1 }}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-blue-200 text-sm font-medium mb-1 uppercase tracking-wider">
                                    Total Balance
                                </p>
                                <div className="flex items-center gap-3">
                                    {balanceVisible ? (
                                        <p className="shimmer-text dash-heading font-bold"
                                           style={{ fontSize:'clamp(2rem,5vw,3rem)', lineHeight:1 }}>
                                            ₹{balance.toLocaleString('en-IN')}
                                        </p>
                                    ) : (
                                        <p className="text-white dash-heading font-bold"
                                           style={{ fontSize:'clamp(2rem,5vw,3rem)', lineHeight:1, letterSpacing:'0.2em' }}>
                                            ••••••••
                                        </p>
                                    )}
                                    <button onClick={() => setBalanceVisible(!balanceVisible)}
                                            className="text-blue-200 hover:text-white transition-colors mt-1">
                                        {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div style={{
                                background:'rgba(255,255,255,0.12)',
                                backdropFilter:'blur(10px)',
                                borderRadius:'16px',
                                padding:'12px',
                                border:'1px solid rgba(255,255,255,0.2)'
                            }}>
                                <Wallet size={28} className="text-white" />
                            </div>
                        </div>

                        {/* Card details row */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex gap-5">
                                <div>
                                    <p className="text-blue-300 text-xs mb-1">Accounts</p>
                                    <p className="text-white font-bold text-lg">{data?.totalAccounts ?? '—'}</p>
                                </div>
                                <div style={{ width:'1px', background:'rgba(255,255,255,0.15)' }} />
                                <div>
                                    <p className="text-blue-300 text-xs mb-1">Total FD</p>
                                    <p className="text-white font-bold text-lg">₹{(data?.totalFdAmount ?? 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div style={{ width:'1px', background:'rgba(255,255,255,0.15)' }} />
                                <div>
                                    <p className="text-blue-300 text-xs mb-1">Loan Due</p>
                                    <p className="text-white font-bold text-lg">₹{(data?.totalLoanAmount ?? 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            <div style={{
                                background:'rgba(255,255,255,0.12)',
                                borderRadius:'12px',
                                padding:'6px 14px',
                                border:'1px solid rgba(255,255,255,0.15)'
                            }}>
                                <span className="text-white text-xs font-medium flex items-center gap-1">
                                    <Sparkles size={13} /> Premium Member
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className={`rounded-2xl p-5 mb-6 anim-fade-up ${isDark ? 'bg-gray-900' : 'bg-white'}`}
                     style={{ animationDelay:'160ms', boxShadow: isDark ? 'none' : '0 1px 20px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`dash-heading font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Quick Actions
                        </h2>
                        <Zap size={16} className="text-yellow-400" />
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {quickActions.map((a, i) => (
                            <button key={i} onClick={() => navigate(a.path)}
                                    className="quick-btn flex flex-col items-center gap-2.5">
                                <div style={{
                                    background: a.grad,
                                    borderRadius:'16px',
                                    padding:'14px',
                                    color:'white',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                                }}>
                                    {a.icon}
                                </div>
                                <span className={`text-xs font-medium text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {a.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* STAT CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {customerStats.map((s, i) => (
                        <div key={i}
                             className={`stat-card rounded-2xl p-4 anim-fade-up ${isDark ? 'bg-gray-900' : 'bg-white'}`}
                             style={{
                                 animationDelay: `${200 + i * 80}ms`,
                                 boxShadow: isDark ? 'none' : '0 1px 20px rgba(0,0,0,0.06)'
                             }}>
                            <div className="flex items-start justify-between mb-3">
                                <div style={{
                                    background: s.grad,
                                    borderRadius:'12px',
                                    padding:'8px',
                                    color:'white',
                                    boxShadow:'0 4px 12px rgba(0,0,0,0.15)'
                                }}>
                                    {s.icon}
                                </div>
                                <Sparkline data={s.sparkData} color={s.sparkColor} />
                            </div>
                            <p className={`text-2xl font-bold dash-heading mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {s.value}
                            </p>
                            <p className={`text-xs font-medium mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {s.title}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* LOAN ALERT */}
                {(data?.totalLoanAmount ?? 0) > 0 && (
                    <div className="anim-fade-up mb-6 rounded-2xl p-4 flex items-center justify-between"
                         style={{
                             animationDelay:'560ms',
                             background: isDark
                                 ? 'linear-gradient(135deg, rgba(234,88,12,0.15), rgba(249,115,22,0.1))'
                                 : 'linear-gradient(135deg, #fff7ed, #ffedd5)',
                             border: '1px solid rgba(234,88,12,0.3)',
                         }}>
                        <div className="flex items-center gap-3">
                            <div style={{ background:'linear-gradient(135deg,#ea580c,#f97316)', borderRadius:'12px', padding:'8px', color:'white' }}>
                                <AlertCircle size={18} />
                            </div>
                            <div>
                                <p className="font-semibold text-orange-500 text-sm">Active Loan Outstanding</p>
                                <p className={`text-xs ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                                    ₹{(data?.totalLoanAmount ?? 0).toLocaleString('en-IN')} pending • Pay EMI on time
                                </p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/loans')}
                                style={{ background:'linear-gradient(135deg,#ea580c,#f97316)', borderRadius:'10px', padding:'7px 14px' }}
                                className="text-white text-xs font-semibold flex items-center gap-1">
                            View <ChevronRight size={13} />
                        </button>
                    </div>
                )}

                {/* RECENT TRANSACTIONS */}
                <div className={`rounded-2xl p-5 anim-fade-up ${isDark ? 'bg-gray-900' : 'bg-white'}`}
                     style={{
                         animationDelay:'600ms',
                         boxShadow: isDark ? 'none' : '0 1px 20px rgba(0,0,0,0.06)'
                     }}>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className={`dash-heading font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Recent Transactions
                            </h2>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Last {transactions.length} activities
                            </p>
                        </div>
                        <button onClick={() => navigate('/transactions')}
                                className="text-blue-500 hover:text-blue-400 text-sm font-semibold flex items-center gap-1 transition-colors">
                            View All <ChevronRight size={15} />
                        </button>
                    </div>

                    {transactions.length === 0 ? (
                        <div className={`text-center py-10 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                            <ArrowLeftRight size={36} className="mx-auto mb-3" />
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                No transactions yet!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {transactions.map((txn, i) => {
                                const isCredit = txn.transactionType === 'CREDIT';
                                return (
                                    <div key={txn.id} className={`txn-row flex items-center justify-between px-3 py-3 rounded-xl
                                        ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div style={{
                                                background: isCredit
                                                    ? 'linear-gradient(135deg,#059669,#10b981)'
                                                    : 'linear-gradient(135deg,#dc2626,#ef4444)',
                                                borderRadius:'12px', padding:'8px', color:'white',
                                                boxShadow:'0 3px 8px rgba(0,0,0,0.15)'
                                            }}>
                                                {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {txn.description || (isCredit ? 'Money Received' : 'Money Sent')}
                                                </p>
                                                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {formatDate(txn.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-sm ${isCredit ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {isCredit ? '+' : '−'}₹{(txn.amount ?? 0).toLocaleString('en-IN')}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                                                {txn.transactionType}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );

    // ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────
    return (
        <div className={`flex min-h-screen dash-root ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
            <style>{styles}</style>
            <Sidebar />

            <main className="flex-1 p-5 md:p-8 overflow-auto">

                {/* Admin Header */}
                <div className="anim-fade-up mb-7" style={{ animationDelay:'0ms' }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="live-dot" />
                        <span className={`text-xs uppercase tracking-widest font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            Admin Control Center
                        </span>
                    </div>
                    <h1 className={`dash-heading text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Welcome, {user?.fullName?.split(' ')[0]}
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date().toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
                    </p>
                </div>

                {/* Admin Hero Banner */}
                <div className="admin-hero p-7 mb-6 anim-fade-up" style={{ animationDelay:'80ms' }}>
                    <div style={{ position:'relative', zIndex:1 }}>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-blue-300 text-xs uppercase tracking-widest mb-2">Bank Overview</p>
                                <p className="shimmer-text dash-heading font-bold" style={{ fontSize:'clamp(1.6rem,4vw,2.5rem)' }}>
                                    SomNath Bank
                                </p>
                                <p className="text-gray-400 text-sm mt-1">Full operational control & monitoring</p>
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {[
                                    { label: 'System',  val: 'Online',  color: '#22c55e' },
                                    { label: 'API',     val: 'Active',  color: '#3b82f6' },
                                    { label: 'DB',      val: 'Healthy', color: '#a855f7' },
                                ].map(s => (
                                    <div key={s.label} style={{
                                        background:'rgba(255,255,255,0.07)',
                                        border:'1px solid rgba(255,255,255,0.12)',
                                        borderRadius:'12px', padding:'10px 16px'
                                    }}>
                                        <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                                        <p className="font-bold text-sm flex items-center gap-1.5" style={{ color: s.color }}>
                                            <CheckCircle2 size={13} /> {s.val}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {adminStats.map((s, i) => (
                        <div key={i}
                             className={`stat-card rounded-2xl p-5 anim-fade-up ${isDark ? 'bg-gray-900' : 'bg-white'}`}
                             style={{
                                 animationDelay:`${180 + i * 70}ms`,
                                 boxShadow: isDark ? 'none' : '0 1px 20px rgba(0,0,0,0.06)'
                             }}>
                            <div className="flex items-start justify-between mb-4">
                                <div style={{
                                    background: s.grad,
                                    borderRadius:'14px', padding:'10px', color:'white',
                                    boxShadow:'0 4px 14px rgba(0,0,0,0.2)'
                                }}>
                                    {s.icon}
                                </div>
                                <Sparkline data={s.sparkData} color={s.sparkColor} />
                            </div>
                            <p className={`dash-heading font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                               style={{ fontSize: s.isString ? '1.5rem' : '2rem', lineHeight:1 }}>
                                {s.isString ? s.value : s.value.toLocaleString('en-IN')}
                            </p>
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.title}</p>
                            <span style={{
                                display:'inline-flex', alignItems:'center', gap:'4px',
                                fontSize:'11px', fontWeight:600,
                                padding:'3px 8px', borderRadius:'20px',
                                background: s.up ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                                color: s.up ? '#10b981' : '#f59e0b'
                            }}>
                                {s.up ? <TrendingUp size={11} /> : <Clock size={11} />} {s.change}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Admin Quick Access */}
                <div className={`rounded-2xl p-5 anim-fade-up ${isDark ? 'bg-gray-900' : 'bg-white'}`}
                     style={{
                         animationDelay:'620ms',
                         boxShadow: isDark ? 'none' : '0 1px 20px rgba(0,0,0,0.06)'
                     }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`dash-heading font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Quick Access
                        </h2>
                        <BarChart3 size={16} className={isDark ? 'text-gray-500' : 'text-gray-300'} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label:'All Customers',  path:'/admin', tab:'customers',  grad:'linear-gradient(135deg,#2563eb,#3b82f6)', icon:<Users size={18}/> },
                            { label:'Pending Loans',  path:'/admin', tab:'loans',      grad:'linear-gradient(135deg,#ea580c,#f97316)', icon:<Building2 size={18}/> },
                            { label:'KYC Reviews',    path:'/admin', tab:'kyc',        grad:'linear-gradient(135deg,#7c3aed,#a855f7)', icon:<Shield size={18}/> },
                            { label:'Complaints',     path:'/admin', tab:'complaints', grad:'linear-gradient(135deg,#be185d,#ec4899)', icon:<Activity size={18}/> },
                        ].map((a, i) => (
                            <button key={i} onClick={() => navigate(a.path)}
                                    className="quick-btn flex items-center gap-3 rounded-xl p-4 text-left w-full"
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                                        border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0'
                                    }}>
                                <div style={{
                                    background: a.grad, borderRadius:'10px',
                                    padding:'8px', color:'white',
                                    boxShadow:'0 3px 10px rgba(0,0,0,0.15)'
                                }}>
                                    {a.icon}
                                </div>
                                <span className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    {a.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}