import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { FileText, Download, Filter, X, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Fonts + Keyframes ───────────────────────────────────────────────────── */
const FontStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@600;700;800&display=swap');

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    @keyframes gradShift {
      0%,100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
    @keyframes slideRight {
      from { opacity:.5; transform: translateX(-6px); }
      to   { opacity:1;  transform: translateX(0); }
    }
    @keyframes pulseGreen {
      0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.4); }
      50%      { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
    }
    @keyframes rowIn {
      from { opacity:0; transform: translateX(-10px); }
      to   { opacity:1; transform: translateX(0); }
    }
    @keyframes skeletonPulse {
      0%,100% { opacity:.4; } 50% { opacity:.8; }
    }
    @keyframes spinSlow { to { transform: rotate(360deg); } }
    @keyframes countUp {
      from { opacity:0; transform: translateY(6px); }
      to   { opacity:1; transform: translateY(0); }
    }

    .st-fade-up   { animation: fadeUp .5s ease both; }
    .st-fade-up-1 { animation: fadeUp .5s .07s ease both; }
    .st-fade-up-2 { animation: fadeUp .5s .14s ease both; }
    .st-fade-up-3 { animation: fadeUp .5s .21s ease both; }
    .st-fade-up-4 { animation: fadeUp .5s .28s ease both; }

    .st-card-lift {
      transition: transform .22s ease, box-shadow .22s ease;
    }
    .st-card-lift:hover {
      transform: translateY(-4px);
    }

    .st-row {
      transition: background .18s ease, transform .18s ease;
      animation: rowIn .35s ease both;
    }
    .st-row:hover {
      transform: translateX(4px);
    }

    .st-dl-btn {
      background: linear-gradient(135deg,#059669,#10B981);
      background-size: 200% 200%;
      animation: gradShift 4s ease infinite;
      transition: transform .2s, filter .2s, box-shadow .2s;
    }
    .st-dl-btn:hover {
      transform: translateY(-3px);
      filter: brightness(1.1);
      box-shadow: 0 10px 28px rgba(16,185,129,.4);
    }

    .st-filter-input {
      transition: border-color .2s, box-shadow .2s;
    }
    .st-filter-input:focus {
      outline: none;
      border-color: #3B82F6 !important;
      box-shadow: 0 0 0 3px rgba(59,130,246,.15);
    }

    .st-skeleton { animation: skeletonPulse 1.5s ease infinite; }

    .st-badge-credit {
      background: rgba(16,185,129,.15);
      color: #10B981;
      border: 1px solid rgba(16,185,129,.25);
    }
    .st-badge-debit {
      background: rgba(239,68,68,.12);
      color: #EF4444;
      border: 1px solid rgba(239,68,68,.2);
    }

    .st-count { animation: countUp .4s ease both; }
  `}</style>
);

/* ─── Mini Sparkline ─────────────────────────────────────────────────────── */
const Spark = ({ data, color, h = 32 }) => {
    if (!data || data.length < 2) return null;
    const w = 80;
    const max = Math.max(...data), min = Math.min(...data);
    const rng = max - min || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 4) - 2}`).join(" ");
    const last = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / rng) * (h - 4) - 2 }));
    const fill = `M${last[0].x},${last[0].y} ${last.slice(1).map(p => `L${p.x},${p.y}`).join(" ")} L${w},${h} L0,${h} Z`;
    return (
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity=".3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fill} fill={`url(#sp-${color})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

/* ─── Skeleton Row ───────────────────────────────────────────────────────── */
const SkeletonRow = ({ isDark }) => (
    <div style={{
        display: "grid", gridTemplateColumns: "1.4fr 1.2fr 2fr 0.8fr 1fr",
        padding: "14px 20px", gap: 12, alignItems: "center",
    }} className="st-skeleton">
        {[180, 120, 220, 70, 90].map((w, i) => (
            <div key={i} style={{
                height: 12, borderRadius: 6, width: w,
                background: isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.07)",
                justifySelf: i === 3 ? "center" : i === 4 ? "end" : "start",
            }} />
        ))}
    </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Statement() {
    const { isDark } = useTheme();
    const { isAdmin } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [filtered, setFiltered]         = useState([]);
    const [accounts, setAccounts]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [filters, setFilters]           = useState({ accountNumber: '', fromDate: '', toDate: '', type: 'ALL' });

    /* ── theme tokens ── */
    const bg      = isDark ? "#070D1A"  : "#F0F4FF";
    const surface = isDark ? "#0F172A"  : "#FFFFFF";
    const surface2= isDark ? "#1A2438"  : "#F8FAFF";
    const border  = isDark ? "rgba(255,255,255,.06)" : "rgba(59,130,246,.1)";
    const text    = isDark ? "#E2E8F0"  : "#0F172A";
    const muted   = isDark ? "#64748B"  : "#94A3B8";
    const inputBg = isDark ? "#1E2A3A"  : "#F8FAFF";
    const inputBorder = isDark ? "rgba(255,255,255,.08)" : "rgba(59,130,246,.18)";

    useEffect(() => {
        if (isAdmin()) { fetchAllCustomers(); fetchAllTransactions(); }
        else           { fetchMyAccounts();  fetchMyTransactions(); }
    }, []);

    useEffect(() => { applyFilters(); }, [transactions, filters]);

    const fetchMyTransactions = async () => {
        try { const r = await API.get('/transactions/my'); setTransactions(r.data); }
        catch { toast.error('Failed to load transactions!'); }
        finally { setLoading(false); }
    };
    const fetchMyAccounts = async () => {
        try {
            const r = await API.get('/accounts/my');
            setAccounts(r.data);
            if (r.data.length > 0) setFilters(f => ({ ...f, accountNumber: r.data[0].accountNumber }));
        } catch {}
    };
    const fetchAllTransactions = async () => {
        try { const r = await API.get('/transactions/admin/all'); setTransactions(r.data); }
        catch { toast.error('Failed!'); }
        finally { setLoading(false); }
    };
    const fetchAllCustomers = async () => {
        try { await API.get('/admin/customers'); } catch {}
    };

    const applyFilters = () => {
        let data = [...transactions];
        if (filters.accountNumber)
            data = data.filter(t => t.accountNumber?.includes(filters.accountNumber) || t.account?.accountNumber?.includes(filters.accountNumber));
        if (filters.type !== 'ALL')
            data = data.filter(t => t.transactionType === filters.type);
        if (filters.fromDate)
            data = data.filter(t => new Date(t.createdAt) >= new Date(filters.fromDate));
        if (filters.toDate)
            data = data.filter(t => new Date(t.createdAt) <= new Date(filters.toDate + 'T23:59:59'));
        setFiltered(data);
    };

    const downloadCSV = () => {
        if (!filtered.length) { toast.error('No data to download!'); return; }
        const headers = ['Date', 'Reference', 'Description', 'Type', 'Amount', 'Balance After'];
        const rows    = filtered.map(t => [
            new Date(t.createdAt).toLocaleString('en-IN'),
            t.referenceNumber, t.description, t.transactionType, t.amount, t.balanceAfter,
        ]);
        const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = `statement_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        toast.success('Statement downloaded! 📄');
    };

    const totalCredit = filtered.filter(t => t.transactionType === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const totalDebit  = filtered.filter(t => t.transactionType === 'DEBIT').reduce((s, t) => s + t.amount, 0);
    const net         = totalCredit - totalDebit;

    /* sparkline data from filtered */
    const creditSpark = filtered.filter(t => t.transactionType === 'CREDIT').slice(-10).map(t => t.amount);
    const debitSpark  = filtered.filter(t => t.transactionType === 'DEBIT').slice(-10).map(t => t.amount);

    const hasActiveFilters = filters.fromDate || filters.toDate || filters.type !== 'ALL';

    const inputStyle = {
        width: "100%", padding: "10px 14px",
        background: inputBg, border: `1.5px solid ${inputBorder}`,
        borderRadius: 12, color: text,
        fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    };

    return (
        <>
            <FontStyle />
            <div style={{ display: "flex", minHeight: "100vh", background: bg, fontFamily: "'DM Sans', sans-serif" }}>
                <Sidebar />

                <main style={{ flex: 1, padding: "28px 28px", overflowX: "hidden" }}>

                    {/* ── Header ── */}
                    <div className="st-fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <FileText size={18} color="#fff" />
                                </div>
                                <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: text, letterSpacing: -0.5 }}>
                                    Bank Statement
                                </h1>
                            </div>
                            <p style={{ fontSize: 13, color: muted, marginLeft: 46 }}>
                                {isAdmin() ? "📋 All customer transactions" : "📋 Your complete transaction history"}
                            </p>
                        </div>

                        <button onClick={downloadCSV} className="st-dl-btn" style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "11px 20px", border: "none", borderRadius: 14,
                            color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 700,
                            fontSize: 13, cursor: "pointer", letterSpacing: .3,
                        }}>
                            <Download size={16} /> Download CSV
                        </button>
                    </div>

                    {/* ── Summary Cards ── */}
                    <div className="st-fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>

                        {/* Credit Card */}
                        <div className="st-card-lift" style={{
                            borderRadius: 18, padding: "18px 20px",
                            background: surface, border: `1px solid ${border}`,
                            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,.35)" : "0 4px 20px rgba(59,130,246,.08)",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                        <TrendingUp size={14} color="#10B981" />
                                        <span style={{ fontSize: 11, color: muted, fontWeight: 600, letterSpacing: .5, textTransform: "uppercase" }}>Total Credit</span>
                                    </div>
                                    <div className="st-count" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#10B981" }}>
                                        +₹{totalCredit.toLocaleString('en-IN')}
                                    </div>
                                    <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>{filtered.filter(t => t.transactionType === 'CREDIT').length} transactions</div>
                                </div>
                                <Spark data={creditSpark.length > 1 ? creditSpark : [1,2,3,4,5]} color="#10B981" />
                            </div>
                        </div>

                        {/* Debit Card */}
                        <div className="st-card-lift" style={{
                            borderRadius: 18, padding: "18px 20px",
                            background: surface, border: `1px solid ${border}`,
                            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,.35)" : "0 4px 20px rgba(59,130,246,.08)",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                        <TrendingDown size={14} color="#EF4444" />
                                        <span style={{ fontSize: 11, color: muted, fontWeight: 600, letterSpacing: .5, textTransform: "uppercase" }}>Total Debit</span>
                                    </div>
                                    <div className="st-count" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#EF4444" }}>
                                        -₹{totalDebit.toLocaleString('en-IN')}
                                    </div>
                                    <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>{filtered.filter(t => t.transactionType === 'DEBIT').length} transactions</div>
                                </div>
                                <Spark data={debitSpark.length > 1 ? debitSpark : [5,4,3,2,1]} color="#EF4444" />
                            </div>
                        </div>

                        {/* Net / Count Card */}
                        <div className="st-card-lift" style={{
                            borderRadius: 18, padding: "18px 20px",
                            background: surface, border: `1px solid ${border}`,
                            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,.35)" : "0 4px 20px rgba(59,130,246,.08)",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                        <Activity size={14} color="#3B82F6" />
                                        <span style={{ fontSize: 11, color: muted, fontWeight: 600, letterSpacing: .5, textTransform: "uppercase" }}>Net Balance</span>
                                    </div>
                                    <div className="st-count" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: net >= 0 ? "#3B82F6" : "#EF4444" }}>
                                        {net >= 0 ? "+" : ""}₹{Math.abs(net).toLocaleString('en-IN')}
                                    </div>
                                    <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>{filtered.length} total records</div>
                                </div>
                                <Spark data={[30,40,35,50,45,60,55,70,65,80]} color="#3B82F6" />
                            </div>
                        </div>
                    </div>

                    {/* ── Filters ── */}
                    <div className="st-fade-up-2" style={{
                        borderRadius: 20, padding: "18px 20px", marginBottom: 20,
                        background: surface, border: `1px solid ${border}`,
                        boxShadow: isDark ? "0 4px 20px rgba(0,0,0,.35)" : "0 4px 20px rgba(59,130,246,.06)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 8,
                                    background: "rgba(59,130,246,.12)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <Filter size={13} color="#3B82F6" />
                                </div>
                                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: text }}>
                  Filters
                </span>
                                {hasActiveFilters && (
                                    <span style={{
                                        padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700,
                                        background: "rgba(59,130,246,.15)", color: "#3B82F6"
                                    }}>Active</span>
                                )}
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={() => setFilters({ accountNumber: filters.accountNumber, fromDate: '', toDate: '', type: 'ALL' })}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 5,
                                        padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,.3)",
                                        background: "rgba(239,68,68,.08)", color: "#EF4444",
                                        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif"
                                    }}
                                >
                                    <X size={12} /> Clear Filters
                                </button>
                            )}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>

                            {/* Account filter */}
                            {isAdmin() ? (
                                <input
                                    type="text" placeholder="🔍 Account Number"
                                    value={filters.accountNumber}
                                    onChange={e => setFilters({ ...filters, accountNumber: e.target.value })}
                                    className="st-filter-input"
                                    style={inputStyle}
                                />
                            ) : (
                                <select
                                    value={filters.accountNumber}
                                    onChange={e => setFilters({ ...filters, accountNumber: e.target.value })}
                                    className="st-filter-input"
                                    style={inputStyle}
                                >
                                    <option value="">All Accounts</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.accountNumber}>{acc.accountNumber}</option>
                                    ))}
                                </select>
                            )}

                            {/* Type */}
                            <select
                                value={filters.type}
                                onChange={e => setFilters({ ...filters, type: e.target.value })}
                                className="st-filter-input"
                                style={inputStyle}
                            >
                                <option value="ALL">All Types</option>
                                <option value="CREDIT">Credit Only ↑</option>
                                <option value="DEBIT">Debit Only ↓</option>
                            </select>

                            {/* From */}
                            <input
                                type="date" value={filters.fromDate}
                                onChange={e => setFilters({ ...filters, fromDate: e.target.value })}
                                className="st-filter-input"
                                style={{ ...inputStyle, colorScheme: isDark ? "dark" : "light" }}
                            />

                            {/* To */}
                            <input
                                type="date" value={filters.toDate}
                                onChange={e => setFilters({ ...filters, toDate: e.target.value })}
                                className="st-filter-input"
                                style={{ ...inputStyle, colorScheme: isDark ? "dark" : "light" }}
                            />
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div className="st-fade-up-3" style={{
                        borderRadius: 20, overflow: "hidden",
                        background: surface, border: `1px solid ${border}`,
                        boxShadow: isDark ? "0 4px 20px rgba(0,0,0,.35)" : "0 4px 20px rgba(59,130,246,.06)",
                    }}>

                        {/* Table Header */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "1.4fr 1.2fr 2fr 0.8fr 1fr",
                            padding: "12px 20px", gap: 12,
                            background: isDark ? "rgba(255,255,255,.04)" : "rgba(59,130,246,.05)",
                            borderBottom: `1px solid ${border}`,
                        }}>
                            {["Date & Time", "Reference", "Description", "Type", "Amount"].map((h, i) => (
                                <span key={i} style={{
                                    fontSize: 10.5, fontWeight: 700, color: muted,
                                    letterSpacing: .8, textTransform: "uppercase",
                                    textAlign: i === 3 ? "center" : i === 4 ? "right" : "left",
                                }}>{h}</span>
                            ))}
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div>
                                {[...Array(6)].map((_, i) => <SkeletonRow key={i} isDark={isDark} />)}
                            </div>
                        )}

                        {/* Empty */}
                        {!loading && filtered.length === 0 && (
                            <div style={{
                                padding: "64px 20px", textAlign: "center",
                                animation: "fadeIn .4s ease"
                            }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: 20, margin: "0 auto 16px",
                                    background: isDark ? "rgba(255,255,255,.05)" : "rgba(59,130,246,.06)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <FileText size={28} color={muted} />
                                </div>
                                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: text, marginBottom: 6 }}>
                                    No transactions found
                                </div>
                                <div style={{ fontSize: 13, color: muted }}>Try adjusting your filters</div>
                            </div>
                        )}

                        {/* Rows */}
                        {!loading && filtered.map((txn, i) => (
                            <div
                                key={txn.id}
                                className="st-row"
                                style={{
                                    display: "grid", gridTemplateColumns: "1.4fr 1.2fr 2fr 0.8fr 1fr",
                                    padding: "13px 20px", gap: 12, alignItems: "center",
                                    background: i % 2 === 0
                                        ? "transparent"
                                        : isDark ? "rgba(255,255,255,.02)" : "rgba(59,130,246,.02)",
                                    borderBottom: `1px solid ${border}`,
                                    cursor: "default",
                                    animationDelay: `${Math.min(i * 0.03, 0.4)}s`,
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(59,130,246,.06)" : "rgba(59,130,246,.04)"}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : isDark ? "rgba(255,255,255,.02)" : "rgba(59,130,246,.02)"}
                            >
                                {/* Date */}
                                <span style={{ fontSize: 11.5, color: muted, fontVariantNumeric: "tabular-nums" }}>
                  {new Date(txn.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>

                                {/* Reference */}
                                <span style={{
                                    fontSize: 11, fontFamily: "monospace", color: muted,
                                    background: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)",
                                    padding: "2px 6px", borderRadius: 6, display: "inline-block",
                                    maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                }}>
                  {txn.referenceNumber}
                </span>

                                {/* Description */}
                                <span style={{
                                    fontSize: 13, color: text, fontWeight: 500,
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                }}>
                  {txn.description}
                </span>

                                {/* Type badge */}
                                <div style={{ textAlign: "center" }}>
                  <span className={txn.transactionType === 'CREDIT' ? "st-badge-credit" : "st-badge-debit"} style={{
                      fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
                      letterSpacing: .5, textTransform: "uppercase"
                  }}>
                    {txn.transactionType === 'CREDIT' ? "↑ Credit" : "↓ Debit"}
                  </span>
                                </div>

                                {/* Amount */}
                                <span style={{
                                    textAlign: "right", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14,
                                    color: txn.transactionType === 'CREDIT' ? "#10B981" : "#EF4444",
                                }}>
                  {txn.transactionType === 'CREDIT' ? "+" : "-"}₹{txn.amount?.toLocaleString('en-IN')}
                </span>
                            </div>
                        ))}

                        {/* Footer */}
                        {!loading && filtered.length > 0 && (
                            <div style={{
                                padding: "12px 20px", display: "flex", justifyContent: "space-between",
                                alignItems: "center", borderTop: `1px solid ${border}`,
                                background: isDark ? "rgba(255,255,255,.02)" : "rgba(59,130,246,.03)",
                            }}>
                <span style={{ fontSize: 12, color: muted }}>
                  Showing <strong style={{ color: text }}>{filtered.length}</strong> transactions
                </span>
                                <span style={{ fontSize: 12, color: muted }}>
                  Net: <strong style={{ color: net >= 0 ? "#10B981" : "#EF4444", fontFamily: "'Syne',sans-serif" }}>
                    {net >= 0 ? "+" : ""}₹{Math.abs(net).toLocaleString('en-IN')}
                  </strong>
                </span>
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </>
    );
}