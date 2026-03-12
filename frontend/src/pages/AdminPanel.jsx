import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import {
    Users, CreditCard, Building2, PiggyBank,
    Check, X, Shield, UserCircle, BookOpen,
    MapPin, Plus, Pencil, Trash2, Banknote,
    ArrowUpRight, ArrowDownLeft, UserPlus, Eye, EyeOff, FileText, MessageSquare, Send,
    TrendingUp, TrendingDown, Activity, Zap, Database, Wifi, Server, RefreshCw,
    ChevronRight, ChevronDown, ChevronUp, AlertCircle, Bell, BarChart3, DollarSign,
    Lock, Unlock, Key, AlertTriangle,
    Home, Car, GraduationCap, Briefcase, User as UserIcon, Wallet, Calendar, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Loan type config ── */
const LOAN_TYPES = {
    PERSONAL:  { label:'Personal',  icon:<UserIcon     size={14}/>, grad:'linear-gradient(135deg,#7c3aed,#a855f7)', glow:'rgba(124,58,237,.35)', accent:'#a78bfa' },
    HOME:      { label:'Home',      icon:<Home         size={14}/>, grad:'linear-gradient(135deg,#1d4ed8,#3b82f6)', glow:'rgba(29,78,216,.35)',  accent:'#60a5fa' },
    CAR:       { label:'Car',       icon:<Car          size={14}/>, grad:'linear-gradient(135deg,#7e22ce,#c026d3)', glow:'rgba(126,34,206,.35)', accent:'#e879f9' },
    EDUCATION: { label:'Education', icon:<GraduationCap size={14}/>, grad:'linear-gradient(135deg,#0f766e,#14b8a6)', glow:'rgba(15,118,110,.35)',  accent:'#2dd4bf' },
    BUSINESS:  { label:'Business',  icon:<Briefcase    size={14}/>, grad:'linear-gradient(135deg,#c2410c,#f97316)', glow:'rgba(194,65,12,.35)',  accent:'#fb923c' },
};

const LOAN_STATUS_CFG = {
    ACTIVE:   { label:'Active',   color:'bg-emerald-100 text-emerald-700', dot:'#34d399' },
    PENDING:  { label:'Pending',  color:'bg-amber-100 text-amber-700',     dot:'#fbbf24' },
    APPROVED: { label:'Approved', color:'bg-blue-100 text-blue-700',       dot:'#38bdf8' },
    REJECTED: { label:'Rejected', color:'bg-red-100 text-red-700',         dot:'#f87171' },
    CLOSED:   { label:'Closed',   color:'bg-gray-100 text-gray-600',       dot:'#94a3b8' },
};

/* ── ID Card constants ── */
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

/* ── Physical ID Card Visual ── */
function IdCardVisual({ card }) {
    const rooms   = card.roomAccess ? card.roomAccess.split(',').filter(Boolean) : [];
    const blocked = card.status === 'BLOCKED';
    const accent  = blocked ? '#dc2626' : '#6366f1';
    const accentL = blocked ? '#fca5a5' : '#a5b4fc';
    return (
        <div style={{ width:'340px',minHeight:'210px',borderRadius:'16px',
            background:blocked?'linear-gradient(135deg,#1a0000 0%,#3b0000 50%,#1a0000 100%)':'linear-gradient(135deg,#0a0f2e 0%,#1a237e 50%,#0a0f2e 100%)',
            position:'relative',overflow:'hidden',
            boxShadow:blocked?'0 8px 32px rgba(220,38,38,0.4)':'0 8px 32px rgba(26,35,126,0.5)',
            fontFamily:"'DM Sans',sans-serif",color:'white',
            border:`1px solid ${blocked?'rgba(220,38,38,0.5)':'rgba(255,255,255,0.1)'}` }}>
            <div style={{position:'absolute',inset:0,opacity:0.05,backgroundImage:'linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)',backgroundSize:'20px 20px'}}/>
            <div style={{position:'absolute',top:'-30px',right:'-30px',width:'100px',height:'100px',borderRadius:'50%',background:`${accent}33`,filter:'blur(30px)'}}/>
            <div style={{height:'4px',background:blocked?'linear-gradient(90deg,#dc2626,#ef4444,#fca5a5,#ef4444,#dc2626)':'linear-gradient(90deg,#6366f1,#3b82f6,#06b6d4,#3b82f6,#6366f1)'}}/>
            {blocked&&<div style={{position:'absolute',top:'28px',right:'-28px',background:'rgba(220,38,38,0.9)',color:'white',fontSize:'9px',fontWeight:'bold',letterSpacing:'2px',padding:'3px 36px',transform:'rotate(35deg)',zIndex:10}}>BLOCKED</div>}
            <div style={{padding:'14px 18px 16px'}}>
                <div style={{textAlign:'center',marginBottom:'12px'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',marginBottom:'2px'}}>
                        <div style={{width:'22px',height:'22px',borderRadius:'6px',background:`${accent}cc`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'}}>🏦</div>
                        <span style={{fontSize:'14px',fontWeight:'800',letterSpacing:'1.5px',fontFamily:"'Syne',sans-serif"}}>SOMNATH BANK</span>
                    </div>
                    <div style={{display:'inline-block',background:`${accent}4d`,border:`1px solid ${accent}80`,borderRadius:'4px',padding:'2px 10px',fontSize:'9px',letterSpacing:'2px',fontWeight:'700',color:accentL}}>
                        {card.designation?.toUpperCase()}
                    </div>
                </div>
                <div style={{height:'1px',background:'rgba(255,255,255,0.1)',marginBottom:'10px'}}/>
                <div style={{display:'flex',gap:'12px',alignItems:'flex-start'}}>
                    <div style={{width:'52px',height:'52px',borderRadius:'10px',flexShrink:0,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>👤</div>
                    <div style={{flex:1}}>
                        <p style={{fontSize:'15px',fontWeight:'700',margin:'0 0 4px',fontFamily:"'Syne',sans-serif"}}>{card.staffName}</p>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3px'}}>
                            {[['Blood',card.bloodGroup||'—'],['ID No',card.cardNumber]].map(([l,v])=>(
                                <div key={l}><p style={{fontSize:'8px',color:'rgba(255,255,255,0.45)',margin:0,letterSpacing:'0.5px'}}>{l.toUpperCase()}</p><p style={{fontSize:'10px',fontWeight:'600',margin:0}}>{v}</p></div>
                            ))}
                        </div>
                        <div style={{marginTop:'4px'}}>
                            <p style={{fontSize:'8px',color:'rgba(255,255,255,0.45)',margin:0,letterSpacing:'0.5px'}}>OFFICE ADDRESS</p>
                            <p style={{fontSize:'9px',fontWeight:'500',margin:0,color:'rgba(255,255,255,0.8)',lineHeight:'1.3'}}>{card.officeAddress||card.branchName||'—'}</p>
                        </div>
                    </div>
                </div>
                <div style={{marginTop:'10px',paddingTop:'8px',borderTop:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div><p style={{fontSize:'8px',color:'rgba(255,255,255,0.4)',margin:0}}>ISSUE DATE</p><p style={{fontSize:'9px',fontWeight:'700',margin:0}}>{card.issueDate}</p></div>
                    <div style={{textAlign:'center'}}><p style={{fontSize:'8px',color:'rgba(255,255,255,0.4)',margin:0}}>VALID TILL</p><p style={{fontSize:'9px',fontWeight:'700',margin:0,color:accentL}}>{card.expiryDate}</p></div>
                    <div style={{textAlign:'right'}}><p style={{fontSize:'8px',color:'rgba(255,255,255,0.4)',margin:0}}>STATUS</p><p style={{fontSize:'9px',fontWeight:'700',margin:0,color:blocked?'#f87171':'#34d399'}}>● {card.status}</p></div>
                </div>
                {rooms.length > 0 && (
                    <div style={{marginTop:'8px',display:'flex',flexWrap:'wrap',gap:'3px'}}>
                        {rooms.map(r=>(
                            <span key={r} style={{fontSize:'7px',padding:'2px 6px',borderRadius:'4px',fontWeight:'600',letterSpacing:'0.5px',background:`${accent}40`,border:`1px solid ${accent}66`,color:accentL}}>
                                {ROOM_OPTIONS.find(o=>o.value===r)?.label||r}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target, duration = 1200) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!target) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setValue(target); clearInterval(timer); }
            else setValue(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target]);
    return value;
}

/* ─── Mini Sparkline SVG ─── */
function Sparkline({ data = [], color = '#3b82f6', height = 32, width = 80 }) {
    if (!data.length) return null;
    const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={width} height={height} className="opacity-70">
            <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ─── Loan Progress Bar ─── */
function LoanProgressBar({ paid = 0, total = 0 }) {
    const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
    return (
        <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:10, fontWeight:600 }}>
                <span style={{ color:'#34d399' }}>₹{paid.toLocaleString('en-IN')} paid</span>
                <span style={{ color:'#64748b' }}>{pct.toFixed(1)}%</span>
            </div>
            <div style={{ height:5, borderRadius:6, background:'rgba(0,0,0,.08)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:6, background:'linear-gradient(90deg,#10b981,#34d399)', width:`${pct}%`, transition:'width .6s ease', boxShadow:'0 0 8px rgba(52,211,153,.5)' }}/>
            </div>
        </div>
    );
}

/* ─── System Status Badge ─── */
function StatusBadge({ label, ok = true }) {
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm
            ${ok ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {label}
        </div>
    );
}

/* ─── Animated stat value ── */
function AnimatedStatValue({ value }) {
    const animated = useAnimatedCounter(value);
    return <p className="text-xl font-bold" style={{fontFamily:'Syne,sans-serif'}}>{animated.toLocaleString('en-IN')}</p>;
}

export default function AdminPanel() {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [accounts, setAccounts] = useState([]);
    const [cards, setCards] = useState([]);
    const [loans, setLoans] = useState([]);
    const [fds, setFds] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [branches, setBranches] = useState([]);
    const [checkbooks, setCheckbooks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [filteredTxns, setFilteredTxns] = useState([]);
    const [kycList, setKycList] = useState([]);
    const [kycViewData, setKycViewData] = useState(null);
    const [showKycModal, setShowKycModal] = useState(false);
    const [kycRemarks, setKycRemarks] = useState('');
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyForm, setReplyForm] = useState({ adminReply: '', status: 'IN_PROGRESS' });
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [salaryHistory, setSalaryHistory] = useState([]);
    const [showSalaryHistory, setShowSalaryHistory] = useState(false);
    const [salaryForm, setSalaryForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), remarks: '' });
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [loanFilter, setLoanFilter] = useState('ALL');
    const [expandedLoanId, setExpandedLoanId] = useState(null);
    /* Cards tab state */
    const [cardFilter, setCardFilter] = useState('ALL');
    const [hoveredCard, setHoveredCard] = useState(null);
    const [revealedNumbers, setRevealedNumbers] = useState({});
    /* ID Card state */
    const [idCards, setIdCards] = useState([]);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showIdBlockModal, setShowIdBlockModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [showCardDetailModal, setShowCardDetailModal] = useState(false);
    const [selectedIdCard, setSelectedIdCard] = useState(null);
    const [idBlockReason, setIdBlockReason] = useState('');
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [generateForm, setGenerateForm] = useState({ staffId:'', bloodGroup:'', officeAddress:'', roomAccess:[] });
    const [txnFilters, setTxnFilters] = useState({ search: '', type: 'ALL', fromDate: '', toDate: '' });
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [editStaff, setEditStaff] = useState(null);
    const [editBranch, setEditBranch] = useState(null);
    const [newCustomerForm, setNewCustomerForm] = useState({
        fullName:'', email:'', phone:'', password:'', dateOfBirth:'', gender:'MALE',
        aadharNumber:'', panNumber:'', address:'', city:'', state:'', pincode:'',
        accountType:'SAVINGS', initialDeposit:''
    });
    const [staffForm, setStaffForm] = useState({
        fullName:'', email:'', phone:'', designation:'', department:'',
        branchName:'', salary:'', address:'', joiningDate:'', status:'ACTIVE'
    });
    const [branchForm, setBranchForm] = useState({
        branchName:'', branchCode:'', ifscCode:'', address:'',
        city:'', state:'', phone:'', managerName:'', status:'ACTIVE'
    });
    const [depositForm, setDepositForm] = useState({ accountNumber:'', amount:'', description:'Cash Deposit at Branch' });

    const sparkData = {
        accounts:     [12,18,15,22,19,28,25,32,29,35],
        customers:    [5,8,7,12,10,15,13,18,16,20],
        loans:        [3,5,4,8,6,10,9,12,11,14],
        transactions: [100,150,130,180,160,220,200,250,230,280],
        revenue:      [45,52,48,61,58,72,68,80,76,90],
        pending:      [8,12,10,15,13,18,16,20,18,22],
    };

    useEffect(() => { fetchAll(); setTimeout(() => setMounted(true), 100); }, []);
    useEffect(() => { applyTxnFilters(); }, [transactions, txnFilters]);

    const formatDate = (dateVal) => {
        if (!dateVal) return '—';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleString('en-IN');
    };

    const fetchAll = async () => {
        try {
            const [accRes, cardRes, loanRes, fdRes, custRes, staffRes, branchRes, cbRes, txnRes, kycRes, compRes, idCardRes] =
                await Promise.all([
                    API.get('/accounts/admin/all'), API.get('/cards/admin/all'),
                    API.get('/loans/admin/all'), API.get('/fd/admin/all'),
                    API.get('/admin/customers'), API.get('/staff/all'),
                    API.get('/branches/all'), API.get('/checkbook/admin/all'),
                    API.get('/transactions/admin/all'), API.get('/kyc/admin/all'),
                    API.get('/complaints/admin/all'), API.get('/idcards/admin/all'),
                ]);
            setAccounts(accRes.data); setCards(cardRes.data); setLoans(loanRes.data);
            setFds(fdRes.data); setCustomers(custRes.data); setStaff(staffRes.data);
            setBranches(branchRes.data); setCheckbooks(cbRes.data);
            setTransactions(txnRes.data); setKycList(kycRes.data); setComplaints(compRes.data);
            setIdCards(idCardRes.data);
        } catch { toast.error('Failed to load data!'); }
        finally { setLoading(false); }
    };

    const applyTxnFilters = () => {
        let data = [...transactions];
        if (txnFilters.type !== 'ALL') data = data.filter(t => t.transactionType === txnFilters.type);
        if (txnFilters.search) data = data.filter(t =>
            t.referenceNumber?.toLowerCase().includes(txnFilters.search.toLowerCase()) ||
            t.description?.toLowerCase().includes(txnFilters.search.toLowerCase()));
        if (txnFilters.fromDate) data = data.filter(t => new Date(t.createdAt) >= new Date(txnFilters.fromDate));
        if (txnFilters.toDate) data = data.filter(t => new Date(t.createdAt) <= new Date(txnFilters.toDate + 'T23:59:59'));
        setFilteredTxns(data);
    };

    const approveAccount  = async (id) => { try { await API.put(`/accounts/admin/approve/${id}`); toast.success('Account approved! ✅'); fetchAll(); } catch { toast.error('Failed!'); } };
    const rejectAccount   = async (id) => { try { await API.put(`/accounts/admin/reject/${id}`);  toast.success('Account rejected!');    fetchAll(); } catch { toast.error('Failed!'); } };
    const blockAccount    = async (id) => { try { await API.put(`/accounts/admin/block/${id}`);   toast.success('Account blocked!');     fetchAll(); } catch { toast.error('Failed!'); } };
    const unblockAccount  = async (id) => { try { await API.put(`/accounts/admin/unblock/${id}`); toast.success('Account unblocked! ✅'); fetchAll(); } catch { toast.error('Failed!'); } };
    const requestKycDocs  = async (userId) => { try { await API.post(`/kyc/admin/request/${userId}`); toast.success('Document request sent! 📩'); fetchAll(); } catch { toast.error('Failed!'); } };
    const viewKycDocs     = async (kycId) => { try { const res = await API.get(`/kyc/admin/view/${kycId}`); setKycViewData(res.data); setKycRemarks(''); setShowKycModal(true); } catch { toast.error('Failed to load documents!'); } };
    const approveKycDoc   = async (kycId) => { try { await API.put(`/kyc/admin/approve/${kycId}`); toast.success('KYC Approved! ✅'); setShowKycModal(false); fetchAll(); } catch { toast.error('Failed!'); } };
    const rejectKycDoc    = async (kycId) => { try { await API.put(`/kyc/admin/reject/${kycId}`, { remarks: kycRemarks }); toast.success('KYC Rejected!'); setShowKycModal(false); fetchAll(); } catch { toast.error('Failed!'); } };
    const resubmitKycDoc  = async (kycId) => { try { await API.put(`/kyc/admin/resubmit/${kycId}`, { remarks: kycRemarks }); toast.success('Re-submission requested!'); setShowKycModal(false); fetchAll(); } catch { toast.error('Failed!'); } };
    const approveCard     = async (id) => { try { await API.put(`/cards/admin/approve/${id}`);  toast.success('Card approved! 💳'); fetchAll(); } catch { toast.error('Failed!'); } };
    const blockCard       = async (id) => { try { await API.put(`/cards/admin/block/${id}`);    toast.success('Card blocked!');     fetchAll(); } catch { toast.error('Failed!'); } };
    const unblockCard     = async (id) => { try { await API.put(`/cards/admin/unblock/${id}`);  toast.success('Card unblocked! ✅'); fetchAll(); } catch { toast.error('Failed!'); } };
    const approveLoan     = async (id) => { try { await API.put(`/loans/admin/approve/${id}`); toast.success('Loan approved! 🎉'); fetchAll(); } catch { toast.error('Failed!'); } };
    const rejectLoan      = async (id) => { try { await API.put(`/loans/admin/reject/${id}`);  toast.success('Loan rejected!');    fetchAll(); } catch { toast.error('Failed!'); } };
    const approveCheckbook  = async (id) => { try { await API.put(`/checkbook/admin/approve/${id}`);  toast.success('Checkbook approved!');     fetchAll(); } catch { toast.error('Failed!'); } };
    const dispatchCheckbook = async (id) => { try { await API.put(`/checkbook/admin/dispatch/${id}`); toast.success('Checkbook dispatched! 📦'); fetchAll(); } catch { toast.error('Failed!'); } };
    const deliverCheckbook  = async (id) => { try { await API.put(`/checkbook/admin/deliver/${id}`);  toast.success('Checkbook delivered! ✅');  fetchAll(); } catch { toast.error('Failed!'); } };
    const rejectCheckbook   = async (id) => { try { await API.put(`/checkbook/admin/reject/${id}`);   toast.success('Checkbook rejected!');      fetchAll(); } catch { toast.error('Failed!'); } };

    /* ID Card actions */
    const handleGenerateIdCard = async () => {
        if (!generateForm.staffId)   { toast.error('Staff select karo!');       return; }
        if (!generateForm.bloodGroup){ toast.error('Blood group select karo!'); return; }
        try {
            await API.post('/idcards/admin/generate', { ...generateForm, staffId: parseInt(generateForm.staffId), roomAccess: generateForm.roomAccess.join(',') });
            toast.success('ID Card generated! 🪪');
            setShowGenerateModal(false);
            setGenerateForm({ staffId:'', bloodGroup:'', officeAddress:'', roomAccess:[] });
            fetchAll();
        } catch (err) { toast.error(err.response?.data || 'Failed!'); }
    };
    const handleBlockIdCard = async () => {
        try { await API.put(`/idcards/admin/block/${selectedIdCard.id}`, { reason: idBlockReason }); toast.success('ID Card blocked!'); setShowIdBlockModal(false); setIdBlockReason(''); fetchAll(); }
        catch { toast.error('Failed!'); }
    };
    const handleUnblockIdCard = async (id) => {
        try { await API.put(`/idcards/admin/unblock/${id}`); toast.success('ID Card unblocked! ✅'); fetchAll(); }
        catch { toast.error('Failed!'); }
    };
    const handleUpdateRoomAccess = async () => {
        try { await API.put(`/idcards/admin/room-access/${selectedIdCard.id}`, { roomAccess: selectedRooms.join(',') }); toast.success('Room access updated! 🔑'); setShowRoomModal(false); fetchAll(); }
        catch { toast.error('Failed!'); }
    };
    const handleRevokeIdCard = async (id) => {
        if (!window.confirm('Are you sure you want to REVOKE this ID Card?')) return;
        try { await API.put(`/idcards/admin/revoke/${id}`); toast.success('ID Card revoked!'); fetchAll(); }
        catch { toast.error('Failed!'); }
    };
    const toggleRoom = (val, arr, setter) => setter(arr.includes(val) ? arr.filter(r=>r!==val) : [...arr, val]);

    const handleNewCustomer = async () => {
        if (!newCustomerForm.fullName || !newCustomerForm.email || !newCustomerForm.phone || !newCustomerForm.password) { toast.error('Name, Email, Phone aur Password zaroori hai!'); return; }
        if (!newCustomerForm.aadharNumber || !newCustomerForm.panNumber) { toast.error('Aadhar aur PAN number zaroori hai!'); return; }
        try {
            const res = await API.post('/admin/create-customer', { ...newCustomerForm, initialDeposit: newCustomerForm.initialDeposit ? parseFloat(newCustomerForm.initialDeposit) : 0 });
            toast.success(`✅ Account created! Account No: ${res.data.accountNumber}`);
            setShowNewCustomerModal(false);
            setNewCustomerForm({ fullName:'', email:'', phone:'', password:'', dateOfBirth:'', gender:'MALE', aadharNumber:'', panNumber:'', address:'', city:'', state:'', pincode:'', accountType:'SAVINGS', initialDeposit:'' });
            fetchAll();
        } catch (err) { toast.error(err.response?.data || 'Customer create karne mein error!'); }
    };

    const handleAdminDeposit = async () => {
        if (!depositForm.accountNumber || !depositForm.amount) { toast.error('Account number aur amount bharo!'); return; }
        if (parseFloat(depositForm.amount) <= 0) { toast.error('Amount 0 se zyada hona chahiye!'); return; }
        try {
            await API.post(`/transactions/admin/deposit/${depositForm.accountNumber}?amount=${depositForm.amount}`);
            toast.success(`₹${parseFloat(depositForm.amount).toLocaleString('en-IN')} deposit successful! 💰`);
            setShowDepositModal(false);
            setDepositForm({ accountNumber:'', amount:'', description:'Cash Deposit at Branch' });
            fetchAll();
        } catch (err) { toast.error(err.response?.data || 'Deposit failed!'); }
    };

    const saveStaff = async () => {
        try {
            if (editStaff) { await API.put(`/staff/update/${editStaff.id}`, staffForm); toast.success('Staff updated!'); }
            else { await API.post('/staff/add', staffForm); toast.success('Staff added! 👤'); }
            setShowStaffModal(false); setEditStaff(null); resetStaffForm(); fetchAll();
        } catch { toast.error('Failed!'); }
    };
    const deleteStaff  = async (id) => { if (!window.confirm('Delete this staff member?')) return; try { await API.delete(`/staff/delete/${id}`); toast.success('Staff deleted!'); fetchAll(); } catch { toast.error('Failed!'); } };
    const saveBranch   = async () => {
        try {
            if (editBranch) { await API.put(`/branches/update/${editBranch.id}`, branchForm); toast.success('Branch updated!'); }
            else { await API.post('/branches/add', branchForm); toast.success('Branch added! 🏦'); }
            setShowBranchModal(false); setEditBranch(null); resetBranchForm(); fetchAll();
        } catch { toast.error('Failed!'); }
    };
    const deleteBranch = async (id) => { if (!window.confirm('Delete this branch?')) return; try { await API.delete(`/branches/delete/${id}`); toast.success('Branch deleted!'); fetchAll(); } catch { toast.error('Failed!'); } };
    const resetStaffForm  = () => setStaffForm({ fullName:'', email:'', phone:'', designation:'', department:'', branchName:'', salary:'', address:'', joiningDate:'', status:'ACTIVE' });
    const resetBranchForm = () => setBranchForm({ branchName:'', branchCode:'', ifscCode:'', address:'', city:'', state:'', phone:'', managerName:'', status:'ACTIVE' });

    const statusColor = (status) => {
        switch (status) {
            case 'ACTIVE': case 'APPROVED': case 'DELIVERED': return 'bg-emerald-100 text-emerald-700';
            case 'PENDING': return 'bg-amber-100 text-amber-700';
            case 'DISPATCHED': return 'bg-blue-100 text-blue-700';
            case 'REJECTED': case 'BLOCKED': case 'CLOSED': case 'INACTIVE': return 'bg-red-100 text-red-700';
            case 'ON_LEAVE': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    /* Cards tab helpers */
    const toggleReveal = (id, e) => {
        e.stopPropagation();
        setRevealedNumbers(prev => ({ ...prev, [id]: !prev[id] }));
    };
    const CARD_NETWORKS = {
        VISA:       { label: 'VISA',   color: '#1a1f71', accent: '#f7a600' },
        MASTERCARD: { label: 'MC',     color: '#eb001b', accent: '#f79e1b' },
        RUPAY:      { label: 'RuPay', color: '#097939', accent: '#f4a200' },
        AMEX:       { label: 'AMEX',  color: '#016fcf', accent: '#82ceff' },
    };
    const CARD_GRADIENTS = {
        DEBIT:   'linear-gradient(135deg,#0f172a 0%,#1e293b 40%,#0f2942 100%)',
        CREDIT:  'linear-gradient(135deg,#1a0533 0%,#2d1065 40%,#1a0533 100%)',
        PREPAID: 'linear-gradient(135deg,#0c1a0f 0%,#14532d 40%,#0c1a0f 100%)',
    };
    const CARD_STATUS_CFG = {
        ACTIVE:   { label:'ACTIVE',   dot:'#34d399', ring:'rgba(52,211,153,0.3)',   badge:'rgba(52,211,153,0.15)',   text:'#34d399' },
        PENDING:  { label:'PENDING',  dot:'#fbbf24', ring:'rgba(251,191,36,0.3)',   badge:'rgba(251,191,36,0.15)',   text:'#fbbf24' },
        BLOCKED:  { label:'BLOCKED',  dot:'#f87171', ring:'rgba(248,113,113,0.3)',  badge:'rgba(248,113,113,0.15)',  text:'#f87171' },
        INACTIVE: { label:'INACTIVE', dot:'#64748b', ring:'rgba(100,116,139,0.3)',  badge:'rgba(100,116,139,0.15)', text:'#64748b' },
    };
    const maskCardNumber = (num) => {
        if (!num) return '•••• •••• •••• ••••';
        const clean = num.replace(/\s/g,'');
        if (clean.length < 12) return num;
        return `${clean.slice(0,4)} •••• •••• ${clean.slice(-4)}`;
    };
    const formatCardNumber = (num) => {
        if (!num) return '•••• •••• •••• ••••';
        const clean = num.replace(/\s/g,'');
        return clean.match(/.{1,4}/g)?.join(' ') || num;
    };
    const filteredCards = cardFilter === 'ALL' ? cards : cards.filter(c => c.cardStatus === cardFilter);

    const card  = `p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${isDark ? 'bg-gray-900 hover:shadow-gray-900/50' : 'bg-white hover:shadow-gray-200/80'}`;
    const input = `w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/30 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`;
    const label = `block text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`;

    const totalCredit = filteredTxns.filter(t => t.transactionType === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const totalDebit  = filteredTxns.filter(t => t.transactionType === 'DEBIT').reduce((s, t) => s + t.amount, 0);
    const pendingItems = accounts.filter(a => a.status === 'PENDING').length + loans.filter(l => l.status === 'PENDING').length + kycList.filter(k => k.status === 'SUBMITTED').length;

    const filteredLoans = loanFilter === 'ALL' ? loans : loans.filter(l => l.status === loanFilter);

    const tabs = [
        { id:'dashboard',    label:'Dashboard',   icon:<BarChart3 size={15}/>,      count:null },
        { id:'accounts',     label:'Accounts',    icon:<Users size={15}/>,          count:accounts.length },
        { id:'cards',        label:'Cards',        icon:<CreditCard size={15}/>,    count:cards.length },
        { id:'loans',        label:'Loans',        icon:<Building2 size={15}/>,     count:loans.length },
        { id:'fds',          label:'FDs',          icon:<PiggyBank size={15}/>,     count:fds.length },
        { id:'customers',    label:'Customers',    icon:<UserCircle size={15}/>,    count:customers.length },
        { id:'transactions', label:'Transactions', icon:<ArrowUpRight size={15}/>,  count:transactions.length },
        { id:'staff',        label:'Staff',        icon:<Users size={15}/>,         count:staff.length },
        { id:'branches',     label:'Branches',     icon:<MapPin size={15}/>,        count:branches.length },
        { id:'checkbook',    label:'Checkbook',    icon:<BookOpen size={15}/>,      count:checkbooks.length },
        { id:'kyc',          label:'KYC',          icon:<FileText size={15}/>,      count:kycList.filter(k=>k.status==='SUBMITTED').length },
        { id:'complaints',   label:'Complaints',   icon:<MessageSquare size={15}/>, count:complaints.filter(c=>c.status==='OPEN').length },
        { id:'idcards',      label:'ID Cards',     icon:<CreditCard size={15}/>,    count:idCards.length },
    ];

    const statCards = [
        { label:'Total Accounts', value:accounts.length,    spark:sparkData.accounts,     color:'#3b82f6', icon:<Users size={18}/>,       bg:'from-blue-500 to-blue-600',    trend:+12.5, tab:'accounts' },
        { label:'Customers',      value:customers.length,   spark:sparkData.customers,    color:'#8b5cf6', icon:<UserCircle size={18}/>,   bg:'from-violet-500 to-violet-600',trend:+8.3,  tab:'customers' },
        { label:'Active Loans',   value:loans.filter(l=>l.status==='ACTIVE').length, spark:sparkData.loans, color:'#f59e0b', icon:<Building2 size={18}/>, bg:'from-amber-500 to-orange-500', trend:+5.1, tab:'loans' },
        { label:'Transactions',   value:transactions.length,spark:sparkData.transactions, color:'#10b981', icon:<Activity size={18}/>,     bg:'from-emerald-500 to-teal-500', trend:+18.7, tab:'transactions' },
        { label:'Pending Reviews',value:pendingItems,       spark:sparkData.pending,      color:'#ef4444', icon:<Bell size={18}/>,          bg:'from-red-500 to-rose-500',     trend:-3.2,  tab:'kyc' },
        { label:'Staff Members',  value:staff.length,       spark:sparkData.revenue,      color:'#06b6d4', icon:<Users size={18}/>,         bg:'from-cyan-500 to-sky-500',     trend:+2.1,  tab:'staff' },
    ];

    const quickActions = [
        { label:'New Customer', icon:<UserPlus size={20}/>,     action:()=>setShowNewCustomerModal(true), gradient:'from-blue-600 to-indigo-600',   glow:'shadow-blue-500/30' },
        { label:'Cash Deposit', icon:<Banknote size={20}/>,     action:()=>setShowDepositModal(true),     gradient:'from-emerald-600 to-teal-600',  glow:'shadow-emerald-500/30' },
        { label:'KYC Review',   icon:<FileText size={20}/>,     action:()=>setActiveTab('kyc'),           gradient:'from-amber-500 to-orange-500',  glow:'shadow-amber-500/30' },
        { label:'Complaints',   icon:<MessageSquare size={20}/>,action:()=>setActiveTab('complaints'),   gradient:'from-rose-500 to-pink-600',     glow:'shadow-rose-500/30' },
        { label:'Add Staff',    icon:<Plus size={20}/>,         action:()=>{resetStaffForm();setEditStaff(null);setShowStaffModal(true);}, gradient:'from-violet-600 to-purple-600', glow:'shadow-violet-500/30' },
        { label:'ID Cards',     icon:<CreditCard size={20}/>,   action:()=>setActiveTab('idcards'),       gradient:'from-cyan-600 to-blue-600',     glow:'shadow-cyan-500/30' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
                .admin-wrap { font-family: 'DM Sans', sans-serif; }
                .syne { font-family: 'Syne', sans-serif; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
                @keyframes pulseRing { 0%{transform:scale(0.95);box-shadow:0 0 0 0 rgba(59,130,246,0.5)} 70%{transform:scale(1);box-shadow:0 0 0 10px rgba(59,130,246,0)} 100%{transform:scale(0.95);box-shadow:0 0 0 0 rgba(59,130,246,0)} }
                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
                @keyframes glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
                @keyframes lnSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
                /* Card tab animations */
                @keyframes holoShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
                @keyframes cardFloat { 0%,100%{transform:translateY(0px) rotateX(0deg)} 50%{transform:translateY(-6px) rotateX(1deg)} }
                @keyframes scanLine { 0%{top:-4px;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
                @keyframes chipGlow { 0%,100%{box-shadow:0 0 8px rgba(255,200,50,0.4)} 50%{box-shadow:0 0 20px rgba(255,200,50,0.9),0 0 40px rgba(255,150,0,0.3)} }
                @keyframes statusPulseCard { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
                @keyframes rowSlide { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
                @keyframes numberReveal { from{letter-spacing:-2px;opacity:0} to{letter-spacing:2px;opacity:1} }
                @keyframes gradientPan { 0%{background-position:0% 0%} 100%{background-position:200% 0%} }
                .fade-up    { animation:fadeUp 0.5s ease forwards; }
                .fade-up-1  { animation:fadeUp 0.5s 0.05s ease both; }
                .fade-up-2  { animation:fadeUp 0.5s 0.10s ease both; }
                .fade-up-3  { animation:fadeUp 0.5s 0.15s ease both; }
                .fade-up-4  { animation:fadeUp 0.5s 0.20s ease both; }
                .fade-up-5  { animation:fadeUp 0.5s 0.25s ease both; }
                .fade-up-6  { animation:fadeUp 0.5s 0.30s ease both; }
                .ln-expand  { animation:lnSlide .25s ease both; }
                .shimmer-text { background:linear-gradient(90deg,#fff 0%,#93c5fd 40%,#fff 60%,#c4b5fd 100%);background-size:400px auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite; }
                .hero-glow { position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 20% 50%,rgba(59,130,246,0.15) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(139,92,246,0.12) 0%,transparent 50%);animation:glow 4s ease-in-out infinite; }
                .hero-grid { background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:30px 30px; }
                .stat-card:hover .stat-icon { animation:float 1.5s ease-in-out infinite; }
                .quick-btn { transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
                .quick-btn:hover { transform:translateY(-4px) scale(1.03); }
                .quick-btn:active { transform:translateY(-1px) scale(0.98); }
                .txn-row { transition:all 0.2s ease; }
                .txn-row:hover { transform:translateX(4px); background:rgba(59,130,246,0.05) !important; }
                .tab-btn { transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
                .pulse-ring { animation:pulseRing 2s ease-out infinite; }
                .loan-card { transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease; }
                .loan-card:hover { transform:translateY(-2px); }
                .loan-top-shimmer { position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);animation:shimmer 2.5s ease-in-out infinite; }
                /* Card tab styles */
                .card-3d { perspective:1000px; transform-style:preserve-3d; }
                .card-3d:hover .card-inner-anim { animation:cardFloat 3s ease-in-out infinite; }
                .card-inner-anim { border-radius:18px; overflow:hidden; transition:box-shadow 0.3s ease; }
                .holo-card { background-size:300% 300%; animation:holoShift 6s ease infinite; }
                .scan-effect::before { content:''; position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent); animation:scanLine 4s ease-in-out infinite; z-index:5; pointer-events:none; }
                .chip-glow { animation:chipGlow 2.5s ease-in-out infinite; }
                .status-dot-active-card { animation:statusPulseCard 1.8s ease-in-out infinite; }
                .card-row-enter { animation:rowSlide 0.4s ease both; }
                .number-reveal { animation:numberReveal 0.6s ease both; font-family:'Space Mono',monospace; }
                .card-filter-pill { transition:all 0.2s cubic-bezier(0.34,1.56,0.64,1); }
                .card-filter-pill:hover { transform:translateY(-1px); }
                .card-filter-pill.active-pill { transform:translateY(-2px); }
                .card-list-item { transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
                .card-list-item:hover { transform:translateY(-4px); }
                .card-action-btn { position:relative; overflow:hidden; transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
                .card-action-btn::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 50%,rgba(255,255,255,0.25),transparent 70%); opacity:0; transition:opacity 0.2s; }
                .card-action-btn:hover::after { opacity:1; }
                .card-action-btn:hover { transform:translateY(-2px) scale(1.04); }
                .card-action-btn:active { transform:scale(0.97); }
                .gradient-text-cards { background:linear-gradient(135deg,#e2e8f0,#94a3b8,#e2e8f0); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:gradientPan 3s linear infinite; }

                /* ── LUXURY FD / CUSTOMER / STAFF ANIMATIONS ── */
                @keyframes luxEntrance { from{opacity:0;transform:translateY(24px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes goldShimmer { 0%{background-position:-800px 0} 100%{background-position:800px 0} }
                @keyframes borderGlow { 0%,100%{opacity:0.4} 50%{opacity:1} }
                @keyframes avatarPulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.5)} 50%{box-shadow:0 0 0 8px rgba(99,102,241,0)} }
                @keyframes salaryBarFill { from{width:0} to{width:var(--pct)} }
                @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
                @keyframes certShimmer { 0%{left:-100%} 100%{left:200%} }
                @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
                @keyframes kycRipple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
                @keyframes staffSlide { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
                @keyframes custFade { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes progressAnim { from{width:0%} to{width:var(--w)} }

                .lux-enter { animation: luxEntrance 0.55s cubic-bezier(0.16,1,0.3,1) both; }
                .gold-text { background:linear-gradient(90deg,#f59e0b,#fcd34d,#d97706,#fcd34d,#f59e0b); background-size:800px; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:goldShimmer 4s linear infinite; }
                .fd-cert { transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease; }
                .fd-cert:hover { transform: translateY(-8px) scale(1.01); }
                .fd-cert:hover .fd-shine { animation: certShimmer 1s ease; }
                .fd-shine { position:absolute; top:0; bottom:0; width:60px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent); pointer-events:none; left:-100%; }
                .cust-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
                .cust-card:hover { transform: translateY(-6px); }
                .cust-card:hover .cust-avatar { animation: avatarPulse 1.5s ease-in-out infinite; }
                .staff-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease; }
                .staff-card:hover { transform: translateY(-5px); }
                .staff-card:hover .staff-avatar-inner { animation: float2 2s ease-in-out infinite; }
                .status-blink { animation: dotBlink 2s ease-in-out infinite; }
                .kyc-badge::after { content:''; position:absolute; inset:0; border-radius:inherit; background:inherit; animation:kycRipple 1.8s ease-out infinite; }
                .salary-progress { animation: progressAnim 1.2s cubic-bezier(0.34,1.56,0.64,1) both; }
            `}</style>

            <div className={`admin-wrap flex min-h-screen ${isDark?'bg-gray-950':'bg-slate-50'}`}>
                <Sidebar/>
                <main className="flex-1 p-6 md:p-8 overflow-auto">

                    {/* ═══ HERO BANNER ═══════════════════════════════════════════ */}
                    <div className={`relative overflow-hidden rounded-3xl mb-6 p-6 md:p-8 fade-up ${isDark?'bg-gray-900 border border-gray-800':'bg-gray-900'}`}
                         style={{background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)'}}>
                        <div className="hero-glow"/>
                        <div className="hero-grid absolute inset-0 opacity-50"/>
                        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-600/10 blur-3xl"/>
                        <div className="absolute -bottom-10 right-1/3 w-32 h-32 rounded-full bg-violet-600/10 blur-3xl"/>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="pulse-ring bg-blue-600 p-2.5 rounded-xl text-white"><Shield size={22}/></div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${isDark?'border-blue-500/30 text-blue-300 bg-blue-500/10':'border-blue-400/40 text-blue-300 bg-blue-500/15'}`}>ADMIN CONTROL CENTER</span>
                                </div>
                                <h1 className="syne text-3xl md:text-4xl font-bold shimmer-text mb-1">Bank Management</h1>
                                <p className="text-gray-400 text-sm">Full system oversight • Real-time monitoring</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">System Status</p>
                                <div className="flex flex-wrap gap-2">
                                    <StatusBadge label="API Online" ok={true}/>
                                    <StatusBadge label="DB Connected" ok={true}/>
                                    <StatusBadge label="Server Active" ok={true}/>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500">Last sync:</span>
                                    <span className="text-xs text-emerald-400 font-medium">Just now</span>
                                    <button onClick={fetchAll} className="p-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"><RefreshCw size={12}/></button>
                                </div>
                            </div>
                        </div>
                        <div className="relative z-10 flex gap-2 mt-5">
                            <button onClick={()=>setShowNewCustomerModal(true)} className="quick-btn flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30"><UserPlus size={16}/> New Customer</button>
                            <button onClick={()=>setShowDepositModal(true)} className="quick-btn flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/30"><Banknote size={16}/> Cash Deposit</button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={`flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto ${isDark?'bg-gray-900':'bg-gray-200'}`}>
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                                    className={`tab-btn flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap
                                    ${activeTab===tab.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : isDark?'text-gray-400 hover:text-white hover:bg-gray-800':'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                                {tab.icon} {tab.label}
                                {tab.count !== null && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab===tab.id?'bg-blue-500':isDark?'bg-gray-700':'bg-gray-300'}`}>{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className={`h-20 rounded-2xl animate-pulse ${isDark?'bg-gray-800':'bg-gray-200'}`}/>)}</div>
                    ) : (
                        <>
                            {/* ═══ DASHBOARD TAB ══════════════════════════════════════ */}
                            {activeTab === 'dashboard' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        {statCards.map((sc,i)=>(
                                            <button key={sc.label} onClick={()=>setActiveTab(sc.tab)}
                                                    className={`stat-card text-left p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group
                                                    ${isDark?'bg-gray-900 border-gray-800 hover:border-gray-700':'bg-white border-gray-100 hover:border-gray-200'} fade-up-${Math.min(i+1,6)}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`stat-icon p-2 rounded-xl text-white bg-gradient-to-br ${sc.bg} shadow-md`}>{sc.icon}</div>
                                                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${sc.trend>0?'text-emerald-500':'text-red-500'}`}>
                                                        {sc.trend>0?<TrendingUp size={11}/>:<TrendingDown size={11}/>}{Math.abs(sc.trend)}%
                                                    </span>
                                                </div>
                                                <AnimatedStatValue value={sc.value}/>
                                                <p className={`text-xs mt-0.5 mb-2 ${isDark?'text-gray-500':'text-gray-400'}`}>{sc.label}</p>
                                                <Sparkline data={sc.spark} color={sc.color} width={90} height={28}/>
                                            </button>
                                        ))}
                                    </div>
                                    <div className={`p-5 rounded-2xl border fade-up-3 ${isDark?'bg-gray-900 border-gray-800':'bg-white border-gray-100'}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div><h3 className={`syne font-bold text-base ${isDark?'text-white':'text-gray-900'}`}>Quick Access</h3><p className={`text-xs mt-0.5 ${isDark?'text-gray-500':'text-gray-400'}`}>Jump to any module instantly</p></div>
                                            <Zap size={18} className="text-amber-400"/>
                                        </div>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                            {quickActions.map(qa=>(
                                                <button key={qa.label} onClick={qa.action} className={`quick-btn flex flex-col items-center gap-2 p-4 rounded-2xl text-white text-xs font-semibold bg-gradient-to-br ${qa.gradient} shadow-lg ${qa.glow}`}>
                                                    <div className="p-2 bg-white/20 rounded-xl">{qa.icon}</div>
                                                    <span className="text-center leading-tight">{qa.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`p-5 rounded-2xl border fade-up-4 ${isDark?'bg-gray-900 border-gray-800':'bg-white border-gray-100'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className={`syne font-bold text-base ${isDark?'text-white':'text-gray-900'}`}>Recent Transactions</h3>
                                                <button onClick={()=>setActiveTab('transactions')} className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 font-medium">View all <ChevronRight size={14}/></button>
                                            </div>
                                            <div className="space-y-1">
                                                {transactions.slice(0,6).map(txn=>(
                                                    <div key={txn.id} className={`txn-row flex items-center justify-between p-3 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-50'}`}>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`p-1.5 rounded-lg ${txn.transactionType==='CREDIT'?'bg-emerald-100 text-emerald-600':'bg-red-100 text-red-600'}`}>{txn.transactionType==='CREDIT'?<ArrowDownLeft size={12}/>:<ArrowUpRight size={12}/>}</div>
                                                            <div>
                                                                <p className={`text-xs font-medium truncate max-w-[120px] ${isDark?'text-gray-200':'text-gray-700'}`}>{txn.description}</p>
                                                                <p className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>{txn.referenceNumber?.slice(-8)}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-xs font-bold ${txn.transactionType==='CREDIT'?'text-emerald-500':'text-red-500'}`}>{txn.transactionType==='CREDIT'?'+':'-'}₹{txn.amount?.toLocaleString('en-IN')}</span>
                                                    </div>
                                                ))}
                                                {transactions.length===0&&<p className={`text-center py-8 text-sm ${isDark?'text-gray-500':'text-gray-400'}`}>No transactions yet</p>}
                                            </div>
                                        </div>
                                        <div className={`p-5 rounded-2xl border fade-up-5 ${isDark?'bg-gray-900 border-gray-800':'bg-white border-gray-100'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className={`syne font-bold text-base ${isDark?'text-white':'text-gray-900'}`}>Needs Attention</h3>
                                                <AlertCircle size={18} className="text-amber-400"/>
                                            </div>
                                            <div className="space-y-2">
                                                {[
                                                    {label:'Pending Accounts',count:accounts.filter(a=>a.status==='PENDING').length,color:'from-blue-500/20 to-blue-600/10 border-blue-500/20',text:'text-blue-500',tab:'accounts'},
                                                    {label:'Pending Loans',count:loans.filter(l=>l.status==='PENDING').length,color:'from-amber-500/20 to-amber-600/10 border-amber-500/20',text:'text-amber-500',tab:'loans'},
                                                    {label:'KYC Submitted',count:kycList.filter(k=>k.status==='SUBMITTED').length,color:'from-violet-500/20 to-violet-600/10 border-violet-500/20',text:'text-violet-500',tab:'kyc'},
                                                    {label:'Open Complaints',count:complaints.filter(c=>c.status==='OPEN').length,color:'from-rose-500/20 to-rose-600/10 border-rose-500/20',text:'text-rose-500',tab:'complaints'},
                                                    {label:'Pending Checkbooks',count:checkbooks.filter(c=>c.status==='PENDING').length,color:'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',text:'text-emerald-500',tab:'checkbook'},
                                                    {label:'Pending Cards',count:cards.filter(c=>c.cardStatus==='PENDING').length,color:'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20',text:'text-cyan-500',tab:'cards'},
                                                ].map(item=>(
                                                    <button key={item.label} onClick={()=>setActiveTab(item.tab)}
                                                            className={`w-full flex items-center justify-between p-3 rounded-xl border bg-gradient-to-r ${item.color} transition-all hover:-translate-y-0.5 hover:shadow-md`}>
                                                        <span className={`text-xs font-medium ${isDark?'text-gray-300':'text-gray-700'}`}>{item.label}</span>
                                                        <div className="flex items-center gap-2"><span className={`text-sm font-bold ${item.text}`}>{item.count}</span><ChevronRight size={13} className={item.text}/></div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══ ACCOUNTS TAB ═══════════════════════════════════════ */}
                            {activeTab === 'accounts' && (
                                <div className="space-y-3">
                                    {accounts.length===0&&<p className={`text-center py-10 ${isDark?'text-gray-400':'text-gray-500'}`}>No accounts found</p>}
                                    {accounts.map((acc,i)=>(
                                        <div key={acc.id} className={`${card} fade-up`} style={{animationDelay:`${i*30}ms`}}>
                                            <div className="flex items-center justify-between flex-wrap gap-3">
                                                <div>
                                                    <p className={`font-semibold ${isDark?'text-white':'text-gray-900'}`}>{acc.ownerName}</p>
                                                    <p className={`text-sm ${isDark?'text-gray-400':'text-gray-500'}`}>{acc.accountNumber} • {acc.accountType}</p>
                                                    <p className={`text-sm font-medium ${isDark?'text-gray-300':'text-gray-700'}`}>₹{acc.balance?.toLocaleString('en-IN')}</p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(acc.status)}`}>{acc.status}</span>
                                                    {acc.status==='PENDING'&&<><button onClick={()=>approveAccount(acc.id)} className="quick-btn flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-md shadow-emerald-500/20"><Check size={14}/> Approve</button><button onClick={()=>rejectAccount(acc.id)} className="quick-btn flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-md shadow-red-500/20"><X size={14}/> Reject</button></>}
                                                    {acc.status==='ACTIVE'&&<button onClick={()=>blockAccount(acc.id)} className="quick-btn flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-md shadow-orange-500/20"><X size={14}/> Block</button>}
                                                    {acc.status==='BLOCKED'&&<button onClick={()=>unblockAccount(acc.id)} className="quick-btn flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-md shadow-emerald-500/20"><Check size={14}/> Unblock</button>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ═══ CARDS TAB — PREMIUM REDESIGN ══════════════════════ */}
                            {activeTab === 'cards' && (
                                <div style={{ fontFamily:"'Outfit',sans-serif" }}>
                                    {/* Header */}
                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
                                        <div>
                                            <h2 className="gradient-text-cards" style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.5px', margin:0, fontFamily:"'Outfit',sans-serif" }}>
                                                Card Management
                                            </h2>
                                            <p style={{ fontSize:12, color:'#475569', marginTop:2, fontWeight:400 }}>
                                                {cards.length} cards across all accounts
                                            </p>
                                        </div>
                                        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                            {[
                                                { label:'Total', count:cards.length, color:'#60a5fa' },
                                                { label:'Active', count:cards.filter(c=>c.cardStatus==='ACTIVE').length, color:'#34d399' },
                                                { label:'Pending', count:cards.filter(c=>c.cardStatus==='PENDING').length, color:'#fbbf24' },
                                                { label:'Blocked', count:cards.filter(c=>c.cardStatus==='BLOCKED').length, color:'#f87171' },
                                            ].map(s=>(
                                                <div key={s.label} style={{ padding:'8px 16px', borderRadius:12, background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1px solid ${s.color}33`, display:'flex', alignItems:'center', gap:8 }}>
                                                    <span style={{ width:7, height:7, borderRadius:'50%', background:s.color, display:'block', boxShadow:`0 0 8px ${s.color}` }}/>
                                                    <span style={{ fontSize:18, fontWeight:800, color:s.color, fontFamily:"'Space Mono',monospace", lineHeight:1 }}>{s.count}</span>
                                                    <span style={{ fontSize:10, color:'#64748b', fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Filter Pills */}
                                    <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
                                        {['ALL','ACTIVE','PENDING','BLOCKED','INACTIVE'].map(f=>(
                                            <button key={f} onClick={()=>setCardFilter(f)}
                                                    className={`card-filter-pill ${cardFilter===f?'active-pill':''}`}
                                                    style={{
                                                        padding:'7px 18px', borderRadius:40, fontSize:11, fontWeight:700,
                                                        letterSpacing:1.2, textTransform:'uppercase', cursor:'pointer', border:'none',
                                                        background:cardFilter===f?'linear-gradient(135deg,#3b82f6,#6366f1)':isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
                                                        color:cardFilter===f?'#fff':isDark?'#64748b':'#94a3b8',
                                                        boxShadow:cardFilter===f?'0 4px 15px rgba(99,102,241,0.4)':'none',
                                                    }}>
                                                {f==='ALL'?'All Cards':f}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Empty */}
                                    {filteredCards.length===0&&(
                                        <div style={{ textAlign:'center', padding:'80px 0', color:'#475569' }}>
                                            <div style={{ fontSize:48, marginBottom:12, opacity:0.3 }}>💳</div>
                                            <p style={{ fontSize:15, fontWeight:600 }}>No {cardFilter!=='ALL'?cardFilter.toLowerCase():''} cards found</p>
                                        </div>
                                    )}

                                    {/* Cards Grid */}
                                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:20 }}>
                                        {filteredCards.map((c, idx) => {
                                            const st = CARD_STATUS_CFG[c.cardStatus] || CARD_STATUS_CFG['INACTIVE'];
                                            const netKey = (c.cardNetwork||'').toUpperCase();
                                            const net = CARD_NETWORKS[netKey] || { label:c.cardNetwork||'CARD', color:'#334155', accent:'#94a3b8' };
                                            const gradient = CARD_GRADIENTS[c.cardType?.toUpperCase()] || CARD_GRADIENTS['DEBIT'];
                                            const isRevealed = revealedNumbers[c.id];
                                            const isHovered = hoveredCard === c.id;

                                            return (
                                                <div key={c.id} className="card-list-item card-row-enter"
                                                     style={{ animationDelay:`${idx*50}ms` }}
                                                     onMouseEnter={()=>setHoveredCard(c.id)}
                                                     onMouseLeave={()=>setHoveredCard(null)}>

                                                    {/* Physical Card */}
                                                    <div className="card-3d">
                                                        <div className="card-inner-anim scan-effect holo-card"
                                                             style={{
                                                                 background:gradient, height:200, padding:'20px 24px',
                                                                 backgroundSize:'300% 300%', borderRadius:18,
                                                                 boxShadow:isHovered
                                                                     ?`0 24px 48px rgba(0,0,0,0.5),0 0 0 1px ${st.dot}44,inset 0 1px 0 rgba(255,255,255,0.1)`
                                                                     :`0 12px 32px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.08)`,
                                                                 border:'1px solid rgba(255,255,255,0.1)',
                                                                 position:'relative', overflow:'hidden',
                                                             }}>
                                                            {/* Noise overlay */}
                                                            <div style={{ position:'absolute', inset:0, borderRadius:18, opacity:0.04, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:'150px' }}/>
                                                            {/* Glare */}
                                                            <div style={{ position:'absolute', top:-60, right:-40, width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%)', pointerEvents:'none', transform:isHovered?'scale(1.2)':'scale(1)', transition:'transform 0.4s ease' }}/>
                                                            {/* Status */}
                                                            <div style={{ position:'absolute', top:16, right:20, display:'flex', alignItems:'center', gap:5 }}>
                                                                <span className={c.cardStatus==='ACTIVE'?'status-dot-active-card':''} style={{ width:7, height:7, borderRadius:'50%', background:st.dot, display:'block', boxShadow:`0 0 10px ${st.dot}` }}/>
                                                                <span style={{ fontSize:8, fontWeight:800, color:st.text, letterSpacing:2, fontFamily:"'Space Mono',monospace", background:st.badge, border:`1px solid ${st.dot}40`, padding:'2px 8px', borderRadius:6 }}>{st.label}</span>
                                                            </div>
                                                            {/* Bank name */}
                                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, position:'relative', zIndex:2 }}>
                                                                <div>
                                                                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)', letterSpacing:2, fontWeight:700, margin:0, fontFamily:"'Space Mono',monospace", textTransform:'uppercase' }}>SOMNATH BANK</p>
                                                                    <p style={{ fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:1.5, margin:'2px 0 0', textTransform:'uppercase' }}>{c.cardType||'DEBIT'} CARD</p>
                                                                </div>
                                                            </div>
                                                            {/* Chip + Contactless */}
                                                            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, position:'relative', zIndex:2 }}>
                                                                <div className={isHovered?'chip-glow':''} style={{ width:36, height:28, borderRadius:6, background:'linear-gradient(135deg,#d4a017 0%,#f5c842 30%,#c8860a 60%,#f0c040 100%)', position:'relative', overflow:'hidden', boxShadow:'0 2px 6px rgba(0,0,0,0.4)', transition:'box-shadow 0.3s ease' }}>
                                                                    <div style={{ position:'absolute', inset:'4px 6px', borderRadius:3, border:'1px solid rgba(150,100,0,0.4)' }}/>
                                                                    <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, background:'rgba(150,100,0,0.3)', transform:'translateY(-50%)' }}/>
                                                                    <div style={{ position:'absolute', top:0, bottom:0, left:'50%', width:1, background:'rgba(150,100,0,0.3)', transform:'translateX(-50%)' }}/>
                                                                </div>
                                                                <div style={{ display:'flex', alignItems:'center', gap:2, opacity:0.5 }}>
                                                                    {[10,14,18].map(r=>(
                                                                        <div key={r} style={{ width:r, height:r, borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.6)', borderLeft:'1.5px solid transparent', borderBottom:'1.5px solid transparent', transform:'rotate(-45deg)' }}/>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {/* Card number */}
                                                            <div style={{ position:'relative', zIndex:2, marginBottom:14 }}>
                                                                <p className="number-reveal" style={{ fontSize:15, color:'rgba(255,255,255,0.9)', margin:0, letterSpacing:2, fontFamily:"'Space Mono',monospace", textShadow:'0 1px 4px rgba(0,0,0,0.4)', animationDelay:`${idx*50+100}ms` }}>
                                                                    {isRevealed?formatCardNumber(c.cardNumber):maskCardNumber(c.cardNumber)}
                                                                </p>
                                                            </div>
                                                            {/* Bottom */}
                                                            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', position:'relative', zIndex:2 }}>
                                                                <div>
                                                                    <p style={{ fontSize:8, color:'rgba(255,255,255,0.35)', letterSpacing:1.5, margin:'0 0 2px', textTransform:'uppercase' }}>CARD HOLDER</p>
                                                                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.9)', fontWeight:600, margin:0, letterSpacing:0.5, textTransform:'uppercase', maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.customerName||'—'}</p>
                                                                </div>
                                                                <div style={{ textAlign:'right' }}>
                                                                    <p style={{ fontSize:8, color:'rgba(255,255,255,0.35)', letterSpacing:1.5, margin:'0 0 2px', textTransform:'uppercase' }}>EXPIRES</p>
                                                                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.85)', fontWeight:700, margin:0, fontFamily:"'Space Mono',monospace" }}>{c.expiryDate||'••/••'}</p>
                                                                </div>
                                                                <div style={{ display:'flex', alignItems:'center', gap:0, background:'rgba(255,255,255,0.08)', borderRadius:8, padding:'4px 10px', border:'1px solid rgba(255,255,255,0.1)' }}>
                                                                    {netKey==='MASTERCARD'?(
                                                                        <div style={{ display:'flex' }}>
                                                                            <div style={{ width:18, height:18, borderRadius:'50%', background:'#eb001b', opacity:0.9 }}/>
                                                                            <div style={{ width:18, height:18, borderRadius:'50%', background:'#f79e1b', opacity:0.9, marginLeft:-6 }}/>
                                                                        </div>
                                                                    ):(
                                                                        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:1.5, fontWeight:700, color:'rgba(255,255,255,0.8)' }}>{net.label}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Info Panel */}
                                                    <div style={{ borderRadius:'0 0 18px 18px', background:isDark?'rgba(15,23,42,0.95)':'rgba(248,250,252,0.98)', border:isDark?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(0,0,0,0.06)', borderTop:'none', padding:'14px 20px 16px', marginTop:-4, backdropFilter:'blur(20px)' }}>
                                                        {/* Customer row */}
                                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                                                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                                <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${st.dot}30,${st.dot}10)`, border:`1.5px solid ${st.dot}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, color:st.text, fontWeight:800, fontFamily:"'Outfit',sans-serif" }}>
                                                                    {(c.customerName||'?')[0].toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize:13, fontWeight:700, color:isDark?'#e2e8f0':'#0f172a', margin:0, fontFamily:"'Outfit',sans-serif" }}>{c.customerName}</p>
                                                                    <p style={{ fontSize:10, color:'#64748b', margin:0, fontFamily:"'Space Mono',monospace" }}>{c.cardType} · {c.cardNetwork}</p>
                                                                </div>
                                                            </div>
                                                            {/* Reveal toggle */}
                                                            <button onClick={(e)=>toggleReveal(c.id,e)}
                                                                    style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:8, border:'none', cursor:'pointer', background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)', color:'#64748b', fontSize:10, fontWeight:700, letterSpacing:0.8, transition:'all 0.2s', fontFamily:"'Outfit',sans-serif" }}>
                                                                <span style={{ fontSize:11 }}>{isRevealed?'🙈':'👁'}</span>
                                                                {isRevealed?'HIDE':'SHOW'}
                                                            </button>
                                                        </div>
                                                        <div style={{ height:1, background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)', marginBottom:12 }}/>
                                                        {/* Action Buttons */}
                                                        <div style={{ display:'flex', gap:8 }}>
                                                            {c.cardStatus==='PENDING'&&(
                                                                <button onClick={()=>approveCard(c.id)} className="card-action-btn"
                                                                        style={{ flex:1, padding:'9px 0', borderRadius:12, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', fontSize:11, fontWeight:800, letterSpacing:1, textTransform:'uppercase', boxShadow:'0 4px 16px rgba(16,185,129,0.35)', fontFamily:"'Outfit',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                                                    <span style={{ fontSize:14 }}>✓</span> Approve
                                                                </button>
                                                            )}
                                                            {c.cardStatus==='ACTIVE'&&(
                                                                <button onClick={()=>blockCard(c.id)} className="card-action-btn"
                                                                        style={{ flex:1, padding:'9px 0', borderRadius:12, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#dc2626,#ef4444)', color:'#fff', fontSize:11, fontWeight:800, letterSpacing:1, textTransform:'uppercase', boxShadow:'0 4px 16px rgba(239,68,68,0.35)', fontFamily:"'Outfit',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                                                    <span style={{ fontSize:12 }}>⊘</span> Block Card
                                                                </button>
                                                            )}
                                                            {c.cardStatus==='BLOCKED'&&(
                                                                <button onClick={()=>unblockCard(c.id)} className="card-action-btn"
                                                                        style={{ flex:1, padding:'9px 0', borderRadius:12, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#2563eb,#3b82f6)', color:'#fff', fontSize:11, fontWeight:800, letterSpacing:1, textTransform:'uppercase', boxShadow:'0 4px 16px rgba(59,130,246,0.35)', fontFamily:"'Outfit',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                                                    <span>🔓</span> Unblock
                                                                </button>
                                                            )}
                                                            <div style={{ padding:'0 12px', borderRadius:12, background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)', border:isDark?'1px solid rgba(255,255,255,0.07)':'1px solid rgba(0,0,0,0.07)', display:'flex', alignItems:'center', gap:8 }}>
                                                                <div style={{ textAlign:'center' }}>
                                                                    <p style={{ fontSize:8, color:'#475569', letterSpacing:1, textTransform:'uppercase', margin:0, fontWeight:700 }}>LIMIT</p>
                                                                    <p style={{ fontSize:11, color:isDark?'#94a3b8':'#334155', fontWeight:700, margin:0, fontFamily:"'Space Mono',monospace" }}>{c.creditLimit?`₹${(c.creditLimit/1000).toFixed(0)}K`:'—'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ═══ LOANS TAB ══════════════════════════════════════════ */}
                            {activeTab === 'loans' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {[
                                            {label:'Total',count:loans.length,color:'text-blue-500',bg:isDark?'bg-gray-900':'bg-white'},
                                            {label:'Pending',count:loans.filter(l=>l.status==='PENDING').length,color:'text-amber-500',bg:isDark?'bg-amber-950/40':'bg-amber-50'},
                                            {label:'Active',count:loans.filter(l=>l.status==='ACTIVE').length,color:'text-emerald-500',bg:isDark?'bg-emerald-950/40':'bg-emerald-50'},
                                            {label:'Rejected',count:loans.filter(l=>l.status==='REJECTED').length,color:'text-red-500',bg:isDark?'bg-red-950/40':'bg-red-50'},
                                            {label:'Closed',count:loans.filter(l=>l.status==='CLOSED').length,color:'text-gray-500',bg:isDark?'bg-gray-900':'bg-white'},
                                        ].map(s=>(
                                            <button key={s.label} onClick={()=>setLoanFilter(s.label==='Total'?'ALL':s.label.toUpperCase())}
                                                    className={`p-4 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md text-left ${s.bg} ${loanFilter===(s.label==='Total'?'ALL':s.label.toUpperCase())?'ring-2 ring-blue-500/50 border-blue-500/30':isDark?'border-gray-800':'border-gray-100'}`}>
                                                <p className={`text-2xl font-bold syne ${s.color}`}>{s.count}</p>
                                                <p className={`text-xs mt-1 font-medium ${isDark?'text-gray-400':'text-gray-500'}`}>{s.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {['ALL','PENDING','ACTIVE','APPROVED','REJECTED','CLOSED'].map(f=>(
                                            <button key={f} onClick={()=>setLoanFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${loanFilter===f?'bg-blue-600 text-white shadow-md shadow-blue-600/30':isDark?'bg-gray-800 text-gray-400 hover:text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                                {f==='ALL'?'All Loans':f.charAt(0)+f.slice(1).toLowerCase()}
                                            </button>
                                        ))}
                                        <span className={`ml-auto text-xs py-1.5 px-3 rounded-full font-medium ${isDark?'bg-gray-800 text-gray-400':'bg-gray-100 text-gray-500'}`}>{filteredLoans.length} loan{filteredLoans.length!==1?'s':''}</span>
                                    </div>
                                    {filteredLoans.length===0?(
                                        <div className={`text-center py-14 rounded-2xl border-2 border-dashed ${isDark?'border-gray-800 text-gray-500':'border-gray-200 text-gray-400'}`}>
                                            <Building2 size={40} className="mx-auto mb-3 opacity-30"/>
                                            <p className="font-medium">No loans found</p>
                                        </div>
                                    ):(
                                        <div className="space-y-3">
                                            {filteredLoans.map((l,idx)=>{
                                                const lType=LOAN_TYPES[l.loanType]||LOAN_TYPES['PERSONAL'];
                                                const st=LOAN_STATUS_CFG[l.status]||LOAN_STATUS_CFG['PENDING'];
                                                const isExp=expandedLoanId===l.id;
                                                return (
                                                    <div key={l.id} className={`loan-card rounded-2xl overflow-hidden border ${isExp?isDark?'border-blue-500/30 shadow-lg shadow-blue-500/10':'border-blue-200 shadow-lg shadow-blue-100':isDark?'border-gray-800':'border-gray-100'} ${isDark?'bg-gray-900':'bg-white'}`} style={{animation:`fadeUp .4s ${idx*.04}s ease both`}}>
                                                        <div style={{height:3,background:lType.grad,position:'relative',overflow:'hidden'}}><div className="loan-top-shimmer"/></div>
                                                        <div className="p-4 cursor-pointer" onClick={()=>setExpandedLoanId(isExp?null:l.id)}>
                                                            <div className="flex items-center justify-between flex-wrap gap-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div style={{width:42,height:42,borderRadius:12,background:lType.grad,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 14px ${lType.glow}`,color:'#fff',flexShrink:0}}>{lType.icon}</div>
                                                                    <div>
                                                                        <p className={`font-semibold text-sm ${isDark?'text-white':'text-gray-900'}`}>{l.customerName}</p>
                                                                        <p className={`text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>{l.customerEmail} · {l.customerPhone}</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:isDark?`${lType.accent}20`:`${lType.accent}15`,color:lType.accent,fontWeight:700,border:`1px solid ${lType.accent}40`}}>{lType.label}</span>
                                                                            <span className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>{l.accountNumber}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <div className="text-right">
                                                                        <p className={`text-lg font-bold ${isDark?'text-white':'text-gray-900'}`} style={{fontFamily:'Syne,sans-serif'}}>₹{(l.loanAmount??0).toLocaleString('en-IN')}</p>
                                                                        <p className={`text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>EMI <span style={{color:lType.accent,fontWeight:700}}>₹{(l.emiAmount??0).toLocaleString('en-IN')}/mo</span></p>
                                                                    </div>
                                                                    <div style={{display:'flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:20,background:isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)',border:`1px solid ${st.dot}44`}}>
                                                                        <span style={{width:6,height:6,borderRadius:'50%',background:st.dot,animation:l.status==='PENDING'?'glow 2s ease-in-out infinite':'none'}}/>
                                                                        <span style={{fontSize:11,fontWeight:700,color:st.dot}}>{st.label}</span>
                                                                    </div>
                                                                    {l.status==='PENDING'&&(
                                                                        <div className="flex gap-2" onClick={e=>e.stopPropagation()}>
                                                                            <button onClick={()=>approveLoan(l.id)} className="quick-btn flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-md shadow-emerald-500/20 font-semibold"><Check size={13}/> Approve</button>
                                                                            <button onClick={()=>rejectLoan(l.id)} className="quick-btn flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-md shadow-red-500/20 font-semibold"><X size={13}/> Reject</button>
                                                                        </div>
                                                                    )}
                                                                    <div style={{color:isDark?'#475569':'#94a3b8'}}>{isExp?<ChevronUp size={15}/>:<ChevronDown size={15}/>}</div>
                                                                </div>
                                                            </div>
                                                            {l.status==='ACTIVE'&&!isExp&&<div className="mt-3"><LoanProgressBar paid={l.paidAmount??0} total={l.loanAmount??0}/></div>}
                                                        </div>
                                                        {isExp&&(
                                                            <div className={`ln-expand border-t px-4 pb-5 pt-4 ${isDark?'border-gray-800 bg-gray-900/60':'border-gray-100 bg-slate-50/60'}`}>
                                                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                                                                    {[
                                                                        {label:'Loan Amount',value:`₹${(l.loanAmount??0).toLocaleString('en-IN')}`,color:lType.accent},
                                                                        {label:'Disbursed',value:`₹${(l.disbursedAmount??0).toLocaleString('en-IN')}`,color:'#38bdf8'},
                                                                        {label:'Outstanding',value:`₹${(l.outstandingAmount??0).toLocaleString('en-IN')}`,color:'#f87171'},
                                                                        {label:'Paid So Far',value:`₹${(l.paidAmount??0).toLocaleString('en-IN')}`,color:'#34d399'},
                                                                        {label:'Interest Rate',value:`${l.interestRate??'—'}% p.a.`,color:'#fbbf24'},
                                                                        {label:'Tenure',value:l.tenureInYears??`${l.tenureMonths} mo`,color:'#a78bfa'},
                                                                    ].map(tile=>(
                                                                        <div key={tile.label} style={{padding:'10px 12px',borderRadius:12,background:isDark?'rgba(255,255,255,.04)':'#fff',border:isDark?'1px solid rgba(255,255,255,.07)':'1px solid rgba(0,0,0,.07)'}}>
                                                                            <p style={{fontSize:9,fontWeight:700,color:isDark?'#475569':'#94a3b8',letterSpacing:.6,textTransform:'uppercase',marginBottom:4}}>{tile.label}</p>
                                                                            <p style={{fontSize:12.5,fontWeight:700,color:tile.color,fontFamily:'Syne,sans-serif'}}>{tile.value}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {l.status==='ACTIVE'&&<div className="mb-4"><LoanProgressBar paid={l.paidAmount??0} total={l.loanAmount??0}/></div>}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                                                                    {[
                                                                        {lbl:'Purpose',val:l.purpose||'—',color:isDark?'#cbd5e1':'#334155'},
                                                                        {lbl:'Applied On',val:formatDate(l.appliedAt),color:isDark?'#94a3b8':'#64748b'},
                                                                        {lbl:'Approved On',val:formatDate(l.approvedAt),color:'#34d399'},
                                                                    ].map(({lbl,val,color})=>(
                                                                        <div key={lbl} style={{padding:'10px 12px',borderRadius:12,background:isDark?'rgba(255,255,255,.04)':'#fff',border:isDark?'1px solid rgba(255,255,255,.07)':'1px solid rgba(0,0,0,.07)'}}>
                                                                            <p style={{fontSize:9,fontWeight:700,color:isDark?'#475569':'#94a3b8',letterSpacing:.6,textTransform:'uppercase',marginBottom:4}}>{lbl}</p>
                                                                            <p style={{fontSize:11.5,color,fontWeight:500}}>{val}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {l.status==='PENDING'&&<div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:10,padding:'12px 14px',borderRadius:14,background:isDark?'rgba(251,191,36,.06)':'rgba(251,191,36,.06)',border:'1px solid rgba(251,191,36,.2)'}}><span style={{fontSize:12,color:isDark?'#94a3b8':'#64748b'}}>⏳ Awaiting your decision</span><button onClick={()=>approveLoan(l.id)} className="quick-btn flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-4 py-2 rounded-xl font-semibold shadow-md shadow-emerald-500/20"><Check size={13}/> Approve Loan</button><button onClick={()=>rejectLoan(l.id)} className="quick-btn flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-2 rounded-xl font-semibold shadow-md shadow-red-500/20"><X size={13}/> Reject</button></div>}
                                                                {l.status==='ACTIVE'&&<div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:14,background:isDark?'rgba(52,211,153,.06)':'rgba(52,211,153,.05)',border:'1px solid rgba(52,211,153,.2)'}}><Check size={13} color="#34d399"/><span style={{fontSize:12,color:'#34d399',fontWeight:600}}>Loan active — Customer is repaying EMIs of ₹{(l.emiAmount??0).toLocaleString('en-IN')}/month</span></div>}
                                                                {l.status==='CLOSED'&&<div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:14,background:'rgba(52,211,153,.06)',border:'1px solid rgba(52,211,153,.2)'}}><Check size={13} color="#34d399"/><span style={{fontSize:12,color:'#34d399',fontWeight:600}}>Fully repaid — Total paid: ₹{(l.paidAmount??0).toLocaleString('en-IN')}</span></div>}
                                                                {l.status==='REJECTED'&&<div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:14,background:'rgba(248,113,113,.06)',border:'1px solid rgba(248,113,113,.2)'}}><X size={13} color="#f87171"/><span style={{fontSize:12,color:'#f87171',fontWeight:500}}>Application was rejected</span></div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ═══ FDs TAB — LUXURY GOLD CERTIFICATE DESIGN ══════════ */}
                            {activeTab === 'fds' && (
                                <div style={{fontFamily:"'Outfit',sans-serif"}}>
                                    {/* Header */}
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
                                        <div>
                                            <h2 className="gold-text" style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',margin:0}}>
                                                Fixed Deposits
                                            </h2>
                                            <p style={{fontSize:12,color:'#92400e',marginTop:3,fontWeight:600}}>
                                                {fds.length} certificates · Total corpus ₹{fds.reduce((s,f)=>s+(f.principalAmount||0),0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                                            {[
                                                {label:'Active',count:fds.filter(f=>f.status==='ACTIVE').length,c:'#34d399'},
                                                {label:'Matured',count:fds.filter(f=>f.status==='MATURED').length,c:'#fbbf24'},
                                                {label:'Closed',count:fds.filter(f=>f.status==='CLOSED').length,c:'#94a3b8'},
                                            ].map(s=>(
                                                <div key={s.label} style={{padding:'7px 16px',borderRadius:40,background:`${s.c}15`,border:`1px solid ${s.c}40`,display:'flex',alignItems:'center',gap:7}}>
                                                    <span style={{width:7,height:7,borderRadius:'50%',background:s.c,display:'block',boxShadow:`0 0 8px ${s.c}`}}/>
                                                    <span style={{fontSize:17,fontWeight:800,color:s.c,fontFamily:"'Outfit',sans-serif"}}>{s.count}</span>
                                                    <span style={{fontSize:10,color:'#64748b',fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {fds.length===0 && (
                                        <div style={{textAlign:'center',padding:'80px 0'}}>
                                            <div style={{fontSize:52,marginBottom:12,opacity:0.25}}>🏦</div>
                                            <p style={{fontSize:15,fontWeight:600,color:'#64748b'}}>No Fixed Deposits found</p>
                                        </div>
                                    )}

                                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))',gap:22}}>
                                        {fds.map((fd,idx)=>{
                                            const isActive=fd.status==='ACTIVE', isMature=fd.status==='MATURED';
                                            const returns=(fd.maturityAmount||0)-(fd.principalAmount||0);
                                            const returnPct=fd.principalAmount>0?((returns/fd.principalAmount)*100).toFixed(1):0;
                                            const matDate=fd.maturityDate?new Date(fd.maturityDate):null;
                                            const daysLeft=matDate?Math.ceil((matDate-new Date())/(86400000)):null;
                                            const statusDot=isActive?'#34d399':isMature?'#fbbf24':'#94a3b8';
                                            return (
                                                <div key={fd.id} className="fd-cert lux-enter" style={{animationDelay:`${idx*55}ms`,borderRadius:22,position:'relative',overflow:'hidden',
                                                    background:isDark?'linear-gradient(150deg,#1a1205 0%,#2d1f08 50%,#1a1205 100%)':'linear-gradient(150deg,#fffbeb 0%,#fef3c7 50%,#fffdf5 100%)',
                                                    border:isDark?'1px solid rgba(251,191,36,0.18)':'1px solid rgba(217,119,6,0.22)',
                                                    boxShadow:isDark?'0 8px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(251,191,36,0.08)':'0 8px 40px rgba(217,119,6,0.12),0 2px 0 rgba(255,255,255,0.8) inset'}}>

                                                    <div className="fd-shine"/>
                                                    {/* Diagonal watermark */}
                                                    <div style={{position:'absolute',inset:0,opacity:isDark?0.025:0.04,backgroundImage:'repeating-linear-gradient(-45deg,transparent,transparent 18px,rgba(217,119,6,1) 18px,rgba(217,119,6,1) 19px)',pointerEvents:'none'}}/>
                                                    {/* Top accent bar */}
                                                    <div style={{height:4,background:'linear-gradient(90deg,#b45309,#f59e0b,#fcd34d,#f59e0b,#b45309)'}}/>
                                                    {/* Bank seal watermark */}
                                                    <div style={{position:'absolute',right:16,top:20,width:48,height:48,borderRadius:'50%',border:`2px solid ${isDark?'rgba(251,191,36,0.15)':'rgba(217,119,6,0.18)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,opacity:0.5}}>🏦</div>

                                                    <div style={{padding:'16px 20px 20px'}}>
                                                        {/* Certificate header */}
                                                        <div style={{marginBottom:14}}>
                                                            <p style={{fontSize:8,fontWeight:800,letterSpacing:3,color:isDark?'rgba(251,191,36,0.45)':'rgba(146,64,14,0.6)',textTransform:'uppercase',margin:'0 0 8px',fontFamily:"'Outfit',sans-serif"}}>CERTIFICATE OF DEPOSIT — SOMNATH BANK</p>
                                                            <div style={{height:1,background:`linear-gradient(90deg,${isDark?'rgba(251,191,36,0.35)':'rgba(217,119,6,0.35)'},transparent)`,marginBottom:12}}/>
                                                            <div style={{display:'flex',alignItems:'center',gap:12}}>
                                                                <div style={{width:44,height:44,borderRadius:14,flexShrink:0,
                                                                    background:isDark?'linear-gradient(135deg,#92400e,#b45309)':'linear-gradient(135deg,#d97706,#f59e0b)',
                                                                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,
                                                                    boxShadow:isDark?'0 4px 12px rgba(0,0,0,0.4)':'0 4px 12px rgba(217,119,6,0.3)'}}>
                                                                    👤
                                                                </div>
                                                                <div>
                                                                    <p style={{fontSize:16,fontWeight:800,color:isDark?'#fcd34d':'#78350f',margin:0,fontFamily:"'Outfit',sans-serif"}}>{fd.customerName}</p>
                                                                    <p style={{fontSize:10,color:isDark?'rgba(251,191,36,0.5)':'#92400e',margin:'2px 0 0',fontWeight:700,letterSpacing:0.5}}>FD No. {fd.fdNumber}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Principal → Maturity */}
                                                        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',alignItems:'center',gap:8,marginBottom:14}}>
                                                            <div style={{padding:'12px 14px',borderRadius:14,background:isDark?'rgba(251,191,36,0.07)':'rgba(217,119,6,0.07)',border:isDark?'1px solid rgba(251,191,36,0.12)':'1px solid rgba(217,119,6,0.15)'}}>
                                                                <p style={{fontSize:8,fontWeight:800,color:isDark?'rgba(251,191,36,0.5)':'#92400e',letterSpacing:1.5,textTransform:'uppercase',margin:'0 0 4px'}}>Principal</p>
                                                                <p style={{fontSize:19,fontWeight:800,color:isDark?'#fcd34d':'#78350f',margin:0,fontFamily:"'Outfit',sans-serif"}}>₹{(fd.principalAmount||0).toLocaleString('en-IN')}</p>
                                                            </div>
                                                            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                                                                <span style={{fontSize:18,color:isDark?'rgba(251,191,36,0.4)':'rgba(217,119,6,0.5)'}}>→</span>
                                                                <span style={{fontSize:8,color:'#64748b',fontWeight:700,letterSpacing:1}}>{fd.tenureYears||'?'}Y</span>
                                                            </div>
                                                            <div style={{padding:'12px 14px',borderRadius:14,background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.2)'}}>
                                                                <p style={{fontSize:8,fontWeight:800,color:'#059669',letterSpacing:1.5,textTransform:'uppercase',margin:'0 0 4px'}}>Maturity</p>
                                                                <p style={{fontSize:19,fontWeight:800,color:'#10b981',margin:0,fontFamily:"'Outfit',sans-serif"}}>₹{(fd.maturityAmount||0).toLocaleString('en-IN')}</p>
                                                            </div>
                                                        </div>

                                                        {/* Returns strip */}
                                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',borderRadius:10,background:'rgba(52,211,153,0.06)',border:'1px solid rgba(52,211,153,0.18)',marginBottom:14}}>
                                                            <span style={{fontSize:12,color:'#10b981',fontWeight:700}}>📈 Returns: +₹{returns.toLocaleString('en-IN')}</span>
                                                            <span style={{fontSize:11,color:'#34d399',fontWeight:800,background:'rgba(52,211,153,0.15)',padding:'2px 10px',borderRadius:20}}>+{returnPct}%</span>
                                                        </div>

                                                        {/* Details chips */}
                                                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
                                                            {[
                                                                {label:'Tenure',value:`${fd.tenureYears||'—'} yr`},
                                                                {label:'Interest',value:`${fd.interestRate||'—'}% p.a.`},
                                                                {label:'Type',value:fd.fdType||fd.compoundingFrequency||'Regular'},
                                                            ].map(item=>(
                                                                <div key={item.label} style={{padding:'9px 10px',borderRadius:12,background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',border:isDark?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(0,0,0,0.06)',textAlign:'center'}}>
                                                                    <p style={{fontSize:8,fontWeight:700,color:'#64748b',letterSpacing:1,textTransform:'uppercase',margin:'0 0 3px'}}>{item.label}</p>
                                                                    <p style={{fontSize:12,fontWeight:800,color:isDark?'#fcd34d':'#92400e',margin:0,fontFamily:"'Outfit',sans-serif"}}>{item.value}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Date timeline */}
                                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:daysLeft!==null&&isActive?12:0}}>
                                                            <div>
                                                                <p style={{fontSize:8,color:'#64748b',fontWeight:700,letterSpacing:1,textTransform:'uppercase',margin:'0 0 2px'}}>ISSUE DATE</p>
                                                                <p style={{fontSize:11,color:isDark?'#94a3b8':'#475569',fontWeight:600,margin:0}}>{fd.startDate||'—'}</p>
                                                            </div>
                                                            <div style={{flex:1,margin:'0 12px',height:1,background:`linear-gradient(90deg,${isDark?'rgba(251,191,36,0.2)':'rgba(217,119,6,0.2)'},${isDark?'rgba(251,191,36,0.5)':'rgba(217,119,6,0.5)'},${isDark?'rgba(251,191,36,0.2)':'rgba(217,119,6,0.2)'})`}}/>
                                                            <div style={{textAlign:'right'}}>
                                                                <p style={{fontSize:8,color:'#64748b',fontWeight:700,letterSpacing:1,textTransform:'uppercase',margin:'0 0 2px'}}>MATURITY DATE</p>
                                                                <p style={{fontSize:11,color:isDark?'#fcd34d':'#b45309',fontWeight:700,margin:0}}>{fd.maturityDate||'—'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Days left */}
                                                        {isActive&&daysLeft!==null&&(
                                                            <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:10,marginTop:10,marginBottom:2,
                                                                background:daysLeft<30?'rgba(239,68,68,0.07)':'rgba(99,102,241,0.07)',
                                                                border:daysLeft<30?'1px solid rgba(239,68,68,0.2)':'1px solid rgba(99,102,241,0.18)'}}>
                                                                <span style={{fontSize:14}}>{daysLeft<30?'⚠️':'⏳'}</span>
                                                                <span style={{fontSize:11,color:daysLeft<30?'#f87171':'#818cf8',fontWeight:700}}>
                                                                    {daysLeft>0?`${daysLeft} days until maturity`:'Matures today!'}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Footer status */}
                                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:14,paddingTop:12,borderTop:isDark?'1px solid rgba(255,255,255,0.05)':'1px solid rgba(0,0,0,0.05)'}}>
                                                            <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:20,background:`${statusDot}15`,border:`1px solid ${statusDot}40`}}>
                                                                <span className={isActive?'status-blink':''} style={{width:6,height:6,borderRadius:'50%',background:statusDot,display:'block',boxShadow:`0 0 6px ${statusDot}`}}/>
                                                                <span style={{fontSize:10,fontWeight:800,color:statusDot,letterSpacing:1,textTransform:'uppercase'}}>{fd.status}</span>
                                                            </div>
                                                            <span style={{fontSize:9,color:'#64748b',fontWeight:600,letterSpacing:0.5}}>A/C {fd.accountNumber||'—'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ═══ CUSTOMERS TAB — LUXURY PROFILE CARDS ══════════════ */}
                            {activeTab === 'customers' && (
                                <div style={{fontFamily:"'Outfit',sans-serif"}}>
                                    {/* Header */}
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
                                        <div>
                                            <h2 style={{fontSize:24,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0,letterSpacing:'-0.5px'}}>
                                                Customer Registry
                                            </h2>
                                            <p style={{fontSize:12,color:'#64748b',marginTop:3,fontWeight:500}}>{customers.length} registered members</p>
                                        </div>
                                        <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
                                            {[
                                                {label:'Active',count:customers.filter(c=>c.isActive).length,c:'#34d399'},
                                                {label:'KYC Verified',count:customers.filter(c=>c.kycStatus==='VERIFIED').length,c:'#60a5fa'},
                                                {label:'KYC Pending',count:customers.filter(c=>!c.kycStatus||c.kycStatus==='PENDING').length,c:'#fbbf24'},
                                            ].map(s=>(
                                                <div key={s.label} style={{padding:'7px 14px',borderRadius:40,background:`${s.c}12`,border:`1px solid ${s.c}38`,display:'flex',alignItems:'center',gap:7}}>
                                                    <span style={{width:7,height:7,borderRadius:'50%',background:s.c,display:'block',boxShadow:`0 0 7px ${s.c}`}}/>
                                                    <span style={{fontSize:16,fontWeight:800,color:s.c}}>{s.count}</span>
                                                    <span style={{fontSize:10,color:'#64748b',fontWeight:700,letterSpacing:0.8,textTransform:'uppercase'}}>{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {customers.length===0&&(
                                        <div style={{textAlign:'center',padding:'80px 0'}}>
                                            <div style={{fontSize:52,marginBottom:12,opacity:0.25}}>👥</div>
                                            <p style={{fontSize:15,fontWeight:600,color:'#64748b'}}>No customers found</p>
                                        </div>
                                    )}

                                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
                                        {customers.map((c,idx)=>{
                                            const palette=['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#f97316','#6366f1'];
                                            const ac=palette[c.id%palette.length];
                                            const initials=(c.fullName||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
                                            const kycCfg={
                                                VERIFIED: {bg:'rgba(52,211,153,0.1)',border:'rgba(52,211,153,0.3)',text:'#34d399',label:'✓ VERIFIED'},
                                                PENDING:  {bg:'rgba(251,191,36,0.1)',border:'rgba(251,191,36,0.3)',text:'#fbbf24',label:'⏳ PENDING'},
                                                REJECTED: {bg:'rgba(248,113,113,0.1)',border:'rgba(248,113,113,0.3)',text:'#f87171',label:'✕ REJECTED'},
                                                SUBMITTED:{bg:'rgba(96,165,250,0.1)',border:'rgba(96,165,250,0.3)',text:'#60a5fa',label:'📤 SUBMITTED'},
                                            };
                                            const kyc=kycCfg[c.kycStatus]||kycCfg['PENDING'];
                                            return (
                                                <div key={c.id} className="cust-card lux-enter"
                                                     style={{animationDelay:`${idx*40}ms`,borderRadius:20,overflow:'hidden',
                                                         background:isDark?'linear-gradient(145deg,#0f172a,#1a2744)':'#fff',
                                                         border:isDark?`1px solid rgba(255,255,255,0.07)`:`1px solid rgba(0,0,0,0.07)`,
                                                         boxShadow:isDark?`0 4px 28px rgba(0,0,0,0.45),0 0 0 1px ${ac}18`:`0 4px 28px rgba(0,0,0,0.07),0 0 0 1px ${ac}15`}}>

                                                    {/* Colored accent top */}
                                                    <div style={{height:3,background:`linear-gradient(90deg,${ac},${ac}88,transparent)`}}/>

                                                    <div style={{padding:'18px 18px 16px'}}>
                                                        {/* Avatar + Name row */}
                                                        <div style={{display:'flex',alignItems:'flex-start',gap:13,marginBottom:14}}>
                                                            <div className="cust-avatar" style={{width:54,height:54,borderRadius:16,flexShrink:0,
                                                                background:`linear-gradient(135deg,${ac},${ac}aa)`,
                                                                border:`2px solid ${ac}44`,
                                                                display:'flex',alignItems:'center',justifyContent:'center',
                                                                fontSize:19,fontWeight:800,color:'#fff',letterSpacing:-0.5,
                                                                boxShadow:`0 4px 16px ${ac}35`,fontFamily:"'Outfit',sans-serif"}}>
                                                                {initials}
                                                            </div>
                                                            <div style={{flex:1,minWidth:0}}>
                                                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:6,marginBottom:3}}>
                                                                    <p style={{fontSize:15,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:"'Outfit',sans-serif"}}>{c.fullName}</p>
                                                                    <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                                                                        <span className={c.isActive?'status-blink':''} style={{width:6,height:6,borderRadius:'50%',background:c.isActive?'#34d399':'#f87171',display:'block',boxShadow:c.isActive?'0 0 6px #34d399':'none'}}/>
                                                                        <span style={{fontSize:9,fontWeight:800,color:c.isActive?'#34d399':'#f87171',letterSpacing:1,textTransform:'uppercase'}}>{c.isActive?'ACTIVE':'INACTIVE'}</span>
                                                                    </div>
                                                                </div>
                                                                <p style={{fontSize:11,color:'#64748b',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.email}</p>
                                                                <p style={{fontSize:11,color:isDark?'#475569':'#94a3b8',margin:0}}>📞 {c.phone}</p>
                                                            </div>
                                                        </div>

                                                        {/* Info pills */}
                                                        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:13}}>
                                                            {c.city&&<span style={{fontSize:10,padding:'3px 10px',borderRadius:20,background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',color:isDark?'#94a3b8':'#64748b',fontWeight:600}}>📍 {c.city}{c.state?`, ${c.state}`:''}</span>}
                                                            {c.accountType&&<span style={{fontSize:10,padding:'3px 10px',borderRadius:20,background:`${ac}18`,color:ac,fontWeight:700,border:`1px solid ${ac}35`}}>🏦 {c.accountType}</span>}
                                                            {c.gender&&<span style={{fontSize:10,padding:'3px 10px',borderRadius:20,background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',color:isDark?'#94a3b8':'#64748b',fontWeight:600}}>{c.gender==='MALE'?'♂':'♀'} {c.gender}</span>}
                                                        </div>

                                                        {/* KYC + Action */}
                                                        <div style={{height:1,background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)',margin:'0 0 12px'}}/>
                                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                                                            <div style={{position:'relative',display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:20,background:kyc.bg,border:`1px solid ${kyc.border}`}}>
                                                                <span style={{fontSize:10,fontWeight:800,color:kyc.text,letterSpacing:0.8}}>{kyc.label}</span>
                                                            </div>
                                                            {c.kycStatus!=='VERIFIED'&&(
                                                                <button onClick={()=>requestKycDocs(c.id)} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:10,border:'none',cursor:'pointer',
                                                                    background:`linear-gradient(135deg,${ac},${ac}bb)`,color:'#fff',fontSize:10,fontWeight:800,
                                                                    boxShadow:`0 3px 12px ${ac}40`,transition:'all 0.2s',fontFamily:"'Outfit',sans-serif",whiteSpace:'nowrap'}}>
                                                                    📄 Request KYC
                                                                </button>
                                                            )}
                                                        </div>

                                                        {c.createdAt&&<p style={{fontSize:9,color:'#475569',margin:'10px 0 0',fontWeight:600,letterSpacing:0.5,textTransform:'uppercase'}}>
                                                            Member since {new Date(c.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}
                                                        </p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ═══ KYC TAB — LUXURY VERIFICATION CARDS ═══════════════ */}
                            {activeTab === 'kyc' && (
                                <div style={{fontFamily:"'Outfit',sans-serif"}}>
                                    {/* Header */}
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
                                        <div>
                                            <h2 style={{fontSize:24,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0,letterSpacing:'-0.5px'}}>KYC Verification</h2>
                                            <p style={{fontSize:12,color:'#64748b',marginTop:3,fontWeight:500}}>{kycList.length} verification requests</p>
                                        </div>
                                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                                            {[
                                                {label:'Pending Upload',count:kycList.filter(k=>k.status==='PENDING_UPLOAD').length,c:'#fbbf24'},
                                                {label:'Submitted',count:kycList.filter(k=>k.status==='SUBMITTED').length,c:'#60a5fa'},
                                                {label:'Approved',count:kycList.filter(k=>k.status==='APPROVED').length,c:'#34d399'},
                                                {label:'Rejected',count:kycList.filter(k=>k.status==='REJECTED'||k.status==='RE_SUBMIT').length,c:'#f87171'},
                                            ].map(s=>(
                                                <div key={s.label} style={{padding:'6px 13px',borderRadius:40,background:`${s.c}12`,border:`1px solid ${s.c}38`,display:'flex',alignItems:'center',gap:6}}>
                                                    <span style={{width:6,height:6,borderRadius:'50%',background:s.c,boxShadow:`0 0 6px ${s.c}`}}/>
                                                    <span style={{fontSize:14,fontWeight:800,color:s.c}}>{s.count}</span>
                                                    <span style={{fontSize:9,color:'#64748b',fontWeight:700,letterSpacing:0.5,textTransform:'uppercase'}}>{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {kycList.length===0 && (
                                        <div style={{textAlign:'center',padding:'80px 0'}}>
                                            <div style={{fontSize:52,marginBottom:12,opacity:0.25}}>🪪</div>
                                            <p style={{fontSize:15,fontWeight:600,color:'#64748b'}}>No KYC requests yet</p>
                                        </div>
                                    )}

                                    <div style={{display:'flex',flexDirection:'column',gap:14}}>
                                        {kycList.map((k,idx)=>{
                                            const kycStatusCfg={
                                                APPROVED:      {c:'#34d399',bg:'rgba(52,211,153,0.1)',   border:'rgba(52,211,153,0.3)',   label:'✓ APPROVED',    icon:'🟢'},
                                                SUBMITTED:     {c:'#60a5fa',bg:'rgba(96,165,250,0.1)',   border:'rgba(96,165,250,0.3)',   label:'📤 SUBMITTED',  icon:'🔵'},
                                                PENDING_UPLOAD:{c:'#fbbf24',bg:'rgba(251,191,36,0.1)',   border:'rgba(251,191,36,0.3)',   label:'⏳ PENDING',    icon:'🟡'},
                                                REJECTED:      {c:'#f87171',bg:'rgba(248,113,113,0.1)',  border:'rgba(248,113,113,0.3)',  label:'✕ REJECTED',   icon:'🔴'},
                                                RE_SUBMIT:     {c:'#fb923c',bg:'rgba(251,146,60,0.1)',   border:'rgba(251,146,60,0.3)',   label:'↩ RE-SUBMIT',  icon:'🟠'},
                                            };
                                            const sc=kycStatusCfg[k.status]||kycStatusCfg['PENDING_UPLOAD'];
                                            const docs=[
                                                {key:'hasAadhar',label:'Aadhar',icon:'🪪'},
                                                {key:'hasPan',label:'PAN Card',icon:'💳'},
                                                {key:'hasPhoto',label:'Photo',icon:'🖼️'},
                                                {key:'hasSignature',label:'Signature',icon:'✍️'},
                                            ];
                                            const docsCount=docs.filter(d=>k[d.key]).length;
                                            const completionPct=Math.round((docsCount/4)*100);
                                            return (
                                                <div key={k.id} className="cust-card lux-enter" style={{animationDelay:`${idx*45}ms`,borderRadius:20,overflow:'hidden',
                                                    background:isDark?'linear-gradient(150deg,#0f172a,#1a2236)':'#fff',
                                                    border:isDark?`1px solid rgba(255,255,255,0.07)`:`1px solid rgba(0,0,0,0.07)`,
                                                    boxShadow:isDark?`0 4px 28px rgba(0,0,0,0.4),0 0 0 1px ${sc.c}10`:`0 4px 28px rgba(0,0,0,0.07),0 0 0 1px ${sc.c}12`}}>
                                                    <div style={{height:3,background:`linear-gradient(90deg,${sc.c},${sc.c}66,transparent)`}}/>
                                                    <div style={{padding:'18px 20px 18px'}}>
                                                        {/* Top row: identity + status */}
                                                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:16}}>
                                                            <div style={{display:'flex',alignItems:'center',gap:13}}>
                                                                {/* Avatar */}
                                                                <div style={{width:50,height:50,borderRadius:16,background:`linear-gradient(135deg,${sc.c}cc,${sc.c}77)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:`0 4px 14px ${sc.c}40`}}>
                                                                    🪪
                                                                </div>
                                                                <div>
                                                                    <p style={{fontSize:15,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0}}>{k.customerName}</p>
                                                                    <p style={{fontSize:11,color:'#64748b',margin:'3px 0 0'}}>{k.email}</p>
                                                                    {k.phone&&<p style={{fontSize:11,color:isDark?'#475569':'#94a3b8',margin:'2px 0 0'}}>📞 {k.phone}</p>}
                                                                </div>
                                                            </div>
                                                            <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 13px',borderRadius:20,background:sc.bg,border:`1px solid ${sc.border}`,flexShrink:0}}>
                                                                <span className={k.status==='SUBMITTED'?'status-blink':''} style={{width:7,height:7,borderRadius:'50%',background:sc.c,boxShadow:`0 0 7px ${sc.c}`}}/>
                                                                <span style={{fontSize:10,fontWeight:800,color:sc.c,letterSpacing:0.8}}>{sc.label}</span>
                                                            </div>
                                                        </div>

                                                        {/* Document completeness bar */}
                                                        <div style={{marginBottom:14}}>
                                                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                                                                <span style={{fontSize:10,fontWeight:700,color:'#64748b',letterSpacing:0.8,textTransform:'uppercase'}}>Document Completeness</span>
                                                                <span style={{fontSize:11,fontWeight:800,color:completionPct===100?'#34d399':completionPct>=50?'#fbbf24':'#f87171'}}>{completionPct}%</span>
                                                            </div>
                                                            <div style={{height:5,borderRadius:10,background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)',overflow:'hidden'}}>
                                                                <div style={{height:'100%',borderRadius:10,width:`${completionPct}%`,background:completionPct===100?'linear-gradient(90deg,#059669,#34d399)':completionPct>=50?'linear-gradient(90deg,#d97706,#fbbf24)':'linear-gradient(90deg,#dc2626,#f87171)',transition:'width 1s cubic-bezier(0.34,1.56,0.64,1)'}}/>
                                                            </div>
                                                        </div>

                                                        {/* Document pills */}
                                                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:16}}>
                                                            {docs.map(doc=>(
                                                                <div key={doc.key} style={{padding:'9px 8px',borderRadius:12,textAlign:'center',
                                                                    background:k[doc.key]?isDark?'rgba(52,211,153,0.1)':'rgba(16,185,129,0.07)':isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',
                                                                    border:k[doc.key]?'1px solid rgba(52,211,153,0.3)':isDark?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(0,0,0,0.06)',
                                                                    transition:'all 0.3s ease'}}>
                                                                    <div style={{fontSize:16,marginBottom:4}}>{k[doc.key]?doc.icon:'⬜'}</div>
                                                                    <p style={{fontSize:9,fontWeight:700,color:k[doc.key]?'#34d399':'#64748b',margin:0,letterSpacing:0.5,textTransform:'uppercase'}}>{doc.label}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Action */}
                                                        <div style={{display:'flex',gap:8}}>
                                                            {k.status==='SUBMITTED'&&(
                                                                <button onClick={()=>viewKycDocs(k.id)} style={{flex:1,padding:'9px 0',borderRadius:12,border:'none',cursor:'pointer',
                                                                    background:'linear-gradient(135deg,#1d4ed8,#3b82f6)',color:'#fff',fontSize:12,fontWeight:800,
                                                                    boxShadow:'0 4px 14px rgba(59,130,246,0.4)',transition:'all 0.2s',letterSpacing:0.5,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                                                                    🔍 Review Documents
                                                                </button>
                                                            )}
                                                            {(k.status==='PENDING_UPLOAD'||k.status==='REJECTED'||k.status==='RE_SUBMIT')&&(
                                                                <div style={{flex:1,padding:'9px 14px',borderRadius:12,background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',border:isDark?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(0,0,0,0.06)',display:'flex',alignItems:'center',gap:7}}>
                                                                    <span style={{fontSize:14}}>⏳</span>
                                                                    <span style={{fontSize:11,color:'#64748b',fontWeight:600}}>Awaiting customer document upload</span>
                                                                </div>
                                                            )}
                                                            {k.status==='APPROVED'&&(
                                                                <div style={{flex:1,padding:'9px 14px',borderRadius:12,background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.2)',display:'flex',alignItems:'center',gap:7}}>
                                                                    <span style={{fontSize:14}}>✅</span>
                                                                    <span style={{fontSize:11,color:'#34d399',fontWeight:700}}>KYC fully verified</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ═══ COMPLAINTS TAB — LUXURY TICKET DESIGN ════════════ */}
                            {activeTab === 'complaints' && (
                                <div style={{fontFamily:"'Outfit',sans-serif"}}>
                                    {/* Header */}
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
                                        <div>
                                            <h2 style={{fontSize:24,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0,letterSpacing:'-0.5px'}}>Customer Complaints</h2>
                                            <p style={{fontSize:12,color:'#64748b',marginTop:3,fontWeight:500}}>{complaints.length} support tickets</p>
                                        </div>
                                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                                            {[
                                                {label:'Open',count:complaints.filter(c=>c.status==='OPEN').length,c:'#fbbf24'},
                                                {label:'In Progress',count:complaints.filter(c=>c.status==='IN_PROGRESS').length,c:'#60a5fa'},
                                                {label:'Resolved',count:complaints.filter(c=>c.status==='RESOLVED').length,c:'#34d399'},
                                                {label:'Closed',count:complaints.filter(c=>c.status==='CLOSED').length,c:'#94a3b8'},
                                            ].map(s=>(
                                                <div key={s.label} style={{padding:'6px 13px',borderRadius:40,background:`${s.c}12`,border:`1px solid ${s.c}38`,display:'flex',alignItems:'center',gap:6}}>
                                                    <span className={s.label==='Open'?'status-blink':''} style={{width:6,height:6,borderRadius:'50%',background:s.c,boxShadow:`0 0 6px ${s.c}`}}/>
                                                    <span style={{fontSize:14,fontWeight:800,color:s.c}}>{s.count}</span>
                                                    <span style={{fontSize:10,color:'#64748b',fontWeight:700,letterSpacing:0.8}}>{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {complaints.length===0&&(
                                        <div style={{textAlign:'center',padding:'80px 0'}}>
                                            <div style={{fontSize:52,marginBottom:12,opacity:0.25}}>💬</div>
                                            <p style={{fontSize:15,fontWeight:600,color:'#64748b'}}>No complaints yet</p>
                                        </div>
                                    )}

                                    <div style={{display:'flex',flexDirection:'column',gap:16}}>
                                        {complaints.map((c,idx)=>{
                                            const stCfg={
                                                OPEN:        {c:'#fbbf24',bg:'rgba(251,191,36,0.1)',   border:'rgba(251,191,36,0.3)',   label:'🔴 OPEN'},
                                                IN_PROGRESS: {c:'#60a5fa',bg:'rgba(96,165,250,0.1)',   border:'rgba(96,165,250,0.3)',   label:'🔵 IN PROGRESS'},
                                                RESOLVED:    {c:'#34d399',bg:'rgba(52,211,153,0.1)',   border:'rgba(52,211,153,0.3)',   label:'✅ RESOLVED'},
                                                CLOSED:      {c:'#94a3b8',bg:'rgba(148,163,184,0.1)',  border:'rgba(148,163,184,0.3)',  label:'🔒 CLOSED'},
                                            };
                                            const st=stCfg[c.status]||stCfg['CLOSED'];
                                            const catCfg={
                                                ACCOUNT:    {emoji:'🏦',color:'#3b82f6'},
                                                CARD:       {emoji:'💳',color:'#8b5cf6'},
                                                LOAN:       {emoji:'💰',color:'#f59e0b'},
                                                TRANSACTION:{emoji:'🔄',color:'#10b981'},
                                                STAFF:      {emoji:'👤',color:'#ec4899'},
                                                TECHNICAL:  {emoji:'🖥️',color:'#06b6d4'},
                                                OTHER:      {emoji:'📋',color:'#64748b'},
                                            };
                                            const cat=catCfg[c.category]||catCfg['OTHER'];
                                            const priorityBorder=c.status==='OPEN'?`0 0 0 1px ${st.c}25`:'none';
                                            return (
                                                <div key={c.id} className="cust-card lux-enter" style={{animationDelay:`${idx*45}ms`,borderRadius:20,overflow:'hidden',
                                                    background:isDark?'linear-gradient(150deg,#0f172a,#1a2236)':'#fff',
                                                    border:isDark?`1px solid rgba(255,255,255,0.07)`:`1px solid rgba(0,0,0,0.07)`,
                                                    boxShadow:isDark?`0 4px 28px rgba(0,0,0,0.4),${priorityBorder}`:`0 4px 28px rgba(0,0,0,0.07),${priorityBorder}`}}>
                                                    <div style={{height:3,background:`linear-gradient(90deg,${st.c},${cat.color},transparent)`}}/>
                                                    <div style={{padding:'18px 20px 18px'}}>
                                                        {/* Ticket header */}
                                                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:14}}>
                                                            <div style={{display:'flex',alignItems:'flex-start',gap:13,flex:1,minWidth:0}}>
                                                                {/* Category icon */}
                                                                <div style={{width:46,height:46,borderRadius:14,background:`linear-gradient(135deg,${cat.color}cc,${cat.color}77)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:`0 4px 12px ${cat.color}40`}}>
                                                                    {cat.emoji}
                                                                </div>
                                                                <div style={{flex:1,minWidth:0}}>
                                                                    <p style={{fontSize:15,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.subject}</p>
                                                                    <div style={{display:'flex',alignItems:'center',gap:8,marginTop:4,flexWrap:'wrap'}}>
                                                                        <span style={{fontSize:10,color:'#64748b',fontWeight:600}}>{c.customerName}</span>
                                                                        <span style={{width:3,height:3,borderRadius:'50%',background:'#475569',display:'inline-block'}}/>
                                                                        <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:`${cat.color}18`,color:cat.color,fontWeight:700,border:`1px solid ${cat.color}35`}}>{cat.emoji} {c.category}</span>
                                                                        <span style={{fontSize:9,color:isDark?'#475569':'#94a3b8',fontWeight:600}}>#{c.id}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:20,background:st.bg,border:`1px solid ${st.border}`,flexShrink:0}}>
                                                                <span className={c.status==='OPEN'?'status-blink':''} style={{width:6,height:6,borderRadius:'50%',background:st.c,boxShadow:`0 0 6px ${st.c}`}}/>
                                                                <span style={{fontSize:10,fontWeight:800,color:st.c,letterSpacing:0.8}}>{st.label}</span>
                                                            </div>
                                                        </div>

                                                        {/* Description */}
                                                        {c.description&&(
                                                            <div style={{padding:'10px 14px',borderRadius:12,background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',border:isDark?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(0,0,0,0.06)',marginBottom:12}}>
                                                                <p style={{fontSize:12,color:isDark?'#cbd5e1':'#475569',lineHeight:1.6,margin:0}}>{c.description}</p>
                                                            </div>
                                                        )}

                                                        {/* Meta row */}
                                                        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14,flexWrap:'wrap'}}>
                                                            <span style={{fontSize:10,color:'#64748b',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>✉ {c.email}</span>
                                                            <span style={{width:3,height:3,borderRadius:'50%',background:'#475569',display:'inline-block'}}/>
                                                            <span style={{fontSize:10,color:'#64748b',fontWeight:600}}>🕐 {formatDate(c.createdAt)}</span>
                                                            {c.accountNumber&&<><span style={{width:3,height:3,borderRadius:'50%',background:'#475569',display:'inline-block'}}/><span style={{fontSize:10,color:'#64748b',fontWeight:600}}>A/C {c.accountNumber}</span></>}
                                                        </div>

                                                        {/* Admin reply preview */}
                                                        {c.adminReply&&(
                                                            <div style={{padding:'10px 14px',borderRadius:12,background:isDark?'rgba(52,211,153,0.06)':'rgba(16,185,129,0.05)',border:'1px solid rgba(52,211,153,0.2)',marginBottom:12}}>
                                                                <p style={{fontSize:9,fontWeight:800,color:'#34d399',letterSpacing:1,textTransform:'uppercase',margin:'0 0 4px'}}>ADMIN RESPONSE</p>
                                                                <p style={{fontSize:12,color:isDark?'#86efac':'#15803d',lineHeight:1.5,margin:0}}>{c.adminReply}</p>
                                                            </div>
                                                        )}

                                                        {/* Action */}
                                                        {c.status!=='RESOLVED'&&c.status!=='CLOSED'&&(
                                                            <button onClick={()=>{setSelectedComplaint(c);setReplyForm({adminReply:c.adminReply||'',status:c.status});setShowReplyModal(true);}}
                                                                    style={{width:'100%',padding:'10px 0',borderRadius:12,border:'none',cursor:'pointer',
                                                                        background:`linear-gradient(135deg,${cat.color},${cat.color}cc)`,
                                                                        color:'#fff',fontSize:12,fontWeight:800,
                                                                        boxShadow:`0 4px 14px ${cat.color}40`,transition:'all 0.2s',letterSpacing:0.5,
                                                                        display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                                                                ✉️ Reply & Update Status
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ═══ TRANSACTIONS TAB ═══════════════════════════════════ */}
                            {activeTab === 'transactions' && (
                                <div>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className={`p-4 rounded-2xl ${isDark?'bg-gray-900':'bg-white'}`}><p className={`text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>Total Credit</p><p className="text-lg font-bold text-emerald-500">+₹{totalCredit.toLocaleString('en-IN')}</p></div>
                                        <div className={`p-4 rounded-2xl ${isDark?'bg-gray-900':'bg-white'}`}><p className={`text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>Total Debit</p><p className="text-lg font-bold text-red-500">-₹{totalDebit.toLocaleString('en-IN')}</p></div>
                                        <div className={`p-4 rounded-2xl ${isDark?'bg-gray-900':'bg-white'}`}><p className={`text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>Total</p><p className={`text-lg font-bold ${isDark?'text-white':'text-gray-900'}`}>{filteredTxns.length}</p></div>
                                    </div>
                                    <div className={`p-4 rounded-2xl mb-4 ${isDark?'bg-gray-900':'bg-white'}`}>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <input type="text" placeholder="Search ref/description..." value={txnFilters.search} onChange={e=>setTxnFilters({...txnFilters,search:e.target.value})} className={input}/>
                                            <select value={txnFilters.type} onChange={e=>setTxnFilters({...txnFilters,type:e.target.value})} className={input}><option value="ALL">All Types</option><option value="CREDIT">Credit</option><option value="DEBIT">Debit</option></select>
                                            <input type="date" value={txnFilters.fromDate} onChange={e=>setTxnFilters({...txnFilters,fromDate:e.target.value})} className={input}/>
                                            <input type="date" value={txnFilters.toDate} onChange={e=>setTxnFilters({...txnFilters,toDate:e.target.value})} className={input}/>
                                        </div>
                                        {(txnFilters.search||txnFilters.type!=='ALL'||txnFilters.fromDate||txnFilters.toDate)&&<button onClick={()=>setTxnFilters({search:'',type:'ALL',fromDate:'',toDate:''})} className="mt-2 text-xs text-red-500 hover:text-red-400">✕ Clear Filters</button>}
                                    </div>
                                    <div className={`rounded-2xl overflow-hidden ${isDark?'bg-gray-900':'bg-white'}`}>
                                        <div className={`grid grid-cols-5 px-4 py-3 text-xs font-semibold ${isDark?'bg-gray-800 text-gray-400':'bg-gray-50 text-gray-500'}`}><span>Date</span><span>Reference</span><span>Description</span><span className="text-center">Type</span><span className="text-right">Amount</span></div>
                                        {filteredTxns.length===0?<p className={`text-center py-10 ${isDark?'text-gray-400':'text-gray-500'}`}>No transactions found</p>
                                            :filteredTxns.map((txn,i)=>(
                                                <div key={txn.id} className={`txn-row grid grid-cols-5 px-4 py-3 items-center text-sm cursor-pointer ${i%2===0?isDark?'bg-gray-900':'bg-white':isDark?'bg-gray-800/40':'bg-gray-50/50'}`}>
                                                    <span className={`text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>{formatDate(txn.createdAt||txn.transactionDate||txn.date)}</span>
                                                    <span className={`text-xs font-mono ${isDark?'text-gray-400':'text-gray-500'}`}>{txn.referenceNumber}</span>
                                                    <span className={`text-xs truncate ${isDark?'text-gray-300':'text-gray-700'}`}>{txn.description}</span>
                                                    <span className="text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center justify-center gap-1 w-fit mx-auto ${txn.transactionType==='CREDIT'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{txn.transactionType==='CREDIT'?<ArrowDownLeft size={12}/>:<ArrowUpRight size={12}/>}{txn.transactionType}</span></span>
                                                    <span className={`text-right font-semibold text-sm ${txn.transactionType==='CREDIT'?'text-emerald-500':'text-red-500'}`}>{txn.transactionType==='CREDIT'?'+':'-'}₹{txn.amount?.toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* ═══ STAFF TAB — LUXURY EMPLOYEE CARDS ═════════════════ */}
                            {activeTab === 'staff' && (
                                <div style={{fontFamily:"'Outfit',sans-serif"}}>
                                    {/* Header */}
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
                                        <div>
                                            <h2 style={{fontSize:24,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0,letterSpacing:'-0.5px'}}>
                                                Staff Directory
                                            </h2>
                                            <p style={{fontSize:12,color:'#64748b',marginTop:3,fontWeight:500}}>
                                                {staff.length} team members · Monthly payroll ₹{staff.reduce((s,m)=>s+(m.salary||0),0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                                            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                                                {[
                                                    {label:'Active',count:staff.filter(s=>s.status==='ACTIVE').length,c:'#34d399'},
                                                    {label:'On Leave',count:staff.filter(s=>s.status==='ON_LEAVE').length,c:'#a78bfa'},
                                                    {label:'Inactive',count:staff.filter(s=>s.status==='INACTIVE').length,c:'#64748b'},
                                                ].map(s=>(
                                                    <div key={s.label} style={{padding:'6px 13px',borderRadius:40,background:`${s.c}12`,border:`1px solid ${s.c}38`,display:'flex',alignItems:'center',gap:6}}>
                                                        <span style={{width:6,height:6,borderRadius:'50%',background:s.c,boxShadow:`0 0 6px ${s.c}`}}/>
                                                        <span style={{fontSize:14,fontWeight:800,color:s.c}}>{s.count}</span>
                                                        <span style={{fontSize:10,color:'#64748b',fontWeight:700,letterSpacing:0.8}}>{s.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={()=>{resetStaffForm();setEditStaff(null);setShowStaffModal(true);}}
                                                    style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:12,border:'none',cursor:'pointer',
                                                        background:'linear-gradient(135deg,#3b82f6,#6366f1)',color:'#fff',fontSize:13,fontWeight:800,
                                                        boxShadow:'0 4px 16px rgba(99,102,241,0.4)',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',fontFamily:"'Outfit',sans-serif"}}>
                                                <span style={{fontSize:16}}>+</span> Add Staff
                                            </button>
                                        </div>
                                    </div>

                                    {staff.length===0&&(
                                        <div style={{textAlign:'center',padding:'80px 0'}}>
                                            <div style={{fontSize:52,marginBottom:12,opacity:0.25}}>👥</div>
                                            <p style={{fontSize:15,fontWeight:600,color:'#64748b'}}>No staff found. Add one!</p>
                                        </div>
                                    )}

                                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:18}}>
                                        {staff.map((s,idx)=>{
                                            const palette=['#6366f1','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#f97316'];
                                            const ac=palette[s.id%palette.length];
                                            const initials=(s.fullName||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
                                            const statusCfg={
                                                ACTIVE:  {color:'#34d399',label:'ACTIVE',bg:'rgba(52,211,153,0.1)',border:'rgba(52,211,153,0.3)'},
                                                INACTIVE:{color:'#94a3b8',label:'INACTIVE',bg:'rgba(148,163,184,0.1)',border:'rgba(148,163,184,0.25)'},
                                                ON_LEAVE:{color:'#a78bfa',label:'ON LEAVE',bg:'rgba(167,139,250,0.1)',border:'rgba(167,139,250,0.3)'},
                                            };
                                            const sc=statusCfg[s.status]||statusCfg['INACTIVE'];
                                            const joiningYear=s.joiningDate?new Date(s.joiningDate).getFullYear():null;
                                            const yearsAtBank=joiningYear?new Date().getFullYear()-joiningYear:null;
                                            return (
                                                <div key={s.id} className="staff-card lux-enter"
                                                     style={{animationDelay:`${idx*45}ms`,borderRadius:22,overflow:'hidden',
                                                         background:isDark?'linear-gradient(150deg,#0f172a,#1a2440)':'#fff',
                                                         border:isDark?`1px solid rgba(255,255,255,0.07)`:`1px solid rgba(0,0,0,0.07)`,
                                                         boxShadow:isDark?`0 6px 32px rgba(0,0,0,0.5),0 0 0 1px ${ac}15`:`0 6px 32px rgba(0,0,0,0.08),0 0 0 1px ${ac}18`}}>

                                                    {/* Top header band */}
                                                    <div style={{height:72,background:`linear-gradient(135deg,${ac}cc,${ac}66)`,position:'relative',overflow:'hidden'}}>
                                                        {/* Pattern overlay */}
                                                        <div style={{position:'absolute',inset:0,opacity:0.15,backgroundImage:'radial-gradient(circle at 25% 25%,rgba(255,255,255,0.3) 0%,transparent 50%),radial-gradient(circle at 75% 75%,rgba(255,255,255,0.2) 0%,transparent 40%)'}}/>
                                                        <div style={{position:'absolute',inset:0,opacity:0.08,backgroundImage:'repeating-linear-gradient(45deg,rgba(255,255,255,0.6) 0px,rgba(255,255,255,0.6) 1px,transparent 1px,transparent 20px)'}}/>
                                                        {/* Employee ID badge */}
                                                        <div style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',padding:'3px 10px',borderRadius:8,background:'rgba(255,255,255,0.18)',border:'1px solid rgba(255,255,255,0.3)',backdropFilter:'blur(6px)'}}>
                                                            <span style={{fontSize:9,fontWeight:800,color:'rgba(255,255,255,0.9)',letterSpacing:1.5,fontFamily:"'Outfit',sans-serif"}}>{s.employeeId||`EMP-${s.id}`}</span>
                                                        </div>
                                                        {/* Status badge */}
                                                        <div style={{position:'absolute',left:14,bottom:8,display:'flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:20,background:'rgba(0,0,0,0.25)',border:'1px solid rgba(255,255,255,0.2)'}}>
                                                            <span className={s.status==='ACTIVE'?'status-blink':''} style={{width:5,height:5,borderRadius:'50%',background:sc.color,boxShadow:`0 0 5px ${sc.color}`}}/>
                                                            <span style={{fontSize:8,fontWeight:800,color:sc.color,letterSpacing:1.5}}>{sc.label}</span>
                                                        </div>
                                                    </div>

                                                    {/* Avatar — overlapping the band */}
                                                    <div style={{display:'flex',justifyContent:'flex-start',paddingLeft:18,marginTop:-26,marginBottom:10,position:'relative',zIndex:2}}>
                                                        <div className="staff-avatar-inner" style={{width:52,height:52,borderRadius:16,
                                                            background:`linear-gradient(135deg,${ac},${ac}cc)`,
                                                            border:`3px solid ${isDark?'#0f172a':'#fff'}`,
                                                            display:'flex',alignItems:'center',justifyContent:'center',
                                                            fontSize:19,fontWeight:800,color:'#fff',
                                                            boxShadow:`0 4px 16px ${ac}45`,fontFamily:"'Outfit',sans-serif"}}>
                                                            {initials}
                                                        </div>
                                                    </div>

                                                    <div style={{padding:'0 18px 18px'}}>
                                                        {/* Name + role */}
                                                        <div style={{marginBottom:12}}>
                                                            <p style={{fontSize:16,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0,fontFamily:"'Outfit',sans-serif"}}>{s.fullName}</p>
                                                            <p style={{fontSize:11,color:ac,fontWeight:700,margin:'3px 0 0',letterSpacing:0.3}}>{s.designation}</p>
                                                            <p style={{fontSize:10,color:'#64748b',margin:'2px 0 0',fontWeight:500}}>{s.department}{s.branchName?` · ${s.branchName}`:''}</p>
                                                        </div>

                                                        {/* Contact chips */}
                                                        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:13}}>
                                                            <span style={{fontSize:10,padding:'3px 9px',borderRadius:8,background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',color:isDark?'#94a3b8':'#64748b',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:180}}>✉ {s.email}</span>
                                                            <span style={{fontSize:10,padding:'3px 9px',borderRadius:8,background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',color:isDark?'#94a3b8':'#64748b',fontWeight:500}}>📞 {s.phone}</span>
                                                        </div>

                                                        {/* Stats row */}
                                                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                                                            <div style={{padding:'10px 12px',borderRadius:12,background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',border:isDark?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(0,0,0,0.06)'}}>
                                                                <p style={{fontSize:8,fontWeight:700,color:'#64748b',letterSpacing:1,textTransform:'uppercase',margin:'0 0 3px'}}>Monthly Salary</p>
                                                                <p style={{fontSize:15,fontWeight:800,color:'#34d399',margin:0,fontFamily:"'Outfit',sans-serif"}}>₹{(s.salary||0).toLocaleString('en-IN')}</p>
                                                            </div>
                                                            <div style={{padding:'10px 12px',borderRadius:12,background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',border:isDark?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(0,0,0,0.06)'}}>
                                                                <p style={{fontSize:8,fontWeight:700,color:'#64748b',letterSpacing:1,textTransform:'uppercase',margin:'0 0 3px'}}>Tenure</p>
                                                                <p style={{fontSize:15,fontWeight:800,color:ac,margin:0,fontFamily:"'Outfit',sans-serif"}}>{yearsAtBank!==null?`${yearsAtBank} yr${yearsAtBank!==1?'s':''}`:'—'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Joining date strip */}
                                                        {s.joiningDate&&(
                                                            <div style={{display:'flex',alignItems:'center',gap:7,padding:'7px 12px',borderRadius:10,background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.025)',border:isDark?'1px solid rgba(255,255,255,0.05)':'1px solid rgba(0,0,0,0.05)',marginBottom:14}}>
                                                                <span style={{fontSize:12}}>📅</span>
                                                                <span style={{fontSize:10,color:'#64748b',fontWeight:600}}>Joined: {new Date(s.joiningDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                                                            </div>
                                                        )}

                                                        {/* Action buttons */}
                                                        <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                                                            <button onClick={()=>{setSelectedStaff(s);setSalaryForm({month:new Date().getMonth()+1,year:new Date().getFullYear(),remarks:''});setShowSalaryModal(true);}}
                                                                    style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'8px 0',borderRadius:10,border:'none',cursor:'pointer',
                                                                        background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',fontSize:10,fontWeight:800,
                                                                        boxShadow:'0 3px 10px rgba(16,185,129,0.35)',transition:'all 0.2s',letterSpacing:0.5}}>
                                                                💵 Pay Salary
                                                            </button>
                                                            <button onClick={async()=>{const res=await API.get(`/salary/admin/history/${s.id}`);setSalaryHistory(res.data);setSelectedStaff(s);setShowSalaryHistory(true);}}
                                                                    style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'8px 0',borderRadius:10,border:'none',cursor:'pointer',
                                                                        background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',color:isDark?'#94a3b8':'#475569',fontSize:10,fontWeight:800,transition:'all 0.2s',letterSpacing:0.5}}>
                                                                📋 History
                                                            </button>
                                                            <button onClick={()=>{setStaffForm(s);setEditStaff(s);setShowStaffModal(true);}}
                                                                    style={{width:34,height:34,borderRadius:10,border:'none',cursor:'pointer',
                                                                        background:`${ac}22`,color:ac,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,transition:'all 0.2s'}}>
                                                                ✏️
                                                            </button>
                                                            <button onClick={()=>deleteStaff(s.id)}
                                                                    style={{width:34,height:34,borderRadius:10,border:'none',cursor:'pointer',
                                                                        background:'rgba(248,113,113,0.12)',color:'#f87171',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,transition:'all 0.2s'}}>
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ═══ BRANCHES TAB — LUXURY BRANCH CARDS ════════════════ */}
                            {activeTab === 'branches' && (
                                <div style={{fontFamily:"'Outfit',sans-serif"}}>
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
                                        <div>
                                            <h2 style={{fontSize:24,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0,letterSpacing:'-0.5px'}}>Branch Network</h2>
                                            <p style={{fontSize:12,color:'#64748b',marginTop:3,fontWeight:500}}>{branches.length} branches across India</p>
                                        </div>
                                        <div style={{display:'flex',gap:9,alignItems:'center',flexWrap:'wrap'}}>
                                            {[{label:'Active',count:branches.filter(b=>b.status==='ACTIVE').length,c:'#34d399'},{label:'Inactive',count:branches.filter(b=>b.status==='INACTIVE').length,c:'#f87171'}].map(s=>(
                                                <div key={s.label} style={{padding:'6px 13px',borderRadius:40,background:`${s.c}12`,border:`1px solid ${s.c}38`,display:'flex',alignItems:'center',gap:6}}>
                                                    <span style={{width:6,height:6,borderRadius:'50%',background:s.c,boxShadow:`0 0 6px ${s.c}`}}/>
                                                    <span style={{fontSize:14,fontWeight:800,color:s.c}}>{s.count}</span>
                                                    <span style={{fontSize:10,color:'#64748b',fontWeight:700,letterSpacing:0.8}}>{s.label}</span>
                                                </div>
                                            ))}
                                            <button onClick={()=>{resetBranchForm();setEditBranch(null);setShowBranchModal(true);}}
                                                    style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:12,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#0f766e,#14b8a6)',color:'#fff',fontSize:13,fontWeight:800,boxShadow:'0 4px 16px rgba(20,184,166,0.4)',transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}>
                                                <span style={{fontSize:16}}>+</span> Add Branch
                                            </button>
                                        </div>
                                    </div>
                                    {branches.length===0&&<div style={{textAlign:'center',padding:'80px 0'}}><div style={{fontSize:52,marginBottom:12,opacity:0.25}}>🏦</div><p style={{fontSize:15,fontWeight:600,color:'#64748b'}}>No branches found. Add one!</p></div>}
                                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:18}}>
                                        {branches.map((b,idx)=>{
                                            const cityPalette=['#0f766e','#1d4ed8','#7c3aed','#c2410c','#0369a1','#15803d','#b45309','#be185d'];
                                            const ac=cityPalette[b.id%cityPalette.length];
                                            const isActive=b.status==='ACTIVE';
                                            return (
                                                <div key={b.id} className="staff-card lux-enter" style={{animationDelay:`${idx*50}ms`,borderRadius:22,overflow:'hidden',
                                                    background:isDark?'linear-gradient(150deg,#0c1a24,#0f2535)':'#fff',
                                                    border:isDark?'1px solid rgba(255,255,255,0.07)':'1px solid rgba(0,0,0,0.07)',
                                                    boxShadow:isDark?`0 6px 32px rgba(0,0,0,0.5),0 0 0 1px ${ac}15`:`0 6px 32px rgba(0,0,0,0.08),0 0 0 1px ${ac}15`}}>
                                                    {/* Map-like header */}
                                                    <div style={{height:80,background:`linear-gradient(135deg,${ac}dd,${ac}88)`,position:'relative',overflow:'hidden'}}>
                                                        <div style={{position:'absolute',inset:0,opacity:0.1,backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)',backgroundSize:'18px 18px'}}/>
                                                        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 20% 50%,rgba(255,255,255,0.15) 0%,transparent 60%)'}}/>
                                                        {/* IFSC chip */}
                                                        <div style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',padding:'4px 10px',borderRadius:8,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(6px)',border:'1px solid rgba(255,255,255,0.2)'}}>
                                                            <span style={{fontSize:9,fontWeight:800,color:'rgba(255,255,255,0.9)',letterSpacing:1.5,fontFamily:"'Space Mono',monospace"}}>{b.ifscCode||'—'}</span>
                                                        </div>
                                                        {/* Status */}
                                                        <div style={{position:'absolute',left:14,bottom:10,display:'flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:20,background:'rgba(0,0,0,0.25)',border:'1px solid rgba(255,255,255,0.2)'}}>
                                                            <span className={isActive?'status-blink':''} style={{width:5,height:5,borderRadius:'50%',background:isActive?'#34d399':'#f87171',boxShadow:isActive?'0 0 5px #34d399':'none'}}/>
                                                            <span style={{fontSize:8,fontWeight:800,color:isActive?'#34d399':'#f87171',letterSpacing:1.5}}>{b.status}</span>
                                                        </div>
                                                    </div>
                                                    {/* Icon overlapping */}
                                                    <div style={{display:'flex',paddingLeft:18,marginTop:-22,marginBottom:8,position:'relative',zIndex:2}}>
                                                        <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${ac},${ac}cc)`,border:`3px solid ${isDark?'#0c1a24':'#fff'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:`0 4px 16px ${ac}40`}}>🏦</div>
                                                    </div>
                                                    <div style={{padding:'0 18px 18px'}}>
                                                        <p style={{fontSize:16,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:'0 0 2px',fontFamily:"'Outfit',sans-serif"}}>{b.branchName}</p>
                                                        <p style={{fontSize:11,color:ac,fontWeight:700,margin:'0 0 10px',letterSpacing:0.3}}>Code: {b.branchCode||'—'}</p>
                                                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                                                            {[{label:'Manager',value:b.managerName||'—',icon:'👔'},{label:'Phone',value:b.phone||'—',icon:'📞'},{label:'City',value:b.city||'—',icon:'📍'},{label:'State',value:b.state||'—',icon:'🗺️'}].map(item=>(
                                                                <div key={item.label} style={{padding:'8px 10px',borderRadius:10,background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',border:isDark?'1px solid rgba(255,255,255,0.06)':'1px solid rgba(0,0,0,0.06)'}}>
                                                                    <p style={{fontSize:8,fontWeight:700,color:'#64748b',letterSpacing:1,textTransform:'uppercase',margin:'0 0 2px'}}>{item.label}</p>
                                                                    <p style={{fontSize:11,fontWeight:700,color:isDark?'#e2e8f0':'#0f172a',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.icon} {item.value}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {b.address&&<div style={{display:'flex',alignItems:'center',gap:6,padding:'7px 10px',borderRadius:10,background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.025)',border:isDark?'1px solid rgba(255,255,255,0.05)':'1px solid rgba(0,0,0,0.05)',marginBottom:12}}>
                                                            <span style={{fontSize:11}}>📫</span>
                                                            <span style={{fontSize:10,color:'#64748b',fontWeight:500,lineHeight:1.4}}>{b.address}</span>
                                                        </div>}
                                                        <div style={{display:'flex',gap:8}}>
                                                            <button onClick={()=>{setBranchForm(b);setEditBranch(b);setShowBranchModal(true);}} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'8px 0',borderRadius:10,border:'none',cursor:'pointer',background:`${ac}22`,color:ac,fontSize:11,fontWeight:800,transition:'all 0.2s'}}>✏️ Edit Branch</button>
                                                            <button onClick={()=>deleteBranch(b.id)} style={{width:36,height:36,borderRadius:10,border:'none',cursor:'pointer',background:'rgba(248,113,113,0.12)',color:'#f87171',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,transition:'all 0.2s'}}>🗑️</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ═══ CHECKBOOK TAB — LUXURY TRACKER ════════════════════ */}
                            {activeTab === 'checkbook' && (
                                <div style={{fontFamily:"'Outfit',sans-serif"}}>
                                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
                                        <div>
                                            <h2 style={{fontSize:24,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0,letterSpacing:'-0.5px'}}>Checkbook Requests</h2>
                                            <p style={{fontSize:12,color:'#64748b',marginTop:3,fontWeight:500}}>{checkbooks.length} total requests</p>
                                        </div>
                                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                                            {[{label:'Pending',count:checkbooks.filter(c=>c.status==='PENDING').length,c:'#fbbf24'},{label:'Approved',count:checkbooks.filter(c=>c.status==='APPROVED').length,c:'#60a5fa'},{label:'Dispatched',count:checkbooks.filter(c=>c.status==='DISPATCHED').length,c:'#a78bfa'},{label:'Delivered',count:checkbooks.filter(c=>c.status==='DELIVERED').length,c:'#34d399'}].map(s=>(
                                                <div key={s.label} style={{padding:'6px 13px',borderRadius:40,background:`${s.c}12`,border:`1px solid ${s.c}38`,display:'flex',alignItems:'center',gap:6}}>
                                                    <span style={{width:6,height:6,borderRadius:'50%',background:s.c,boxShadow:`0 0 6px ${s.c}`}}/>
                                                    <span style={{fontSize:14,fontWeight:800,color:s.c}}>{s.count}</span>
                                                    <span style={{fontSize:10,color:'#64748b',fontWeight:700,letterSpacing:0.8}}>{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {checkbooks.length===0&&<div style={{textAlign:'center',padding:'80px 0'}}><div style={{fontSize:52,marginBottom:12,opacity:0.25}}>📒</div><p style={{fontSize:15,fontWeight:600,color:'#64748b'}}>No checkbook requests</p></div>}
                                    <div style={{display:'flex',flexDirection:'column',gap:14}}>
                                        {checkbooks.map((cb,idx)=>{
                                            const stepsCfg=[{key:'PENDING',label:'Requested',icon:'📋'},{key:'APPROVED',label:'Approved',icon:'✅'},{key:'DISPATCHED',label:'Dispatched',icon:'📦'},{key:'DELIVERED',label:'Delivered',icon:'🏠'}];
                                            const rejCfg={key:'REJECTED',label:'Rejected',icon:'❌'};
                                            const isRejected=cb.status==='REJECTED';
                                            const currentStepIdx=isRejected?-1:stepsCfg.findIndex(s=>s.key===cb.status);
                                            const statusColors={PENDING:'#fbbf24',APPROVED:'#60a5fa',DISPATCHED:'#a78bfa',DELIVERED:'#34d399',REJECTED:'#f87171'};
                                            const sc=statusColors[cb.status]||'#94a3b8';
                                            return (
                                                <div key={cb.id} className="cust-card lux-enter" style={{animationDelay:`${idx*50}ms`,borderRadius:20,overflow:'hidden',
                                                    background:isDark?'linear-gradient(150deg,#0f172a,#1a2236)':'#fff',
                                                    border:isDark?`1px solid rgba(255,255,255,0.07)`:`1px solid rgba(0,0,0,0.07)`,
                                                    boxShadow:isDark?'0 4px 28px rgba(0,0,0,0.4)':'0 4px 28px rgba(0,0,0,0.07)'}}>
                                                    <div style={{height:3,background:`linear-gradient(90deg,${sc},${sc}88,transparent)`}}/>
                                                    <div style={{padding:'16px 20px 18px'}}>
                                                        {/* Header */}
                                                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:14}}>
                                                            <div style={{display:'flex',alignItems:'center',gap:12}}>
                                                                <div style={{width:46,height:46,borderRadius:14,background:`linear-gradient(135deg,${sc}cc,${sc}77)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,boxShadow:`0 4px 12px ${sc}40`}}>📒</div>
                                                                <div>
                                                                    <p style={{fontSize:15,fontWeight:800,color:isDark?'#f1f5f9':'#0f172a',margin:0,fontFamily:"'Outfit',sans-serif"}}>{cb.user?.fullName||'—'}</p>
                                                                    <p style={{fontSize:10,color:'#64748b',margin:'2px 0 0',fontFamily:"'Space Mono',monospace",fontWeight:600}}>{cb.requestNumber}</p>
                                                                    <p style={{fontSize:10,color:isDark?'#475569':'#94a3b8',margin:'1px 0 0'}}>A/C: {cb.accountNumber}</p>
                                                                </div>
                                                            </div>
                                                            <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:20,background:`${sc}15`,border:`1px solid ${sc}40`,flexShrink:0}}>
                                                                <span className={cb.status==='PENDING'?'status-blink':''} style={{width:6,height:6,borderRadius:'50%',background:sc,display:'block',boxShadow:`0 0 6px ${sc}`}}/>
                                                                <span style={{fontSize:10,fontWeight:800,color:sc,letterSpacing:1,textTransform:'uppercase'}}>{isRejected?'REJECTED':cb.status}</span>
                                                            </div>
                                                        </div>
                                                        {/* Details chips */}
                                                        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
                                                            <span style={{fontSize:10,padding:'4px 12px',borderRadius:20,background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',color:isDark?'#94a3b8':'#64748b',fontWeight:700}}>📄 {cb.numberOfLeaves} leaves</span>
                                                            {cb.deliveryAddress&&<span style={{fontSize:10,padding:'4px 12px',borderRadius:20,background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',color:isDark?'#94a3b8':'#64748b',fontWeight:600,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>📍 {cb.deliveryAddress}</span>}
                                                            {cb.requestedAt&&<span style={{fontSize:10,padding:'4px 12px',borderRadius:20,background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',color:isDark?'#94a3b8':'#64748b',fontWeight:600}}>🕐 {new Date(cb.requestedAt).toLocaleDateString('en-IN')}</span>}
                                                        </div>
                                                        {/* Journey tracker */}
                                                        {!isRejected&&(
                                                            <div style={{marginBottom:16}}>
                                                                <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                                                    {/* Progress bar behind steps */}
                                                                    <div style={{position:'absolute',top:'50%',left:'5%',right:'5%',height:2,background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)',transform:'translateY(-50%)',zIndex:0}}/>
                                                                    <div style={{position:'absolute',top:'50%',left:'5%',height:2,background:`linear-gradient(90deg,${sc},${sc}88)`,transform:'translateY(-50%)',zIndex:0,transition:'width 0.8s ease',
                                                                        width:currentStepIdx>=0?`${(currentStepIdx/3)*90}%`:'0%'}}/>
                                                                    {stepsCfg.map((step,i)=>{
                                                                        const done=i<=currentStepIdx;
                                                                        const active=i===currentStepIdx;
                                                                        return (
                                                                            <div key={step.key} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,position:'relative',zIndex:1}}>
                                                                                <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,
                                                                                    background:done?`linear-gradient(135deg,${sc},${sc}99)`:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)',
                                                                                    border:done?`2px solid ${sc}`:isDark?'2px solid rgba(255,255,255,0.1)':'2px solid rgba(0,0,0,0.1)',
                                                                                    boxShadow:active?`0 0 12px ${sc}60`:'none',
                                                                                    transition:'all 0.4s ease'}}>
                                                                                    {done?step.icon:'○'}
                                                                                </div>
                                                                                <span style={{fontSize:8,fontWeight:700,color:done?sc:'#64748b',letterSpacing:0.5,textAlign:'center',maxWidth:60}}>{step.label}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {isRejected&&<div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderRadius:12,background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.2)',marginBottom:14}}>
                                                            <span style={{fontSize:16}}>❌</span>
                                                            <span style={{fontSize:12,color:'#f87171',fontWeight:700}}>Request was rejected</span>
                                                        </div>}
                                                        {/* Action buttons */}
                                                        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                                                            {cb.status==='PENDING'&&<>
                                                                <button onClick={()=>approveCheckbook(cb.id)} style={{flex:1,padding:'8px 0',borderRadius:10,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',fontSize:11,fontWeight:800,boxShadow:'0 3px 10px rgba(16,185,129,0.35)',transition:'all 0.2s',letterSpacing:0.5}}>✅ Approve</button>
                                                                <button onClick={()=>rejectCheckbook(cb.id)} style={{flex:1,padding:'8px 0',borderRadius:10,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#dc2626,#ef4444)',color:'#fff',fontSize:11,fontWeight:800,boxShadow:'0 3px 10px rgba(239,68,68,0.35)',transition:'all 0.2s',letterSpacing:0.5}}>❌ Reject</button>
                                                            </>}
                                                            {cb.status==='APPROVED'&&<button onClick={()=>dispatchCheckbook(cb.id)} style={{flex:1,padding:'8px 0',borderRadius:10,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#7c3aed,#a855f7)',color:'#fff',fontSize:11,fontWeight:800,boxShadow:'0 3px 10px rgba(168,85,247,0.35)',transition:'all 0.2s',letterSpacing:0.5}}>📦 Mark Dispatched</button>}
                                                            {cb.status==='DISPATCHED'&&<button onClick={()=>deliverCheckbook(cb.id)} style={{flex:1,padding:'8px 0',borderRadius:10,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',fontSize:11,fontWeight:800,boxShadow:'0 3px 10px rgba(16,185,129,0.35)',transition:'all 0.2s',letterSpacing:0.5}}>🏠 Mark Delivered</button>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ═══ ID CARDS TAB ════════════════════════════════════════ */}
                            {activeTab === 'idcards' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <div><h2 className={`syne text-lg font-bold ${isDark?'text-white':'text-gray-900'}`}>Staff ID Cards</h2><p className={`text-xs mt-0.5 ${isDark?'text-gray-400':'text-gray-500'}`}>Generate, manage & control staff identity cards</p></div>
                                        <div className="flex gap-2">
                                            <button onClick={fetchAll} className={`p-2 rounded-xl transition-all ${isDark?'bg-gray-800 text-gray-400 hover:text-white':'bg-gray-100 text-gray-500 hover:text-gray-800'}`}><RefreshCw size={16}/></button>
                                            <button onClick={()=>{setGenerateForm({staffId:'',bloodGroup:'',officeAddress:'',roomAccess:[]});setShowGenerateModal(true);}} className="quick-btn flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/25"><Plus size={16}/> Generate ID Card</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[{label:'Total Cards',count:idCards.length,color:'text-blue-500'},{label:'Active',count:idCards.filter(c=>c.status==='ACTIVE').length,color:'text-emerald-500'},{label:'Blocked',count:idCards.filter(c=>c.status==='BLOCKED').length,color:'text-red-500'},{label:'Not Generated',count:staff.filter(s=>!idCards.find(c=>c.staffId===s.id)).length,color:'text-amber-500'}].map(s=>(
                                            <div key={s.label} className={`p-4 rounded-2xl border ${isDark?'bg-gray-900 border-gray-800':'bg-white border-gray-100'}`}><p className={`text-2xl font-bold syne ${s.color}`}>{s.count}</p><p className={`text-xs mt-1 ${isDark?'text-gray-400':'text-gray-500'}`}>{s.label}</p></div>
                                        ))}
                                    </div>
                                    {idCards.length===0?(<div className={`text-center py-16 rounded-2xl border-2 border-dashed ${isDark?'border-gray-700 text-gray-400':'border-gray-200 text-gray-400'}`}><CreditCard size={48} className="mx-auto mb-3 opacity-30"/><p className="font-medium">No ID Cards generated yet</p><p className="text-sm mt-1">Click "Generate ID Card" to create one</p></div>
                                    ):(
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {idCards.map(idCard=>(
                                                <div key={idCard.id} className={`rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl ${isDark?'bg-gray-900 border-gray-800':'bg-white border-gray-100'}`}>
                                                    <div className="flex justify-center pt-5 pb-3 px-4"><IdCardVisual card={idCard}/></div>
                                                    <div className={`px-4 pb-4 border-t ${isDark?'border-gray-800':'border-gray-100'}`}>
                                                        <div className="flex items-center justify-between mt-3 mb-2">
                                                            <div><p className={`font-semibold text-sm ${isDark?'text-white':'text-gray-900'}`}>{idCard.staffName}</p><p className={`text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>{idCard.cardNumber} • {idCard.department}</p></div>
                                                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${{ACTIVE:'bg-emerald-100 text-emerald-700',BLOCKED:'bg-red-100 text-red-700',EXPIRED:'bg-gray-100 text-gray-600',REVOKED:'bg-purple-100 text-purple-700'}[idCard.status]||'bg-gray-100 text-gray-600'}`}>{idCard.status}</span>
                                                        </div>
                                                        {idCard.roomAccess&&<div className="flex flex-wrap gap-1 mb-3">{idCard.roomAccess.split(',').filter(Boolean).map(r=><span key={r} className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark?'bg-indigo-900/50 text-indigo-300 border border-indigo-700/40':'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>{ROOM_OPTIONS.find(o=>o.value===r)?.label||r}</span>)}</div>}
                                                        <div className="flex flex-wrap gap-2">
                                                            {idCard.status==='ACTIVE'&&<button onClick={()=>{setSelectedIdCard(idCard);setShowIdBlockModal(true);}} className="quick-btn flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"><Lock size={12}/> Block</button>}
                                                            {idCard.status==='BLOCKED'&&<button onClick={()=>handleUnblockIdCard(idCard.id)} className="quick-btn flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"><Unlock size={12}/> Unblock</button>}
                                                            <button onClick={()=>{setSelectedIdCard(idCard);setSelectedRooms(idCard.roomAccess?idCard.roomAccess.split(',').filter(Boolean):[]);setShowRoomModal(true);}} className="quick-btn flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"><Key size={12}/> Room Access</button>
                                                            <button onClick={()=>{setSelectedIdCard(idCard);setShowCardDetailModal(true);}} className={`quick-btn flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold ${isDark?'bg-gray-700 hover:bg-gray-600 text-white':'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}><Eye size={12}/> View</button>
                                                            {idCard.status!=='REVOKED'&&<button onClick={()=>handleRevokeIdCard(idCard.id)} className="quick-btn flex items-center gap-1 bg-gray-800 hover:bg-red-900 text-red-400 hover:text-red-300 text-xs px-3 py-1.5 rounded-lg font-semibold"><Trash2 size={12}/> Revoke</button>}
                                                        </div>
                                                        {idCard.status==='BLOCKED'&&idCard.blockedReason&&<div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-100 flex items-start gap-2"><AlertTriangle size={12} className="text-red-500 mt-0.5 flex-shrink-0"/><p className="text-xs text-red-600">{idCard.blockedReason}</p></div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* ──────── MODALS ──────── */}

                {/* NEW CUSTOMER MODAL */}
                {showNewCustomerModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className={`w-full max-w-2xl p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                            <div className="flex justify-between items-center mb-5"><div><h2 className="syne text-lg font-bold">New Customer Account</h2><p className={`text-sm ${isDark?'text-gray-400':'text-gray-500'}`}>Branch visit — Admin account creation</p></div><button onClick={()=>setShowNewCustomerModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                            <p className={`text-xs font-bold uppercase mb-2 ${isDark?'text-blue-400':'text-blue-600'}`}>👤 Personal Information</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {[['Full Name *','fullName','text','Rahul Kumar'],['Email *','email','email','rahul@gmail.com'],['Phone *','phone','text','9876543210'],['Password *','password','text','Bank@1234']].map(([lbl,key,type,ph])=>(
                                    <div key={key}><label className={label}>{lbl}</label><input type={type} placeholder={ph} value={newCustomerForm[key]} onChange={e=>setNewCustomerForm({...newCustomerForm,[key]:e.target.value})} className={input}/></div>
                                ))}
                                <div><label className={label}>Date of Birth</label><input type="date" value={newCustomerForm.dateOfBirth} onChange={e=>setNewCustomerForm({...newCustomerForm,dateOfBirth:e.target.value})} className={input}/></div>
                                <div><label className={label}>Gender</label><select value={newCustomerForm.gender} onChange={e=>setNewCustomerForm({...newCustomerForm,gender:e.target.value})} className={input}><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
                            </div>
                            <p className={`text-xs font-bold uppercase mb-2 ${isDark?'text-blue-400':'text-blue-600'}`}>📄 Documents (KYC)</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div><label className={label}>Aadhar Number *</label><input type="text" placeholder="1234 5678 9012" value={newCustomerForm.aadharNumber} onChange={e=>setNewCustomerForm({...newCustomerForm,aadharNumber:e.target.value})} className={input}/></div>
                                <div><label className={label}>PAN Number *</label><input type="text" placeholder="ABCDE1234F" value={newCustomerForm.panNumber} onChange={e=>setNewCustomerForm({...newCustomerForm,panNumber:e.target.value})} className={input}/></div>
                            </div>
                            <p className={`text-xs font-bold uppercase mb-2 ${isDark?'text-blue-400':'text-blue-600'}`}>🏠 Address</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="col-span-2"><label className={label}>Address</label><input type="text" placeholder="123, Main Road" value={newCustomerForm.address} onChange={e=>setNewCustomerForm({...newCustomerForm,address:e.target.value})} className={input}/></div>
                                {[['City','city','Mumbai'],['State','state','Maharashtra'],['Pincode','pincode','400001']].map(([lbl,key,ph])=>(
                                    <div key={key}><label className={label}>{lbl}</label><input type="text" placeholder={ph} value={newCustomerForm[key]} onChange={e=>setNewCustomerForm({...newCustomerForm,[key]:e.target.value})} className={input}/></div>
                                ))}
                            </div>
                            <p className={`text-xs font-bold uppercase mb-2 ${isDark?'text-blue-400':'text-blue-600'}`}>🏦 Account Details</p>
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div><label className={label}>Account Type</label><select value={newCustomerForm.accountType} onChange={e=>setNewCustomerForm({...newCustomerForm,accountType:e.target.value})} className={input}><option value="SAVINGS">Savings</option><option value="CURRENT">Current</option></select></div>
                                <div><label className={label}>Initial Deposit (₹)</label><input type="number" placeholder="5000" value={newCustomerForm.initialDeposit} onChange={e=>setNewCustomerForm({...newCustomerForm,initialDeposit:e.target.value})} className={input}/></div>
                            </div>
                            <button onClick={handleNewCustomer} className="quick-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"><UserPlus size={18}/> Create Customer Account</button>
                        </div>
                    </div>
                )}

                {/* CASH DEPOSIT MODAL */}
                {showDepositModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                            <div className="flex justify-between items-center mb-4"><div><h2 className="syne text-lg font-bold">Cash Deposit</h2><p className={`text-sm ${isDark?'text-gray-400':'text-gray-500'}`}>Credit to customer account</p></div><button onClick={()=>setShowDepositModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                            <div className={`p-3 rounded-xl mb-4 flex items-center gap-2 ${isDark?'bg-emerald-950 border border-emerald-800':'bg-emerald-50 border border-emerald-100'}`}><span className="text-xl">💰</span><p className={`text-xs ${isDark?'text-emerald-300':'text-emerald-700'}`}>Verify account number before depositing cash.</p></div>
                            <div className="space-y-4">
                                <div><label className={`block text-sm font-medium mb-1 ${isDark?'text-gray-300':'text-gray-700'}`}>Account Number</label><input type="text" placeholder="SNB123456789" value={depositForm.accountNumber} onChange={e=>setDepositForm({...depositForm,accountNumber:e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-emerald-500/30 ${isDark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200'}`}/></div>
                                <div><label className={`block text-sm font-medium mb-1 ${isDark?'text-gray-300':'text-gray-700'}`}>Amount (₹)</label><input type="number" placeholder="5000" value={depositForm.amount} onChange={e=>setDepositForm({...depositForm,amount:e.target.value})} className={`w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-emerald-500/30 ${isDark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200'}`}/></div>
                                <button onClick={handleAdminDeposit} className="quick-btn w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-600/25">💰 Deposit</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STAFF MODAL */}
                {showStaffModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                            <div className="flex justify-between items-center mb-5"><h2 className="syne text-lg font-bold">{editStaff?'Edit Staff':'Add New Staff'}</h2><button onClick={()=>setShowStaffModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                            <div className="grid grid-cols-2 gap-3">
                                {[['Full Name','fullName','text','Rahul Kumar'],['Email','email','email','rahul@bank.com'],['Phone','phone','text','9876543210'],['Designation','designation','text','Branch Manager'],['Department','department','text','Operations'],['Branch Name','branchName','text','Mumbai Main'],['Salary (₹)','salary','number','50000'],['Joining Date','joiningDate','date','']].map(([lbl,key,type,ph])=>(
                                    <div key={key}><label className={label}>{lbl}</label><input type={type} placeholder={ph} value={staffForm[key]||''} onChange={e=>setStaffForm({...staffForm,[key]:e.target.value})} className={input}/></div>
                                ))}
                                <div className="col-span-2"><label className={label}>Address</label><input type="text" placeholder="123 Main St" value={staffForm.address||''} onChange={e=>setStaffForm({...staffForm,address:e.target.value})} className={input}/></div>
                                <div><label className={label}>Status</label><select value={staffForm.status} onChange={e=>setStaffForm({...staffForm,status:e.target.value})} className={input}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="ON_LEAVE">On Leave</option></select></div>
                            </div>
                            <button onClick={saveStaff} className="quick-btn w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/25">{editStaff?'Update Staff':'Add Staff'}</button>
                        </div>
                    </div>
                )}

                {/* BRANCH MODAL */}
                {showBranchModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                            <div className="flex justify-between items-center mb-5"><h2 className="syne text-lg font-bold">{editBranch?'Edit Branch':'Add New Branch'}</h2><button onClick={()=>setShowBranchModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                            <div className="grid grid-cols-2 gap-3">
                                {[['Branch Name','branchName','Mumbai Main'],['Branch Code','branchCode','MUM001'],['IFSC Code','ifscCode','SNB0001234'],['Manager Name','managerName','Rahul Kumar'],['Phone','phone','022-12345678'],['City','city','Mumbai'],['State','state','Maharashtra']].map(([lbl,key,ph])=>(
                                    <div key={key}><label className={label}>{lbl}</label><input type="text" placeholder={ph} value={branchForm[key]||''} onChange={e=>setBranchForm({...branchForm,[key]:e.target.value})} className={input}/></div>
                                ))}
                                <div className="col-span-2"><label className={label}>Address</label><input type="text" placeholder="123 MG Road" value={branchForm.address||''} onChange={e=>setBranchForm({...branchForm,address:e.target.value})} className={input}/></div>
                                <div><label className={label}>Status</label><select value={branchForm.status} onChange={e=>setBranchForm({...branchForm,status:e.target.value})} className={input}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
                            </div>
                            <button onClick={saveBranch} className="quick-btn w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/25">{editBranch?'Update Branch':'Add Branch'}</button>
                        </div>
                    </div>
                )}
            </div>

            {/* KYC MODAL */}
            {showKycModal && kycViewData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                        <div className="p-5 border-b border-gray-700/50 flex items-center justify-between"><div><h2 className="syne text-lg font-bold">KYC Review</h2><p className={`text-sm ${isDark?'text-gray-400':'text-gray-500'}`}>{kycViewData.customerName} • {kycViewData.email}</p></div><button onClick={()=>setShowKycModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {[{key:'aadharCard',label:'🪪 Aadhar Card'},{key:'panCard',label:'💳 PAN Card'},{key:'photo',label:'🤳 Passport Photo'},{key:'signature',label:'✍️ Signature'}].map(({key,label:lbl})=>(
                                    <div key={key} className={`rounded-xl overflow-hidden border ${isDark?'border-gray-700':'border-gray-200'}`}>
                                        <div className={`px-3 py-2 text-xs font-medium ${isDark?'bg-gray-800 text-gray-300':'bg-gray-50 text-gray-600'}`}>{lbl}</div>
                                        {kycViewData[key]?<img src={kycViewData[key]} alt={lbl} className="w-full h-40 object-contain bg-black/10 p-2"/>:<div className={`h-40 flex items-center justify-center text-sm ${isDark?'text-gray-500':'text-gray-400'}`}>Not uploaded</div>}
                                    </div>
                                ))}
                            </div>
                            <div><label className={`block text-sm font-medium mb-1 ${isDark?'text-gray-300':'text-gray-700'}`}>Admin Remarks</label><textarea value={kycRemarks} onChange={e=>setKycRemarks(e.target.value)} placeholder="e.g. Aadhar card blurry hai, please re-upload..." rows={2} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none ${isDark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200'}`}/></div>
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={()=>approveKycDoc(kycViewData.id)} className="quick-btn flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-600/20"><Check size={16}/> Approve</button>
                                <button onClick={()=>resubmitKycDoc(kycViewData.id)} className="quick-btn flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-500/20">🔄 Re-Submit</button>
                                <button onClick={()=>rejectKycDoc(kycViewData.id)} className="quick-btn flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-red-600/20"><X size={16}/> Reject</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* COMPLAINT REPLY MODAL */}
            {showReplyModal && selectedComplaint && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                        <div className="flex items-center justify-between mb-4"><div><h2 className="syne text-lg font-bold">Reply to Complaint</h2><p className={`text-sm ${isDark?'text-gray-400':'text-gray-500'}`}>{selectedComplaint.customerName} — {selectedComplaint.subject}</p></div><button onClick={()=>setShowReplyModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                        <div className={`p-3 rounded-xl mb-4 ${isDark?'bg-gray-800':'bg-gray-50'}`}><p className={`text-xs font-medium mb-1 ${isDark?'text-gray-400':'text-gray-500'}`}>Customer complaint:</p><p className={`text-sm ${isDark?'text-gray-200':'text-gray-700'}`}>{selectedComplaint.description}</p></div>
                        <div className="space-y-3">
                            <div><label className={`block text-sm font-medium mb-1 ${isDark?'text-gray-300':'text-gray-700'}`}>Update Status</label><select value={replyForm.status} onChange={e=>setReplyForm({...replyForm,status:e.target.value})} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${isDark?'bg-gray-800 border-gray-700 text-white':'bg-gray-50 border-gray-200'}`}><option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select></div>
                            <div><label className={`block text-sm font-medium mb-1 ${isDark?'text-gray-300':'text-gray-700'}`}>Your Reply *</label><textarea value={replyForm.adminReply} onChange={e=>setReplyForm({...replyForm,adminReply:e.target.value})} placeholder="Type your reply here..." rows={4} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none ${isDark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200'}`}/></div>
                            <button onClick={async()=>{if(!replyForm.adminReply.trim()){toast.error('Reply likhna zaroori hai!');return;}try{await API.put(`/complaints/admin/reply/${selectedComplaint.id}`,replyForm);toast.success('Reply sent! ✅');setShowReplyModal(false);fetchAll();}catch{toast.error('Failed!');}}}
                                    className="quick-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"><Send size={16}/> Send Reply</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PAY SALARY MODAL */}
            {showSalaryModal && selectedStaff && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                        <div className="flex items-center justify-between mb-4"><div><h2 className="syne text-lg font-bold">Pay Salary</h2><p className={`text-sm ${isDark?'text-gray-400':'text-gray-500'}`}>{selectedStaff.fullName} • ₹{selectedStaff.salary?.toLocaleString('en-IN')}/mo</p></div><button onClick={()=>setShowSalaryModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                        <div className="space-y-3">
                            <div><label className={`block text-sm font-medium mb-1 ${isDark?'text-gray-300':'text-gray-700'}`}>Payment Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[{value:'SALARY',label:'💰 Salary',color:'bg-emerald-600'},{value:'BONUS',label:'🎁 Bonus',color:'bg-blue-600'},{value:'ADVANCE',label:'⚡ Advance',color:'bg-orange-500'}].map(t=>(
                                        <button key={t.value} onClick={()=>setSalaryForm({...salaryForm,paymentType:t.value,amount:''})} className={`quick-btn py-2 rounded-xl text-white text-xs font-semibold transition-all ${salaryForm.paymentType===t.value?t.color:isDark?'bg-gray-700':'bg-gray-200 text-gray-700'}`}>{t.label}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={`block text-sm font-medium mb-1 ${isDark?'text-gray-300':'text-gray-700'}`}>Month</label><select value={salaryForm.month} onChange={e=>setSalaryForm({...salaryForm,month:parseInt(e.target.value)})} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${isDark?'bg-gray-800 border-gray-700 text-white':'bg-gray-50 border-gray-200'}`}>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}</select></div>
                                <div><label className={`block text-sm font-medium mb-1 ${isDark?'text-gray-300':'text-gray-700'}`}>Year</label><select value={salaryForm.year} onChange={e=>setSalaryForm({...salaryForm,year:parseInt(e.target.value)})} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${isDark?'bg-gray-800 border-gray-700 text-white':'bg-gray-50 border-gray-200'}`}>{[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}</select></div>
                            </div>
                            {(salaryForm.paymentType==='BONUS'||salaryForm.paymentType==='ADVANCE')&&<div><label className={`block text-sm font-medium mb-1 ${isDark?'text-gray-300':'text-gray-700'}`}>Amount (₹) *</label><input type="number" value={salaryForm.amount||''} onChange={e=>setSalaryForm({...salaryForm,amount:e.target.value})} placeholder="Enter amount" className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${isDark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200'}`}/></div>}
                            <div><label className={`block text-sm font-medium mb-1 ${isDark?'text-gray-300':'text-gray-700'}`}>Remarks (optional)</label><input type="text" value={salaryForm.remarks} onChange={e=>setSalaryForm({...salaryForm,remarks:e.target.value})} placeholder="e.g. March salary" className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${isDark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200'}`}/></div>
                            <div className={`p-3 rounded-xl ${isDark?'bg-gray-800':'bg-emerald-50'}`}><p className={`text-sm ${isDark?'text-gray-300':'text-gray-700'}`}>Amount: <span className="font-bold text-emerald-500">₹{(salaryForm.amount||selectedStaff.salary)?.toLocaleString('en-IN')}</span> <span className={`ml-2 text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>({salaryForm.paymentType||'SALARY'})</span></p></div>
                            <button onClick={async()=>{try{await API.post('/salary/admin/pay',{staffId:selectedStaff.id,month:salaryForm.month,year:salaryForm.year,remarks:salaryForm.remarks,paymentType:salaryForm.paymentType||'SALARY',amount:salaryForm.amount||null});toast.success(`${salaryForm.paymentType||'Salary'} paid to ${selectedStaff.fullName}! ✅`);setShowSalaryModal(false);}catch(err){toast.error(err.response?.data?.message||'Failed!');}}}
                                    className="quick-btn w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"><Banknote size={18}/> Confirm Payment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SALARY HISTORY MODAL */}
            {showSalaryHistory && selectedStaff && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 rounded-2xl shadow-2xl ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                        <div className="flex items-center justify-between mb-4"><div><h2 className="syne text-lg font-bold">Salary History</h2><p className={`text-sm ${isDark?'text-gray-400':'text-gray-500'}`}>{selectedStaff.fullName}</p></div><button onClick={()=>setShowSalaryHistory(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                        {salaryHistory.length===0?<p className={`text-center py-8 ${isDark?'text-gray-400':'text-gray-500'}`}>No salary records yet</p>:(
                            <div className="space-y-2">
                                {salaryHistory.map(s=>(
                                    <div key={s.id} className={`p-3 rounded-xl flex items-center justify-between ${isDark?'bg-gray-800':'bg-gray-50'}`}>
                                        <div><p className={`font-medium text-sm ${isDark?'text-white':'text-gray-900'}`}>{['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][s.month]} {s.year}</p>{s.remarks&&<p className={`text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>{s.remarks}</p>}<p className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>{formatDate(s.paidAt)}</p></div>
                                        <div className="text-right"><p className="font-bold text-emerald-500">₹{s.amount?.toLocaleString('en-IN')}</p><span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{s.status}</span></div>
                                    </div>
                                ))}
                                <div className={`p-3 rounded-xl mt-2 ${isDark?'bg-gray-800':'bg-blue-50'}`}><p className={`text-sm font-semibold ${isDark?'text-white':'text-gray-900'}`}>Total Paid: <span className="text-emerald-500">₹{salaryHistory.reduce((s,r)=>s+r.amount,0).toLocaleString('en-IN')}</span></p></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* GENERATE ID CARD MODAL */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-lg p-6 rounded-2xl shadow-2xl ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                        <div className="flex justify-between items-center mb-5"><div><h2 className="syne text-lg font-bold">Generate Staff ID Card</h2><p className={`text-sm ${isDark?'text-gray-400':'text-gray-500'}`}>Admin only — Creates permanent identity card</p></div><button onClick={()=>setShowGenerateModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                        <div className="space-y-4">
                            <div><label className={`block text-xs font-medium mb-1 ${isDark?'text-gray-400':'text-gray-600'}`}>Select Staff Member *</label><select value={generateForm.staffId} onChange={e=>setGenerateForm({...generateForm,staffId:e.target.value})} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${isDark?'bg-gray-800 border-gray-700 text-white':'bg-gray-50 border-gray-200'}`}><option value="">— Select Staff —</option>{staff.filter(s=>!idCards.find(c=>c.staffId===s.id)).map(s=><option key={s.id} value={s.id}>{s.fullName} ({s.designation} • {s.employeeId})</option>)}</select></div>
                            <div><label className={`block text-xs font-medium mb-1 ${isDark?'text-gray-400':'text-gray-600'}`}>Blood Group *</label><div className="flex flex-wrap gap-2 mt-1">{BLOOD_GROUPS.map(bg=><button key={bg} onClick={()=>setGenerateForm({...generateForm,bloodGroup:bg})} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${generateForm.bloodGroup===bg?'bg-red-500 text-white shadow-md':isDark?'bg-gray-800 text-gray-300 hover:bg-gray-700':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{bg}</button>)}</div></div>
                            <div><label className={`block text-xs font-medium mb-1 ${isDark?'text-gray-400':'text-gray-600'}`}>Office Address (optional)</label><input type="text" placeholder="123 MG Road, Mumbai - 400001" value={generateForm.officeAddress} onChange={e=>setGenerateForm({...generateForm,officeAddress:e.target.value})} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${isDark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200'}`}/></div>
                            <div><label className={`block text-xs font-medium mb-1 ${isDark?'text-gray-400':'text-gray-600'}`}>Room Access Permissions</label><div className="flex flex-wrap gap-2 mt-1">{ROOM_OPTIONS.map(opt=><button key={opt.value} onClick={()=>toggleRoom(opt.value,generateForm.roomAccess,arr=>setGenerateForm({...generateForm,roomAccess:arr}))} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${generateForm.roomAccess.includes(opt.value)?'bg-indigo-600 text-white shadow-md':isDark?'bg-gray-800 text-gray-300 hover:bg-gray-700':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{opt.label}</button>)}</div></div>
                            <button onClick={handleGenerateIdCard} className="quick-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"><CreditCard size={18}/> Generate ID Card</button>
                        </div>
                    </div>
                </div>
            )}

            {/* BLOCK ID CARD MODAL */}
            {showIdBlockModal && selectedIdCard && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                        <div className="flex justify-between items-center mb-4"><h2 className="syne text-lg font-bold text-red-500">Block ID Card</h2><button onClick={()=>setShowIdBlockModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                        <div className={`p-3 rounded-xl mb-4 flex items-center gap-2 ${isDark?'bg-red-950 border border-red-800':'bg-red-50 border border-red-100'}`}><AlertTriangle size={16} className="text-red-500 flex-shrink-0"/><p className={`text-xs ${isDark?'text-red-300':'text-red-700'}`}>Blocking will immediately deactivate <strong>{selectedIdCard.staffName}</strong>'s ID card.</p></div>
                        <div className="space-y-3">
                            <div><label className={`block text-xs font-medium mb-1 ${isDark?'text-gray-400':'text-gray-600'}`}>Reason for blocking *</label><textarea value={idBlockReason} onChange={e=>setIdBlockReason(e.target.value)} placeholder="e.g. Card lost, suspicious activity..." rows={3} className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none ${isDark?'bg-gray-800 border-gray-700 text-white placeholder-gray-500':'bg-gray-50 border-gray-200'}`}/></div>
                            <button onClick={handleBlockIdCard} className="quick-btn w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"><Lock size={16}/> Confirm Block</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ROOM ACCESS MODAL */}
            {showRoomModal && selectedIdCard && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                        <div className="flex justify-between items-center mb-4"><div><h2 className="syne text-lg font-bold">Room Access</h2><p className={`text-sm ${isDark?'text-gray-400':'text-gray-500'}`}>{selectedIdCard.staffName}</p></div><button onClick={()=>setShowRoomModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">{ROOM_OPTIONS.map(opt=><button key={opt.value} onClick={()=>toggleRoom(opt.value,selectedRooms,setSelectedRooms)} className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${selectedRooms.includes(opt.value)?'bg-indigo-600 text-white shadow-md scale-105':isDark?'bg-gray-800 text-gray-300 hover:bg-gray-700':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{opt.label}</button>)}</div>
                            <div className={`p-3 rounded-xl text-xs ${isDark?'bg-gray-800 text-gray-300':'bg-indigo-50 text-indigo-700'}`}><strong>Selected:</strong> {selectedRooms.length===0?'No access':selectedRooms.map(r=>ROOM_OPTIONS.find(o=>o.value===r)?.label).join(', ')}</div>
                            <button onClick={handleUpdateRoomAccess} className="quick-btn w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"><Key size={16}/> Update Room Access</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CARD DETAIL MODAL */}
            {showCardDetailModal && selectedIdCard && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDark?'bg-gray-900 text-white border border-gray-800':'bg-white text-gray-900'}`}>
                        <div className="flex justify-between items-center mb-5"><h2 className="syne text-lg font-bold">Card Details</h2><button onClick={()=>setShowCardDetailModal(false)} className={`p-2 rounded-xl ${isDark?'hover:bg-gray-800':'hover:bg-gray-100'}`}><X size={20}/></button></div>
                        <div className="flex justify-center mb-5"><IdCardVisual card={selectedIdCard}/></div>
                        <div className="space-y-1">
                            {[['Card Number',selectedIdCard.cardNumber],['Employee ID',selectedIdCard.employeeId],['Blood Group',selectedIdCard.bloodGroup],['Department',selectedIdCard.department],['Email',selectedIdCard.email],['Phone',selectedIdCard.phone],['Branch',selectedIdCard.branchName],['Issue Date',selectedIdCard.issueDate],['Expiry Date',selectedIdCard.expiryDate],['Status',selectedIdCard.status]].map(([k,v])=>(
                                <div key={k} className={`flex justify-between items-center py-1.5 border-b text-sm ${isDark?'border-gray-800':'border-gray-100'}`}>
                                    <span className={isDark?'text-gray-400':'text-gray-500'}>{k}</span>
                                    <span className={`font-medium ${isDark?'text-white':'text-gray-900'}`}>{v||'—'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}