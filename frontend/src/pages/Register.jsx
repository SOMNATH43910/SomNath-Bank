import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
    Eye, EyeOff, Sun, Moon, Building2,
    User, Mail, Phone, Lock, ArrowRight,
    CheckCircle2, AlertCircle, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

/* ─── Inject styles once (not on every render) ──────────────────────────── */
/* Fix: FontStyle as a const string, injected via useEffect once */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --blue:    #3b82f6;
  --cyan:    #06b6d4;
  --indigo:  #6366f1;
  --emerald: #10b981;
  --rose:    #f43f5e;
  --amber:   #f59e0b;
  --spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --out:     cubic-bezier(0.22, 1, 0.36, 1);
}

/* ── Keyframes ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes floatY {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes orbFloat1 {
  0%,100% { transform: translate(0,0) scale(1); }
  50%      { transform: translate(20px,-16px) scale(1.07); }
}
@keyframes orbFloat2 {
  0%,100% { transform: translate(0,0); }
  50%      { transform: translate(-16px,20px); }
}
@keyframes gradFlow {
  0%,100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes checkBounce {
  0%   { transform: scale(0) rotate(-18deg); opacity: 0; }
  65%  { transform: scale(1.22) rotate(4deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes badgePop {
  0%   { transform: translateX(-50%) translateY(8px); opacity: 0; }
  100% { transform: translateX(-50%) translateY(0); opacity: 1; }
}
@keyframes shimmerSlide {
  0%   { background-position: -300% 0; }
  100% { background-position:  300% 0; }
}
@keyframes conicSpin {
  to { transform: rotate(360deg); }
}
@keyframes progressGrow {
  from { width: 0; }
}
@keyframes successPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.45); }
  50%      { box-shadow: 0 0 0 16px rgba(16,185,129,0); }
}

/* ── Stagger classes ── */
/* Fix: all delays use positive class names, no negative suffix */
.s0 { animation: fadeUp 0.5s 0.00s var(--out) both; }
.s1 { animation: fadeUp 0.5s 0.07s var(--out) both; }
.s2 { animation: fadeUp 0.5s 0.13s var(--out) both; }
.s3 { animation: fadeUp 0.5s 0.19s var(--out) both; }
.s4 { animation: fadeUp 0.5s 0.25s var(--out) both; }
.s5 { animation: fadeUp 0.5s 0.31s var(--out) both; }
.s6 { animation: fadeUp 0.5s 0.37s var(--out) both; }
.s7 { animation: fadeUp 0.5s 0.43s var(--out) both; }

/* ── Logo ── */
.logo-badge {
  animation: floatY 3.5s ease-in-out infinite;
  position: relative;
}
.logo-badge::after {
  content: '';
  position: absolute; inset: -5px;
  border-radius: 24px;
  background: conic-gradient(from 0deg, rgba(59,130,246,0.55), rgba(99,102,241,0.55), rgba(6,182,212,0.55), rgba(59,130,246,0.55));
  z-index: -1;
  animation: conicSpin 4s linear infinite;
  mask: radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 100%);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 100%);
}

/* ── Submit button ── */
.submit-btn {
  width: 100%; padding: 14px 20px;
  border: none; border-radius: 16px;
  background: linear-gradient(135deg, #2563eb 0%, #06b6d4 50%, #6366f1 100%);
  background-size: 200% 200%;
  animation: gradFlow 4s ease infinite;
  color: #fff;
  font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 15px;
  letter-spacing: 0.3px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  position: relative; overflow: hidden;
  box-shadow: 0 8px 28px rgba(59,130,246,0.38), inset 0 1px 0 rgba(255,255,255,0.18);
  transition: transform 0.25s var(--spring), box-shadow 0.22s ease, opacity 0.2s;
}
.submit-btn::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.1) 50%, transparent 65%);
  background-size: 300% 100%;
  background-position: -150% 0;
  animation: shimmerSlide 3.5s ease-in-out infinite;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 14px 36px rgba(59,130,246,0.48), inset 0 1px 0 rgba(255,255,255,0.2);
}
.submit-btn:active:not(:disabled) { transform: translateY(0px); }
.submit-btn:disabled { opacity: 0.62; cursor: not-allowed; animation: none; }

/* ── Input ── */
.field-input {
  width: 100%; outline: none;
  font-family: 'Outfit', sans-serif; font-size: 13.5px; font-weight: 500;
  transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
  border-radius: 14px;
}
.field-input:focus {
  border-color: var(--blue) !important;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.13) !important;
}
.field-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  pointer-events: none; z-index: 2; display: flex; align-items: center;
  transition: color 0.2s;
}
.field-wrap:focus-within .field-icon { color: var(--blue) !important; }

/* Focus underline bar */
.field-underline {
  position: absolute; bottom: 0; left: 0; right: 0; height: 2.5px;
  background: linear-gradient(90deg, var(--blue), var(--cyan));
  border-radius: 0 0 14px 14px;
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.26s var(--out);
}
.field-wrap:focus-within .field-underline { transform: scaleX(1); }

/* ── Strength bar ── */
.str-segment {
  flex: 1; height: 4px; border-radius: 99px;
  transition: background 0.35s ease;
}

/* ── Trust badges ── */
.trust-badge {
  font-size: 11px; font-weight: 600;
  padding: 5px 12px; border-radius: 99px;
  backdrop-filter: blur(10px);
  white-space: nowrap;
  animation: badgePop 0.5s var(--out) both;
}

/* ── Success ring ── */
.success-icon { animation: successPulse 2s ease-in-out infinite; }
.check-bounce { animation: checkBounce 0.45s var(--spring) both; }

/* ── Orb BG ── */
.orb {
  position: fixed; border-radius: 50%;
  /* Fix: pointer-events none + zIndex below card */
  pointer-events: none; z-index: 0;
  filter: blur(55px);
}

/* ── Register link ── */
.sign-in-link {
  color: var(--blue); font-weight: 700; text-decoration: none;
  position: relative; padding-bottom: 1px;
  transition: opacity 0.2s;
}
.sign-in-link::after {
  content: '';
  position: absolute; bottom: -1px; left: 0; right: 0; height: 1.5px;
  background: var(--blue); border-radius: 99px;
  transform: scaleX(0.4); transform-origin: left;
  transition: transform 0.25s var(--out);
}
.sign-in-link:hover::after { transform: scaleX(1); }
.sign-in-link:hover { opacity: 0.8; }

/* ── Theme toggle ── */
.theme-toggle {
  position: fixed; top: 18px; right: 18px; z-index: 200;
  width: 44px; height: 44px; border-radius: 14px;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.25s var(--spring), box-shadow 0.2s;
}
.theme-toggle:hover { transform: rotate(18deg) scale(1.1); }
`;

/* ─── Password strength ──────────────────────────────────────────────────── */
const getStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8)           s++;
    if (/[A-Z]/.test(pw))         s++;
    if (/[0-9]/.test(pw))         s++;
    if (/[^A-Za-z0-9]/.test(pw))  s++;
    return s;
};

/* Fix: index 0 = no password case, handled separately */
const STRENGTH_META = [
    null, // score 0 — handled by conditional render
    { label: 'Too Weak',  color: '#ef4444', track: 'rgba(239,68,68,0.18)'  },
    { label: 'Fair',      color: '#f59e0b', track: 'rgba(245,158,11,0.18)' },
    { label: 'Good',      color: '#3b82f6', track: 'rgba(59,130,246,0.18)' },
    { label: 'Strong 💪', color: '#10b981', track: 'rgba(16,185,129,0.18)' },
];

/* ─── Field component ────────────────────────────────────────────────────── */
/* Fix: stagger index passed as number, class computed correctly */
function Field({ label, icon: Icon, iconColor, stagger, isDark, children }) {
    const labelColor = isDark ? '#64748b' : '#94a3b8';
    return (
        <div className={`s${stagger}`}>
            <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 7, color: labelColor,
            }}>
                {label}
            </label>
            <div className="field-wrap" style={{ position: 'relative' }}>
                <span className="field-icon" style={{ color: isDark ? '#475569' : '#9ca3af' }}>
                    <Icon size={15} />
                </span>
                {children}
                <div className="field-underline" />
            </div>
        </div>
    );
}

/* ─── Main Register Component ────────────────────────────────────────────── */
export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm,  setShowConfirm]  = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [success,  setSuccess]  = useState(false);
    /* Fix: touched per-field for inline validation */
    const [touched,  setTouched]  = useState({});

    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    /* Fix: inject global styles once via useEffect */
    useEffect(() => {
        const id = 'register-styles';
        if (!document.getElementById(id)) {
            const el = document.createElement('style');
            el.id = id;
            el.textContent = GLOBAL_CSS;
            document.head.appendChild(el);
        }
        return () => { /* keep style alive for app, or remove if isolated */ };
    }, []);

    /* Fix: functional updater to avoid stale closure */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    /* Fix: memoized derived values */
    const strength     = useMemo(() => getStrength(formData.password), [formData.password]);
    const strengthMeta = STRENGTH_META[strength] ?? null;

    /* Fix: properly typed boolean, not falsy-string */
    const pwMatch = useMemo(() =>
            formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword,
        [formData.password, formData.confirmPassword]);

    const pwMismatch = useMemo(() =>
            touched.confirmPassword && formData.confirmPassword.length > 0 && !pwMatch,
        [touched.confirmPassword, formData.confirmPassword, pwMatch]);

    /* Fix: double-submit guard + sends only required fields */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (loading || success) return;
        if (!pwMatch) {
            toast.error('Passwords do not match');
            return;
        }
        if (strength < 2) {
            toast.error('Please use a stronger password');
            return;
        }
        setLoading(true);
        try {
            await API.post('/auth/register', {
                fullName: formData.fullName.trim(),
                email:    formData.email.trim().toLowerCase(),
                phone:    formData.phone.trim(),
                password: formData.password,
                /* Fix: confirmPassword NOT sent to server */
            });
            setSuccess(true);
            toast.success('Account created! 🎉');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }, [loading, success, pwMatch, strength, formData, navigate]);

    /* ── Theme tokens ── */
    const bg         = isDark ? '#07080f' : '#f0f4ff';
    const surface    = isDark ? '#0e1117' : '#ffffff';
    const borderCol  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(59,130,246,0.12)';
    const text       = isDark ? '#f1f5f9' : '#0f172a';
    const muted      = isDark ? '#64748b' : '#94a3b8';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#f8faff';
    const inputBord  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.18)';

    const inputStyle = {
        padding: '13px 14px 13px 42px',
        background: inputBg,
        border: `1.5px solid ${inputBord}`,
        color: isDark ? '#f1f5f9' : '#0f172a',
    };

    const inputStylePw = { ...inputStyle, paddingRight: 46 };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '28px 16px',
            background: bg, fontFamily: "'Outfit', sans-serif",
            transition: 'background 0.35s', position: 'relative',
        }}>

            {/* Fix: orbs zIndex:0 always below card zIndex:1 */}
            <div className="orb" style={{
                width: 400, height: 400, top: -120, left: -120,
                background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
                animation: 'orbFloat1 10s ease-in-out infinite',
            }} />
            <div className="orb" style={{
                width: 320, height: 320, bottom: -80, right: -80,
                background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)',
                animation: 'orbFloat2 13s ease-in-out infinite',
            }} />
            <div className="orb" style={{
                width: 200, height: 200, top: '40%', right: '8%',
                background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
                animation: 'orbFloat1 16s 2s ease-in-out infinite',
            }} />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="theme-toggle"
                style={{
                    background: isDark ? 'rgba(255,255,255,0.07)' : '#fff',
                    border: `1px solid ${borderCol}`,
                    color:  isDark ? '#facc15' : '#334155',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}
                aria-label="Toggle theme"
            >
                {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* ══ Card ══ */}
            <div style={{
                width: '100%', maxWidth: 448,
                background: surface, color: text,
                borderRadius: 28, padding: '36px 34px 30px',
                border: `1px solid ${borderCol}`,
                boxShadow: isDark
                    ? '0 28px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset'
                    : '0 28px 64px rgba(59,130,246,0.1), 0 0 0 1px rgba(59,130,246,0.06) inset',
                position: 'relative', zIndex: 1, overflow: 'hidden',
                animation: 'fadeUp 0.6s var(--out) both',
            }}>

                {/* Card shimmer top border */}
                <div style={{
                    position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(59,130,246,0.6), transparent)',
                    borderRadius: 99,
                }} />

                {/* Card inner glow */}
                <div style={{
                    position: 'absolute', top: -80, right: -80, width: 240, height: 240,
                    background: isDark
                        ? 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>

                    {/* ── Logo + Brand ── */}
                    <div className="s0" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
                        <div className="logo-badge" style={{
                            width: 62, height: 62, borderRadius: 20,
                            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 14,
                            boxShadow: '0 10px 32px rgba(59,130,246,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
                        }}>
                            <Building2 size={28} color="#fff" />
                        </div>
                        <h1 style={{
                            fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 22,
                            letterSpacing: -0.6, marginBottom: 5, lineHeight: 1,
                            color: text,
                        }}>
                            Somnath{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>Bank</span>
                        </h1>
                        <p style={{ fontSize: 13, color: muted, fontWeight: 400 }}>
                            Create your free account today
                        </p>
                    </div>

                    {/* ══ Success State ══ */}
                    {success ? (
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: 14, padding: '32px 0', animation: 'fadeIn 0.4s ease',
                        }}>
                            <div className="success-icon check-bounce" style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: 'rgba(16,185,129,0.12)',
                                border: '2px solid rgba(16,185,129,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <CheckCircle2 size={38} color="#10b981" />
                            </div>
                            <div style={{
                                fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 19, color: text,
                            }}>
                                Account Created! 🎉
                            </div>
                            <p style={{ fontSize: 13, color: muted, textAlign: 'center' }}>
                                Welcome aboard. Redirecting you to login…
                            </p>
                            {/* Animated progress bar */}
                            <div style={{ width: '100%', height: 4, borderRadius: 99, background: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: 99,
                                    background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                                    width: '100%',
                                    animation: 'progressGrow 2s linear both',
                                    transformOrigin: 'left',
                                }} />
                            </div>
                        </div>
                    ) : (
                        /* ══ Registration Form ══ */
                        /* Fix: noValidate + aria attributes for a11y */
                        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

                            {/* Full Name */}
                            <Field label="Full Name" icon={User} stagger={1} isDark={isDark}>
                                <input
                                    type="text" name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Priya Sharma"
                                    required
                                    autoComplete="name"
                                    disabled={loading}
                                    className="field-input"
                                    style={inputStyle}
                                />
                            </Field>

                            {/* Email */}
                            <Field label="Email Address" icon={Mail} stagger={2} isDark={isDark}>
                                <input
                                    type="email" name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="priya@gmail.com"
                                    required
                                    autoComplete="email"
                                    disabled={loading}
                                    className="field-input"
                                    style={inputStyle}
                                />
                            </Field>

                            {/* Phone */}
                            <Field label="Phone Number" icon={Phone} stagger={3} isDark={isDark}>
                                <input
                                    type="tel" name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                    required
                                    autoComplete="tel"
                                    disabled={loading}
                                    className="field-input"
                                    style={inputStyle}
                                />
                            </Field>

                            {/* Password */}
                            <Field label="Password" icon={Lock} stagger={4} isDark={isDark}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 characters"
                                    required
                                    autoComplete="new-password"
                                    disabled={loading}
                                    className="field-input"
                                    style={inputStylePw}
                                />
                                {/* Fix: type="button" so it never submits the form */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: muted, display: 'flex', padding: 4, borderRadius: 6,
                                        transition: 'color 0.2s',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </Field>

                            {/* Strength Meter — Fix: only shown when password has content */}
                            {formData.password.length > 0 && strengthMeta && (
                                <div style={{ marginTop: -6, animation: 'fadeIn 0.3s ease' }}>
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="str-segment" style={{
                                                background: i <= strength ? strengthMeta.color : (isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'),
                                                boxShadow: i <= strength ? `0 0 8px ${strengthMeta.color}60` : 'none',
                                            }} />
                                        ))}
                                    </div>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: strengthMeta.color }}>
                                            {strengthMeta.label}
                                        </span>
                                        <span style={{ fontSize: 10.5, color: muted }}>
                                            {strength}/4 criteria
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Confirm Password */}
                            <Field label="Confirm Password" icon={Lock} stagger={5} isDark={isDark}>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter password"
                                    required
                                    autoComplete="new-password"
                                    disabled={loading}
                                    className="field-input"
                                    /* Fix: padding-right accommodates BOTH eye btn + match icon without overlap */
                                    style={{ ...inputStylePw, paddingRight: 72 }}
                                />
                                {/* Eye toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(v => !v)}
                                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: muted, display: 'flex', padding: 4, borderRadius: 6,
                                        transition: 'color 0.2s',
                                    }}
                                >
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>

                                {/* Fix: match indicator left of eye button, no overlap */}
                                {formData.confirmPassword.length > 0 && (
                                    <span style={{
                                        position: 'absolute', right: 42, top: '50%', transform: 'translateY(-50%)',
                                        display: 'flex', alignItems: 'center',
                                        animation: 'checkBounce 0.35s var(--spring) both',
                                    }}>
                                        {pwMatch
                                            ? <CheckCircle2 size={15} color="#10b981" />
                                            : <AlertCircle  size={15} color="#f43f5e" />
                                        }
                                    </span>
                                )}
                            </Field>

                            {/* Inline mismatch error — Fix: uses touched state */}
                            {pwMismatch && (
                                <div style={{
                                    marginTop: -8, display: 'flex', alignItems: 'center', gap: 5,
                                    fontSize: 11.5, fontWeight: 700, color: '#f43f5e',
                                    animation: 'fadeIn 0.2s ease',
                                }}>
                                    <AlertCircle size={11} /> Passwords don't match
                                </div>
                            )}

                            {/* Submit */}
                            <div className="s6" style={{ marginTop: 4 }}>
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="submit-btn"
                                >
                                    {loading ? (
                                        <>
                                            {/* Fix: spinner separate from text, shimmer not applied globally */}
                                            <span style={{
                                                width: 17, height: 17, flexShrink: 0,
                                                border: '2.5px solid rgba(255,255,255,0.3)',
                                                borderTopColor: '#fff', borderRadius: '50%',
                                                animation: 'spin 0.65s linear infinite',
                                                display: 'inline-block',
                                            }} />
                                            <span style={{
                                                background: 'linear-gradient(90deg,rgba(255,255,255,0.5) 25%,rgba(255,255,255,1) 50%,rgba(255,255,255,0.5) 75%)',
                                                backgroundSize: '300% 100%',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                animation: 'shimmerSlide 1.5s ease-in-out infinite',
                                            }}>
                                                Creating Account…
                                            </span>
                                        </>
                                    ) : (
                                        <>Create Account <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="s7" style={{
                                display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0',
                            }}>
                                <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0' }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: muted, letterSpacing: '0.04em' }}>
                                    ALREADY HAVE AN ACCOUNT?
                                </span>
                                <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0' }} />
                            </div>

                            {/* Login link */}
                            <div className="s7" style={{ textAlign: 'center' }}>
                                <Link to="/login" className="sign-in-link">
                                    Sign In →
                                </Link>
                            </div>

                        </form>
                    )}
                </div>
            </div>

            {/* ── Trust Badges ── */}
            {/* Fix: wrapped in a div to avoid fixed-left + translateX quirks on some browsers */}
            <div style={{
                position: 'fixed', bottom: 16,
                left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 10, flexWrap: 'nowrap',
                zIndex: 100,
            }}>
                {[
                    { icon: '🔒', text: 'SSL Secured' },
                    { icon: '🏦', text: 'RBI Regulated' },
                    { icon: '🛡', text: '256-bit AES' },
                ].map((b, i) => (
                    <div
                        key={i}
                        className="trust-badge"
                        style={{
                            background: isDark ? 'rgba(14,17,23,0.85)' : 'rgba(255,255,255,0.88)',
                            border: `1px solid ${borderCol}`,
                            color: muted,
                            animationDelay: `${0.7 + i * 0.1}s`,
                        }}
                    >
                        {b.icon} {b.text}
                    </div>
                ))}
            </div>
        </div>
    );
}