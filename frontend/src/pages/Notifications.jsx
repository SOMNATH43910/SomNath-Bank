import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { Bell, CheckCheck, Check, BellOff, SlidersHorizontal, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Global styles ─────────────────────────────────────────────────────── */
const GlobalStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --blue:    #3b82f6;
      --indigo:  #6366f1;
      --violet:  #8b5cf6;
      --emerald: #10b981;
      --amber:   #f59e0b;
      --rose:    #ef4444;
      --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* ── Keyframes ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes bellShake {
      0%,100% { transform: rotate(0); }
      10%     { transform: rotate(16deg); }
      25%     { transform: rotate(-13deg); }
      40%     { transform: rotate(10deg); }
      55%     { transform: rotate(-7deg); }
      70%     { transform: rotate(4deg); }
    }
    @keyframes badgePop {
      0%   { transform: scale(0) rotate(-15deg); }
      65%  { transform: scale(1.25) rotate(4deg); }
      100% { transform: scale(1) rotate(0); }
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.4; transform: scale(0.85); }
    }
    @keyframes skeletonPulse {
      0%, 100% { opacity: 0.3; }
      50%      { opacity: 0.65; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes cardIn {
      from { opacity: 0; transform: translateY(14px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes readFlash {
      0%   { background: rgba(99,102,241,0.18); }
      100% { background: inherit; }
    }
    @keyframes checkBounce {
      0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
      65%  { transform: scale(1.3) rotate(5deg); opacity: 1; }
      100% { transform: scale(1) rotate(0); opacity: 1; }
    }
    @keyframes gradFlow {
      0%, 100% { background-position: 0% 50%; }
      50%       { background-position: 100% 50%; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Utility classes ── */
    .nf-fade-up   { animation: fadeUp  0.5s ease both; }
    .nf-fade-up-1 { animation: fadeUp  0.5s 0.08s ease both; }
    .nf-fade-up-2 { animation: fadeUp  0.5s 0.16s ease both; }
    .nf-fade-in   { animation: fadeIn  0.4s ease both; }

    .nf-bell { animation: bellShake 1.6s ease 0.6s both; }

    /* ── Card ── */
    .nf-card {
      position: relative;
      overflow: hidden;
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      animation: cardIn 0.45s var(--ease-spring) both;
      cursor: default;
    }
    .nf-card:hover { transform: translateY(-2px); }
    .nf-card.unread:hover { transform: translateY(-2px) translateX(2px); }

    /* Read flash on mark-as-read */
    .nf-card.just-read { animation: readFlash 0.5s ease both; }

    /* Shimmer line across card top */
    .nf-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: shimmer 3s ease-in-out infinite;
    }

    /* ── Filter tabs ── */
    .nf-tab {
      padding: 7px 14px;
      border-radius: 99px;
      border: none;
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.18s var(--ease-spring), box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease;
      white-space: nowrap;
    }
    .nf-tab:hover:not(.active) { transform: translateY(-1px); }
    .nf-tab.active {
      background: linear-gradient(135deg, var(--indigo), var(--violet)) !important;
      color: #fff !important;
      box-shadow: 0 6px 18px rgba(99,102,241,0.38);
      transform: translateY(-1px);
    }

    /* ── Mark all button ── */
    .nf-mark-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 14px;
      border: none; cursor: pointer;
      font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 13px;
      color: #fff; letter-spacing: 0.2px;
      background: linear-gradient(135deg, #2563eb, #06b6d4);
      background-size: 200% 200%;
      animation: gradFlow 4s ease infinite;
      transition: transform 0.22s var(--ease-spring), box-shadow 0.22s ease, opacity 0.2s;
      box-shadow: 0 6px 20px rgba(59,130,246,0.32);
    }
    .nf-mark-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 12px 28px rgba(59,130,246,0.42);
    }
    .nf-mark-btn:disabled { opacity: 0.65; cursor: not-allowed; }

    /* ── Read button ── */
    .nf-read-btn {
      display: flex; align-items: center; gap: 4px;
      padding: 5px 10px; border-radius: 8px;
      border: none; cursor: pointer;
      font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 11px;
      background: rgba(99,102,241,0.12);
      border: 1px solid rgba(99,102,241,0.22);
      color: var(--indigo);
      transition: transform 0.18s var(--ease-spring), background 0.18s, box-shadow 0.18s;
    }
    .nf-read-btn:hover {
      transform: scale(1.08);
      background: rgba(99,102,241,0.2);
      box-shadow: 0 4px 12px rgba(99,102,241,0.22);
    }
    .nf-read-btn .check-icon { animation: checkBounce 0.35s var(--ease-spring) both; }

    /* ── Pulse dot ── */
    .nf-dot { animation: pulseDot 2s ease infinite; }

    /* ── Skeleton ── */
    .nf-skeleton { animation: skeletonPulse 1.6s ease infinite; }

    /* ── Count badge ── */
    .nf-badge { animation: badgePop 0.4s var(--ease-spring) both; }

    /* ── Stat count ── */
    .nf-stat-count { animation: countUp 0.4s ease both; }

    /* ── Scroll area ── */
    .nf-scroll::-webkit-scrollbar { width: 4px; }
    .nf-scroll::-webkit-scrollbar-track { background: transparent; }
    .nf-scroll::-webkit-scrollbar-thumb { border-radius: 99px; background: rgba(99,102,241,0.25); }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .nf-header-row { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
      .nf-stats-row { display: none; }
    }
  `}</style>
);

/* ─── Type config ─────────────────────────────────────────────────────────── */
const TYPE_CONFIG = {
    SUCCESS: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.22)', label: 'Success',  glow: 'rgba(16,185,129,0.15)'  },
    WARNING: { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.22)', label: 'Warning',  glow: 'rgba(245,158,11,0.15)'  },
    ALERT:   { icon: '🚨', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.22)',  label: 'Alert',    glow: 'rgba(239,68,68,0.15)'   },
    INFO:    { icon: 'ℹ️', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.22)', label: 'Info',     glow: 'rgba(59,130,246,0.15)'  },
};
const getType = (t) => TYPE_CONFIG[t] ?? { icon: '🔔', color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', label: t, glow: 'transparent' };

/* ─── Skeleton card ──────────────────────────────────────────────────────── */
const SkeletonCard = ({ isDark, delay = 0 }) => {
    const sh = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
    return (
        <div className="nf-skeleton" style={{
            borderRadius: 18, padding: '18px 22px',
            display: 'flex', gap: 14, alignItems: 'flex-start',
            animationDelay: `${delay}s`,
        }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: sh, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ height: 13, borderRadius: 6, width: '50%', background: sh }} />
                <div style={{ height: 11, borderRadius: 6, width: '80%', background: sh }} />
                <div style={{ height: 10, borderRadius: 6, width: '30%', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
            </div>
            <div style={{ width: 60, height: 22, borderRadius: 20, background: sh, flexShrink: 0 }} />
        </div>
    );
};

/* ─── Stat chip ──────────────────────────────────────────────────────────── */
const StatChip = ({ label, value, color, isDark }) => (
    <div style={{
        padding: '10px 18px', borderRadius: 14,
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.1)'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        minWidth: 72,
    }}>
        <span className="nf-stat-count" style={{
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
            fontSize: 20, color, lineHeight: 1,
        }}>{value}</span>
        <span style={{ fontSize: 10.5, color: isDark ? '#64748b' : '#94a3b8', fontWeight: 600, letterSpacing: 0.3 }}>{label}</span>
    </div>
);

/* ─── Notification card ──────────────────────────────────────────────────── */
const NotifCard = ({ n, index, isDark, onMarkRead, readingId }) => {
    const cfg = getType(n.type);
    const isReading = readingId === n.id;
    const surface = isDark ? '#0f172a' : '#ffffff';
    const border  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.1)';
    const text    = isDark ? '#e2e8f0' : '#0f172a';
    const muted   = isDark ? '#64748b' : '#94a3b8';

    return (
        <div
            className={`nf-card ${!n.isRead ? 'unread' : ''} ${isReading ? 'just-read' : ''}`}
            style={{
                borderRadius: 18,
                marginBottom: 10,
                padding: '18px 20px',
                background: n.isRead
                    ? surface
                    : isDark ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.04)',
                border: n.isRead
                    ? `1px solid ${border}`
                    : '1px solid rgba(99,102,241,0.24)',
                boxShadow: n.isRead
                    ? (isDark ? '0 2px 14px rgba(0,0,0,0.28)' : '0 2px 14px rgba(0,0,0,0.05)')
                    : `0 4px 24px rgba(99,102,241,0.13), 0 0 0 0 ${cfg.glow}`,
                animationDelay: `${Math.min(index * 0.055, 0.55)}s`,
            }}
        >
            {/* Unread left accent bar */}
            {!n.isRead && (
                <div style={{
                    position: 'absolute', left: 0, top: 12, bottom: 12, width: 3,
                    background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                    borderRadius: '0 3px 3px 0',
                }} />
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>

                {/* Icon + content */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
                    {/* Type icon */}
                    <div style={{
                        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20,
                        boxShadow: `0 4px 14px ${cfg.glow}`,
                    }}>
                        {cfg.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title row */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            marginBottom: 4, flexWrap: 'wrap',
                        }}>
                            <span style={{
                                fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14,
                                color: text, lineHeight: 1.3,
                            }}>
                                {n.title}
                            </span>
                            {!n.isRead && (
                                <span className="nf-dot" style={{
                                    width: 7, height: 7, borderRadius: '50%',
                                    background: 'var(--indigo)', display: 'inline-block', flexShrink: 0,
                                }} />
                            )}
                        </div>

                        {/* Message */}
                        <p style={{
                            fontSize: 13, color: isDark ? '#94a3b8' : '#64748b',
                            marginBottom: 7, lineHeight: 1.55,
                            /* Fix: long messages don't overflow */
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                        }}>
                            {n.message}
                        </p>

                        {/* Timestamp — Fix: graceful fallback if createdAt is invalid */}
                        <div style={{ fontSize: 11, color: muted, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ opacity: 0.6 }}>🕐</span>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5 }}>
                                {n.createdAt
                                    ? new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                                    : 'Just now'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: badge + action */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        whiteSpace: 'nowrap',
                    }}>
                        {cfg.label}
                    </span>

                    {/* Fix: disabled state while marking read to prevent double-click */}
                    {!n.isRead ? (
                        <button
                            className="nf-read-btn"
                            onClick={() => onMarkRead(n.id)}
                            disabled={readingId === n.id}
                            title="Mark as read"
                            style={{ opacity: readingId === n.id ? 0.5 : 1 }}
                        >
                            {readingId === n.id
                                ? <span style={{ width: 11, height: 11, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: 'var(--indigo)', borderRadius: '50%', animation: 'spin 0.65s linear infinite', display: 'inline-block' }} />
                                : <Check size={12} className="check-icon" />
                            }
                            Read
                        </button>
                    ) : (
                        <span style={{ fontSize: 11, color: muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCheck size={11} color="var(--emerald)" /> Done
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function Notifications() {
    const { isDark } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(true);
    /* Fix: track multiple readingIds to allow rapid clicks on different cards */
    const [readingIds, setReadingIds]        = useState(new Set());
    const [markingAll, setMarkingAll]        = useState(false);
    const [filter, setFilter]               = useState('ALL');
    const [refreshing, setRefreshing]       = useState(false);

    /* ── theme tokens ── */
    const bg      = isDark ? '#070d1a'  : '#f0f4ff';
    const surface = isDark ? '#0f172a'  : '#ffffff';
    const border  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.1)';
    const text    = isDark ? '#e2e8f0'  : '#0f172a';
    const muted   = isDark ? '#64748b'  : '#94a3b8';
    const surface2= isDark ? '#1a2438'  : '#f8faff';

    /* ── Fetch ── */
    const fetchNotifications = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const r = await API.get('/notifications/my');
            /* Fix: ensure array even if API returns null/undefined */
            setNotifications(Array.isArray(r.data) ? r.data : []);
        } catch {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    /* ── Mark single as read — Fix: uses Set so multiple cards can be in-flight ── */
    const markAsRead = useCallback(async (id) => {
        setReadingIds(prev => new Set(prev).add(id));
        try {
            await API.put(`/notifications/read/${id}`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch {
            toast.error('Could not mark as read');
        } finally {
            setReadingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        }
    }, []);

    /* ── Mark all as read ── */
    const markAllAsRead = useCallback(async () => {
        if (markingAll) return; // Fix: guard against double submit
        setMarkingAll(true);
        try {
            await API.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read ✅');
        } catch {
            toast.error('Failed to mark all as read');
        } finally {
            setMarkingAll(false);
        }
    }, [markingAll]);

    /* ── Derived state — Fix: useMemo to avoid recomputing on every render ── */
    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

    const displayed = useMemo(() => notifications.filter(n => {
        if (filter === 'UNREAD') return !n.isRead;
        if (filter !== 'ALL')    return n.type === filter;
        return true;
    }), [notifications, filter]);

    /* ── Type counts for filter badges ── */
    const typeCounts = useMemo(() => {
        const counts = {};
        notifications.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1; });
        return counts;
    }, [notifications]);

    const filterTabs = [
        { key: 'ALL',     label: 'All',        count: notifications.length },
        { key: 'UNREAD',  label: 'Unread',      count: unreadCount },
        { key: 'SUCCESS', label: '✅ Success',  count: typeCounts.SUCCESS },
        { key: 'WARNING', label: '⚠️ Warning',  count: typeCounts.WARNING },
        { key: 'ALERT',   label: '🚨 Alert',    count: typeCounts.ALERT   },
        { key: 'INFO',    label: 'ℹ️ Info',     count: typeCounts.INFO    },
    ];

    return (
        <>
            <GlobalStyle />
            <div style={{ display: 'flex', minHeight: '100vh', background: bg, fontFamily: "'Outfit', sans-serif" }}>
                <Sidebar />

                <main className="nf-scroll" style={{ flex: 1, padding: '28px 28px 48px', overflowX: 'hidden', overflowY: 'auto', maxHeight: '100vh' }}>

                    {/* ══ Header ══ */}
                    <div className="nf-fade-up nf-header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>

                        {/* Left: bell + title + stats */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {/* Bell badge */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div className="nf-bell" style={{
                                    width: 52, height: 52, borderRadius: 16,
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 8px 24px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
                                }}>
                                    <Bell size={24} color="#fff" />
                                </div>
                                {unreadCount > 0 && (
                                    <div className="nf-badge" style={{
                                        position: 'absolute', top: -7, right: -7,
                                        minWidth: 22, height: 22, borderRadius: 11,
                                        padding: '0 5px',
                                        background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 800, color: '#fff',
                                        border: `2.5px solid ${bg}`,
                                        fontFamily: 'JetBrains Mono, monospace',
                                    }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h1 style={{
                                    fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                                    fontSize: 24, color: text,
                                    letterSpacing: -0.6, marginBottom: 4, lineHeight: 1,
                                }}>
                                    Notifications
                                </h1>
                                <p style={{ fontSize: 13, color: muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {unreadCount > 0 ? (
                                        <>
                                            <span className="nf-dot" style={{
                                                display: 'inline-block', width: 7, height: 7,
                                                borderRadius: '50%', background: 'var(--indigo)',
                                            }} />
                                            {unreadCount} unread
                                        </>
                                    ) : (
                                        'All caught up! 🎉'
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Right: stats + actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            {/* Stats chips */}
                            <div className="nf-stats-row" style={{ display: 'flex', gap: 8 }}>
                                <StatChip label="Total"  value={notifications.length} color={text}           isDark={isDark} />
                                <StatChip label="Unread" value={unreadCount}          color="var(--indigo)"  isDark={isDark} />
                            </div>

                            {/* Refresh button */}
                            <button
                                onClick={() => fetchNotifications(true)}
                                disabled={refreshing || loading}
                                title="Refresh"
                                style={{
                                    width: 40, height: 40, borderRadius: 12, border: `1px solid ${border}`,
                                    background: surface2, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: muted, transition: 'transform 0.2s, color 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = text; e.currentTarget.style.transform = 'rotate(180deg)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = muted; e.currentTarget.style.transform = 'rotate(0)'; }}
                            >
                                <RefreshCw size={16} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
                            </button>

                            {/* Mark all read */}
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={markingAll}
                                    className="nf-mark-btn"
                                >
                                    {markingAll
                                        ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.65s linear infinite', display: 'inline-block' }} /> Marking…</>
                                        : <><CheckCheck size={15} /> Mark All Read</>
                                    }
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ══ Stats summary bar (mobile-hidden) ══ */}
                    {!loading && notifications.length > 0 && (
                        <div className="nf-fade-up-1" style={{
                            display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap',
                            padding: '14px 18px', borderRadius: 16,
                            background: surface, border: `1px solid ${border}`,
                        }}>
                            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                                const cnt = typeCounts[key] || 0;
                                if (!cnt) return null;
                                return (
                                    <div key={key} style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '4px 10px', borderRadius: 20,
                                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                                        fontSize: 11.5, fontWeight: 700, color: cfg.color,
                                    }}>
                                        {cfg.icon} <span>{cnt}</span>
                                        <span style={{ opacity: 0.6, fontWeight: 400 }}>{cfg.label}</span>
                                    </div>
                                );
                            })}
                            <div style={{ marginLeft: 'auto', fontSize: 11.5, color: muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <SlidersHorizontal size={11} /> Filter active: <strong style={{ color: text }}>{filter}</strong>
                            </div>
                        </div>
                    )}

                    {/* ══ Filter tabs ══ */}
                    <div className="nf-fade-up-2" style={{
                        display: 'flex', gap: 7, marginBottom: 18,
                        flexWrap: 'wrap',
                    }}>
                        {filterTabs.map(tab => (
                            /* Fix: tab count only shown when > 0 */
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`nf-tab ${filter === tab.key ? 'active' : ''}`}
                                style={{
                                    background: filter === tab.key
                                        ? undefined
                                        : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.07)',
                                    color: filter === tab.key ? undefined : muted,
                                }}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span style={{
                                        minWidth: 18, height: 18, borderRadius: 9,
                                        padding: '0 4px',
                                        background: filter === tab.key ? 'rgba(255,255,255,0.22)' : 'rgba(99,102,241,0.18)',
                                        color: filter === tab.key ? '#fff' : 'var(--indigo)',
                                        fontSize: 10, fontWeight: 800,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'JetBrains Mono, monospace',
                                    }}>{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ══ Loading skeletons ══ */}
                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} style={{ background: surface, borderRadius: 18, border: `1px solid ${border}` }}>
                                    <SkeletonCard isDark={isDark} delay={i * 0.1} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ══ Empty state ══ */}
                    {!loading && displayed.length === 0 && (
                        <div className="nf-fade-in" style={{
                            padding: '60px 20px', textAlign: 'center',
                            background: surface, borderRadius: 22, border: `1px solid ${border}`,
                        }}>
                            <div style={{
                                width: 70, height: 70, borderRadius: 22, margin: '0 auto 16px',
                                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `1px solid ${border}`,
                            }}>
                                <BellOff size={30} color={muted} />
                            </div>
                            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 16, color: text, marginBottom: 6 }}>
                                {filter === 'UNREAD' ? 'No unread notifications' : 'Nothing here yet'}
                            </div>
                            <div style={{ fontSize: 13, color: muted, marginBottom: 18 }}>
                                {filter !== 'ALL'
                                    ? 'Try switching to "All" to see everything'
                                    : "We'll notify you of all bank activity here"}
                            </div>
                            {filter !== 'ALL' && (
                                <button onClick={() => setFilter('ALL')} style={{
                                    padding: '8px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                    background: 'linear-gradient(135deg, var(--indigo), var(--violet))',
                                    color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13,
                                    boxShadow: '0 6px 18px rgba(99,102,241,0.3)',
                                    transition: 'transform 0.2s',
                                }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                >
                                    Show all notifications
                                </button>
                            )}
                        </div>
                    )}

                    {/* ══ Notification cards ══ */}
                    {!loading && displayed.length > 0 && (
                        <div>
                            {displayed.map((n, i) => (
                                <NotifCard
                                    key={n.id}
                                    n={n}
                                    index={i}
                                    isDark={isDark}
                                    onMarkRead={markAsRead}
                                    readingId={readingIds.has(n.id) ? n.id : null}
                                />
                            ))}
                        </div>
                    )}

                    {/* ══ Footer ══ */}
                    {!loading && notifications.length > 0 && (
                        <div className="nf-fade-in" style={{
                            textAlign: 'center', marginTop: 16,
                            fontSize: 12, color: muted,
                        }}>
                            Showing{' '}
                            <strong style={{ color: text, fontFamily: 'JetBrains Mono, monospace' }}>{displayed.length}</strong>
                            {' '}of{' '}
                            <strong style={{ color: text, fontFamily: 'JetBrains Mono, monospace' }}>{notifications.length}</strong>
                            {' '}notifications
                        </div>
                    )}

                </main>
            </div>
        </>
    );
}