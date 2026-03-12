import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import {
    UserCircle, Mail, Shield, Pencil, Check, X, Lock,
    Eye, EyeOff, Phone, MapPin, Calendar, RefreshCw,
    CheckCircle2, AlertCircle, Zap, Camera,
    Activity, Globe, Key, Fingerprint,
    Bell, TrendingUp, Clock, ShieldCheck, Sparkles,
    ArrowRight, Info, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════════ */

/* ─── Password Strength ─────────────────────────────────────────── */
function PasswordStrength({ password }) {
    if (!password) return null;

    const checks = [
        password.length >= 6,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;

    /* Fix: score=0 → no color bleed, use fallback */
    const meta = [
        null,
        { label: 'Weak',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.2)'    },
        { label: 'Fair',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)'   },
        { label: 'Good',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.2)'   },
        { label: 'Strong', color: '#10b981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.2)'   },
    ];
    const m = meta[score] ?? meta[1];

    return (
        <div style={{
            marginTop: 10, padding: '10px 14px', borderRadius: 14,
            background: m.bg, border: `1px solid ${m.border}`,
        }}>
            <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        height: 5, flex: 1, borderRadius: 99,
                        transition: 'background 0.4s ease',
                        background: i <= score ? m.color : 'rgba(255,255,255,0.1)',
                        boxShadow: i <= score ? `0 0 8px ${m.color}80` : 'none',
                    }} />
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: m.color }}>{m.label}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{score}/4 met</span>
            </div>
        </div>
    );
}

/* ─── Avatar initials ────────────────────────────────────────────── */
function Avatar({ name = '', size = 80 }) {
    /* Fix: safe split — handles empty string, undefined */
    const initials = (name || 'U')
        .split(' ')
        .filter(Boolean)
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U';

    return (
        <div className="avatar-ring" style={{
            width: size, height: size,
            borderRadius: Math.round(size * 0.28),
            fontSize: Math.round(size * 0.34),
            flexShrink: 0,
        }}>
            <span style={{ position: 'relative', zIndex: 1 }}>{initials}</span>
            <div className="avatar-shine" />
        </div>
    );
}

/* ─── Info Field ─────────────────────────────────────────────────── */
/* Fix: light mode class now correctly applied */
function InfoField({ label, value, icon, isDark }) {
    return (
        <div>
            {label && (
                <label style={{
                    display: 'block', fontSize: 10.5, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.09em',
                    marginBottom: 7,
                    color: isDark ? '#4b5563' : '#94a3b8',
                }}>
                    {label}
                </label>
            )}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 16px', borderRadius: 14,
                background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                transition: 'border-color 0.2s',
            }}>
                {icon && <span style={{ color: '#60a5fa', flexShrink: 0, display: 'flex' }}>{icon}</span>}
                <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: isDark ? '#cbd5e1' : '#374151',
                }}>
                    {value || '—'}
                </span>
            </div>
        </div>
    );
}

/* ─── Stat Pill ──────────────────────────────────────────────────── */
function StatPill({ label, value, icon }) {
    return (
        <div className="stat-pill">
            <div className="stat-icon">{icon}</div>
            <div>
                <p className="stat-label">{label}</p>
                <p className="stat-value">{value}</p>
            </div>
        </div>
    );
}

/* ─── Section Header ─────────────────────────────────────────────── */
function SectionHeader({ icon, iconBg, iconColor, title, subtitle, isDark }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                {icon}
            </div>
            <div>
                <h3 style={{
                    fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 15,
                    color: isDark ? '#f1f5f9' : '#0f172a', lineHeight: 1,
                }}>
                    {title}
                </h3>
                {subtitle && (
                    <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8', marginTop: 3 }}>
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ─── Status Tile ────────────────────────────────────────────────── */
function StatusTile({ icon, label, value, subtitle, color, bg, border, isDark }) {
    return (
        <div style={{
            padding: 16, borderRadius: 18, position: 'relative', overflow: 'hidden',
            background: bg, border: `1px solid ${border}`,
            transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s',
        }}
             onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${bg}`; }}
             onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <span style={{ display: 'flex', color }}>{icon}</span>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color }}>{label}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 5 }}>
                {value}
            </p>
            {subtitle && (
                <p style={{ fontSize: 11.5, fontWeight: 500, color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }}>
                    {subtitle}
                </p>
            )}
            {/* Glow orb */}
            <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 80, height: 80, borderRadius: '50%',
                background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function Profile() {
    const { isDark } = useTheme();
    const { user }   = useAuth();

    const [profile,   setProfile]   = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [editing,   setEditing]   = useState(false);
    const [saving,    setSaving]    = useState(false);
    const [form,      setForm]      = useState({ fullName: '', phone: '', address: '', city: '', state: '', pincode: '' });
    const [pwForm,    setPwForm]    = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPw,    setShowPw]    = useState({ current: false, new: false, confirm: false });
    const [pwLoading, setPwLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    /* ── Fix: useCallback so fetchProfile ref is stable for useEffect ── */
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/users/profile');
            const d = res.data;
            setProfile(d);
            setForm({
                fullName: d.fullName || '',
                phone:    d.phone    || '',
                address:  d.address  || '',
                city:     d.city     || '',
                state:    d.state    || '',
                pincode:  d.pincode  || '',
            });
        } catch {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    /* ── Fix: cancel properly resets form from profile, not refetches ── */
    const handleCancel = useCallback(() => {
        setEditing(false);
        if (profile) {
            setForm({
                fullName: profile.fullName || '',
                phone:    profile.phone    || '',
                address:  profile.address  || '',
                city:     profile.city     || '',
                state:    profile.state    || '',
                pincode:  profile.pincode  || '',
            });
        }
    }, [profile]);

    const handleUpdate = useCallback(async () => {
        if (saving) return; // Fix: guard double-submit
        setSaving(true);
        try {
            await API.put('/users/profile/update', form);
            toast.success('Profile updated ✅');
            setEditing(false);
            await fetchProfile();
        } catch {
            toast.error('Update failed');
        } finally {
            setSaving(false);
        }
    }, [form, saving, fetchProfile]);

    /* ── Fix: full validation + double-submit guard ── */
    const handlePasswordChange = useCallback(async () => {
        if (pwLoading) return;
        const { currentPassword, newPassword, confirmPassword } = pwForm;
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill all fields');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword === currentPassword) {
            toast.error('New password must differ from current password');
            return;
        }
        setPwLoading(true);
        try {
            await API.put('/users/change-password', { currentPassword, newPassword });
            toast.success('Password changed 🔒');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Password change failed');
        } finally {
            setPwLoading(false);
        }
    }, [pwForm, pwLoading]);

    /* ── Fix: safe date formatting ── */
    const formatDate = useCallback((val) => {
        if (!val) return '—';
        const d = new Date(val);
        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    }, []);

    /* ── Profile completion — Fix: safe null checks ── */
    const profileCompletion = useMemo(() => {
        if (!profile) return { pct: 0, fields: [] };
        const fields = [
            { label: 'Full Name', done: !!profile.fullName },
            { label: 'Phone',     done: !!profile.phone    },
            { label: 'Address',   done: !!profile.address  },
            { label: 'City',      done: !!profile.city     },
            { label: 'KYC Done',  done: profile.kycStatus === 'VERIFIED' },
        ];
        return { pct: Math.round((fields.filter(f => f.done).length / fields.length) * 100), fields };
    }, [profile]);

    /* ── Security score — Fix: safe null checks ── */
    const securityScore = useMemo(() => {
        if (!profile) return { score: 0, grade: 'D', gradeColor: '#ef4444', checks: [] };
        const checks = [
            { label: 'KYC Verified',   done: profile.kycStatus === 'VERIFIED', weight: 35 },
            { label: 'Phone Added',    done: !!profile.phone,                  weight: 25 },
            { label: 'Address Set',    done: !!profile.address,                weight: 20 },
            { label: 'Account Active', done: !!profile.active,                 weight: 20 },
        ];
        const score = checks.reduce((s, c) => s + (c.done ? c.weight : 0), 0);
        const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';
        const gradeColor = score >= 80 ? '#34d399' : score >= 60 ? '#60a5fa' : score >= 40 ? '#fbbf24' : '#ef4444';
        return { score, grade, gradeColor, checks };
    }, [profile]);

    /* ── Tokens ── */
    const bg      = isDark ? '#07080f' : '#f0f4ff';
    const surface = isDark ? '#0e1117' : '#ffffff';
    const border  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(59,130,246,0.1)';
    const text    = isDark ? '#e2e8f0' : '#0f172a';
    const muted   = isDark ? '#64748b' : '#94a3b8';
    const surface2= isDark ? '#161d2c' : '#f8faff';

    const inputStyle = {
        width: '100%', padding: '13px 16px',
        borderRadius: 14, outline: 'none',
        fontSize: 13, fontWeight: 500,
        fontFamily: 'Outfit, sans-serif',
        transition: 'border-color 0.22s, box-shadow 0.22s, background 0.22s',
        background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#0f172a',
        border: `2px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
    };

    const lbl = {
        display: 'block', fontSize: 10.5, fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.09em',
        marginBottom: 7,
        color: isDark ? '#4b5563' : '#94a3b8',
    };

    const TABS = [
        { id: 'personal', label: 'Personal',  num: '01', icon: <UserCircle size={17} />, desc: 'Name & phone',      color: '#60a5fa', iconBg: 'rgba(37,99,235,0.15)',    bar: 'linear-gradient(90deg,#2563eb,#4f46e5)' },
        { id: 'contact',  label: 'Contact',   num: '02', icon: <Globe size={17} />,      desc: 'Address & location', color: '#a78bfa', iconBg: 'rgba(124,58,237,0.15)',   bar: 'linear-gradient(90deg,#7c3aed,#a78bfa)' },
        { id: 'security', label: 'Security',  num: '03', icon: <Fingerprint size={17}/>, desc: 'KYC & status',      color: '#34d399', iconBg: 'rgba(16,185,129,0.13)',    bar: 'linear-gradient(90deg,#059669,#34d399)' },
        { id: 'password', label: 'Password',  num: '04', icon: <Key size={17} />,        desc: 'Change password',   color: '#f87171', iconBg: 'rgba(239,68,68,0.13)',     bar: 'linear-gradient(90deg,#dc2626,#f87171)' },
    ];

    /* ─── Loading skeleton ─── */
    const SkeletonBlock = ({ h = 80 }) => (
        <div className="skeleton" style={{
            height: h, borderRadius: 20,
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        }} />
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

                *, *::before, *::after { box-sizing: border-box; }

                :root {
                    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
                    --ease-out:    cubic-bezier(0.22, 1, 0.36, 1);
                }

                .prof-root { font-family: 'Outfit', sans-serif; }

                /* ── Keyframes ── */
                @keyframes fadeUp     { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
                @keyframes scaleIn    { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
                @keyframes avatarIn   { from{transform:scale(0.55) rotate(-12deg);opacity:0} to{transform:scale(1) rotate(0);opacity:1} }
                @keyframes ringGlow   { 0%,100%{box-shadow:0 0 0 0 rgba(79,70,229,.45),0 8px 28px rgba(79,70,229,.3)} 50%{box-shadow:0 0 0 8px rgba(79,70,229,0),0 8px 40px rgba(79,70,229,.45)} }
                @keyframes shimmerBg  { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
                @keyframes orbFloat1  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(18px,-14px) scale(1.06)} }
                @keyframes orbFloat2  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-14px,18px)} }
                @keyframes pulseDot   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
                @keyframes cardIn     { from{opacity:0;transform:translateY(14px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes skeletonP  { 0%,100%{opacity:.35} 50%{opacity:.65} }
                @keyframes shimmerBtn { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                @keyframes spin       { to{transform:rotate(360deg)} }
                @keyframes progressFill { from{width:0} to{width:var(--pct)} }

                .fu   { animation: fadeUp  0.55s 0.00s var(--ease-out) both; }
                .fu1  { animation: fadeUp  0.55s 0.07s var(--ease-out) both; }
                .fu2  { animation: fadeUp  0.55s 0.14s var(--ease-out) both; }
                .fu3  { animation: fadeUp  0.55s 0.21s var(--ease-out) both; }
                .ci   { animation: cardIn  0.45s var(--ease-out) both; }
                .skeleton { animation: skeletonP 1.5s ease-in-out infinite; }

                /* ── Hero Banner ── */
                .hero-banner {
                    position: relative; overflow: hidden;
                    border-radius: 24px;
                    background: linear-gradient(145deg, #060e1e 0%, #0d1f3c 50%, #08121f 100%);
                    border: 1px solid rgba(59,130,246,0.12);
                    box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.55);
                }
                .hero-glow {
                    position: absolute; inset: 0; pointer-events: none;
                    background:
                        radial-gradient(ellipse 55% 65% at 15% 50%, rgba(59,130,246,0.2) 0%, transparent 100%),
                        radial-gradient(ellipse 45% 50% at 85% 20%, rgba(139,92,246,0.14) 0%, transparent 100%),
                        radial-gradient(ellipse 35% 40% at 65% 85%, rgba(16,185,129,0.07) 0%, transparent 100%);
                }
                .hero-grid {
                    position: absolute; inset: 0; pointer-events: none;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
                    background-size: 36px 36px;
                    mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
                    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
                }
                .hero-noise {
                    position: absolute; inset: 0; pointer-events: none; opacity: .03;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    background-size: 180px;
                }
                .hero-orb-1 { position:absolute; width:280px; height:280px; top:-100px; right:-80px; border-radius:50%; background:radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%); filter:blur(40px); pointer-events:none; animation:orbFloat1 9s ease-in-out infinite; }
                .hero-orb-2 { position:absolute; width:200px; height:200px; bottom:-70px; left:15%; border-radius:50%; background:radial-gradient(circle, rgba(139,92,246,0.11) 0%, transparent 70%); filter:blur(35px); pointer-events:none; animation:orbFloat2 11s ease-in-out infinite; }

                /* ── Avatar ── */
                .avatar-ring {
                    background: linear-gradient(135deg, #1d4ed8, #4f46e5, #7c3aed);
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; font-weight: 900;
                    font-family: 'Outfit', sans-serif;
                    box-shadow: 0 8px 32px rgba(79,70,229,0.45), 0 0 0 1px rgba(255,255,255,0.1) inset;
                    animation: avatarIn .7s var(--ease-spring) both, ringGlow 4s 1s ease-in-out infinite;
                    position: relative; overflow: hidden;
                    letter-spacing: -0.03em;
                    cursor: default;
                }
                .avatar-shine {
                    position: absolute; inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 60%);
                }

                /* ── Camera Button ── */
                .avatar-cam {
                    position: absolute; bottom: -5px; right: -5px;
                    width: 26px; height: 26px; border-radius: 50%;
                    background: linear-gradient(135deg, #2563eb, #4f46e5);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; border: 2px solid #060e1e;
                    transition: transform .3s var(--ease-spring), box-shadow .2s;
                    z-index: 2;
                }
                .avatar-cam:hover { transform: scale(1.25) rotate(15deg); box-shadow: 0 4px 14px rgba(37,99,235,0.5); }

                /* ── Shimmer name ── */
                .shimmer-name {
                    background: linear-gradient(90deg, #e2e8f0 0%, #93c5fd 30%, #ffffff 50%, #c4b5fd 70%, #e2e8f0 100%);
                    background-size: 400px auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmerBg 4s linear infinite;
                }

                /* ── Stat Pills ── */
                .stat-pill {
                    display: flex; align-items: center; gap: 10px;
                    padding: 9px 14px; border-radius: 14px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    transition: all .28s var(--ease-spring);
                    cursor: default;
                }
                .stat-pill:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); border-color: rgba(59,130,246,0.3); }
                .stat-icon { width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.06); }
                .stat-label { color:rgba(255,255,255,0.32);font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em; }
                .stat-value { color:rgba(255,255,255,0.82);font-size:12px;font-weight:700;margin-top:1px; }

                /* ── Badges ── */
                .badge {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 4px 10px; border-radius: 99px;
                    font-size: 11px; font-weight: 700; letter-spacing: 0.01em;
                    transition: transform .2s var(--ease-spring);
                    cursor: default;
                }
                .badge:hover { transform: translateY(-1px); }
                .badge-role     { background:rgba(59,130,246,0.14);  color:#93c5fd; border:1px solid rgba(59,130,246,0.22); }
                .badge-verified { background:rgba(16,185,129,0.12);  color:#6ee7b7; border:1px solid rgba(16,185,129,0.22); }
                .badge-pending  { background:rgba(245,158,11,0.12);  color:#fcd34d; border:1px solid rgba(245,158,11,0.22); }
                .badge-active   { background:rgba(16,185,129,0.12);  color:#6ee7b7; border:1px solid rgba(16,185,129,0.22); }
                .badge-inactive { background:rgba(239,68,68,0.12);   color:#fca5a5; border:1px solid rgba(239,68,68,0.22); }

                /* ── Tab Grid ── */
                .tab-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
                .tab-card {
                    position: relative; display:flex; flex-direction:column; align-items:flex-start;
                    gap: 8px; padding: 15px 16px; border-radius: 20px;
                    cursor: pointer; text-align:left; overflow:hidden;
                    transition: transform .28s var(--ease-spring), box-shadow .25s, background .2s, border-color .2s;
                    border: none;
                }
                .tab-card::before {
                    content:''; position:absolute; inset:0; border-radius:inherit; opacity:0;
                    transition: opacity .3s ease;
                }
                .tab-card:hover { transform: translateY(-2px); }
                .tab-card:hover::before { opacity:1; }
                .tab-card:active { transform: scale(0.98); }

                /* Active bottom bar */
                .tab-bar {
                    position:absolute; bottom:0; left:0; right:0; height:2.5px;
                    border-radius: 0 0 20px 20px;
                    transform: scaleX(0); transform-origin:left;
                    transition: transform .4s var(--ease-out);
                }
                .tab-active .tab-bar { transform: scaleX(1); }

                .tab-num {
                    position:absolute; top:13px; right:14px;
                    font-family:'JetBrains Mono',monospace; font-size:9.5px; font-weight:600;
                    letter-spacing:0.06em; opacity:0.25; transition: opacity .2s;
                }
                .tab-card:hover .tab-num, .tab-active .tab-num { opacity:0.65; }

                .tab-icon {
                    width:36px;height:36px;border-radius:11px;
                    display:flex;align-items:center;justify-content:center;
                    transition: transform .3s var(--ease-spring);
                    flex-shrink:0;
                }
                .tab-card:hover .tab-icon, .tab-active .tab-icon { transform: scale(1.1); }

                .tab-label { font-size:12.5px;font-weight:800;line-height:1.1; transition:color .2s; }
                .tab-desc  { font-size:10.5px;font-weight:500;opacity:0.4;line-height:1.3; transition:opacity .2s; }
                .tab-card:hover .tab-desc, .tab-active .tab-desc { opacity:0.65; }

                /* ── Section Card ── */
                .section-card {
                    border-radius: 22px;
                    animation: cardIn .45s var(--ease-out) both;
                    transition: box-shadow .3s;
                }
                .section-card:hover { box-shadow: 0 24px 56px rgba(0,0,0,0.35) !important; }

                /* ── Field focus glow ── */
                input:focus {
                    border-color: #3b82f6 !important;
                    box-shadow: 0 0 0 4px rgba(59,130,246,0.12) !important;
                    background: ${isDark ? 'rgba(59,130,246,0.06)' : '#fff'} !important;
                    outline: none;
                }

                /* ── PW Eye button — Fix: type=button always, no form submit ── */
                .pw-wrap { position:relative; }
                .pw-eye {
                    position: absolute; right:13px; top:50%; transform:translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    display: flex; align-items: center;
                    color: rgba(255,255,255,0.22);
                    transition: color .2s, transform .25s var(--ease-spring);
                    padding: 4px; border-radius: 6px;
                    z-index: 2;
                }
                .pw-eye:hover { color: rgba(255,255,255,0.65); transform: translateY(-50%) scale(1.12); }

                /* ── Buttons ── */
                .btn-edit {
                    display:flex;align-items:center;gap:7px;padding:10px 18px;
                    border-radius:14px;background:linear-gradient(135deg,#2563eb,#4f46e5);
                    color:#fff;font-weight:700;font-size:12.5px;border:none;cursor:pointer;
                    box-shadow:0 5px 18px rgba(37,99,235,0.35);font-family:'Outfit',sans-serif;
                    transition:transform .25s var(--ease-spring),box-shadow .2s;
                }
                .btn-edit:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 10px 26px rgba(37,99,235,0.45); }

                .btn-save {
                    display:flex;align-items:center;gap:7px;padding:10px 18px;
                    border-radius:14px;background:linear-gradient(135deg,#059669,#10b981);
                    color:#fff;font-weight:700;font-size:12.5px;border:none;cursor:pointer;
                    box-shadow:0 5px 18px rgba(16,185,129,0.3);font-family:'Outfit',sans-serif;
                    transition:transform .25s var(--ease-spring),box-shadow .2s;
                }
                .btn-save:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 10px 26px rgba(16,185,129,0.42); }
                .btn-save:disabled { opacity:.55;cursor:not-allowed; }

                /* Fix: btn-cancel visible in both themes */
                .btn-cancel {
                    display:flex;align-items:center;gap:6px;padding:10px 14px;
                    border-radius:14px;cursor:pointer;font-weight:600;font-size:12.5px;
                    font-family:'Outfit',sans-serif;
                    background:${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'};
                    color:${isDark ? 'rgba(255,255,255,0.55)' : '#475569'};
                    border:1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
                    transition:background .2s,color .2s,transform .2s;
                }
                .btn-cancel:hover { background:${isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.1)'}; color:${isDark ? '#fff' : '#0f172a'}; transform:scale(1.03); }

                .btn-refresh {
                    width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;
                    background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.09);
                    color:rgba(255,255,255,0.4);cursor:pointer;
                    transition:all .25s var(--ease-spring);
                }
                .btn-refresh:hover { background:rgba(255,255,255,0.14);color:#fff;transform:rotate(180deg); }

                .btn-update-pw {
                    width:100%;display:flex;align-items:center;justify-content:center;gap:8px;
                    padding:14px;border-radius:16px;
                    background:linear-gradient(135deg,#dc2626,#b91c1c);
                    color:#fff;font-weight:800;font-size:13.5px;letter-spacing:0.02em;
                    border:none;cursor:pointer;font-family:'Outfit',sans-serif;
                    box-shadow:0 8px 28px rgba(220,38,38,0.35),inset 0 1px 0 rgba(255,255,255,0.15);
                    position:relative;overflow:hidden;
                    transition:transform .25s var(--ease-spring),box-shadow .2s;
                }
                .btn-update-pw::after {
                    content:'';position:absolute;top:-50%;left:-60%;width:40%;height:200%;
                    background:rgba(255,255,255,0.14);transform:skewX(-20deg);
                    transition:left .5s ease;
                }
                .btn-update-pw:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 14px 36px rgba(220,38,38,0.5); }
                .btn-update-pw:hover::after { left:130%; }
                .btn-update-pw:disabled { opacity:.5;cursor:not-allowed;transform:none; }

                /* ── Right Panel ── */
                .rp-card {
                    border-radius:20px;padding:18px;
                    transition:transform .28s var(--ease-spring),box-shadow .25s;
                    animation: cardIn .5s var(--ease-out) both;
                }
                .rp-card:hover { transform:translateY(-2px); }

                .rp-card-header { display:flex;align-items:center;gap:10px;margin-bottom:16px; }
                .rp-icon { width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
                .rp-title { font-size:12.5px;font-weight:800;line-height:1.2; }
                .rp-sub   { font-size:10px;font-weight:600;color:rgba(140,140,150,0.9);margin-top:1px; }

                .rp-live-dot {
                    width:7px;height:7px;border-radius:50%;background:#34d399;
                    box-shadow:0 0 8px #34d399;margin-left:auto;flex-shrink:0;
                    animation:pulseDot 2s ease-in-out infinite;
                }

                .rp-stat-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
                .rp-stat-cell { padding:10px 12px;border-radius:12px; }
                .rp-stat-lbl  { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;margin-bottom:4px; }
                .rp-stat-val  { font-size:12.5px;font-weight:800; }

                /* Progress bar animation */
                .progress-track { height:6px;border-radius:99px;overflow:hidden;margin-bottom:16px; }
                .progress-fill  { height:100%;border-radius:99px;transition:width 1s var(--ease-out); }

                /* Checklist */
                .check-row { display:flex;align-items:center;gap:8px;padding:5px 0; }
                .check-box {
                    width:15px;height:15px;border-radius:5px;
                    display:flex;align-items:center;justify-content:center;
                    flex-shrink:0;
                }

                /* Quick action buttons */
                .qa-btn {
                    display:flex;align-items:center;gap:10px;padding:9px 12px;
                    border-radius:12px;cursor:pointer;width:100%;text-align:left;
                    transition:transform .22s var(--ease-spring),border-color .2s,background .2s;
                    font-family:'Outfit',sans-serif;
                }
                .qa-btn:hover { transform:translateX(4px); }

                /* SVG ring */
                .score-ring circle { transition: stroke-dashoffset 1.2s var(--ease-out); }

                /* Match line */
                .match-ok  { color:#34d399; }
                .match-bad { color:#f87171; }

                /* Scroll */
                .rp-scroll::-webkit-scrollbar { width:3px; }
                .rp-scroll::-webkit-scrollbar-thumb { border-radius:99px;background:rgba(99,102,241,0.25); }

                /* 2-col layout */
                .page-cols { display:grid; grid-template-columns:minmax(0,1fr) 288px; gap:22px; align-items:start; }
                .col-left  { min-width:0;display:flex;flex-direction:column;gap:14px; }
                .col-right { display:flex;flex-direction:column;gap:11px;position:sticky;top:22px;max-height:calc(100vh - 60px);overflow-y:auto;scrollbar-width:none;padding-bottom:24px; }
                .col-right::-webkit-scrollbar { display:none; }

                @media (max-width:1100px) { .page-cols { grid-template-columns:1fr; } .col-right { display:none; } }
                @media (max-width:640px)  { .tab-grid { grid-template-columns:1fr 1fr; } .stat-pill { display:none; } }
            `}</style>

            <div className={`prof-root flex min-h-screen ${isDark ? 'bg-[#07080f]' : 'bg-slate-50'}`}>
                <Sidebar />

                <main className="flex-1 p-5 md:p-7 overflow-auto min-w-0">
                    <div className="page-cols">

                        {/* ════════════ LEFT COLUMN ════════════ */}
                        <div className="col-left">
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[180, 120, 200].map((h, i) => <SkeletonBlock key={i} h={h} />)}
                                </div>
                            ) : (
                                <>
                                    {/* ══ HERO BANNER ══ */}
                                    <div className="fu hero-banner" style={{ padding: '28px 28px 24px' }}>
                                        <div className="hero-glow" />
                                        <div className="hero-grid" />
                                        <div className="hero-noise" />
                                        <div className="hero-orb-1" />
                                        <div className="hero-orb-2" />

                                        <div style={{ position: 'relative', zIndex: 10 }}>
                                            {/* Top row: avatar + info + buttons */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>

                                                {/* Avatar */}
                                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                                    <Avatar name={profile?.fullName} size={78} />
                                                    <div className="avatar-cam" onClick={() => setEditing(true)} title="Edit profile">
                                                        <Camera size={11} color="#fff" />
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h1 className="shimmer-name" style={{
                                                        fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                                                        fontSize: 'clamp(1.4rem,3vw,1.9rem)',
                                                        lineHeight: 1.15, marginBottom: 5,
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                    }}>
                                                        {profile?.fullName || 'Your Name'}
                                                    </h1>
                                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {profile?.email}
                                                    </p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                                        <span className="badge badge-role">
                                                            ⚡ {profile?.role === 'ADMIN' ? 'Admin' : 'Customer'}
                                                        </span>
                                                        <span className={`badge ${profile?.kycStatus === 'VERIFIED' ? 'badge-verified' : 'badge-pending'}`}>
                                                            {profile?.kycStatus === 'VERIFIED' ? '✓ KYC Verified' : '⏳ KYC Pending'}
                                                        </span>
                                                        <span className={`badge ${profile?.active ? 'badge-active' : 'badge-inactive'}`}>
                                                            <span style={{
                                                                width: 6, height: 6, borderRadius: '50%',
                                                                background: profile?.active ? '#34d399' : '#f87171',
                                                                boxShadow: profile?.active ? '0 0 6px #34d399' : '0 0 6px #f87171',
                                                                display: 'inline-block', animation: 'pulseDot 2s ease-in-out infinite',
                                                            }} />
                                                            {profile?.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action buttons */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                    <button className="btn-refresh" onClick={fetchProfile} title="Refresh">
                                                        <RefreshCw size={15} />
                                                    </button>
                                                    {!editing ? (
                                                        <button className="btn-edit" onClick={() => setEditing(true)}>
                                                            <Pencil size={13} /> Edit
                                                        </button>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: 7 }}>
                                                            <button className="btn-save" onClick={handleUpdate} disabled={saving}>
                                                                {saving
                                                                    ? <RefreshCw size={13} style={{ animation: 'spin 0.65s linear infinite' }} />
                                                                    : <Check size={13} />}
                                                                Save
                                                            </button>
                                                            {/* Fix: handleCancel resets from state, no API call */}
                                                            <button className="btn-cancel" onClick={handleCancel}>
                                                                <X size={13} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '18px 0' }} />

                                            {/* Stat pills */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                <StatPill label="Member Since" value={formatDate(profile?.createdAt)} icon={<Calendar size={12} color="#60a5fa" />} />
                                                <StatPill label="Date of Birth" value={formatDate(profile?.dob)}       icon={<Zap size={12} color="#a78bfa" />} />
                                                <StatPill label="Phone"         value={profile?.phone || '—'}          icon={<Phone size={12} color="#34d399" />} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ══ TAB CARDS ══ */}
                                    <div className="fu1 tab-grid">
                                        {TABS.map(t => {
                                            const isActive = activeTab === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setActiveTab(t.id)}
                                                    className={`tab-card ${isActive ? 'tab-active' : ''}`}
                                                    style={{
                                                        background: isActive
                                                            ? `${t.color}18`
                                                            : isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                        border: `1.5px solid ${isActive ? `${t.color}40` : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)')}`,
                                                        boxShadow: isActive ? `0 8px 28px ${t.color}20` : 'none',
                                                    }}
                                                >
                                                    {/* Radial glow on active */}
                                                    <div style={{
                                                        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
                                                        background: isActive ? `radial-gradient(ellipse at 0 0, ${t.color}18 0%, transparent 65%)` : 'none',
                                                    }} />

                                                    <span className="tab-num" style={{ color: isActive ? t.color : undefined }}>
                                                        {t.num}
                                                    </span>
                                                    <div className="tab-icon" style={{
                                                        background: isActive ? t.iconBg : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                                        boxShadow: isActive ? `0 0 14px ${t.color}30` : 'none',
                                                        color: isActive ? t.color : (isDark ? 'rgba(255,255,255,0.28)' : '#94a3b8'),
                                                    }}>
                                                        {t.icon}
                                                    </div>
                                                    <div>
                                                        <p className="tab-label" style={{ color: isActive ? (isDark ? '#fff' : '#0f172a') : (isDark ? 'rgba(255,255,255,0.5)' : '#64748b') }}>
                                                            {t.label}
                                                        </p>
                                                        <p className="tab-desc" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}>
                                                            {t.desc}
                                                        </p>
                                                    </div>
                                                    <div className="tab-bar" style={{ background: t.bar }} />
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* ══ PERSONAL TAB ══ */}
                                    {activeTab === 'personal' && (
                                        <div className="fu2 section-card" style={{
                                            padding: '24px 26px',
                                            background: surface, border: `1px solid ${border}`,
                                            boxShadow: isDark ? '0 20px 56px rgba(0,0,0,0.45)' : '0 8px 40px rgba(0,0,0,0.07)',
                                        }}>
                                            <SectionHeader
                                                icon={<UserCircle size={15} color="#60a5fa" />}
                                                iconBg="rgba(37,99,235,0.12)"
                                                title="Personal Information"
                                                subtitle="Manage your personal details"
                                                isDark={isDark}
                                            />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                {/* Full Name */}
                                                <div>
                                                    <label style={lbl}>Full Name</label>
                                                    {editing
                                                        ? <input
                                                            type="text" value={form.fullName}
                                                            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                                            placeholder="Your full name"
                                                            style={inputStyle}
                                                        />
                                                        : <InfoField value={profile?.fullName} icon={<UserCircle size={14} />} isDark={isDark} />
                                                    }
                                                </div>
                                                {/* Phone */}
                                                <div>
                                                    <label style={lbl}>Phone</label>
                                                    {editing
                                                        ? <input
                                                            type="tel" value={form.phone}
                                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                                            placeholder="9876543210"
                                                            style={inputStyle}
                                                        />
                                                        : <InfoField value={profile?.phone} icon={<Phone size={14} />} isDark={isDark} />
                                                    }
                                                </div>
                                                {/* Email — read only */}
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <label style={lbl}>
                                                        Email <span style={{ fontWeight: 400, opacity: 0.4, textTransform: 'none', letterSpacing: 0 }}>(read only)</span>
                                                    </label>
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: 10,
                                                        padding: '13px 16px', borderRadius: 14,
                                                        background: isDark ? 'rgba(255,255,255,0.02)' : '#f1f5f9',
                                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'}`,
                                                    }}>
                                                        <Mail size={14} style={{ opacity: 0.35, flexShrink: 0 }} />
                                                        <span style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#64748b' : '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {profile?.email}
                                                        </span>
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: 5,
                                                            padding: '3px 9px', borderRadius: 8,
                                                            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
                                                        }}>
                                                            <Lock size={9} style={{ opacity: 0.35 }} />
                                                            <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.4 }}>Locked</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ══ CONTACT TAB ══ */}
                                    {activeTab === 'contact' && (
                                        <div className="fu2 section-card" style={{
                                            padding: '24px 26px',
                                            background: surface, border: `1px solid ${border}`,
                                            boxShadow: isDark ? '0 20px 56px rgba(0,0,0,0.45)' : '0 8px 40px rgba(0,0,0,0.07)',
                                        }}>
                                            <SectionHeader
                                                icon={<Globe size={15} color="#a78bfa" />}
                                                iconBg="rgba(124,58,237,0.12)"
                                                title="Contact & Address"
                                                subtitle="Your location and contact info"
                                                isDark={isDark}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                <div>
                                                    <label style={lbl}>Street Address</label>
                                                    {editing
                                                        ? <input
                                                            type="text" value={form.address}
                                                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                                            placeholder="123 Main Street"
                                                            style={inputStyle}
                                                        />
                                                        : <InfoField value={profile?.address} icon={<MapPin size={14} />} isDark={isDark} />
                                                    }
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                                    {[
                                                        ['City',    'city',    'Mumbai'],
                                                        ['State',   'state',   'MH'],
                                                        ['Pincode', 'pincode', '400001'],
                                                    ].map(([label, key, ph]) => (
                                                        <div key={key}>
                                                            <label style={lbl}>{label}</label>
                                                            {editing
                                                                ? <input
                                                                    type="text" value={form[key]}
                                                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                                    placeholder={ph}
                                                                    style={inputStyle}
                                                                />
                                                                : <InfoField value={profile?.[key]} isDark={isDark} />
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ══ SECURITY TAB ══ */}
                                    {activeTab === 'security' && (
                                        <div className="fu2 section-card" style={{
                                            padding: '24px 26px',
                                            background: surface, border: `1px solid ${border}`,
                                            boxShadow: isDark ? '0 20px 56px rgba(0,0,0,0.45)' : '0 8px 40px rgba(0,0,0,0.07)',
                                        }}>
                                            <SectionHeader
                                                icon={<Fingerprint size={15} color="#34d399" />}
                                                iconBg="rgba(16,185,129,0.12)"
                                                title="Account Security"
                                                subtitle="Your account status and verification"
                                                isDark={isDark}
                                            />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                <StatusTile
                                                    icon={profile?.active ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                    label="Account Status"
                                                    value={profile?.active ? 'Active' : 'Inactive'}
                                                    subtitle={profile?.active ? 'Your account is in good standing' : 'Contact support'}
                                                    color={profile?.active ? '#34d399' : '#f87171'}
                                                    bg={profile?.active ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}
                                                    border={profile?.active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}
                                                    isDark={isDark}
                                                />
                                                <StatusTile
                                                    icon={profile?.kycStatus === 'VERIFIED' ? <Shield size={14} /> : <AlertCircle size={14} />}
                                                    label="KYC Status"
                                                    value={profile?.kycStatus === 'VERIFIED' ? 'Verified' : 'Pending'}
                                                    subtitle={profile?.kycStatus === 'VERIFIED' ? 'Full access unlocked' : 'Submit documents'}
                                                    color={profile?.kycStatus === 'VERIFIED' ? '#34d399' : '#fbbf24'}
                                                    bg={profile?.kycStatus === 'VERIFIED' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)'}
                                                    border={profile?.kycStatus === 'VERIFIED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}
                                                    isDark={isDark}
                                                />
                                                <StatusTile
                                                    icon={<Calendar size={14} />}
                                                    label="Member Since"
                                                    value={formatDate(profile?.createdAt)}
                                                    color="#60a5fa"
                                                    bg={isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'}
                                                    border={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}
                                                    isDark={isDark}
                                                />
                                                <StatusTile
                                                    icon={<Zap size={14} />}
                                                    label="Date of Birth"
                                                    value={formatDate(profile?.dob)}
                                                    color="#a78bfa"
                                                    bg={isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'}
                                                    border={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}
                                                    isDark={isDark}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* ══ PASSWORD TAB ══ */}
                                    {activeTab === 'password' && (
                                        <div className="fu2 section-card" style={{
                                            padding: '24px 26px',
                                            background: surface, border: `1px solid ${border}`,
                                            boxShadow: isDark ? '0 20px 56px rgba(0,0,0,0.45)' : '0 8px 40px rgba(0,0,0,0.07)',
                                        }}>
                                            <SectionHeader
                                                icon={<Key size={15} color="#f87171" />}
                                                iconBg="rgba(239,68,68,0.12)"
                                                title="Change Password"
                                                subtitle="Use a strong password you don't use elsewhere"
                                                isDark={isDark}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                {/* Current Password */}
                                                <div>
                                                    <label style={lbl}>Current Password</label>
                                                    <div className="pw-wrap">
                                                        <input
                                                            type={showPw.current ? 'text' : 'password'}
                                                            value={pwForm.currentPassword}
                                                            onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                                                            placeholder="Enter current password"
                                                            autoComplete="current-password"
                                                            style={{ ...inputStyle, paddingRight: 46 }}
                                                        />
                                                        {/* Fix: type="button" on ALL pw-eye buttons */}
                                                        <button type="button" className="pw-eye"
                                                                onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}>
                                                            {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* New Password */}
                                                <div>
                                                    <label style={lbl}>New Password</label>
                                                    <div className="pw-wrap">
                                                        <input
                                                            type={showPw.new ? 'text' : 'password'}
                                                            value={pwForm.newPassword}
                                                            onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                                                            placeholder="Create a strong password"
                                                            autoComplete="new-password"
                                                            style={{ ...inputStyle, paddingRight: 46 }}
                                                        />
                                                        <button type="button" className="pw-eye"
                                                                onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}>
                                                            {showPw.new ? <EyeOff size={15} /> : <Eye size={15} />}
                                                        </button>
                                                    </div>
                                                    <PasswordStrength password={pwForm.newPassword} />
                                                </div>

                                                {/* Confirm Password */}
                                                <div>
                                                    <label style={lbl}>Confirm New Password</label>
                                                    <div className="pw-wrap">
                                                        <input
                                                            type={showPw.confirm ? 'text' : 'password'}
                                                            value={pwForm.confirmPassword}
                                                            onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                                            placeholder="Repeat new password"
                                                            autoComplete="new-password"
                                                            style={{ ...inputStyle, paddingRight: 46 }}
                                                        />
                                                        <button type="button" className="pw-eye"
                                                                onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}>
                                                            {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                                        </button>
                                                    </div>
                                                    {/* Match indicator */}
                                                    {pwForm.newPassword && pwForm.confirmPassword && (
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: 6,
                                                            marginTop: 9, fontSize: 11.5, fontWeight: 700,
                                                            color: pwForm.newPassword === pwForm.confirmPassword ? '#34d399' : '#f87171',
                                                        }}>
                                                            {pwForm.newPassword === pwForm.confirmPassword
                                                                ? <><CheckCircle2 size={12} /> Passwords match — ready to go!</>
                                                                : <><AlertCircle size={12} /> Passwords don't match</>
                                                            }
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handlePasswordChange}
                                                    disabled={pwLoading}
                                                    className="btn-update-pw"
                                                    style={{ marginTop: 4 }}
                                                >
                                                    {pwLoading
                                                        ? <><RefreshCw size={15} style={{ animation: 'spin 0.65s linear infinite' }} /> Updating…</>
                                                        : <><Key size={15} /> Update Password</>
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>{/* end col-left */}

                        {/* ════════════ RIGHT PANEL ════════════ */}
                        <aside className="col-right rp-scroll">

                            {/* ── Account Overview ── */}
                            <div className={`rp-card fu`} style={{
                                background: surface, border: `1px solid ${border}`,
                                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)',
                            }}>
                                <div className="rp-card-header">
                                    <div className="rp-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
                                        <Activity size={14} color="#60a5fa" />
                                    </div>
                                    <div>
                                        <p className="rp-title" style={{ color: text }}>Account Overview</p>
                                        <p className="rp-sub">Live summary</p>
                                    </div>
                                    <span className="rp-live-dot" />
                                </div>
                                <div className="rp-stat-grid">
                                    {[
                                        { label: 'KYC',    val: profile?.kycStatus === 'VERIFIED' ? 'Verified' : 'Pending', color: profile?.kycStatus === 'VERIFIED' ? '#34d399' : '#fbbf24', dot: true },
                                        { label: 'Status', val: profile?.active ? 'Active' : 'Inactive',                   color: profile?.active ? '#34d399' : '#f87171',             dot: true },
                                        { label: 'Role',   val: profile?.role || '—',                                      color: '#60a5fa' },
                                        { label: 'Joined', val: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—', color: '#a78bfa' },
                                    ].map((s, i) => (
                                        <div key={i} className="rp-stat-cell" style={{
                                            background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                        }}>
                                            <p className="rp-stat-lbl" style={{ color: muted }}>{s.label}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                {s.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}`, display: 'inline-block', flexShrink: 0 }} />}
                                                <p className="rp-stat-val" style={{ color: s.color }}>{s.val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Profile Strength ── */}
                            <div className="rp-card fu1" style={{
                                background: surface, border: `1px solid ${border}`,
                                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)',
                            }}>
                                <div className="rp-card-header">
                                    <div className="rp-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                                        <CheckCircle2 size={14} color="#34d399" />
                                    </div>
                                    <div>
                                        <p className="rp-title" style={{ color: text }}>Profile Strength</p>
                                        <p className="rp-sub">Complete your profile</p>
                                    </div>
                                </div>
                                {/* Fix: profileCompletion is memoized, safe */}
                                {(() => {
                                    const { pct, fields } = profileCompletion;
                                    const c = pct < 40 ? '#f87171' : pct < 75 ? '#fbbf24' : '#34d399';
                                    return (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: c, letterSpacing: '-0.03em', lineHeight: 1 }}>{pct}%</span>
                                                <span style={{ fontSize: 10.5, fontWeight: 600, color: muted }}>{fields.filter(f => f.done).length}/{fields.length} done</span>
                                            </div>
                                            <div className="progress-track" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)' }}>
                                                <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${c}99,${c})`, boxShadow: `0 0 10px ${c}60` }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {fields.map((f, i) => (
                                                    <div key={i} className="check-row">
                                                        <div className="check-box" style={{
                                                            background: f.done ? 'rgba(52,211,153,0.14)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                                                            border: `1px solid ${f.done ? 'rgba(52,211,153,0.28)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                                                        }}>
                                                            {f.done && <Check size={9} color="#34d399" strokeWidth={3} />}
                                                        </div>
                                                        <span style={{ fontSize: 11.5, fontWeight: 600, color: f.done ? (isDark ? 'rgba(255,255,255,0.7)' : '#475569') : muted }}>
                                                            {f.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* ── Security Score ── */}
                            <div className="rp-card fu2" style={{
                                background: surface, border: `1px solid ${border}`,
                                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)',
                            }}>
                                <div className="rp-card-header">
                                    <div className="rp-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
                                        <TrendingUp size={14} color="#818cf8" />
                                    </div>
                                    <div>
                                        <p className="rp-title" style={{ color: text }}>Security Score</p>
                                        <p className="rp-sub">Account safety rating</p>
                                    </div>
                                </div>
                                {/* Fix: securityScore memoized, safe null guard */}
                                {(() => {
                                    const { score, grade, gradeColor, checks } = securityScore;
                                    const C = 2 * Math.PI * 28;
                                    return (
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                                                {/* SVG Ring */}
                                                <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
                                                    <svg width="68" height="68" className="score-ring" style={{ transform: 'rotate(-90deg)' }}>
                                                        <circle cx="34" cy="34" r="28" fill="none" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'} strokeWidth="5" />
                                                        <circle cx="34" cy="34" r="28" fill="none" stroke={gradeColor} strokeWidth="5"
                                                                strokeLinecap="round"
                                                                strokeDasharray={C}
                                                                strokeDashoffset={C - (score / 100) * C}
                                                                style={{ filter: `drop-shadow(0 0 5px ${gradeColor}80)` }}
                                                        />
                                                    </svg>
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span style={{ fontSize: 18, fontWeight: 900, color: gradeColor, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{grade}</span>
                                                        <span style={{ fontSize: 9, fontWeight: 700, color: muted, marginTop: 1 }}>{score}pts</span>
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 11.5, fontWeight: 700, color: muted, marginBottom: 6 }}>
                                                        {score >= 80 ? 'Excellent security!' : score >= 60 ? 'Good, keep going' : score >= 40 ? 'Needs attention' : 'Action required'}
                                                    </p>
                                                    {checks.filter(c => !c.done).slice(0, 1).map((c, i) => (
                                                        <div key={i} style={{
                                                            display: 'flex', alignItems: 'center', gap: 5,
                                                            padding: '4px 8px', borderRadius: 8,
                                                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                                                        }}>
                                                            <AlertCircle size={10} color="#f87171" />
                                                            <span style={{ fontSize: 10.5, fontWeight: 600, color: '#f87171' }}>Fix: {c.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                                {checks.map((c, i) => (
                                                    <div key={i} style={{
                                                        display: 'flex', alignItems: 'center', gap: 8,
                                                        padding: '6px 0',
                                                        borderBottom: i < checks.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` : 'none',
                                                    }}>
                                                        <div style={{
                                                            width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                                                            background: c.done ? 'rgba(52,211,153,0.14)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                                                            border: `1px solid ${c.done ? 'rgba(52,211,153,0.28)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            {c.done && <Check size={8} color="#34d399" strokeWidth={3} />}
                                                        </div>
                                                        <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: c.done ? (isDark ? 'rgba(255,255,255,0.6)' : '#475569') : muted }}>{c.label}</span>
                                                        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: c.done ? gradeColor : muted }}>+{c.weight}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* ── Quick Actions ── */}
                            <div className="rp-card fu2" style={{
                                background: surface, border: `1px solid ${border}`,
                                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)',
                            }}>
                                <div className="rp-card-header">
                                    <div className="rp-icon" style={{ background: 'rgba(251,146,60,0.12)' }}>
                                        <Sparkles size={14} color="#fb923c" />
                                    </div>
                                    <div>
                                        <p className="rp-title" style={{ color: text }}>Quick Actions</p>
                                        <p className="rp-sub">Shortcuts for you</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {[
                                        { label: 'View KYC Status',   icon: <ShieldCheck size={12} />, color: '#34d399', bg: 'rgba(16,185,129,0.1)',  onClick: () => setActiveTab('security') },
                                        { label: 'Change Password',   icon: <Lock size={12} />,        color: '#f87171', bg: 'rgba(239,68,68,0.1)',   onClick: () => setActiveTab('password') },
                                        { label: 'Update Address',    icon: <MapPin size={12} />,      color: '#a78bfa', bg: 'rgba(124,58,237,0.1)',  onClick: () => { setActiveTab('contact'); setEditing(true); } },
                                        { label: 'Edit Personal Info',icon: <UserCircle size={12} />,  color: '#60a5fa', bg: 'rgba(37,99,235,0.1)',   onClick: () => { setActiveTab('personal'); setEditing(true); } },
                                    ].map((a, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={a.onClick}
                                            className="qa-btn"
                                            style={{
                                                background: isDark ? a.bg : a.bg,
                                                border: `1px solid ${a.color}22`,
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = `${a.color}55`; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = `${a.color}22`; }}
                                        >
                                            <span style={{
                                                width: 26, height: 26, borderRadius: 8,
                                                background: `${a.color}22`, display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', color: a.color, flexShrink: 0,
                                            }}>
                                                {a.icon}
                                            </span>
                                            <span style={{ fontSize: 11.5, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.75)' : '#374151', flex: 1 }}>
                                                {a.label}
                                            </span>
                                            <ArrowRight size={11} color={a.color} style={{ opacity: 0.55 }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Recent Activity ── */}
                            <div className="rp-card fu3" style={{
                                background: surface, border: `1px solid ${border}`,
                                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)',
                            }}>
                                <div className="rp-card-header">
                                    <div className="rp-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>
                                        <Clock size={14} color="#a78bfa" />
                                    </div>
                                    <div>
                                        <p className="rp-title" style={{ color: text }}>Recent Activity</p>
                                        <p className="rp-sub">Last account events</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {[
                                        { event: 'Profile viewed',  time: 'Just now',     icon: <UserCircle size={11} />, color: '#60a5fa' },
                                        { event: 'Account created', time: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—', icon: <Star size={11} />, color: '#34d399' },
                                        { event: 'KYC submitted',   time: profile?.kycStatus === 'VERIFIED' ? 'Approved' : 'Pending review', icon: <ShieldCheck size={11} />, color: profile?.kycStatus === 'VERIFIED' ? '#34d399' : '#fbbf24' },
                                    ].map((ev, i, arr) => (
                                        <div key={i} style={{
                                            display: 'flex', gap: 10,
                                            paddingBottom: i < arr.length - 1 ? 12 : 0,
                                            marginBottom: i < arr.length - 1 ? 12 : 0,
                                            borderBottom: i < arr.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none',
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                                                <div style={{
                                                    width: 24, height: 24, borderRadius: 8,
                                                    background: `${ev.color}18`, border: `1px solid ${ev.color}28`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: ev.color,
                                                }}>
                                                    {ev.icon}
                                                </div>
                                                {i < arr.length - 1 && (
                                                    <div style={{ width: 1, flex: 1, minHeight: 10, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)', marginTop: 4 }} />
                                                )}
                                            </div>
                                            <div style={{ paddingTop: 2 }}>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.75)' : '#374151', lineHeight: 1.2 }}>{ev.event}</p>
                                                <p style={{ fontSize: 10, fontWeight: 600, color: muted, marginTop: 3 }}>{ev.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Pro Tip ── */}
                            <div className="rp-card fu3" style={{
                                background: isDark ? 'linear-gradient(135deg,rgba(37,99,235,0.07),rgba(79,70,229,0.05))' : 'linear-gradient(135deg,#eff6ff,#eef2ff)',
                                border: `1px solid ${isDark ? 'rgba(79,130,246,0.14)' : 'rgba(99,102,241,0.18)'}`,
                            }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                                        background: 'rgba(79,70,229,0.14)', border: '1px solid rgba(79,70,229,0.22)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Info size={13} color="#818cf8" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#c7d2fe' : '#4338ca', marginBottom: 5 }}>💡 Pro Tip</p>
                                        <p style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.6, color: isDark ? 'rgba(199,210,254,0.55)' : '#6366f1' }}>
                                            Complete your KYC & address to unlock full banking features and higher transaction limits.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('security')}
                                            style={{
                                                marginTop: 9, display: 'inline-flex', alignItems: 'center', gap: 5,
                                                fontSize: 10.5, fontWeight: 800,
                                                color: '#818cf8', background: 'rgba(79,70,229,0.12)',
                                                border: '1px solid rgba(79,70,229,0.2)',
                                                padding: '4px 10px', borderRadius: 8, cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                                fontFamily: 'Outfit, sans-serif',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = ''}
                                        >
                                            View Security <ArrowRight size={9} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}