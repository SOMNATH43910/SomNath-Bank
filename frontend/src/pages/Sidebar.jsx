import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, CreditCard, Landmark,
    PiggyBank, Bell, LogOut, Building2,
    ShieldCheck, Sun, Moon, Menu, X,
    BookOpen, ArrowLeftRight, FileText, UserCircle, Shield, MessageSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

/* ─── Fonts + Keyframes ───────────────────────────────────────────────────── */
const FontStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@600;700;800&display=swap');

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateX(-18px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes pulseRing {
      0%   { box-shadow: 0 0 0 0 rgba(59,130,246,.55); }
      70%  { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
      100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
    }
    @keyframes floatY {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-5px); }
    }
    @keyframes gradShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes activeGlow {
      0%,100% { box-shadow: 0 0 8px rgba(59,130,246,.4); }
      50%      { box-shadow: 0 0 18px rgba(59,130,246,.7); }
    }
    @keyframes spinIn {
      from { transform: rotate(-90deg) scale(0.5); opacity: 0; }
      to   { transform: rotate(0deg) scale(1); opacity: 1; }
    }
    @keyframes overlayIn {
      from { opacity: 0; } to { opacity: 1; }
    }

    .sb-logo-float { animation: floatY 3.5s ease-in-out infinite; }
    .sb-pulse      { animation: pulseRing 2.2s infinite; }
    .sb-spin-in    { animation: spinIn .35s cubic-bezier(.34,1.56,.64,1) both; }

    .sb-nav-link {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-radius: 12px;
      text-decoration: none; font-size: 13.5px; font-weight: 500;
      font-family: 'DM Sans', sans-serif;
      transition: background .18s ease, transform .18s ease, color .18s ease;
      position: relative; overflow: hidden;
      animation: fadeSlideIn .4s ease both;
    }
    .sb-nav-link:hover {
      transform: translateX(4px);
    }
    .sb-nav-link.active {
      animation: activeGlow 2.5s ease-in-out infinite,
                 fadeSlideIn .4s ease both;
    }
    .sb-nav-link .link-indicator {
      position: absolute; left: 0; top: 50%; transform: translateY(-50%);
      width: 3px; height: 0; border-radius: 0 3px 3px 0;
      background: #fff; transition: height .2s ease;
    }
    .sb-nav-link.active .link-indicator { height: 60%; }

    .sb-icon-wrap {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background .2s, transform .2s;
    }
    .sb-nav-link:hover .sb-icon-wrap { transform: scale(1.1); }

    .sb-bottom-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-radius: 12px;
      font-size: 13.5px; font-weight: 500;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
      width: 100%; border: none; background: none;
      transition: background .18s ease, transform .18s ease;
    }
    .sb-bottom-btn:hover { transform: translateX(3px); }

    .sb-logout-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; border-radius: 12px;
      font-size: 13.5px; font-weight: 600;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
      width: 100%; border: none;
      transition: background .18s ease, transform .18s ease;
    }
    .sb-logout-btn:hover { transform: translateX(3px); }

    .mobile-overlay { animation: overlayIn .25s ease; }
    .mobile-sidebar { animation: fadeSlideIn .3s ease; }

    /* custom scrollbar for nav */
    .sb-scroll::-webkit-scrollbar { width: 4px; }
    .sb-scroll::-webkit-scrollbar-track { background: transparent; }
    .sb-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,.3); border-radius: 4px; }
  `}</style>
);

export default function Sidebar() {
    const { user, logout, isAdmin } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    /* ── theme tokens ── */
    const bg        = isDark ? "#0F172A"  : "#FFFFFF";
    const border    = isDark ? "rgba(255,255,255,.06)" : "rgba(59,130,246,.1)";
    const text      = isDark ? "#E2E8F0"  : "#1E293B";
    const muted     = isDark ? "#64748B"  : "#94A3B8";
    const hoverBg   = isDark ? "rgba(255,255,255,.05)" : "rgba(59,130,246,.06)";
    const activeBg  = "linear-gradient(135deg,#2563EB,#0891B2)";
    const profileBg = isDark ? "rgba(255,255,255,.05)" : "rgba(59,130,246,.06)";
    const iconActiveBg = "rgba(255,255,255,.2)";
    const iconHoverBg  = isDark ? "rgba(255,255,255,.08)" : "rgba(59,130,246,.1)";

    const customerLinks = [
        { path: '/dashboard',     icon: <LayoutDashboard size={16} />, label: 'Dashboard',       color: "#3B82F6" },
        { path: '/accounts',      icon: <Landmark size={16} />,        label: 'Accounts',         color: "#06B6D4" },
        { path: '/cards',         icon: <CreditCard size={16} />,      label: 'Cards',            color: "#8B5CF6" },
        { path: '/loans',         icon: <Building2 size={16} />,       label: 'Loans',            color: "#F59E0B" },
        { path: '/fd',            icon: <PiggyBank size={16} />,       label: 'Fixed Deposits',   color: "#10B981" },
        { path: '/transactions',  icon: <ArrowLeftRight size={16} />,  label: 'Transactions',     color: "#EC4899" },
        { path: '/statement',     icon: <FileText size={16} />,        label: 'Statement',        color: "#6366F1" },
        { path: '/checkbook',     icon: <BookOpen size={16} />,        label: 'Checkbook',        color: "#14B8A6" },
        { path: '/kyc',           icon: <Shield size={16} />,          label: 'KYC Verification', color: "#F97316" },
        { path: '/complaints',    icon: <MessageSquare size={16} />,   label: 'Complaints',       color: "#EF4444" },
        { path: '/notifications', icon: <Bell size={16} />,            label: 'Notifications',    color: "#A78BFA" },
        { path: '/profile',       icon: <UserCircle size={16} />,      label: 'Profile',          color: "#34D399" },
    ];

    const adminLinks = [
        { path: '/admin',     icon: <ShieldCheck size={16} />,     label: 'Admin Panel',  color: "#EF4444" },
        { path: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard',    color: "#3B82F6" },
        { path: '/statement', icon: <FileText size={16} />,        label: 'Statement',    color: "#6366F1" },
        { path: '/profile',   icon: <UserCircle size={16} />,      label: 'Profile',      color: "#34D399" },
    ];

    const links = isAdmin() ? adminLinks : customerLinks;

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
        navigate('/login');
    };

    /* ── Sidebar body ── */
    const SidebarContent = ({ isMobile = false }) => (
        <div style={{
            display: "flex", flexDirection: "column", height: "100%",
            background: bg, color: text,
            fontFamily: "'DM Sans', sans-serif",
            width: collapsed && !isMobile ? 72 : 256,
            transition: "width .3s ease",
            borderRight: `1px solid ${border}`,
        }}>

            {/* ── Header ── */}
            <div style={{
                padding: collapsed && !isMobile ? "20px 16px" : "20px 20px",
                borderBottom: `1px solid ${border}`,
                display: "flex", alignItems: "center",
                justifyContent: collapsed && !isMobile ? "center" : "space-between",
                minHeight: 72,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        className="sb-logo-float sb-pulse"
                        style={{
                            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                            background: "linear-gradient(135deg,#2563EB,#06B6D4)",
                            backgroundSize: "200% 200%",
                            animation: "gradShift 4s ease infinite, floatY 3.5s ease-in-out infinite, pulseRing 2.5s infinite",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 16px rgba(59,130,246,.4)",
                        }}
                    >
                        <Building2 size={20} color="#fff" />
                    </div>

                    {(!collapsed || isMobile) && (
                        <div style={{ animation: "fadeIn .3s ease" }}>
                            <div style={{
                                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                                fontSize: 16, lineHeight: 1.1, letterSpacing: -0.3,
                            }}>
                                SomNath{" "}
                                <span style={{
                                    background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
                                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                    backgroundClip: "text"
                                }}>Bank</span>
                            </div>
                            <div style={{ fontSize: 10, color: muted, fontWeight: 500, letterSpacing: .5 }}>
                                {isAdmin() ? "🛡 Admin Portal" : "💼 Customer Portal"}
                            </div>
                        </div>
                    )}
                </div>

                {!isMobile && (
                    <button onClick={() => setCollapsed(!collapsed)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: muted, padding: 4, borderRadius: 6,
                        display: "flex", transition: "color .2s",
                    }}>
                        {collapsed
                            ? <Menu size={16} style={{ animation: "spinIn .3s ease" }} />
                            : <X size={16} style={{ animation: "spinIn .3s ease" }} />
                        }
                    </button>
                )}
            </div>

            {/* ── User Profile Card ── */}
            {(!collapsed || isMobile) && (
                <div style={{
                    margin: "12px 12px 0",
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: profileBg,
                    border: `1px solid ${border}`,
                    animation: "fadeSlideIn .4s ease",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                            background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#fff",
                        }}>
                            {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {user?.fullName}
                            </div>
                            <div style={{ fontSize: 11, color: muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {user?.email}
                            </div>
                        </div>
                        <span style={{
                            marginLeft: "auto", flexShrink: 0,
                            padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                            background: isAdmin()
                                ? "linear-gradient(135deg,#EF4444,#F97316)"
                                : "linear-gradient(135deg,#3B82F6,#06B6D4)",
                            color: "#fff",
                        }}>
                            {isAdmin() ? "Admin" : "User"}
                        </span>
                    </div>
                </div>
            )}

            {/* collapsed avatar */}
            {collapsed && !isMobile && (
                <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "#fff",
                    }}>
                        {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                </div>
            )}

            {/* ── Nav Links ── */}
            <nav className="sb-scroll" style={{
                flex: 1, padding: "8px", overflowY: "auto", overflowX: "hidden",
                marginTop: 6,
            }}>
                {/* Section label */}
                {(!collapsed || isMobile) && (
                    <div style={{
                        fontSize: 9.5, fontWeight: 700, color: muted,
                        letterSpacing: 1.2, textTransform: "uppercase",
                        padding: "4px 14px 6px", marginBottom: 2,
                    }}>
                        {isAdmin() ? "Management" : "Navigation"}
                    </div>
                )}

                {links.map((link, i) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileOpen(false)}
                            className={`sb-nav-link ${isActive ? "active" : ""}`}
                            title={collapsed && !isMobile ? link.label : ""}
                            style={{
                                color: isActive ? "#fff" : text,
                                background: isActive ? activeBg : "transparent",
                                marginBottom: 2,
                                animationDelay: `${i * 0.04}s`,
                                justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                                boxShadow: isActive ? "0 4px 16px rgba(59,130,246,.35)" : "none",
                            }}
                            onMouseEnter={e => {
                                if (!isActive) e.currentTarget.style.background = hoverBg;
                            }}
                            onMouseLeave={e => {
                                if (!isActive) e.currentTarget.style.background = "transparent";
                            }}
                        >
                            {/* active indicator bar */}
                            <div className="link-indicator" />

                            <div className="sb-icon-wrap" style={{
                                background: isActive ? iconActiveBg : "transparent",
                            }}>
                                <span style={{ color: isActive ? "#fff" : link.color }}>
                                    {link.icon}
                                </span>
                            </div>

                            {(!collapsed || isMobile) && (
                                <span style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 500 }}>
                                    {link.label}
                                </span>
                            )}

                            {/* notification dot for bell */}
                            {link.path === "/notifications" && (!collapsed || isMobile) && (
                                <span style={{
                                    marginLeft: "auto", width: 18, height: 18, borderRadius: "50%",
                                    background: "#EF4444", color: "#fff",
                                    fontSize: 10, fontWeight: 700,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>3</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* ── Bottom Controls ── */}
            <div style={{
                padding: "8px 8px 12px",
                borderTop: `1px solid ${border}`,
            }}>
                {(!collapsed || isMobile) && (
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: muted, letterSpacing: 1.2, textTransform: "uppercase", padding: "4px 14px 6px" }}>
                        Preferences
                    </div>
                )}

                <button
                    onClick={toggleTheme}
                    className="sb-bottom-btn"
                    style={{
                        color: text, justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                        marginBottom: 2,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                    title={collapsed && !isMobile ? (isDark ? "Light Mode" : "Dark Mode") : ""}
                >
                    <div className="sb-icon-wrap" style={{ background: isDark ? "rgba(251,191,36,.12)" : "rgba(99,102,241,.1)" }}>
                        <span style={{ color: isDark ? "#FBBF24" : "#6366F1", animation: "spinIn .35s ease" }}>
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </span>
                    </div>
                    {(!collapsed || isMobile) && (
                        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                    )}
                </button>

                <button
                    onClick={handleLogout}
                    className="sb-logout-btn"
                    style={{
                        color: "#EF4444",
                        justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                        background: "none",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                    title={collapsed && !isMobile ? "Logout" : ""}
                >
                    <div className="sb-icon-wrap" style={{ background: "rgba(239,68,68,.1)" }}>
                        <LogOut size={16} color="#EF4444" />
                    </div>
                    {(!collapsed || isMobile) && <span>Logout</span>}
                </button>

                {/* version tag */}
                {(!collapsed || isMobile) && (
                    <div style={{
                        textAlign: "center", marginTop: 8,
                        fontSize: 10, color: muted, fontWeight: 500, letterSpacing: .3,
                    }}>
                        Somnath Bank v2.0 · 2026
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            <FontStyle />

            {/* ── Desktop Sidebar ── */}
            <aside style={{
                display: "none",
                position: "sticky", top: 0, height: "100vh",
                flexShrink: 0,
                // show on md+
            }}
                   className="hidden md:block"
            >
                <SidebarContent />
            </aside>

            {/* ── Mobile hamburger ── */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden"
                style={{
                    position: "fixed", top: 14, left: 14, zIndex: 50,
                    width: 40, height: 40, borderRadius: 12,
                    background: bg, border: `1px solid ${border}`,
                    boxShadow: "0 4px 16px rgba(0,0,0,.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: text,
                }}
            >
                <Menu size={20} />
            </button>

            {/* ── Mobile Drawer ── */}
            {mobileOpen && (
                <div className="md:hidden mobile-overlay" style={{
                    position: "fixed", inset: 0, zIndex: 100,
                    display: "flex", background: "rgba(0,0,0,.55)",
                    backdropFilter: "blur(4px)",
                }}>
                    <div className="mobile-sidebar" style={{ width: 256, height: "100%", flexShrink: 0, overflowY: "auto" }}>
                        <SidebarContent isMobile={true} />
                    </div>
                    <div style={{ flex: 1 }} onClick={() => setMobileOpen(false)} />
                </div>
            )}
        </>
    );
}