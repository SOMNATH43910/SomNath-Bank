import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, CreditCard, Landmark,
    PiggyBank, Bell, LogOut, Building2,
    ShieldCheck, Sun, Moon, Menu, X,
    BookOpen, ArrowLeftRight, FileText, UserCircle, Shield, MessageSquare,
    Sparkles, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const FontStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Clash+Display:wght@600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

    :root {
      --ink: #0D0D1A;
      --glass: rgba(255,255,255,.04);
      --glass-border: rgba(255,255,255,.08);
    }

    @keyframes hoverGlow {
      0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
      50%      { box-shadow: 0 0 18px 4px rgba(99,102,241,.35); }
    }
    @keyframes slideRight {
      from { opacity:0; transform:translateX(-8px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes orbFloat {
      0%,100% { transform:translateY(0) scale(1); }
      50%      { transform:translateY(-12px) scale(1.05); }
    }
    @keyframes scanLine {
      0%   { transform:translateY(-100%); opacity:.6; }
      100% { transform:translateY(400%); opacity:0; }
    }
    @keyframes gradRing {
      0%   { transform:rotate(0deg); }
      100% { transform:rotate(360deg); }
    }
    @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.2;} }
    @keyframes popIn {
      0%   { transform:scale(.8) translateX(-4px); opacity:0; }
      70%  { transform:scale(1.05) translateX(2px); opacity:1; }
      100% { transform:scale(1) translateX(0); opacity:1; }
    }
    @keyframes overlayIn { from{opacity:0;} to{opacity:1;} }
    @keyframes drawerSlide {
      from { transform:translateX(-100%); }
      to   { transform:translateX(0); }
    }
    @keyframes pulseAvatar {
      0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,.6); }
      50%      { box-shadow:0 0 0 6px rgba(99,102,241,0); }
    }

    .sb3 {
      font-family:'Plus Jakarta Sans', sans-serif;
      display:flex; flex-direction:column;
      height:100%;
      position:relative;
      overflow:hidden;
      transition:width .3s cubic-bezier(.4,0,.2,1);
    }

    /* ── Scan line effect ── */
    .sb3-scan::after {
      content:'';
      position:absolute;
      left:0; right:0;
      height:60px;
      background:linear-gradient(180deg, transparent, rgba(99,102,241,.06), transparent);
      animation:scanLine 4s linear infinite;
      pointer-events:none;
      z-index:0;
    }

    /* ── Nav item ── */
    .sb3-item {
      position:relative;
      display:flex;
      align-items:center;
      border-radius:16px;
      text-decoration:none;
      cursor:pointer;
      transition:all .22s cubic-bezier(.4,0,.2,1);
      overflow:hidden;
      margin-bottom:2px;
    }
    .sb3-item:hover { transform:translateX(3px); }
    .sb3-item.active { transform:none; }

    /* pill hover bg */
    .sb3-item .sb3-pill {
      position:absolute; inset:0; border-radius:16px;
      opacity:0; transition:opacity .2s;
    }
    .sb3-item:hover .sb3-pill { opacity:1; }

    /* ── Icon container ── */
    .sb3-ic {
      width:40px; height:40px;
      border-radius:13px;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0;
      transition:transform .2s, box-shadow .2s;
      position:relative; z-index:1;
    }
    .sb3-item:hover .sb3-ic { transform:scale(1.08) rotate(-3deg); }
    .sb3-item.active .sb3-ic { transform:scale(1.04); }

    /* ── Label ── */
    .sb3-lbl {
      font-size:13px; font-weight:600;
      white-space:nowrap;
      transition:opacity .2s, transform .2s;
      position:relative; z-index:1;
    }

    /* ── Bottom action btns ── */
    .sb3-action {
      display:flex; align-items:center; gap:10px;
      padding:9px 10px; border-radius:14px;
      cursor:pointer; border:none; background:none;
      font-family:'Plus Jakarta Sans',sans-serif;
      font-size:13px; font-weight:600;
      width:100%;
      transition:background .18s, transform .18s;
    }
    .sb3-action:hover { transform:translateX(3px); }
    .sb3-action-ic {
      width:36px; height:36px; border-radius:11px;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0;
      transition:transform .2s;
    }
    .sb3-action:hover .sb3-action-ic { transform:scale(1.1); }

    /* scrollbar */
    .sb3-scroll::-webkit-scrollbar { width:2px; }
    .sb3-scroll::-webkit-scrollbar-thumb { background:rgba(99,102,241,.2); border-radius:2px; }

    .sb3-badge {
      width:18px; height:18px; border-radius:50%;
      background:linear-gradient(135deg,#EF4444,#F97316);
      color:#fff; font-size:9px; font-weight:800;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0; margin-left:auto;
      position:relative; z-index:1;
      box-shadow:0 2px 8px rgba(239,68,68,.45);
      animation:blink 3s ease-in-out infinite;
    }

    .sb3-avatar-ring { animation:pulseAvatar 2.5s ease-in-out infinite; }
    .sb3-drawer { animation:drawerSlide .3s cubic-bezier(.4,0,.2,1); }
    .sb3-overlay { animation:overlayIn .25s ease; }

    .sb3-sep {
      height:1px;
      margin:6px 4px;
    }

    .sb3-cat {
      font-size:8.5px; font-weight:800;
      letter-spacing:2px; text-transform:uppercase;
      padding:10px 10px 4px;
      opacity:.35;
    }

    /* active shimmer */
    .sb3-active-shimmer {
      position:absolute; inset:0; border-radius:16px;
      background:linear-gradient(120deg, transparent 30%, rgba(255,255,255,.06) 50%, transparent 70%);
      background-size:200% 100%;
      animation:shimmerSlide 3s ease infinite;
      pointer-events:none;
    }
    @keyframes shimmerSlide {
      0%   { background-position:200% 0; }
      100% { background-position:-200% 0; }
    }
  `}</style>
);

/* ─── Data ────────────────────────────────────────────────────────────────── */
const NAV = {
    customer: [
        { cat:'Main', items:[
                { path:'/dashboard',    icon:<LayoutDashboard size={16}/>, label:'Dashboard',       c:'#818CF8', dark:'rgba(129,140,248,.18)', glow:'rgba(129,140,248,.4)' },
                { path:'/accounts',     icon:<Landmark size={16}/>,        label:'Accounts',         c:'#22D3EE', dark:'rgba(34,211,238,.15)',  glow:'rgba(34,211,238,.4)' },
                { path:'/cards',        icon:<CreditCard size={16}/>,      label:'Cards',            c:'#A78BFA', dark:'rgba(167,139,250,.15)', glow:'rgba(167,139,250,.4)' },
            ]},
        { cat:'Money', items:[
                { path:'/loans',         icon:<Building2 size={16}/>,      label:'Loans',            c:'#FBBF24', dark:'rgba(251,191,36,.15)',  glow:'rgba(251,191,36,.4)' },
                { path:'/fd',            icon:<PiggyBank size={16}/>,      label:'Fixed Deposits',   c:'#34D399', dark:'rgba(52,211,153,.15)',  glow:'rgba(52,211,153,.4)' },
                { path:'/transactions',  icon:<ArrowLeftRight size={16}/>, label:'Transactions',     c:'#F472B6', dark:'rgba(244,114,182,.15)', glow:'rgba(244,114,182,.4)' },
                { path:'/statement',     icon:<FileText size={16}/>,       label:'Statement',        c:'#C4B5FD', dark:'rgba(196,181,253,.13)', glow:'rgba(196,181,253,.4)' },
            ]},
        { cat:'Tools', items:[
                { path:'/checkbook',    icon:<BookOpen size={16}/>,        label:'Checkbook',        c:'#2DD4BF', dark:'rgba(45,212,191,.13)',  glow:'rgba(45,212,191,.4)' },
                { path:'/kyc',          icon:<Shield size={16}/>,          label:'KYC',              c:'#FB923C', dark:'rgba(251,146,60,.13)',  glow:'rgba(251,146,60,.4)' },
                { path:'/complaints',   icon:<MessageSquare size={16}/>,   label:'Complaints',       c:'#F87171', dark:'rgba(248,113,113,.13)', glow:'rgba(248,113,113,.4)' },
                { path:'/notifications',icon:<Bell size={16}/>,            label:'Notifications',    c:'#60A5FA', dark:'rgba(96,165,250,.13)',  glow:'rgba(96,165,250,.4)', badge:3 },
                { path:'/profile',      icon:<UserCircle size={16}/>,      label:'Profile',          c:'#86EFAC', dark:'rgba(134,239,172,.13)', glow:'rgba(134,239,172,.4)' },
            ]},
    ],
    admin: [
        { cat:'Admin', items:[
                { path:'/admin',     icon:<ShieldCheck size={16}/>,     label:'Admin Panel',  c:'#F87171', dark:'rgba(248,113,113,.15)', glow:'rgba(248,113,113,.4)' },
                { path:'/dashboard', icon:<LayoutDashboard size={16}/>, label:'Dashboard',    c:'#818CF8', dark:'rgba(129,140,248,.18)', glow:'rgba(129,140,248,.4)' },
                { path:'/statement', icon:<FileText size={16}/>,        label:'Statement',    c:'#C4B5FD', dark:'rgba(196,181,253,.13)', glow:'rgba(196,181,253,.4)' },
                { path:'/profile',   icon:<UserCircle size={16}/>,      label:'Profile',      c:'#86EFAC', dark:'rgba(134,239,172,.13)', glow:'rgba(134,239,172,.4)' },
            ]},
    ],
};

export default function Sidebar() {
    const { user, logout, isAdmin } = useAuth();
    const { isDark, toggleTheme }   = useTheme();
    const location  = useLocation();
    const navigate  = useNavigate();
    const [mobile, setMobile]     = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const bg      = isDark ? '#0D0D1A' : '#FAFBFF';
    const border  = isDark ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.1)';
    const text    = isDark ? '#CBD5E1' : '#1E293B';
    const muted   = isDark ? '#3F4A5E' : '#94A3B8';
    const sections = isAdmin() ? NAV.admin : NAV.customer;

    const handleLogout = () => {
        logout();
        toast.success('See you soon! 👋');
        navigate('/login');
    };

    const Body = ({ isMobile = false }) => {
        const mini = collapsed && !isMobile;
        const W = mini ? 72 : 248;

        return (
            <div className="sb3 sb3-scan" style={{
                width: W, background: bg,
                borderRight:`1px solid ${border}`,
            }}>

                {/* ── top gradient line ── */}
                <div style={{
                    position:'absolute', top:0, left:0, right:0, height:2, zIndex:20,
                    background:'linear-gradient(90deg,#818CF8,#C4B5FD,#22D3EE,#F472B6,#818CF8)',
                    backgroundSize:'300% 100%',
                    animation:'gradRing 5s linear infinite',
                }}/>

                {/* ── ambient orb ── */}
                {!mini && isDark && (
                    <div style={{
                        position:'absolute', top:-40, right:-40,
                        width:160, height:160, borderRadius:'50%',
                        background:'radial-gradient(circle, rgba(129,140,248,.12) 0%, transparent 70%)',
                        animation:'orbFloat 6s ease-in-out infinite',
                        pointerEvents:'none', zIndex:0,
                    }}/>
                )}

                {/* ══ HEADER ══ */}
                <div style={{
                    padding: mini ? '18px 14px' : '18px 16px',
                    display:'flex', alignItems:'center',
                    justifyContent: mini ? 'center' : 'space-between',
                    borderBottom:`1px solid ${border}`,
                    position:'relative', zIndex:2, marginTop:2,
                    minHeight:64,
                }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        {/* Rotating gradient ring around logo */}
                        <div style={{ position:'relative', flexShrink:0 }}>
                            <div style={{
                                position:'absolute', inset:-2, borderRadius:15,
                                background:'conic-gradient(from 0deg, #818CF8, #22D3EE, #F472B6, #818CF8)',
                                animation:'gradRing 3s linear infinite',
                                zIndex:0,
                            }}/>
                            <div style={{
                                position:'relative', zIndex:1,
                                width:38, height:38, borderRadius:13,
                                background: isDark ? '#1A1A2E' : '#fff',
                                display:'flex', alignItems:'center', justifyContent:'center',
                            }}>
                                <Building2 size={19} color="#818CF8"/>
                            </div>
                        </div>

                        {!mini && (
                            <div style={{ animation:'slideRight .3s ease' }}>
                                <div style={{
                                    fontFamily:"'Plus Jakarta Sans',sans-serif",
                                    fontWeight:800, fontSize:16, letterSpacing:-.4,
                                    background:'linear-gradient(135deg,#818CF8 0%,#22D3EE 100%)',
                                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                                    backgroundClip:'text',
                                }}>SomNath</div>
                                <div style={{ fontSize:9, fontWeight:700, color:muted, letterSpacing:2, textTransform:'uppercase' }}>
                                    {isAdmin() ? '⬡ Admin' : '◈ Banking'}
                                </div>
                            </div>
                        )}
                    </div>

                    {!isMobile && (
                        <button onClick={() => setCollapsed(!collapsed)} style={{
                            width:26, height:26, borderRadius:8,
                            background: isDark ? 'rgba(255,255,255,.06)' : 'rgba(99,102,241,.08)',
                            border:`1px solid ${border}`, cursor:'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            color:muted, transition:'all .2s',
                        }}
                                onMouseEnter={e => { e.currentTarget.style.background='rgba(129,140,248,.15)'; e.currentTarget.style.color='#818CF8'; }}
                                onMouseLeave={e => { e.currentTarget.style.background= isDark?'rgba(255,255,255,.06)':'rgba(99,102,241,.08)'; e.currentTarget.style.color=muted; }}
                        >
                            {mini ? <ChevronRight size={12}/> : <X size={12}/>}
                        </button>
                    )}
                </div>

                {/* ══ PROFILE ══ */}
                {!mini ? (
                    <div style={{
                        margin:'10px 10px 0', padding:'11px 12px',
                        borderRadius:16, position:'relative', zIndex:2,
                        background: isDark ? 'rgba(129,140,248,.07)' : 'rgba(129,140,248,.06)',
                        border:`1px solid ${isDark ? 'rgba(129,140,248,.15)' : 'rgba(129,140,248,.12)'}`,
                        overflow:'hidden',
                        animation:'fadeUp .35s ease',
                    }}>
                        {/* micro shimmer on profile card */}
                        <div style={{
                            position:'absolute', inset:0,
                            background:'linear-gradient(120deg, transparent 40%, rgba(129,140,248,.05) 50%, transparent 60%)',
                            backgroundSize:'200% 100%',
                            animation:'shimmerSlide 4s ease infinite',
                            pointerEvents:'none',
                        }}/>
                        <div style={{ display:'flex', alignItems:'center', gap:10, position:'relative', zIndex:1 }}>
                            <div className="sb3-avatar-ring" style={{
                                width:34, height:34, borderRadius:11, flexShrink:0,
                                background:'linear-gradient(135deg,#818CF8,#22D3EE)',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontWeight:800, fontSize:14, color:'#fff',
                                fontFamily:"'Plus Jakarta Sans',sans-serif",
                            }}>
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div style={{ minWidth:0, flex:1 }}>
                                <div style={{
                                    fontWeight:700, fontSize:12.5, color:text,
                                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                                }}>{user?.fullName}</div>
                                <div style={{ fontSize:10.5, color:muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                                    {user?.email}
                                </div>
                            </div>
                            <div style={{
                                padding:'2px 7px', borderRadius:8, fontSize:9, fontWeight:800,
                                letterSpacing:.5, textTransform:'uppercase', flexShrink:0,
                                background: isAdmin() ? 'rgba(248,113,113,.18)' : 'rgba(129,140,248,.18)',
                                color: isAdmin() ? '#F87171' : '#818CF8',
                                border: `1px solid ${isAdmin() ? 'rgba(248,113,113,.3)' : 'rgba(129,140,248,.3)'}`,
                            }}>
                                {isAdmin() ? 'Admin' : 'User'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display:'flex', justifyContent:'center', padding:'10px 0', position:'relative', zIndex:2 }}>
                        <div style={{
                            width:34, height:34, borderRadius:11,
                            background:'linear-gradient(135deg,#818CF8,#22D3EE)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontWeight:800, fontSize:14, color:'#fff',
                        }}>
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    </div>
                )}

                {/* ══ NAV ══ */}
                <nav className="sb3-scroll" style={{
                    flex:1, padding:'6px 8px', overflowY:'auto', overflowX:'hidden',
                    marginTop:6, position:'relative', zIndex:2,
                }}>
                    {sections.map((sec, si) => (
                        <div key={si}>
                            {!mini && (
                                <div className="sb3-cat" style={{ color:muted }}>{sec.cat}</div>
                            )}
                            {mini && si > 0 && <div className="sb3-sep" style={{ background:border }}/>}

                            {sec.items.map((item, ii) => {
                                const active = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobile(false)}
                                        className={`sb3-item ${active ? 'active' : ''}`}
                                        title={mini ? item.label : ''}
                                        style={{
                                            padding: mini ? '9px' : '8px 9px',
                                            gap:10,
                                            justifyContent: mini ? 'center' : 'flex-start',
                                            color: active ? '#fff' : text,
                                            background: active
                                                ? `linear-gradient(135deg, ${item.c}cc 0%, ${item.c}77 100%)`
                                                : 'transparent',
                                            boxShadow: active ? `0 4px 20px ${item.glow}` : 'none',
                                            animationDelay:`${(si*4 + ii)*0.035}s`,
                                        }}
                                    >
                                        {/* hover fill */}
                                        <div className="sb3-pill" style={{
                                            background: isDark ? item.dark : `${item.c}0f`,
                                        }}/>

                                        {/* active shimmer */}
                                        {active && <div className="sb3-active-shimmer"/>}

                                        {/* icon */}
                                        <div className="sb3-ic" style={{
                                            background: active
                                                ? 'rgba(255,255,255,.2)'
                                                : isDark ? item.dark : `${item.c}14`,
                                            boxShadow: active ? `0 2px 12px ${item.glow}` : 'none',
                                        }}>
                      <span style={{ color: active ? '#fff' : item.c, display:'flex' }}>
                        {item.icon}
                      </span>
                                        </div>

                                        {/* label */}
                                        {!mini && (
                                            <span className="sb3-lbl" style={{ color: active ? '#fff' : text }}>
                        {item.label}
                      </span>
                                        )}

                                        {/* badge */}
                                        {item.badge && !mini && (
                                            <div className="sb3-badge">{item.badge}</div>
                                        )}
                                        {item.badge && mini && (
                                            <span style={{
                                                position:'absolute', top:3, right:3,
                                                width:8, height:8, borderRadius:'50%',
                                                background:'#EF4444',
                                                border:`1.5px solid ${bg}`,
                                                animation:'blink 2s ease infinite',
                                            }}/>
                                        )}

                                        {/* active arrow */}
                                        {active && !mini && (
                                            <ChevronRight size={13} style={{ marginLeft:'auto', opacity:.7, flexShrink:0, position:'relative', zIndex:1 }}/>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* ══ BOTTOM ══ */}
                <div style={{
                    padding:'6px 8px 12px', borderTop:`1px solid ${border}`,
                    position:'relative', zIndex:2,
                }}>
                    {!mini && (
                        <div className="sb3-cat" style={{ color:muted }}>System</div>
                    )}

                    {/* Theme */}
                    <button className="sb3-action" onClick={toggleTheme}
                            style={{ color:text, justifyContent: mini?'center':'flex-start' }}
                            onMouseEnter={e => e.currentTarget.style.background = isDark?'rgba(251,191,36,.08)':'rgba(99,102,241,.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            title={mini ? (isDark?'Light':'Dark') : ''}
                    >
                        <div className="sb3-action-ic" style={{
                            background: isDark ? 'rgba(251,191,36,.12)' : 'rgba(99,102,241,.1)',
                        }}>
                            {isDark ? <Sun size={15} color="#FBBF24"/> : <Moon size={15} color="#818CF8"/>}
                        </div>
                        {!mini && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>

                    {/* Logout */}
                    <button className="sb3-action" onClick={handleLogout}
                            style={{ color:'#F87171', justifyContent: mini?'center':'flex-start', marginTop:2 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            title={mini ? 'Logout' : ''}
                    >
                        <div className="sb3-action-ic" style={{ background:'rgba(248,113,113,.12)' }}>
                            <LogOut size={15} color="#F87171"/>
                        </div>
                        {!mini && <span>Logout</span>}
                    </button>

                    {/* Tagline */}
                    {!mini && (
                        <div style={{
                            marginTop:10, textAlign:'center',
                            fontSize:9.5, color:muted, letterSpacing:.4,
                            display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                        }}>
                            <Sparkles size={9} color="#818CF8"/>
                            <span style={{
                                background:'linear-gradient(135deg,#818CF8,#22D3EE)',
                                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                                backgroundClip:'text', fontWeight:700,
                            }}>SomNath</span>
                            <span>· v3.0 · 2026</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <FontStyle />

            {/* Desktop */}
            <aside className="hidden md:block" style={{
                position:'sticky', top:0, height:'100vh', flexShrink:0,
            }}>
                <Body />
            </aside>

            {/* Mobile trigger — only visible below 768px */}
            <style>{`@media(min-width:768px){.sb3-mob-trigger{display:none!important;}}`}</style>
            <button onClick={() => setMobile(true)} className="sb3-mob-trigger" style={{
                position:'fixed', top:14, left:14, zIndex:60,
                width:42, height:42, borderRadius:13,
                background: isDark ? '#0D0D1A' : '#fff',
                border:`1px solid ${isDark ? 'rgba(129,140,248,.2)' : 'rgba(99,102,241,.15)'}`,
                boxShadow:'0 4px 20px rgba(129,140,248,.2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer',
            }}>
                <Menu size={19} color="#818CF8"/>
            </button>

            {/* Mobile drawer */}
            {mobile && (
                <div className="md:hidden sb3-overlay" style={{
                    position:'fixed', inset:0, zIndex:100,
                    display:'flex', background:'rgba(0,0,0,.7)',
                    backdropFilter:'blur(8px)',
                }}>
                    <div className="sb3-drawer" style={{ height:'100%', overflowY:'auto', flexShrink:0 }}>
                        <Body isMobile />
                    </div>
                    <div style={{ flex:1 }} onClick={() => setMobile(false)}/>
                </div>
            )}
        </>
    );
}