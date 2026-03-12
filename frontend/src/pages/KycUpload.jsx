import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { Shield, Upload, Check, X, RefreshCw, FileCheck, AlertCircle, Clock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════════════════════════
   DOC CONFIG
   FIX #1: hasField map uses ACTUAL backend keys
   (hasAadhar, hasPan, hasPhoto, hasSignature)
   Original code computed 'hasAadharCard' and 'hasPanCard' — WRONG
══════════════════════════════════════════════════════════════ */
const DOC_FIELDS = [
    { key:'aadharCard', label:'Aadhar Card',     hasField:'hasAadhar',   icon:'🪪', hint:'Front side clear photo — JPG/PNG, max 2 MB', accent:'#6366f1', glow:'rgba(99,102,241,.4)'  },
    { key:'panCard',    label:'PAN Card',         hasField:'hasPan',      icon:'💳', hint:'Clear scan of your PAN card — JPG/PNG, max 2 MB', accent:'#0ea5e9', glow:'rgba(14,165,233,.4)'  },
    { key:'photo',      label:'Passport Photo',   hasField:'hasPhoto',    icon:'🤳', hint:'Recent passport photo on white background', accent:'#10b981', glow:'rgba(16,185,129,.4)'  },
    { key:'signature',  label:'Signature',        hasField:'hasSignature',icon:'✍️', hint:'Signature on plain white paper — clearly visible', accent:'#f59e0b', glow:'rgba(245,158,11,.4)'  },
];

const STATUS_CFG = {
    NOT_REQUESTED: { icon:<Clock size={20}/>,     title:'Waiting for Admin',         subtitle:'KYC request has not been sent yet. Contact your branch.', grad:'linear-gradient(135deg,#1e293b,#334155)', accent:'#94a3b8', border:'rgba(148,163,184,.25)' },
    PENDING_UPLOAD:{ icon:<Upload size={20}/>,    title:'Documents Required',        subtitle:'Admin has requested your KYC documents. Please upload all 4.', grad:'linear-gradient(135deg,#451a03,#78350f)', accent:'#fbbf24', border:'rgba(251,191,36,.3)' },
    SUBMITTED:     { icon:<Clock size={20}/>,     title:'Under Review',              subtitle:'Documents submitted! Admin is reviewing your KYC.', grad:'linear-gradient(135deg,#0c1a3a,#1e3a5f)', accent:'#38bdf8', border:'rgba(56,189,248,.3)' },
    APPROVED:      { icon:<Check size={20}/>,     title:'KYC Verified ✓',            subtitle:'Your account is fully activated and verified.', grad:'linear-gradient(135deg,#052e16,#14532d)', accent:'#34d399', border:'rgba(52,211,153,.3)' },
    REJECTED:      { icon:<X size={20}/>,         title:'KYC Rejected',              subtitle:'Documents were rejected. Please re-upload corrected documents.', grad:'linear-gradient(135deg,#3b0008,#7f1d1d)', accent:'#f87171', border:'rgba(248,113,113,.3)' },
    RE_SUBMIT:     { icon:<RefreshCw size={20}/>, title:'Re-submission Required',    subtitle:'Admin has requested updated documents. Please re-upload.', grad:'linear-gradient(135deg,#431407,#7c2d12)', accent:'#fb923c', border:'rgba(251,146,60,.3)' },
};

/* ══════════════════════════════════════════════════════════════
   UPLOAD ZONE COMPONENT
   FIX #4: useRef instead of document.getElementById
   FIX #3: input.value reset so same file can re-trigger
   FIX #6: JS-level MIME type validation
══════════════════════════════════════════════════════════════ */
function UploadZone({ field, preview, onFile, isDark }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const processFile = useCallback((file) => {
        if (!file) return;
        // FIX #6: validate MIME in JS (can't trust accept="" alone)
        const allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
        if (!allowed.includes(file.type)) {
            toast.error('Only JPG, PNG, or WebP images are allowed!');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error(`${field.label}: File must be under 2 MB!`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => onFile(field.key, e.target.result);
        reader.readAsDataURL(file);
        // FIX #3: reset so same file triggers onChange again
        if (inputRef.current) inputRef.current.value = '';
    }, [field.key, field.label, onFile]);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        processFile(e.dataTransfer.files[0]);
    }, [processFile]);

    return (
        <div>
            {/* Label row */}
            <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:9 }}>
                <div style={{
                    width:36, height:36, borderRadius:10, flexShrink:0,
                    background: preview ? `${field.accent}22` : 'rgba(255,255,255,.06)',
                    border: `1px solid ${preview ? field.accent+'44' : 'rgba(255,255,255,.08)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:17,
                    boxShadow: preview ? `0 4px 14px ${field.glow}` : 'none',
                    transition:'all .3s ease',
                }}>
                    {field.icon}
                </div>
                <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
                        <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:13, color: isDark?'#e2e8f0':'#1e293b' }}>{field.label}</span>
                        {preview && (
                            <span className="kyc-check-pop" style={{
                                display:'inline-flex', alignItems:'center', gap:4,
                                padding:'2px 8px', borderRadius:20,
                                background:'rgba(52,211,153,.15)', color:'#34d399',
                                border:'1px solid rgba(52,211,153,.3)', fontSize:10, fontWeight:700,
                            }}>
                                <Check size={10}/> Uploaded
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize:11, color: isDark?'#475569':'#94a3b8', margin:0 }}>{field.hint}</p>
                </div>
            </div>

            {/* Drop zone */}
            <div
                style={{
                    borderRadius:16,
                    border:`2px dashed ${preview ? field.accent : dragging ? field.accent : isDark?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'}`,
                    background: preview ? `${field.accent}0d` : dragging ? `${field.accent}08` : isDark?'rgba(255,255,255,.02)':'rgba(0,0,0,.01)',
                    padding: preview ? '12px' : '22px 16px',
                    cursor:'pointer', textAlign:'center',
                    transition:'all .25s ease',
                    boxShadow: preview ? `0 0 0 1px ${field.accent}30, 0 4px 20px ${field.glow}20` : dragging ? `0 0 0 3px ${field.accent}30` : 'none',
                    transform: dragging ? 'scale(1.015)' : 'scale(1)',
                }}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
            >
                {preview ? (
                    <div>
                        <img src={preview} alt={field.label} style={{
                            maxHeight:110, maxWidth:'100%', borderRadius:10,
                            objectFit:'contain', display:'block', margin:'0 auto 8px',
                            boxShadow:'0 4px 16px rgba(0,0,0,.3)',
                        }}/>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontSize:11, fontWeight:600, color:field.accent }}>
                            <Eye size={11}/> Click to change
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{
                            width:38, height:38, borderRadius:11, margin:'0 auto 10px',
                            background: isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.04)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                            <Upload size={17} color={isDark?'#64748b':'#94a3b8'}/>
                        </div>
                        <p style={{ fontSize:13, fontWeight:600, color:isDark?'#64748b':'#94a3b8', margin:'0 0 3px' }}>Click or drag to upload</p>
                        <p style={{ fontSize:10.5, color:isDark?'#334155':'#cbd5e1', margin:0 }}>JPG · PNG · WebP · max 2 MB</p>
                    </>
                )}
            </div>

            {/* FIX #4: ref-based file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{ display:'none' }}
                onChange={e => processFile(e.target.files[0])}
            />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function KycUpload() {
    const { isDark } = useTheme();
    const [kycStatus,  setKycStatus]  = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [uploading,  setUploading]  = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const EMPTY = { aadharCard:null, panCard:null, photo:null, signature:null };
    const [docs,     setDocs]     = useState(EMPTY);
    const [previews, setPreviews] = useState(EMPTY);

    useEffect(() => { fetchKycStatus(); }, []);

    const fetchKycStatus = useCallback(async (quiet = false) => {
        if (!quiet) setRefreshing(true);
        try {
            const res = await API.get('/kyc/my');
            setKycStatus(res.data);
        } catch {
            setKycStatus({ status:'NOT_REQUESTED' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const handleFile = useCallback((field, dataUrl) => {
        setDocs(d    => ({ ...d, [field]: dataUrl }));
        setPreviews(p => ({ ...p, [field]: dataUrl }));
    }, []);

    const handleSubmit = async () => {
        const missing = DOC_FIELDS.filter(f => !docs[f.key]).map(f => f.label);
        if (missing.length) { toast.error(`Missing: ${missing.join(', ')}`); return; }
        setUploading(true);
        try {
            // FIX #7: sends full base64 dataURL (data:image/...;base64,...)
            // If your backend needs raw base64, strip prefix: docs[key].split(',')[1]
            await API.post('/kyc/upload', docs);
            toast.success('Documents submitted successfully! ✅');
            // FIX #9: clear stale previews after submit
            setDocs(EMPTY);
            setPreviews(EMPTY);
            fetchKycStatus(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed!');
        } finally {
            setUploading(false); // FIX #10: always reset
        }
    };

    // FIX #2: REJECTED also allows re-upload
    const canUpload = ['PENDING_UPLOAD','RE_SUBMIT','REJECTED'].includes(kycStatus?.status);
    const uploadedCount = useMemo(() => Object.values(docs).filter(Boolean).length, [docs]);

    // FIX #5: memoize cfg
    const cfg = useMemo(() => STATUS_CFG[kycStatus?.status] || STATUS_CFG['NOT_REQUESTED'], [kycStatus?.status]);

    const surface    = isDark ? '#0b1322' : '#ffffff';
    const surfaceAlt = isDark ? '#0f1c30' : '#f8faff';
    const border     = isDark ? 'rgba(255,255,255,.07)' : 'rgba(59,130,246,.1)';
    const text       = isDark ? '#e2e8f0' : '#0f172a';
    const muted      = isDark ? '#475569' : '#94a3b8';

    const stepLabels = ['Submit','Review','Verified'];
    const stepIdx    = { NOT_REQUESTED:0, PENDING_UPLOAD:0, SUBMITTED:1, REJECTED:0, RE_SUBMIT:0, APPROVED:2 };
    const curStep    = stepIdx[kycStatus?.status] ?? 0;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
                .kyc-root *, .kyc-root *::before, .kyc-root *::after { box-sizing:border-box; }
                .kyc-root { font-family:'Outfit',sans-serif; }

                @keyframes kyc-fu   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes kyc-fi   { from{opacity:0} to{opacity:1} }
                @keyframes kyc-scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(350%)} }
                @keyframes kyc-dots { 0%{background-position:0 0} 100%{background-position:24px 24px} }
                @keyframes kyc-glow { 0%,100%{opacity:.5}  50%{opacity:.9} }
                @keyframes kyc-float{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
                @keyframes kyc-spin { to{transform:rotate(360deg)} }
                @keyframes kyc-pop  { 0%{transform:scale(0) rotate(-30deg);opacity:0} 65%{transform:scale(1.3) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
                @keyframes kyc-prog { from{width:0} }
                @keyframes kyc-grad { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }

                .kyc-fu0 { animation:kyc-fu .5s cubic-bezier(.22,1,.36,1) both; }
                .kyc-fu1 { animation:kyc-fu .5s .07s cubic-bezier(.22,1,.36,1) both; }
                .kyc-fu2 { animation:kyc-fu .5s .14s cubic-bezier(.22,1,.36,1) both; }
                .kyc-fu3 { animation:kyc-fu .5s .21s cubic-bezier(.22,1,.36,1) both; }
                .kyc-fu4 { animation:kyc-fu .5s .28s cubic-bezier(.22,1,.36,1) both; }
                .kyc-check-pop { animation:kyc-pop .4s cubic-bezier(.34,1.56,.64,1) both; }

                .kyc-hero-dots {
                    background-image:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px);
                    background-size:22px 22px;
                    animation:kyc-dots 10s linear infinite;
                }
                .kyc-scan-line {
                    position:absolute; left:0; right:0; height:2px;
                    background:linear-gradient(90deg,transparent,rgba(99,102,241,.55),transparent);
                    animation:kyc-scan 5s ease-in-out infinite; pointer-events:none;
                }
                .kyc-glow { animation:kyc-glow 5s ease-in-out infinite; }
                .kyc-float{ animation:kyc-float 3s ease-in-out infinite; }
                .kyc-spin { animation:kyc-spin .7s linear infinite; }

                .kyc-tile { transition:transform .25s ease,box-shadow .25s ease; }
                .kyc-tile:hover { transform:translateY(-3px); }

                .kyc-doc-chip { transition:transform .2s cubic-bezier(.34,1.56,.64,1); }
                .kyc-doc-chip:hover { transform:translateX(5px); }

                .kyc-submit {
                    background:linear-gradient(135deg,#4f46e5,#0891b2,#7c3aed);
                    background-size:200% 200%;
                    animation:kyc-grad 4s ease infinite;
                    border:none; cursor:pointer; color:#fff;
                    font-family:'Outfit',sans-serif; font-weight:700;
                    transition:transform .2s,filter .2s,box-shadow .2s;
                }
                .kyc-submit:hover:not(:disabled) {
                    transform:translateY(-3px); filter:brightness(1.1);
                    box-shadow:0 14px 34px rgba(79,70,229,.45);
                }
                .kyc-submit:disabled {
                    opacity:.45; cursor:not-allowed; animation:none;
                    background:${isDark?'#1e293b':'#e2e8f0'};
                }
                .kyc-prog-bar { animation:kyc-prog .6s cubic-bezier(.22,1,.36,1) both; }

                .kyc-step-line { transition:width .6s cubic-bezier(.22,1,.36,1); }
            `}</style>

            <div className="kyc-root" style={{
                display:'flex', minHeight:'100vh',
                background: isDark ? '#060d1a' : '#f0f5ff',
                backgroundImage: isDark
                    ? 'radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)'
                    : 'radial-gradient(rgba(99,102,241,.06) 1px,transparent 1px)',
                backgroundSize:'20px 20px',
            }}>
                <Sidebar />

                <main style={{ flex:1, padding:'26px 28px', overflowX:'hidden', overflowY:'auto' }}>

                    {/* ══ HERO ══════════════════════════════════════════════════ */}
                    <div className="kyc-fu0" style={{
                        borderRadius:26, marginBottom:20, padding:'26px 28px',
                        background:'linear-gradient(135deg,#06091a 0%,#0d1440 45%,#180a2a 80%,#06091a 100%)',
                        position:'relative', overflow:'hidden',
                        boxShadow:'0 20px 60px rgba(10,5,40,.7),0 0 0 1px rgba(99,102,241,.18)',
                    }}>
                        <div className="kyc-hero-dots" style={{ position:'absolute',inset:0,pointerEvents:'none' }}/>
                        <div className="kyc-scan-line"/>
                        <div className="kyc-glow" style={{
                            position:'absolute',inset:0,pointerEvents:'none',
                            background:'radial-gradient(ellipse at 10% 65%,rgba(99,102,241,.2) 0%,transparent 50%),radial-gradient(ellipse at 88% 20%,rgba(139,92,246,.15) 0%,transparent 45%)',
                        }}/>
                        <div style={{ position:'absolute',top:-60,right:-40,width:240,height:240,borderRadius:'50%',background:'rgba(99,102,241,.06)',filter:'blur(40px)',pointerEvents:'none' }}/>

                        {/* Header row */}
                        <div style={{ position:'relative',zIndex:2,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,marginBottom:22 }}>
                            <div style={{ display:'flex',alignItems:'center',gap:14 }}>
                                <div className="kyc-float" style={{
                                    width:48,height:48,borderRadius:15,
                                    background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                    display:'flex',alignItems:'center',justifyContent:'center',
                                    boxShadow:'0 8px 26px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.15)',
                                }}>
                                    <Shield size={22} color="#fff"/>
                                </div>
                                <div>
                                    <div style={{ fontSize:10,color:'rgba(255,255,255,.35)',letterSpacing:1.4,textTransform:'uppercase',marginBottom:3,fontWeight:600 }}>Account Verification</div>
                                    <div style={{ fontFamily:"'Outfit',sans-serif",fontWeight:900,fontSize:24,color:'#fff',letterSpacing:-.5 }}>KYC Verification</div>
                                    <div style={{ fontSize:12,color:'rgba(255,255,255,.35)',marginTop:2 }}>Upload your documents to activate your account</div>
                                </div>
                            </div>
                            <button onClick={() => fetchKycStatus()} style={{
                                display:'flex',alignItems:'center',gap:6,padding:'8px 14px',
                                borderRadius:12,border:'1px solid rgba(255,255,255,.1)',
                                background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.6)',
                                fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:12,
                                cursor:'pointer',backdropFilter:'blur(8px)',transition:'background .2s',
                            }}>
                                <RefreshCw size={13} className={refreshing?'kyc-spin':''}/>
                                Refresh
                            </button>
                        </div>

                        {/* Step progress */}
                        <div style={{ position:'relative',zIndex:2,display:'flex',alignItems:'center' }}>
                            {stepLabels.map((step,i) => (
                                <div key={step} style={{ display:'flex',alignItems:'center',flex:i<stepLabels.length-1?1:'none' }}>
                                    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:5 }}>
                                        <div style={{
                                            width:28,height:28,borderRadius:'50%',
                                            background: curStep>i?'#34d399':curStep===i?'#6366f1':'rgba(255,255,255,.1)',
                                            display:'flex',alignItems:'center',justifyContent:'center',
                                            border:`2px solid ${curStep>i?'#34d399':curStep===i?'#818cf8':'rgba(255,255,255,.15)'}`,
                                            boxShadow: curStep===i?'0 0 14px rgba(99,102,241,.65)':curStep>i?'0 0 12px rgba(52,211,153,.45)':'none',
                                            transition:'all .4s ease',fontSize:11,fontWeight:800,color:'#fff',
                                        }}>
                                            {curStep>i?<Check size={13}/>:i+1}
                                        </div>
                                        <span style={{ fontSize:10,fontWeight:600,whiteSpace:'nowrap',color:curStep===i?'#a5b4fc':curStep>i?'#6ee7b7':'rgba(255,255,255,.3)' }}>
                                            {step}
                                        </span>
                                    </div>
                                    {i<stepLabels.length-1 && (
                                        <div style={{ flex:1,height:2,margin:'0 8px',marginBottom:14,background:'rgba(255,255,255,.1)',borderRadius:2,overflow:'hidden' }}>
                                            <div className="kyc-step-line" style={{ height:'100%',borderRadius:2,background:'linear-gradient(90deg,#6366f1,#34d399)',width:curStep>i?'100%':'0%' }}/>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ══ CONTENT ══════════════════════════════════════════════ */}
                    {loading ? (
                        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                            {[...Array(3)].map((_,i)=>(
                                <div key={i} style={{
                                    height:80,borderRadius:18,
                                    background:isDark?'rgba(255,255,255,.05)':'rgba(59,130,246,.05)',
                                    animation:`kyc-glow 1.5s ${i*.15}s ease infinite`,
                                }}/>
                            ))}
                        </div>
                    ) : (
                        <div style={{ maxWidth:680,display:'flex',flexDirection:'column',gap:14 }}>

                            {/* ── Status Card ── */}
                            <div className="kyc-fu1 kyc-tile" style={{
                                borderRadius:22,overflow:'hidden',
                                border:`1px solid ${cfg.border}`,
                                boxShadow:`0 8px 32px ${cfg.accent}20`,
                            }}>
                                <div style={{
                                    padding:'18px 22px',background:cfg.grad,
                                    position:'relative',overflow:'hidden',
                                    display:'flex',alignItems:'center',gap:13,
                                }}>
                                    <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(255,255,255,.045) 1px,transparent 1px)',backgroundSize:'16px 16px',pointerEvents:'none' }}/>
                                    <div style={{
                                        width:40,height:40,borderRadius:12,flexShrink:0,
                                        background:`${cfg.accent}22`,border:`1px solid ${cfg.accent}55`,
                                        display:'flex',alignItems:'center',justifyContent:'center',color:cfg.accent,
                                        boxShadow:`0 4px 14px ${cfg.accent}35`,
                                    }}>
                                        {cfg.icon}
                                    </div>
                                    <div style={{ position:'relative',zIndex:1,flex:1 }}>
                                        <div style={{ fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:16,color:'#fff',marginBottom:3 }}>{cfg.title}</div>
                                        <div style={{ fontSize:12,color:'rgba(255,255,255,.5)',fontWeight:500 }}>{cfg.subtitle}</div>
                                    </div>
                                    <div style={{
                                        padding:'3px 12px',borderRadius:20,fontSize:10,fontWeight:700,
                                        background:`${cfg.accent}22`,color:cfg.accent,
                                        border:`1px solid ${cfg.accent}44`,whiteSpace:'nowrap',
                                    }}>
                                        {kycStatus?.status?.replace(/_/g,' ')}
                                    </div>
                                </div>

                                {/* Admin remarks */}
                                {kycStatus?.adminRemarks && (
                                    <div style={{ padding:'14px 22px',background:surface,borderTop:`1px solid ${border}`,display:'flex',alignItems:'flex-start',gap:10 }}>
                                        <AlertCircle size={15} color="#fb923c" style={{ flexShrink:0,marginTop:1 }}/>
                                        <div>
                                            <div style={{ fontSize:10,fontWeight:700,color:'#fb923c',letterSpacing:.7,textTransform:'uppercase',marginBottom:3 }}>Admin Remark</div>
                                            <div style={{ fontSize:13,color:text,fontWeight:500 }}>{kycStatus.adminRemarks}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Doc checklist (SUBMITTED / APPROVED) ── */}
                            {/* FIX #1: uses f.hasField which maps to correct backend keys */}
                            {(kycStatus?.status==='SUBMITTED'||kycStatus?.status==='APPROVED') && (
                                <div className="kyc-fu2 kyc-tile" style={{
                                    borderRadius:22,padding:'20px 22px',
                                    background:surface,border:`1px solid ${border}`,
                                    boxShadow:isDark?'0 4px 20px rgba(0,0,0,.35)':'0 4px 20px rgba(59,130,246,.07)',
                                }}>
                                    <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
                                        <FileCheck size={16} color="#6366f1"/>
                                        <span style={{ fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,color:text }}>Submitted Documents</span>
                                    </div>
                                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                                        {DOC_FIELDS.map((f,i) => {
                                            const uploaded = kycStatus[f.hasField]; // ✅ FIX #1
                                            return (
                                                <div key={f.key} className="kyc-doc-chip" style={{
                                                    display:'flex',alignItems:'center',gap:10,
                                                    padding:'11px 14px',borderRadius:14,
                                                    background:uploaded?'rgba(52,211,153,.1)':isDark?'rgba(239,68,68,.1)':'rgba(239,68,68,.07)',
                                                    border:`1px solid ${uploaded?'rgba(52,211,153,.25)':'rgba(239,68,68,.2)'}`,
                                                    animation:`kyc-fu .4s ${i*.07}s ease both`,
                                                }}>
                                                    <span style={{ fontSize:15 }}>{f.icon}</span>
                                                    <span style={{ flex:1,fontSize:12,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{f.label}</span>
                                                    <div style={{ width:22,height:22,borderRadius:'50%',flexShrink:0,background:uploaded?'rgba(52,211,153,.2)':'rgba(239,68,68,.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                                                        {uploaded?<Check size={12} color="#34d399"/>:<X size={12} color="#f87171"/>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── Approved celebration ── */}
                            {kycStatus?.status==='APPROVED' && (
                                <div className="kyc-fu3 kyc-tile" style={{
                                    borderRadius:22,padding:'28px',textAlign:'center',
                                    background:'linear-gradient(135deg,rgba(5,46,22,.9),rgba(20,83,45,.9))',
                                    border:'1px solid rgba(52,211,153,.3)',
                                    boxShadow:'0 8px 32px rgba(16,185,129,.2)',
                                    position:'relative',overflow:'hidden',
                                }}>
                                    <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(52,211,153,.06) 1px,transparent 1px)',backgroundSize:'16px 16px' }}/>
                                    <div style={{ position:'relative',zIndex:1 }}>
                                        <div style={{ fontSize:48,marginBottom:12 }}>🎉</div>
                                        <div style={{ fontFamily:"'Outfit',sans-serif",fontWeight:900,fontSize:22,color:'#34d399',marginBottom:6 }}>KYC Fully Verified!</div>
                                        <div style={{ fontSize:13,color:'rgba(255,255,255,.5)',fontWeight:500 }}>Your account is fully activated. All banking features are now accessible.</div>
                                        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:16 }}>
                                            <div style={{ display:'flex',alignItems:'center',gap:5,padding:'5px 14px',borderRadius:20,background:'rgba(52,211,153,.15)',border:'1px solid rgba(52,211,153,.3)',color:'#34d399',fontSize:12,fontWeight:600 }}>
                                                <Check size={13}/> Verified Account
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Upload form (PENDING_UPLOAD / RE_SUBMIT / REJECTED) ── */}
                            {/* FIX #2: canUpload includes REJECTED */}
                            {canUpload && (
                                <div className="kyc-fu3" style={{
                                    borderRadius:22,overflow:'hidden',
                                    background:surface,border:`1px solid ${border}`,
                                    boxShadow:isDark?'0 4px 24px rgba(0,0,0,.4)':'0 4px 24px rgba(59,130,246,.07)',
                                }}>
                                    {/* Form header */}
                                    <div style={{
                                        padding:'16px 22px',
                                        background:isDark?'#0d1730':'#f0f4ff',
                                        borderBottom:`1px solid ${border}`,
                                        display:'flex',alignItems:'center',gap:11,
                                    }}>
                                        <div style={{
                                            width:36,height:36,borderRadius:10,
                                            background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                            display:'flex',alignItems:'center',justifyContent:'center',
                                            boxShadow:'0 4px 14px rgba(79,70,229,.4)',
                                        }}>
                                            <Upload size={16} color="#fff"/>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:15,color:text }}>
                                                {kycStatus?.status==='PENDING_UPLOAD' ? '📤 Upload Documents' : '🔄 Re-upload Documents'}
                                            </div>
                                            <div style={{ fontSize:11,color:muted }}>All 4 documents required • JPG/PNG/WebP • max 2 MB each</div>
                                        </div>
                                    </div>

                                    <div style={{ padding:'22px',display:'flex',flexDirection:'column',gap:20 }}>
                                        {/* Upload zones — FIX #3 #4 #6 handled inside UploadZone */}
                                        {DOC_FIELDS.map((field,i) => (
                                            <div key={field.key} style={{ animation:`kyc-fu .45s ${i*.08}s ease both` }}>
                                                <UploadZone field={field} preview={previews[field.key]} onFile={handleFile} isDark={isDark}/>
                                                {i < DOC_FIELDS.length-1 && (
                                                    <div style={{ marginTop:20,height:1,background:isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.06)' }}/>
                                                )}
                                            </div>
                                        ))}

                                        {/* Progress panel */}
                                        <div style={{
                                            padding:'16px',borderRadius:18,
                                            background:surfaceAlt,border:`1px solid ${border}`,
                                        }}>
                                            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                                                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                                                    <div style={{
                                                        width:24,height:24,borderRadius:'50%',
                                                        background:uploadedCount===4?'rgba(52,211,153,.2)':isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)',
                                                        display:'flex',alignItems:'center',justifyContent:'center',
                                                    }}>
                                                        {uploadedCount===4?<Check size={13} color="#34d399"/>:<span style={{ fontSize:10,fontWeight:800,color:muted }}>{uploadedCount}</span>}
                                                    </div>
                                                    <span style={{ fontSize:12,fontWeight:600,color:text }}>Upload Progress</span>
                                                </div>
                                                <span style={{ fontSize:11,fontWeight:700,color:uploadedCount===4?'#34d399':'#6366f1',fontFamily:"'JetBrains Mono',monospace" }}>
                                                    {uploadedCount} / 4
                                                </span>
                                            </div>

                                            {/* Bar */}
                                            <div style={{ height:6,borderRadius:6,background:isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)',overflow:'hidden',marginBottom:12 }}>
                                                <div className="kyc-prog-bar" style={{
                                                    height:'100%',borderRadius:6,
                                                    background:uploadedCount===4?'linear-gradient(90deg,#34d399,#10b981)':'linear-gradient(90deg,#6366f1,#818cf8)',
                                                    width:`${(uploadedCount/4)*100}%`,
                                                    transition:'width .4s cubic-bezier(.22,1,.36,1)',
                                                    boxShadow:uploadedCount===4?'0 0 10px rgba(52,211,153,.55)':'0 0 10px rgba(99,102,241,.5)',
                                                }}/>
                                            </div>

                                            {/* Doc status chips */}
                                            <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                                                {DOC_FIELDS.map(f => (
                                                    <div key={f.key} style={{
                                                        display:'flex',alignItems:'center',gap:5,
                                                        padding:'3px 10px',borderRadius:20,
                                                        background:docs[f.key]?`${f.accent}18`:isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)',
                                                        border:`1px solid ${docs[f.key]?`${f.accent}40`:border}`,
                                                        transition:'all .25s ease',
                                                    }}>
                                                        <div style={{ width:6,height:6,borderRadius:'50%',background:docs[f.key]?f.accent:muted,transition:'background .25s' }}/>
                                                        <span style={{ fontSize:10,fontWeight:600,color:docs[f.key]?f.accent:muted }}>{f.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            onClick={handleSubmit}
                                            disabled={uploading||uploadedCount<4}
                                            className="kyc-submit"
                                            style={{ width:'100%',padding:'14px',borderRadius:16,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:9 }}
                                        >
                                            {uploading?(
                                                <>
                                                    <span style={{ width:16,height:16,borderRadius:'50%',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',display:'inline-block',animation:'kyc-spin .7s linear infinite' }}/>
                                                    Submitting Documents…
                                                </>
                                            ):uploadedCount<4?(
                                                <>{uploadedCount} of 4 documents uploaded — {4-uploadedCount} remaining</>
                                            ):(
                                                <><Check size={16}/> Submit All Documents</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}