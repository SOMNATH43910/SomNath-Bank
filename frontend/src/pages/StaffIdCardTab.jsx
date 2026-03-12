import { useState, useEffect, useCallback, useMemo } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
    CreditCard, Plus, Lock, Unlock, Key, RefreshCw,
    Eye, AlertTriangle, Trash2, X, Download
} from 'lucide-react';
import html2canvas from 'html2canvas';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const ROOM_OPTIONS = [
    { value: 'SERVER_ROOM',     label: '🖥️ Server Room' },
    { value: 'VAULT',           label: '🏦 Vault' },
    { value: 'MANAGER_CABIN',   label: '👔 Manager Cabin' },
    { value: 'RECORDS_ROOM',    label: '📁 Records Room' },
    { value: 'CASH_COUNTER',    label: '💵 Cash Counter' },
    { value: 'CONFERENCE_ROOM', label: '🤝 Conference Room' },
    { value: 'IT_ROOM',         label: '💻 IT Room' },
];
const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

const DESIGNATION_EMOJI = (desig = '') => {
    const d = desig.toLowerCase();
    if (d.includes('manager'))  return '👔';
    if (d.includes('cashier') || d.includes('casher')) return '💵';
    if (d.includes('security')) return '🛡️';
    if (d.includes('it'))       return '💻';
    return '👤';
};

const STATUS_CFG = {
    ACTIVE:  { bg:'rgba(52,211,153,.1)',  border:'rgba(52,211,153,.25)',  color:'#34d399', dot:'#34d399' },
    BLOCKED: { bg:'rgba(239,68,68,.1)',   border:'rgba(239,68,68,.25)',   color:'#f87171', dot:'#ef4444' },
    EXPIRED: { bg:'rgba(107,114,128,.1)', border:'rgba(107,114,128,.25)', color:'#9ca3af', dot:'#6b7280' },
    REVOKED: { bg:'rgba(167,139,250,.1)', border:'rgba(167,139,250,.25)', color:'#c4b5fd', dot:'#a78bfa' },
};

/* ─── Styles ────────────────────────────────────────────────────────────── */
const Styles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

        :root {
            --gold-1: #c9a84c;
            --gold-2: #f0d080;
            --gold-3: #a07830;
            --gold-glow: rgba(201,168,76,0.25);
        }

        .ic-wrap * { box-sizing: border-box; }
        .ic-wrap { font-family: 'Outfit', sans-serif; }
        .ic-serif { font-family: 'Playfair Display', Georgia, serif; }

        @keyframes icFadeUp {
            from { opacity:0; transform:translateY(20px); }
            to   { opacity:1; transform:translateY(0); }
        }
        @keyframes icModalIn {
            from { opacity:0; transform:scale(.94) translateY(16px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes icOverlayIn { from{opacity:0;} to{opacity:1;} }
        @keyframes icGoldShimmer {
            0%   { background-position: 200% center; }
            100% { background-position: -200% center; }
        }
        @keyframes icSpin { to { transform: rotate(360deg); } }
        @keyframes icSkeleton { 0%,100%{opacity:.3;} 50%{opacity:.65;} }
        @keyframes icStatusPulse { 0%,100%{opacity:1;} 50%{opacity:.35;} }

        .ic-gold-text {
            background: linear-gradient(90deg, var(--gold-3) 0%, var(--gold-2) 30%, #fff8e0 50%, var(--gold-2) 70%, var(--gold-3) 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: icGoldShimmer 4s linear infinite;
        }

        .ic-card {
            transition: transform .28s cubic-bezier(.34,1.3,.64,1), box-shadow .28s ease;
        }
        .ic-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 50px rgba(0,0,0,.45), 0 0 0 1px rgba(201,168,76,.15);
        }

        .ic-btn {
            border: none; cursor: pointer;
            font-family: 'Outfit', sans-serif; font-weight: 600;
            display: inline-flex; align-items: center; gap: 6px;
            transition: transform .2s cubic-bezier(.34,1.4,.64,1), box-shadow .2s, background .18s;
            position: relative; overflow: hidden;
        }
        .ic-btn::after {
            content:''; position:absolute; inset:0;
            background:rgba(255,255,255,.12); opacity:0;
            transition:opacity .18s; border-radius:inherit;
        }
        .ic-btn:hover::after { opacity:1; }
        .ic-btn:hover  { transform: translateY(-2px) scale(1.03); }
        .ic-btn:active { transform: scale(.97); }
        .ic-btn:disabled { opacity:.6; cursor:not-allowed; transform:none !important; }

        .ic-btn-gold {
            background: linear-gradient(135deg, var(--gold-3), var(--gold-1), var(--gold-2), var(--gold-1));
            background-size: 200% 200%;
            animation: icGoldShimmer 4s linear infinite;
            color: #1a0f00;
            box-shadow: 0 6px 20px rgba(201,168,76,.3);
        }
        .ic-btn-gold:hover { box-shadow: 0 10px 30px rgba(201,168,76,.45); }

        .ic-btn-ghost {
            background: rgba(255,255,255,.05);
            border: 1px solid rgba(255,255,255,.1) !important;
            color: inherit;
        }

        .ic-input:focus {
            outline: none;
            border-color: var(--gold-1) !important;
            box-shadow: 0 0 0 3px rgba(201,168,76,.15);
        }

        .ic-fade-up   { animation: icFadeUp .5s cubic-bezier(.22,1,.36,1) both; }
        .ic-fade-up-1 { animation: icFadeUp .5s .06s cubic-bezier(.22,1,.36,1) both; }
        .ic-fade-up-2 { animation: icFadeUp .5s .12s cubic-bezier(.22,1,.36,1) both; }
        .ic-skeleton  { animation: icSkeleton 1.6s ease infinite; }
        .ic-status-pulse { animation: icStatusPulse 2s ease infinite; }

        .ic-hologram {
            background: repeating-linear-gradient(
                45deg,
                rgba(255,255,255,.025) 0px, rgba(255,255,255,.025) 1px,
                transparent 1px, transparent 6px
            );
        }

        .ic-scroll::-webkit-scrollbar { width: 4px; }
        .ic-scroll::-webkit-scrollbar-thumb { background: rgba(201,168,76,.2); border-radius:99px; }
    `}</style>
);

/* ─── Luxury ID Card Visual ─────────────────────────────────────────────── */
function IdCardVisual({ card }) {
    /* BUG FIX: useMemo to avoid reparse on every render */
    const rooms     = useMemo(() => card.roomAccess ? card.roomAccess.split(',').filter(Boolean) : [], [card.roomAccess]);
    const isBlocked = card.status === 'BLOCKED';
    const isRevoked = card.status === 'REVOKED';

    const accentR = isBlocked ? '#ef4444' : isRevoked ? '#a78bfa' : '#c9a84c';
    const accentG = isBlocked ? '#fca5a5' : isRevoked ? '#c4b5fd' : '#f0d080';
    const bgTop   = isBlocked ? '#1a0505' : isRevoked ? '#0e0e1e' : '#0a0a16';
    const bgBot   = isBlocked ? '#2d0808' : isRevoked ? '#16163a' : '#141428';

    return (
        <div style={{
            width:300, height:182, borderRadius:14,
            background:`linear-gradient(140deg,${bgTop} 0%,${bgBot} 55%,${bgTop} 100%)`,
            position:'relative', overflow:'hidden',
            color:'white', flexShrink:0,
            border:`1px solid ${accentR}55`,
            boxShadow: isBlocked
                ? '0 14px 44px rgba(180,20,20,.4), inset 0 1px 0 rgba(255,100,100,.08)'
                : `0 14px 44px rgba(0,0,0,.65), inset 0 1px 0 rgba(240,208,128,.12)`,
            fontFamily:"'Outfit',sans-serif",
        }}>
            <div className="ic-hologram" style={{ position:'absolute', inset:0, pointerEvents:'none' }} />
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,transparent,${accentR},${accentG},${accentR},transparent)` }} />
            <div style={{ position:'absolute', top:-50, right:-50, width:140, height:140, borderRadius:'50%', background:`radial-gradient(circle,${accentR}20 0%,transparent 70%)`, pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-40, left:-30, width:110, height:110, borderRadius:'50%', background:'radial-gradient(circle,rgba(80,60,180,.12) 0%,transparent 70%)', pointerEvents:'none' }} />

            {isBlocked && (
                <div style={{ position:'absolute', top:20, right:-28, background:'rgba(220,38,38,.9)', color:'white', fontSize:7.5, fontWeight:800, letterSpacing:2.5, padding:'3px 34px', transform:'rotate(35deg)', zIndex:10 }}>BLOCKED</div>
            )}
            {isRevoked && (
                <div style={{ position:'absolute', top:20, right:-28, background:'rgba(124,58,237,.9)', color:'white', fontSize:7.5, fontWeight:800, letterSpacing:2.5, padding:'3px 34px', transform:'rotate(35deg)', zIndex:10 }}>REVOKED</div>
            )}

            <div style={{ padding:'12px 14px 10px', height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', zIndex:1 }}>
                {/* Top */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <div style={{ width:26, height:26, borderRadius:7, fontSize:14, background:`linear-gradient(135deg,${accentR}99,${accentR})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 2px 8px ${accentR}55` }}>🏦</div>
                        <div>
                            <p style={{ margin:0, fontSize:10.5, fontWeight:700, letterSpacing:2, color:accentG, textTransform:'uppercase' }}>Somnath Bank</p>
                            <p style={{ margin:0, fontSize:7, color:'rgba(255,255,255,.35)', letterSpacing:.5 }}>Staff Identity Card</p>
                        </div>
                    </div>
                    <div style={{ padding:'2px 7px', borderRadius:20, fontSize:7, fontWeight:700, letterSpacing:.8, background:`${accentR}20`, border:`1px solid ${accentR}44`, color:accentG }}>
                        ● {card.status}
                    </div>
                </div>

                <div style={{ height:1, background:`linear-gradient(90deg,transparent,${accentR}40,transparent)` }} />

                {/* Middle */}
                <div style={{ display:'flex', gap:11, alignItems:'center' }}>
                    <div style={{ width:46, height:46, borderRadius:11, flexShrink:0, background:'linear-gradient(135deg,#161628,#222244)', border:`1.5px solid ${accentR}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                        {DESIGNATION_EMOJI(card.designation)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:'0 0 2px', fontSize:15, fontWeight:700, fontFamily:"'Playfair Display',Georgia,serif", letterSpacing:.2, lineHeight:1.2, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{card.staffName}</p>
                        <p style={{ margin:'0 0 5px', fontSize:8, fontWeight:600, letterSpacing:1.4, textTransform:'uppercase', color:`${accentG}bb` }}>{card.designation}</p>
                        <div style={{ display:'flex', gap:10 }}>
                            {[['🩸', card.bloodGroup||'—'], ['🪪', card.cardNumber]].map(([icon, val]) => (
                                <div key={val} style={{ display:'flex', alignItems:'center', gap:3 }}>
                                    <span style={{ fontSize:8 }}>{icon}</span>
                                    <span style={{ fontSize:8, fontWeight:600, color:'rgba(255,255,255,.6)' }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingTop:7, borderTop:'1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ flex:1, minWidth:0, marginRight:8 }}>
                        <p style={{ margin:0, fontSize:6.5, color:'rgba(255,255,255,.3)', letterSpacing:.5 }}>OFFICE</p>
                        <p style={{ margin:0, fontSize:8, fontWeight:500, color:'rgba(255,255,255,.55)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{card.officeAddress || card.branchName || '—'}</p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ margin:0, fontSize:6.5, color:'rgba(255,255,255,.3)', letterSpacing:.5 }}>VALID TILL</p>
                        <p style={{ margin:0, fontSize:9, fontWeight:700, color:accentG }}>{card.expiryDate}</p>
                    </div>
                </div>

                {/* Rooms */}
                {rooms.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginTop:4 }}>
                        {rooms.slice(0,4).map(r => (
                            <span key={r} style={{ fontSize:6.5, padding:'1.5px 5px', borderRadius:4, fontWeight:600, background:`${accentR}18`, border:`1px solid ${accentR}30`, color:accentG }}>
                                {ROOM_OPTIONS.find(o=>o.value===r)?.label || r}
                            </span>
                        ))}
                        {rooms.length > 4 && <span style={{ fontSize:6.5, padding:'1.5px 5px', borderRadius:4, background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.4)' }}>+{rooms.length-4}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Reusable sub-components ───────────────────────────────────────────── */
const IcModal = ({ onClose, isDark, maxWidth=480, children }) => (
    <div onClick={e => e.target===e.currentTarget && onClose()} style={{
        position:'fixed', inset:0, background:'rgba(0,0,0,.72)', backdropFilter:'blur(12px)',
        display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16,
        animation:'icOverlayIn .25s ease',
    }}>
        <div style={{
            width:'100%', maxWidth,
            background: isDark ? '#0c0c1e' : '#ffffff',
            borderRadius:24, padding:'26px 26px 24px',
            border: isDark ? '1px solid rgba(201,168,76,.12)' : '1px solid rgba(201,168,76,.25)',
            boxShadow: isDark ? '0 32px 80px rgba(0,0,0,.7)' : '0 32px 80px rgba(0,0,0,.15)',
            animation:'icModalIn .38s cubic-bezier(.22,1,.36,1) both',
            position:'relative', overflow:'hidden',
        }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:180, height:180, background:'radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'relative', zIndex:1 }}>{children}</div>
        </div>
    </div>
);

const IcModalHeader = ({ title, subtitle, onClose, isDark, gold }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
        <div>
            <h2 className={`ic-serif ${gold ? 'ic-gold-text' : ''}`} style={{ fontWeight:700, fontSize:19, margin:0, color: !gold ? (isDark?'#f1f5f9':'#0f172a') : undefined }}>{title}</h2>
            {subtitle && <p style={{ margin:'3px 0 0', fontSize:12, color:isDark?'#475569':'#94a3b8' }}>{subtitle}</p>}
        </div>
        <button onClick={onClose} style={{ background:isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)', border:'none', borderRadius:10, padding:7, cursor:'pointer', display:'flex', color:isDark?'#64748b':'#94a3b8', transition:'all .15s', flexShrink:0 }}
                onMouseEnter={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,.12)':'rgba(0,0,0,.1)'; e.currentTarget.style.color=isDark?'#e2e8f0':'#0f172a';}}
                onMouseLeave={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)'; e.currentTarget.style.color=isDark?'#64748b':'#94a3b8';}}>
            <X size={18} />
        </button>
    </div>
);

const IcField = ({ label, isDark, children }) => (
    <div style={{ marginBottom:16 }}>
        <label style={{ display:'block', fontSize:10, fontWeight:700, marginBottom:7, color:isDark?'#475569':'#94a3b8', letterSpacing:.9, textTransform:'uppercase', fontFamily:"'Outfit',sans-serif" }}>{label}</label>
        {children}
    </div>
);

const RoomChip = ({ label, active, onClick, isDark }) => (
    <button onClick={onClick} className="ic-btn" style={{
        padding:'7px 14px', borderRadius:10, fontSize:12, fontWeight:600,
        background: active ? 'rgba(201,168,76,.15)' : isDark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)',
        border: `1.5px solid ${active ? 'rgba(201,168,76,.4)' : isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'}`,
        color: active ? '#f0d080' : isDark ? '#94a3b8' : '#64748b',
        transform: active ? 'scale(1.04)' : 'scale(1)',
    }}>{label}</button>
);

const Spinner = ({ size=16 }) => (
    <span style={{ width:size, height:size, border:'2px solid rgba(255,255,255,.25)', borderTopColor:'rgba(255,255,255,.9)', borderRadius:'50%', animation:'icSpin .65s linear infinite', display:'inline-block', flexShrink:0 }} />
);

const StatCard = ({ icon, label, value, color, isDark, delay=0 }) => (
    <div className="ic-fade-up" style={{
        padding:'20px 22px', borderRadius:20,
        background: isDark ? '#0f0f22' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,.06)' : `1px solid ${color}22`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,.3)' : `0 4px 20px ${color}14`,
        animationDelay:`${delay}ms`, position:'relative', overflow:'hidden',
    }}>
        <div style={{ position:'absolute', right:-16, top:-16, width:70, height:70, borderRadius:'50%', background:`${color}18`, filter:'blur(18px)', pointerEvents:'none' }} />
        <div style={{ fontSize:22, marginBottom:10 }}>{icon}</div>
        <p className="ic-serif" style={{ fontSize:26, fontWeight:700, color, margin:'0 0 3px', letterSpacing:-.5 }}>{value}</p>
        <p style={{ fontSize:11, color:isDark?'#334155':'#94a3b8', margin:0, fontWeight:500 }}>{label}</p>
    </div>
);

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function StaffIdCardTab({ staff = [], isDark }) {
    const [idCards,       setIdCards]       = useState([]);
    const [loading,       setLoading]       = useState(false);
    const [fetched,       setFetched]       = useState(false);

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showDetailModal,   setShowDetailModal]   = useState(false);
    const [showBlockModal,    setShowBlockModal]     = useState(false);
    const [showRoomModal,     setShowRoomModal]      = useState(false);
    const [selectedCard,      setSelectedCard]       = useState(null);
    const [generateForm,      setGenerateForm]       = useState({ staffId:'', bloodGroup:'', officeAddress:'', roomAccess:[] });
    const [blockReason,       setBlockReason]        = useState('');
    const [selectedRooms,     setSelectedRooms]      = useState([]);
    const [actionLoading,     setActionLoading]      = useState(false);

    /* ── theme ── */
    const surface = isDark ? '#0f0f22' : '#FFFFFF';
    const border  = isDark ? 'rgba(255,255,255,.06)' : 'rgba(201,168,76,.15)';
    const text     = isDark ? '#e2e8f0' : '#0f172a';
    const muted    = isDark ? '#475569' : '#94a3b8';
    const inputBg  = isDark ? '#13132a' : '#f8f8ff';
    const inputBorderC = isDark ? 'rgba(255,255,255,.09)' : 'rgba(201,168,76,.25)';
    const inputStyle = { width:'100%', padding:'11px 14px', background:inputBg, border:`1.5px solid ${inputBorderC}`, borderRadius:12, color:text, fontSize:13, fontFamily:"'Outfit',sans-serif", transition:'border-color .2s, box-shadow .2s' };

    /* ── BUG FIX 1: useEffect — no bare call in render body (infinite loop) ── */
    const fetchCards = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/idcards/admin/all');
            setIdCards(res.data ?? []);
            setFetched(true);
        } catch { toast.error('Failed to load ID Cards!'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCards(); }, [fetchCards]);

    /* ── BUG FIX 2: useMemo — no heavy recomputation every render ── */
    const staffWithoutCard = useMemo(
        () => staff.filter(s => !idCards.find(c => c.staffId === s.id)),
        [staff, idCards]
    );

    /* ── BUG FIX 3: toggleRoom — functional setter, no stale closure ── */
    const toggleRoom = useCallback((val, setter) => {
        setter(prev => prev.includes(val) ? prev.filter(r => r !== val) : [...prev, val]);
    }, []);

    /* ── BUG FIX 5: downloadCard — null check before html2canvas ── */
    const downloadCard = useCallback(async (card) => {
        const el = document.getElementById(`ic-dl-${card.id}`);
        if (!el) { toast.error('Card element not found!'); return; }
        try {
            const canvas = await html2canvas(el, { backgroundColor:null, scale:2 });
            const link = document.createElement('a');
            link.download = `${card.cardNumber}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('Downloaded! 📥');
        } catch { toast.error('Download failed!'); }
    }, []);

    /* ── Handlers ── */
    const handleGenerate = async () => {
        if (!generateForm.staffId)    { toast.error('Staff select karo!'); return; }
        if (!generateForm.bloodGroup) { toast.error('Blood group select karo!'); return; }
        setActionLoading(true);
        try {
            await API.post('/idcards/admin/generate', {
                ...generateForm,
                staffId: parseInt(generateForm.staffId),
                roomAccess: generateForm.roomAccess.join(','),
            });
            toast.success('ID Card generated! 🪪');
            setShowGenerateModal(false);
            setGenerateForm({ staffId:'', bloodGroup:'', officeAddress:'', roomAccess:[] });
            fetchCards();
        } catch (err) { toast.error(err.response?.data?.message || err.response?.data || 'Failed!'); }
        finally { setActionLoading(false); }
    };

    const handleBlock = async () => {
        if (!blockReason.trim()) { toast.error('Reason likhna zaroori hai!'); return; }
        if (!selectedCard) return;          /* BUG FIX 4: null guard */
        setActionLoading(true);
        try {
            await API.put(`/idcards/admin/block/${selectedCard.id}`, { reason:blockReason });
            toast.success('ID Card blocked!');
            setShowBlockModal(false); setBlockReason(''); setSelectedCard(null);
            fetchCards();
        } catch { toast.error('Failed!'); }
        finally { setActionLoading(false); }
    };

    const handleUnblock = async (id) => {
        try { await API.put(`/idcards/admin/unblock/${id}`); toast.success('Unblocked! ✅'); fetchCards(); }
        catch { toast.error('Failed!'); }
    };

    const handleRoomUpdate = async () => {
        if (!selectedCard) return;          /* BUG FIX 4: null guard */
        setActionLoading(true);
        try {
            await API.put(`/idcards/admin/room-access/${selectedCard.id}`, { roomAccess:selectedRooms.join(',') });
            toast.success('Room access updated! 🔑');
            setShowRoomModal(false); setSelectedCard(null);
            fetchCards();
        } catch { toast.error('Failed!'); }
        finally { setActionLoading(false); }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm('Revoke this ID Card? This cannot be undone.')) return;
        try { await API.put(`/idcards/admin/revoke/${id}`); toast.success('Revoked!'); fetchCards(); }
        catch { toast.error('Failed!'); }
    };

    const openBlockModal  = useCallback((card) => { setSelectedCard(card); setShowBlockModal(true); }, []);
    const openRoomModal   = useCallback((card) => { setSelectedCard(card); setSelectedRooms(card.roomAccess ? card.roomAccess.split(',').filter(Boolean) : []); setShowRoomModal(true); }, []);
    const openDetailModal = useCallback((card) => { setSelectedCard(card); setShowDetailModal(true); }, []);

    const stats = useMemo(() => ({
        total:   idCards.length,
        active:  idCards.filter(c=>c.status==='ACTIVE').length,
        blocked: idCards.filter(c=>c.status==='BLOCKED').length,
        noCard:  staffWithoutCard.length,
    }), [idCards, staffWithoutCard]);

    /* ── render ── */
    return (
        <>
            <Styles />
            <div className="ic-wrap">

                {/* HEADER */}
                <div className="ic-fade-up" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:14, marginBottom:24 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:50, height:50, borderRadius:16, background:'linear-gradient(135deg,#a07830,#c9a84c,#f0d080)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:'0 8px 24px rgba(201,168,76,.35)' }}>🪪</div>
                        <div>
                            <h2 className="ic-serif ic-gold-text" style={{ fontWeight:700, fontSize:22, margin:0, letterSpacing:-.3 }}>Staff Identity Cards</h2>
                            <p style={{ fontSize:12, color:muted, margin:'3px 0 0' }}>Manage and issue premium staff identification</p>
                        </div>
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                        <button onClick={fetchCards} className="ic-btn ic-btn-ghost" style={{ padding:'10px 12px', borderRadius:13, color:muted }}>
                            <RefreshCw size={15} style={{ animation:loading?'icSpin .8s linear infinite':'none' }} />
                        </button>
                        <button onClick={() => { setGenerateForm({staffId:'',bloodGroup:'',officeAddress:'',roomAccess:[]}); setShowGenerateModal(true); }} className="ic-btn ic-btn-gold" style={{ padding:'10px 20px', borderRadius:13, fontSize:13 }}>
                            <Plus size={15} /> Issue New Card
                        </button>
                    </div>
                </div>

                {/* STATS */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
                    <StatCard icon="🪪" label="Total Issued"  value={stats.total}   color="#c9a84c" isDark={isDark} delay={0}   />
                    <StatCard icon="✅" label="Active"        value={stats.active}  color="#34d399" isDark={isDark} delay={60}  />
                    <StatCard icon="🚫" label="Blocked"       value={stats.blocked} color="#f87171" isDark={isDark} delay={120} />
                    <StatCard icon="⏳" label="Card Pending"  value={stats.noCard}  color="#94a3b8" isDark={isDark} delay={180} />
                </div>

                {/* CARDS GRID */}
                {loading && !fetched ? (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
                        {[1,2,3,4].map(i => (
                            <div key={i} className="ic-skeleton" style={{ height:280, borderRadius:22, background:isDark?'rgba(255,255,255,.04)':'rgba(0,0,0,.05)', animationDelay:`${i*80}ms` }} />
                        ))}
                    </div>
                ) : idCards.length === 0 ? (
                    <div className="ic-fade-up" style={{ textAlign:'center', padding:'72px 20px', borderRadius:24, border:`2px dashed ${isDark?'rgba(201,168,76,.15)':'rgba(201,168,76,.3)'}`, background: isDark?'rgba(201,168,76,.02)':'rgba(201,168,76,.03)' }}>
                        <div style={{ fontSize:52, marginBottom:14 }}>🪪</div>
                        <p className="ic-serif" style={{ fontSize:19, fontWeight:700, color:text, margin:'0 0 6px' }}>No ID Cards Issued</p>
                        <p style={{ fontSize:13, color:muted, margin:0 }}>Click "Issue New Card" to create one</p>
                    </div>
                ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
                        {idCards.map((card, i) => {
                            const scfg  = STATUS_CFG[card.status] || STATUS_CFG.EXPIRED;
                            const rooms = card.roomAccess ? card.roomAccess.split(',').filter(Boolean) : [];
                            return (
                                <div key={card.id} className="ic-card ic-fade-up" style={{
                                    borderRadius:22, overflow:'hidden', background:surface,
                                    border:`1px solid ${border}`,
                                    boxShadow:isDark?'0 4px 20px rgba(0,0,0,.3)':'0 4px 20px rgba(0,0,0,.06)',
                                    animationDelay:`${i*55}ms`,
                                }}>
                                    {/* Card display area */}
                                    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'24px 16px', background:'linear-gradient(140deg,#070710,#11112a)', position:'relative' }}>
                                        <div style={{ position:'absolute', inset:0, background: card.status==='ACTIVE' ? 'radial-gradient(ellipse at center,rgba(201,168,76,.06) 0%,transparent 70%)' : card.status==='BLOCKED' ? 'radial-gradient(ellipse at center,rgba(239,68,68,.06) 0%,transparent 70%)' : 'transparent', pointerEvents:'none' }} />
                                        <div id={`ic-dl-${card.id}`}>
                                            <IdCardVisual card={card} />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div style={{ padding:'16px 18px' }}>
                                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                                            <div style={{ minWidth:0, flex:1 }}>
                                                <p className="ic-serif" style={{ fontWeight:700, fontSize:15.5, color:text, margin:'0 0 3px' }}>{card.staffName}</p>
                                                <p style={{ fontSize:11.5, color:muted, margin:0 }}>{card.cardNumber} · {card.department}</p>
                                            </div>
                                            <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:scfg.bg, border:`1px solid ${scfg.border}`, color:scfg.color, flexShrink:0, marginLeft:10 }}>
                                                <span className="ic-status-pulse" style={{ width:6, height:6, borderRadius:'50%', background:scfg.dot, display:'inline-block' }} />
                                                {card.status}
                                            </div>
                                        </div>

                                        {rooms.length > 0 && (
                                            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                                                {rooms.map(r => (
                                                    <span key={r} style={{ fontSize:11, padding:'3px 9px', borderRadius:7, fontWeight:500, background:isDark?'rgba(201,168,76,.1)':'rgba(201,168,76,.08)', border:isDark?'1px solid rgba(201,168,76,.2)':'1px solid rgba(201,168,76,.25)', color:isDark?'#f0d080':'#92660a' }}>
                                                        {ROOM_OPTIONS.find(o=>o.value===r)?.label || r}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                                            {card.status==='ACTIVE' ? (
                                                <button onClick={() => openBlockModal(card)} className="ic-btn" style={{ padding:'6px 12px', borderRadius:10, fontSize:12, background:'rgba(239,68,68,.1)', color:'#f87171', border:'1px solid rgba(239,68,68,.2)' }}><Lock size={11} /> Block</button>
                                            ) : card.status==='BLOCKED' ? (
                                                <button onClick={() => handleUnblock(card.id)} className="ic-btn" style={{ padding:'6px 12px', borderRadius:10, fontSize:12, background:'rgba(52,211,153,.1)', color:'#34d399', border:'1px solid rgba(52,211,153,.2)' }}><Unlock size={11} /> Unblock</button>
                                            ) : null}
                                            <button onClick={() => openRoomModal(card)} className="ic-btn" style={{ padding:'6px 12px', borderRadius:10, fontSize:12, background:'rgba(201,168,76,.1)', color:'#c9a84c', border:'1px solid rgba(201,168,76,.2)' }}><Key size={11} /> Rooms</button>
                                            <button onClick={() => downloadCard(card)} className="ic-btn" style={{ padding:'6px 12px', borderRadius:10, fontSize:12, background:isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)', color:muted, border:`1px solid ${border}` }}><Download size={11} /> Save</button>
                                            <button onClick={() => openDetailModal(card)} className="ic-btn" style={{ padding:'6px 12px', borderRadius:10, fontSize:12, background:isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)', color:muted, border:`1px solid ${border}` }}><Eye size={11} /> View</button>
                                            {card.status !== 'REVOKED' && (
                                                <button onClick={() => handleRevoke(card.id)} className="ic-btn" style={{ padding:'6px 12px', borderRadius:10, fontSize:12, background:'rgba(107,114,128,.08)', color:'#6b7280', border:'1px solid rgba(107,114,128,.15)' }}><Trash2 size={11} /> Revoke</button>
                                            )}
                                        </div>

                                        {card.status==='BLOCKED' && card.blockedReason && (
                                            <div style={{ marginTop:12, padding:'10px 12px', borderRadius:12, background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.15)', display:'flex', alignItems:'flex-start', gap:8 }}>
                                                <AlertTriangle size={12} style={{ color:'#f87171', marginTop:1, flexShrink:0 }} />
                                                <p style={{ margin:0, fontSize:12, color:'#f87171cc' }}>{card.blockedReason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ══ GENERATE MODAL ══ */}
            {showGenerateModal && (
                <IcModal onClose={() => setShowGenerateModal(false)} isDark={isDark} maxWidth={500}>
                    <IcModalHeader title="Issue Staff ID Card" subtitle="Admin — Permanent identity record" onClose={() => setShowGenerateModal(false)} isDark={isDark} gold />
                    <IcField label="Staff Member *" isDark={isDark}>
                        <select value={generateForm.staffId} onChange={e => setGenerateForm({...generateForm, staffId:e.target.value})} className="ic-input" style={inputStyle}>
                            <option value="">— Select Staff —</option>
                            {staffWithoutCard.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.designation} · {s.employeeId})</option>)}
                            {staffWithoutCard.length===0 && <option disabled>All staff have ID cards ✅</option>}
                        </select>
                    </IcField>
                    <IcField label="Blood Group *" isDark={isDark}>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                            {BLOOD_GROUPS.map(grp => (
                                /* BUG FIX 6: renamed loop variable from 'bg' → 'grp' to avoid shadowing outer 'bg' token */
                                <button key={grp} onClick={() => setGenerateForm({...generateForm, bloodGroup:grp})} className="ic-btn" style={{
                                    padding:'6px 16px', borderRadius:10, fontSize:13, fontWeight:600,
                                    background: generateForm.bloodGroup===grp ? 'linear-gradient(135deg,#a07830,#c9a84c,#f0d080)' : isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)',
                                    border: generateForm.bloodGroup===grp ? 'none' : isDark?'1.5px solid rgba(255,255,255,.09)':'1.5px solid rgba(0,0,0,.08)',
                                    color: generateForm.bloodGroup===grp ? '#1a0f00' : isDark?'#94a3b8':'#64748b',
                                    boxShadow: generateForm.bloodGroup===grp ? '0 4px 14px rgba(201,168,76,.3)' : 'none',
                                }}>{grp}</button>
                            ))}
                        </div>
                    </IcField>
                    <IcField label="Office Address (Optional)" isDark={isDark}>
                        <input type="text" placeholder="123 MG Road, Mumbai" value={generateForm.officeAddress} onChange={e => setGenerateForm({...generateForm, officeAddress:e.target.value})} className="ic-input" style={inputStyle} />
                    </IcField>
                    <IcField label="Room Access Permissions" isDark={isDark}>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                            {ROOM_OPTIONS.map(opt => (
                                <RoomChip key={opt.value} label={opt.label}
                                          active={generateForm.roomAccess.includes(opt.value)}
                                    /* BUG FIX 3: proper functional setter pattern for nested state */
                                          onClick={() => toggleRoom(opt.value, rooms => setGenerateForm(f => ({...f, roomAccess: rooms(f.roomAccess)})))}
                                          isDark={isDark} />
                            ))}
                        </div>
                    </IcField>
                    <button onClick={handleGenerate} disabled={actionLoading} className="ic-btn ic-btn-gold" style={{ width:'100%', padding:'13px', borderRadius:14, fontSize:14, justifyContent:'center', marginTop:4 }}>
                        {actionLoading ? <><Spinner size={15} /> Generating…</> : <><CreditCard size={15} /> Issue ID Card</>}
                    </button>
                </IcModal>
            )}

            {/* ══ BLOCK MODAL ══ */}
            {showBlockModal && selectedCard && (
                <IcModal onClose={() => { setShowBlockModal(false); setBlockReason(''); }} isDark={isDark} maxWidth={420}>
                    <IcModalHeader title="Block ID Card" onClose={() => { setShowBlockModal(false); setBlockReason(''); }} isDark={isDark} />
                    <div style={{ padding:'12px 14px', borderRadius:13, marginBottom:18, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', display:'flex', alignItems:'center', gap:10 }}>
                        <AlertTriangle size={15} style={{ color:'#f87171', flexShrink:0 }} />
                        <p style={{ margin:0, fontSize:12.5, color:'#f87171cc' }}>Immediately deactivates <strong style={{color:'#f87171'}}>{selectedCard.staffName}</strong>'s card access.</p>
                    </div>
                    <IcField label="Reason *" isDark={isDark}>
                        <textarea value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="e.g. Card lost, suspicious activity..." rows={3} className="ic-input" style={{...inputStyle, resize:'none'}} />
                    </IcField>
                    <button onClick={handleBlock} disabled={actionLoading || !blockReason.trim()} className="ic-btn" style={{ width:'100%', padding:'13px', borderRadius:14, fontSize:14, justifyContent:'center', background:'rgba(239,68,68,.15)', color:'#f87171', border:'1px solid rgba(239,68,68,.25)', opacity:!blockReason.trim()?.5:1 }}>
                        {actionLoading ? <><Spinner size={15} /> Blocking…</> : <><Lock size={14} /> Confirm Block</>}
                    </button>
                </IcModal>
            )}

            {/* ══ ROOM ACCESS MODAL ══ */}
            {showRoomModal && selectedCard && (
                <IcModal onClose={() => { setShowRoomModal(false); setSelectedCard(null); }} isDark={isDark} maxWidth={440}>
                    <IcModalHeader title="Room Access" subtitle={selectedCard.staffName} onClose={() => { setShowRoomModal(false); setSelectedCard(null); }} isDark={isDark} gold />
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                        {ROOM_OPTIONS.map(opt => (
                            <RoomChip key={opt.value} label={opt.label}
                                      active={selectedRooms.includes(opt.value)}
                                /* BUG FIX 3: direct setter — correct, no stale closure */
                                      onClick={() => toggleRoom(opt.value, setSelectedRooms)}
                                      isDark={isDark} />
                        ))}
                    </div>
                    <div style={{ padding:'11px 14px', borderRadius:12, marginBottom:16, background:isDark?'rgba(201,168,76,.07)':'rgba(201,168,76,.06)', border:'1px solid rgba(201,168,76,.15)' }}>
                        <span style={{ fontSize:11, color:'#c9a84c', fontWeight:700 }}>Selected: </span>
                        <span style={{ fontSize:12, color:muted }}>{selectedRooms.length===0 ? 'No access' : selectedRooms.map(r => ROOM_OPTIONS.find(o=>o.value===r)?.label).join(', ')}</span>
                    </div>
                    <button onClick={handleRoomUpdate} disabled={actionLoading} className="ic-btn ic-btn-gold" style={{ width:'100%', padding:'13px', borderRadius:14, fontSize:14, justifyContent:'center' }}>
                        {actionLoading ? <><Spinner size={15} /> Updating…</> : <><Key size={14} /> Update Access</>}
                    </button>
                </IcModal>
            )}

            {/* ══ DETAIL MODAL ══ */}
            {showDetailModal && selectedCard && (
                <IcModal onClose={() => { setShowDetailModal(false); setSelectedCard(null); }} isDark={isDark} maxWidth={380}>
                    <IcModalHeader title="Card Details" onClose={() => { setShowDetailModal(false); setSelectedCard(null); }} isDark={isDark} gold />
                    <div style={{ display:'flex', justifyContent:'center', padding:'20px 16px', borderRadius:16, marginBottom:18, background:'linear-gradient(140deg,#070710,#11112a)' }}>
                        <IdCardVisual card={selectedCard} />
                    </div>
                    {[['Card Number',selectedCard.cardNumber],['Employee ID',selectedCard.employeeId],['Blood Group',selectedCard.bloodGroup],['Department',selectedCard.department],['Email',selectedCard.email],['Branch',selectedCard.branchName],['Valid Till',selectedCard.expiryDate]].map(([k,v]) => (
                        <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', fontSize:13, borderBottom:`1px solid ${isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.05)'}` }}>
                            <span style={{ color:muted }}>{k}</span>
                            <span style={{ color:text, fontWeight:600 }}>{v||'—'}</span>
                        </div>
                    ))}
                    <button onClick={() => downloadCard(selectedCard)} className="ic-btn ic-btn-gold" style={{ width:'100%', padding:'12px', borderRadius:13, fontSize:13, justifyContent:'center', marginTop:16 }}>
                        <Download size={14} /> Download Card
                    </button>
                </IcModal>
            )}
        </>
    );
}