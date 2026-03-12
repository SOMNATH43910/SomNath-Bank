import { useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, Sun, Moon, Building2, ArrowRight, Shield, TrendingUp, Lock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Floating Particle ──────────────────────────────────────────── */
function Particle({ style }) {
    return <div className="particle" style={style} aria-hidden="true" />;
}

/* ─── Animated Counter ───────────────────────────────────────────── */
function StatCard({ value, label }) {
    return (
        <div className="stat-card">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
        </div>
    );
}

export default function Login() {
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading]           = useState(false);
    const [focused, setFocused]           = useState('');
    const { login }                       = useAuth();
    const { isDark, toggleTheme }         = useTheme();
    const navigate                        = useNavigate();

    /* ── Fix: useMemo so particles don't regenerate on every render ── */
    const particles = useMemo(() =>
            Array.from({ length: 22 }, (_, i) => ({
                width:             `${Math.random() * 5 + 2}px`,
                height:            `${Math.random() * 5 + 2}px`,
                left:              `${Math.random() * 100}%`,
                top:               `${Math.random() * 100}%`,
                animationDelay:    `${Math.random() * 8}s`,
                animationDuration: `${Math.random() * 10 + 8}s`,
                opacity:           Math.random() * 0.35 + 0.08,
                '--drift':         `${(Math.random() - 0.5) * 60}px`,
            })),
        []);

    /* ── Fix: useCallback so handleSubmit reference is stable ── */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!email.trim() || !password) return;
        setLoading(true);
        try {
            const user = await login(email.trim(), password);
            toast.success(`Welcome back, ${user.fullName}! 🎉`);
            navigate(user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Invalid email or password!';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [email, password, login, navigate]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --blue:    #3b82f6;
                    --indigo:  #6366f1;
                    --violet:  #8b5cf6;
                    --emerald: #10b981;
                    --radius:  20px;
                    --transition: 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                /* ══ Root layout ══ */
                .login-root {
                    font-family: 'Outfit', sans-serif;
                    min-height: 100vh;
                    display: flex;
                    position: relative;
                }
                .login-root.dark  { background: #060b14; }
                .login-root.light { background: #f0f4ff; }

                /* ══ LEFT PANEL ══ */
                .left-panel {
                    position: relative;
                    flex: 1;
                    display: none;
                    overflow: hidden;
                    background: linear-gradient(145deg, #060e1e 0%, #0d1f3c 45%, #091528 100%);
                }
                @media (min-width: 1024px) {
                    .left-panel { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 4rem 3.5rem; }
                }

                /* Layered background effects */
                .left-glow {
                    position: absolute; inset: 0; pointer-events: none;
                    background:
                        radial-gradient(ellipse 60% 50% at 20% 35%, rgba(59,130,246,0.22) 0%, transparent 100%),
                        radial-gradient(ellipse 50% 60% at 80% 75%, rgba(139,92,246,0.16) 0%, transparent 100%);
                    animation: glowPulse 7s ease-in-out infinite;
                }
                .left-noise {
                    position: absolute; inset: 0; pointer-events: none; opacity: 0.035;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                    background-size: 180px;
                }
                .left-grid {
                    position: absolute; inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .left-orb1 {
                    position: absolute; top: -100px; right: -100px;
                    width: 380px; height: 380px; border-radius: 50%;
                    background: radial-gradient(circle at 40% 40%, rgba(59,130,246,0.18) 0%, transparent 65%);
                    animation: orbFloat1 9s ease-in-out infinite;
                }
                .left-orb2 {
                    position: absolute; bottom: -80px; left: -80px;
                    width: 300px; height: 300px; border-radius: 50%;
                    background: radial-gradient(circle at 60% 60%, rgba(139,92,246,0.14) 0%, transparent 65%);
                    animation: orbFloat2 12s ease-in-out infinite;
                }
                .left-orb3 {
                    position: absolute; top: 50%; left: 50%;
                    width: 200px; height: 200px; border-radius: 50%;
                    transform: translate(-50%, -50%);
                    background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
                    animation: orbFloat3 15s ease-in-out infinite;
                }

                /* Particles — Fix: use CSS var(--drift) for horizontal drift */
                .particle {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.75);
                    animation: floatParticle linear infinite;
                    pointer-events: none;
                }
                @keyframes floatParticle {
                    0%   { transform: translate(0, 0) scale(1); opacity: 0; }
                    8%   { opacity: 1; }
                    88%  { opacity: 0.25; }
                    100% { transform: translate(var(--drift, 20px), -130px) scale(0.4); opacity: 0; }
                }

                /* ══ Brand block ══ */
                .brand-row {
                    display: flex; align-items: center; gap: 14px;
                    margin-bottom: 2.5rem;
                }
                .logo-badge {
                    width: 64px; height: 64px; border-radius: 18px;
                    background: linear-gradient(135deg, var(--blue), var(--indigo));
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 10px 40px rgba(59,130,246,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset;
                    position: relative;
                    flex-shrink: 0;
                    animation: logoBreathe 4s ease-in-out infinite;
                }
                .logo-badge::after {
                    content: '';
                    position: absolute; inset: -5px;
                    border-radius: 23px;
                    background: conic-gradient(from 0deg, rgba(59,130,246,0.5), rgba(139,92,246,0.5), rgba(59,130,246,0.5));
                    z-index: -1;
                    animation: conicSpin 4s linear infinite;
                    mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 100%);
                    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 100%);
                }

                .brand-name {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 900;
                    font-size: 1.55rem;
                    color: #fff;
                    letter-spacing: -0.5px;
                    line-height: 1;
                }
                .brand-tagline {
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.38);
                    margin-top: 3px;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                /* ══ Headline ══ */
                .left-headline {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 900;
                    font-size: clamp(2.2rem, 3vw, 3rem);
                    line-height: 1.1;
                    color: #fff;
                    margin-bottom: 1rem;
                    letter-spacing: -1px;
                }
                .gradient-text {
                    background: linear-gradient(100deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .left-sub {
                    color: rgba(255,255,255,0.42);
                    font-size: 0.92rem;
                    line-height: 1.7;
                    margin-bottom: 2.5rem;
                    max-width: 360px;
                }

                /* ══ Feature pills ══ */
                .pills-list {
                    display: flex; flex-direction: column; gap: 10px;
                    margin-bottom: 2.5rem;
                }
                .pill {
                    display: flex; align-items: center; gap: 12px;
                    padding: 13px 16px; border-radius: 14px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    backdrop-filter: blur(4px);
                    transition: background 0.3s, transform 0.3s;
                    cursor: default;
                }
                .pill:hover {
                    background: rgba(255,255,255,0.09);
                    transform: translateX(6px);
                    border-color: rgba(255,255,255,0.13);
                }
                .pill-icon {
                    width: 34px; height: 34px; border-radius: 10px;
                    background: rgba(255,255,255,0.07);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .pill-title { color: #f1f5f9; font-size: 0.85rem; font-weight: 600; line-height: 1; }
                .pill-sub   { color: rgba(255,255,255,0.38); font-size: 0.72rem; margin-top: 3px; }

                /* ══ Stats row ══ */
                .stats-row {
                    display: flex; gap: 14px;
                    flex-wrap: wrap;
                }
                .stat-card {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 14px;
                    padding: 14px 18px;
                    flex: 1; min-width: 90px;
                }
                .stat-value {
                    display: block;
                    font-family: 'Space Mono', monospace;
                    font-weight: 700;
                    font-size: 1.25rem;
                    color: #fff;
                    line-height: 1;
                }
                .stat-label {
                    display: block;
                    font-size: 0.68rem;
                    color: rgba(255,255,255,0.38);
                    margin-top: 4px;
                    letter-spacing: 0.3px;
                }

                /* ══ RIGHT PANEL ══ */
                .right-panel {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1.5rem;
                    position: relative;
                    min-height: 100vh;
                    transition: background 0.3s;
                }
                .right-panel.dark  { background: #060b14; }
                .right-panel.light { background: #f0f4ff; }
                @media (min-width: 1024px) {
                    .right-panel { width: 500px; flex: 0 0 500px; }
                }

                /* Background decoration for right panel */
                .right-bg-orb {
                    position: absolute; pointer-events: none;
                    border-radius: 50%;
                    animation: orbFloat1 8s ease-in-out infinite;
                }

                /* ══ Glass card ══ */
                .glass-card {
                    width: 100%;
                    max-width: 430px;
                    border-radius: 28px;
                    padding: 2.8rem 2.5rem;
                    position: relative;
                    overflow: hidden;
                    animation: cardReveal 0.7s cubic-bezier(0.22,1,0.36,1) both;
                }
                .glass-card.dark {
                    background: rgba(11,18,35,0.97);
                    border: 1px solid rgba(255,255,255,0.07);
                    box-shadow:
                        0 32px 80px rgba(0,0,0,0.6),
                        0 0 0 1px rgba(255,255,255,0.04) inset,
                        0 1px 0 rgba(255,255,255,0.08) inset;
                }
                .glass-card.light {
                    background: rgba(255,255,255,0.97);
                    border: 1px solid rgba(99,102,241,0.1);
                    box-shadow:
                        0 32px 80px rgba(59,130,246,0.1),
                        0 0 0 1px rgba(99,102,241,0.06) inset;
                }
                /* Card top shimmer line */
                .glass-card::before {
                    content: '';
                    position: absolute; top: 0; left: 20%; right: 20%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(59,130,246,0.6), transparent);
                    border-radius: 99px;
                }

                /* ══ Mobile logo ══ */
                .mobile-logo {
                    display: flex; align-items: center; justify-content: center; gap: 12px;
                    margin-bottom: 1.8rem;
                }
                @media (min-width: 1024px) { .mobile-logo { display: none; } }

                /* ══ Heading ══ */
                .card-title {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 900;
                    font-size: 1.8rem;
                    letter-spacing: -0.5px;
                    line-height: 1.15;
                    margin-bottom: 6px;
                }
                .card-title.dark  { color: #f8fafc; }
                .card-title.light { color: #0f172a; }
                .card-sub {
                    font-size: 0.875rem;
                    margin-bottom: 2rem;
                }
                .card-sub.dark  { color: rgba(255,255,255,0.36); }
                .card-sub.light { color: #94a3b8; }

                /* ══ Form fields ══ */
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .field-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }
                .field-label.dark  { color: rgba(255,255,255,0.65); }
                .field-label.light { color: #475569; }

                .field-wrap { position: relative; }
                .field-input {
                    width: 100%;
                    padding: 14px 16px;
                    border-radius: 14px;
                    border: 2px solid transparent;
                    outline: none;
                    font-size: 0.9rem;
                    font-family: 'Outfit', sans-serif;
                    font-weight: 400;
                    transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
                    position: relative;
                    z-index: 1;
                }
                .field-input.dark {
                    background: rgba(255,255,255,0.04);
                    color: #f1f5f9;
                    border-color: rgba(255,255,255,0.07);
                }
                .field-input.dark::placeholder { color: rgba(255,255,255,0.2); }
                .field-input.dark:focus {
                    border-color: var(--blue);
                    background: rgba(59,130,246,0.06);
                    box-shadow: 0 0 0 4px rgba(59,130,246,0.14), 0 2px 8px rgba(0,0,0,0.3);
                }
                .field-input.dark.focused {
                    border-color: var(--blue);
                    background: rgba(59,130,246,0.06);
                    box-shadow: 0 0 0 4px rgba(59,130,246,0.14), 0 2px 8px rgba(0,0,0,0.3);
                }
                .field-input.light {
                    background: #f8faff;
                    color: #0f172a;
                    border-color: #e2e8f0;
                }
                .field-input.light::placeholder { color: #c0c9d8; }
                .field-input.light:focus {
                    border-color: var(--blue);
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(59,130,246,0.10);
                }
                .field-input.light.focused {
                    border-color: var(--blue);
                    background: #fff;
                    box-shadow: 0 0 0 4px rgba(59,130,246,0.10);
                }
                .field-input.pw { padding-right: 50px; }

                /* Fix: password toggle button - properly centered */
                .pw-toggle {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 6px;
                    z-index: 2;
                    transition: opacity 0.2s;
                }
                .pw-toggle:hover { opacity: 0.8; }
                .pw-toggle.dark  { color: #4b5563; }
                .pw-toggle.light { color: #94a3b8; }

                /* ══ Label row ══ */
                .label-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .forgot-link {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--blue);
                    cursor: pointer;
                    background: none; border: none;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }
                .forgot-link:hover { opacity: 0.75; }

                /* ══ Submit button ══ */
                .submit-btn {
                    width: 100%;
                    padding: 15px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, var(--blue) 0%, var(--indigo) 100%);
                    color: white;
                    font-weight: 700;
                    font-size: 0.95rem;
                    font-family: 'Outfit', sans-serif;
                    letter-spacing: 0.2px;
                    border: none;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 8px 28px rgba(59,130,246,0.38), 0 1px 0 rgba(255,255,255,0.15) inset;
                    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
                    margin-top: 4px;
                }
                .submit-btn::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%);
                    background-size: 300% 100%;
                    background-position: -150% 0;
                    animation: shimmer 3.5s ease-in-out infinite;
                }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 14px 36px rgba(59,130,246,0.48), 0 1px 0 rgba(255,255,255,0.2) inset;
                }
                .submit-btn:active:not(:disabled) {
                    transform: translateY(0px);
                    box-shadow: 0 4px 16px rgba(59,130,246,0.3);
                }
                .submit-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                    transform: none;
                }

                /* ══ Spinner ══ */
                .spinner {
                    width: 18px; height: 18px;
                    border: 2.5px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.65s linear infinite;
                    flex-shrink: 0;
                }

                /* ══ Divider ══ */
                .divider {
                    display: flex; align-items: center; gap: 14px;
                    margin: 22px 0;
                }
                .divider-line {
                    flex: 1; height: 1px;
                    background: linear-gradient(90deg, transparent, currentColor, transparent);
                }
                .divider-line.dark  { color: rgba(255,255,255,0.07); }
                .divider-line.light { color: #e2e8f0; }
                .divider-text {
                    font-size: 0.73rem;
                    font-weight: 500;
                    white-space: nowrap;
                }
                .divider-text.dark  { color: #374151; }
                .divider-text.light { color: #94a3b8; }

                /* ══ Register CTA ══ */
                .register-btn {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    padding: 14px; border-radius: 14px; width: 100%;
                    font-weight: 700; font-size: 0.9rem;
                    text-decoration: none;
                    font-family: 'Outfit', sans-serif;
                    transition: transform var(--transition), background 0.22s, box-shadow 0.22s;
                    letter-spacing: 0.1px;
                }
                .register-btn.dark {
                    border: 2px solid rgba(99,102,241,0.3);
                    color: #818cf8;
                    background: rgba(99,102,241,0.06);
                }
                .register-btn.dark:hover {
                    background: rgba(99,102,241,0.14);
                    border-color: rgba(99,102,241,0.5);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(99,102,241,0.2);
                }
                .register-btn.light {
                    border: 2px solid rgba(59,130,246,0.2);
                    color: var(--blue);
                    background: rgba(59,130,246,0.04);
                }
                .register-btn.light:hover {
                    background: rgba(59,130,246,0.1);
                    border-color: rgba(59,130,246,0.4);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(59,130,246,0.15);
                }

                /* ══ Footer ══ */
                .card-footer {
                    text-align: center;
                    font-size: 0.7rem;
                    margin-top: 18px;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                }
                .card-footer.dark  { color: rgba(255,255,255,0.18); }
                .card-footer.light { color: #c0c9d8; }

                /* ══ Theme toggle ══ */
                .theme-toggle {
                    position: fixed; top: 18px; right: 18px; z-index: 200;
                    width: 46px; height: 46px; border-radius: 14px;
                    border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: transform var(--transition), box-shadow 0.2s;
                }
                .theme-toggle:hover { transform: scale(1.1) rotate(12deg); }
                .theme-toggle.dark  {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #facc15;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
                }
                .theme-toggle.light {
                    background: #fff;
                    border: 1px solid rgba(0,0,0,0.08);
                    color: #334155;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                }

                /* ══ Form stagger ══ */
                .stagger { opacity: 0; animation: slideUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
                .s0 { animation-delay: 0.05s; }
                .s1 { animation-delay: 0.12s; }
                .s2 { animation-delay: 0.19s; }
                .s3 { animation-delay: 0.26s; }
                .s4 { animation-delay: 0.33s; }
                .s5 { animation-delay: 0.40s; }
                .s6 { animation-delay: 0.47s; }

                /* ══ Keyframes ══ */
                @keyframes glowPulse  { 0%,100%{opacity:.5} 50%{opacity:1} }
                @keyframes orbFloat1  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-18px,22px) scale(1.05)} }
                @keyframes orbFloat2  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(22px,-18px)} }
                @keyframes orbFloat3  { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.2)} }
                @keyframes logoBreathe { 0%,100%{box-shadow:0 10px 40px rgba(59,130,246,.4)} 50%{box-shadow:0 10px 60px rgba(59,130,246,.65)} }
                @keyframes conicSpin  { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
                @keyframes shimmer    { 0%{background-position:-150% 0} 60%,100%{background-position:150% 0} }
                @keyframes spin       { to{transform:rotate(360deg)} }
                @keyframes cardReveal { from{opacity:0;transform:translateY(28px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes slideUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
                .fade-in { animation: fadeIn 0.8s ease both; }
            `}</style>

            {/* ── Theme Toggle ── */}
            <button
                onClick={toggleTheme}
                className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
                aria-label="Toggle theme"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className={`login-root ${isDark ? 'dark' : 'light'}`}>

                {/* ══════════════ LEFT PANEL ══════════════ */}
                <div className="left-panel fade-in">
                    <div className="left-glow" />
                    <div className="left-noise" />
                    <div className="left-grid" />
                    <div className="left-orb1" />
                    <div className="left-orb2" />
                    <div className="left-orb3" />

                    {/* Fix: particles generated once via useMemo */}
                    {particles.map((p, i) => <Particle key={i} style={p} />)}

                    <div style={{ position: 'relative', zIndex: 10, maxWidth: '420px', width: '100%' }}>

                        {/* Brand */}
                        <div className="brand-row">
                            <div className="logo-badge">
                                <Building2 size={26} color="#fff" />
                            </div>
                            <div>
                                <div className="brand-name">SomNath Bank</div>
                                <div className="brand-tagline">Digital Banking Platform</div>
                            </div>
                        </div>

                        {/* Headline */}
                        <h1 className="left-headline">
                            Banking<br />
                            <span className="gradient-text">Redefined.</span>
                        </h1>
                        <p className="left-sub">
                            Secure, modern, and intelligent banking at your fingertips. Manage accounts, loans, and investments — all in one place.
                        </p>

                        {/* Feature pills */}
                        <div className="pills-list">
                            {[
                                { icon: <Shield size={15} color="#60a5fa" />,    label: 'Bank-grade Security',   sub: '256-bit SSL encryption'    },
                                { icon: <TrendingUp size={15} color="#34d399" />, label: 'Smart Investments',    sub: 'Fixed deposits up to 8% p.a.' },
                                { icon: <Lock size={15} color="#a78bfa" />,       label: 'Instant Transfers',    sub: 'Real-time fund movement'   },
                                { icon: <Sparkles size={15} color="#fbbf24" />,   label: 'AI-powered Insights',  sub: 'Smart spending analytics'  },
                            ].map((f, i) => (
                                <div key={i} className="pill">
                                    <div className="pill-icon">{f.icon}</div>
                                    <div>
                                        <div className="pill-title">{f.label}</div>
                                        <div className="pill-sub">{f.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="stats-row">
                            <StatCard value="2M+"  label="Active Users" />
                            <StatCard value="₹50B" label="Assets Managed" />
                            <StatCard value="99.9%" label="Uptime SLA" />
                        </div>
                    </div>
                </div>

                {/* ══════════════ RIGHT PANEL ══════════════ */}
                <div className={`right-panel ${isDark ? 'dark' : 'light'}`}>

                    {/* Subtle bg orbs for right panel */}
                    <div className="right-bg-orb" style={{
                        width: '350px', height: '350px',
                        top: '-80px', right: '-80px',
                        background: `radial-gradient(circle, ${isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)'} 0%, transparent 70%)`,
                    }} />
                    <div className="right-bg-orb" style={{
                        width: '280px', height: '280px',
                        bottom: '-60px', left: '-60px',
                        background: `radial-gradient(circle, ${isDark ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.05)'} 0%, transparent 70%)`,
                        animationName: 'orbFloat2',
                    }} />

                    <div className={`glass-card ${isDark ? 'dark' : 'light'}`}>

                        {/* Mobile logo — only shown when left panel is hidden */}
                        <div className="mobile-logo stagger s0">
                            <div className="logo-badge" style={{ width: '50px', height: '50px', borderRadius: '14px' }}>
                                <Building2 size={20} color="#fff" />
                            </div>
                            <span style={{
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 900, fontSize: '1.3rem',
                                color: isDark ? '#f8fafc' : '#0f172a',
                                letterSpacing: '-0.3px',
                            }}>SomNath Bank</span>
                        </div>

                        {/* Heading */}
                        <div className="stagger s1">
                            <h2 className={`card-title ${isDark ? 'dark' : 'light'}`}>
                                Welcome back 👋
                            </h2>
                            <p className={`card-sub ${isDark ? 'dark' : 'light'}`}>
                                Sign in to access your account
                            </p>
                        </div>

                        {/* ── Form ── */}
                        {/* Fix: noValidate lets us handle validation messages in JS */}
                        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* Email */}
                            <div className="form-group stagger s2">
                                {/* Fix: htmlFor + id for accessibility */}
                                <label htmlFor="login-email" className={`field-label ${isDark ? 'dark' : 'light'}`}>
                                    Email Address
                                </label>
                                <div className="field-wrap">
                                    <input
                                        id="login-email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onFocus={() => setFocused('email')}
                                        onBlur={() => setFocused('')}
                                        placeholder="rahul@example.com"
                                        required
                                        className={`field-input ${isDark ? 'dark' : 'light'} ${focused === 'email' ? 'focused' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="form-group stagger s3">
                                <div className="label-row">
                                    <label htmlFor="login-pw" className={`field-label ${isDark ? 'dark' : 'light'}`}>
                                        Password
                                    </label>
                                    {/* Fix: button type="button" so it doesn't submit the form */}
                                    <button type="button" className="forgot-link">Forgot password?</button>
                                </div>
                                <div className="field-wrap">
                                    <input
                                        id="login-pw"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused('')}
                                        placeholder="••••••••"
                                        required
                                        className={`field-input pw ${isDark ? 'dark' : 'light'} ${focused === 'password' ? 'focused' : ''}`}
                                    />
                                    {/* Fix: type="button" explicitly prevents form submit */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        className={`pw-toggle ${isDark ? 'dark' : 'light'}`}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="stagger s4">
                                <button type="submit" disabled={loading} className="submit-btn">
                                    {loading ? (
                                        <><div className="spinner" aria-hidden="true" />Signing in…</>
                                    ) : (
                                        <>Sign In <ArrowRight size={17} /></>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="divider stagger s5">
                            <div className={`divider-line ${isDark ? 'dark' : 'light'}`} />
                            <span className={`divider-text ${isDark ? 'dark' : 'light'}`}>New to SomNath Bank?</span>
                            <div className={`divider-line ${isDark ? 'dark' : 'light'}`} />
                        </div>

                        {/* Register CTA */}
                        <div className="stagger s6">
                            <Link
                                to="/register"
                                className={`register-btn ${isDark ? 'dark' : 'light'}`}
                            >
                                Create Free Account <ArrowRight size={15} />
                            </Link>
                        </div>

                        {/* Footer */}
                        <div className={`card-footer ${isDark ? 'dark' : 'light'}`}>
                            <Lock size={11} />
                            <span>Protected by 256-bit AES encryption</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}