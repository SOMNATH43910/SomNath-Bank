import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Suspense, lazy } from 'react';

// ── Pages (Lazy loaded for faster initial load) ────────────────────────────
import Login        from './pages/Login';
import Register     from './pages/Register';

const Dashboard     = lazy(() => import('./pages/Dashboard'));
const Accounts      = lazy(() => import('./pages/Accounts'));
const Cards         = lazy(() => import('./pages/Cards'));
const Loans         = lazy(() => import('./pages/Loans'));
const FixedDeposits = lazy(() => import('./pages/FixedDeposits'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Checkbook     = lazy(() => import('./pages/Checkbook'));
const Transactions  = lazy(() => import('./pages/Transactions'));
const Statement     = lazy(() => import('./pages/Statement'));
const Profile       = lazy(() => import('./pages/Profile'));
const AdminPanel    = lazy(() => import('./pages/AdminPanel'));
const KycUpload     = lazy(() => import('./pages/KycUpload'));
const Complaints    = lazy(() => import('./pages/Complaints'));

// ── Route Guards ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
    const { user, isAdmin } = useAuth();
    if (!user)      return <Navigate to="/login" replace />;
    if (!isAdmin()) return <Navigate to="/dashboard" replace />;
    return children;
};

// ── Suspense fallback ──────────────────────────────────────────────────────
const PageLoader = () => {
    const { isDark } = useTheme();
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isDark ? '#070D1A' : '#F0F4FF',
            flexDirection: 'column', gap: 14,
        }}>
            <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'linear-gradient(135deg,#2563EB,#06B6D4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                animation: 'spin .8s linear infinite',
            }}>🏦</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{
                fontSize: 13, fontWeight: 600,
                color: isDark ? '#475569' : '#94A3B8',
                fontFamily: 'system-ui, sans-serif',
                letterSpacing: .3,
            }}>Loading…</div>
        </div>
    );
};

// ── 404 Page ───────────────────────────────────────────────────────────────
const NotFound = () => {
    const { isDark } = useTheme();
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: isDark ? '#070D1A' : '#F0F4FF',
            fontFamily: 'system-ui, sans-serif', gap: 10,
        }}>
            <div style={{ fontSize: 64 }}>🏦</div>
            <div style={{
                fontSize: 80, fontWeight: 900,
                background: 'linear-gradient(135deg,#2563EB,#06B6D4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1,
            }}>404</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#E2E8F0' : '#0F172A' }}>
                Page not found
            </div>
            <div style={{ fontSize: 13, color: isDark ? '#475569' : '#94A3B8', marginBottom: 8 }}>
                The page you're looking for doesn't exist.
            </div>
            <a href="/dashboard" style={{
                padding: '10px 24px', borderRadius: 12,
                background: 'linear-gradient(135deg,#2563EB,#06B6D4)',
                color: '#fff', textDecoration: 'none',
                fontWeight: 700, fontSize: 13,
                boxShadow: '0 6px 20px rgba(59,130,246,.35)',
            }}>← Go to Dashboard</a>
        </div>
    );
};

// ── Theme-aware Toaster ────────────────────────────────────────────────────
const ThemedToaster = () => {
    const { isDark } = useTheme();
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3500,
                style: {
                    background:  isDark ? '#0F172A' : '#ffffff',
                    color:       isDark ? '#E2E8F0' : '#0F172A',
                    border:      isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(59,130,246,.15)',
                    borderRadius: 14,
                    fontSize:    13,
                    fontWeight:  600,
                    fontFamily:  'system-ui, sans-serif',
                    boxShadow:   isDark
                        ? '0 8px 32px rgba(0,0,0,.5)'
                        : '0 8px 32px rgba(59,130,246,.12)',
                    padding: '12px 16px',
                },
                success: {
                    iconTheme: { primary: '#10B981', secondary: isDark ? '#0F172A' : '#fff' },
                },
                error: {
                    iconTheme: { primary: '#EF4444', secondary: isDark ? '#0F172A' : '#fff' },
                },
            }}
        />
    );
};

// ── Main App ───────────────────────────────────────────────────────────────
function AppRoutes() {
    return (
        <>
            <ThemedToaster />
            <Suspense fallback={<PageLoader />}>
                <Routes>

                    {/* ── Public ── */}
                    <Route path="/login"    element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/"         element={<Navigate to="/login" replace />} />

                    {/* ── Customer ── */}
                    <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/accounts"     element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
                    <Route path="/cards"        element={<ProtectedRoute><Cards /></ProtectedRoute>} />
                    <Route path="/loans"        element={<ProtectedRoute><Loans /></ProtectedRoute>} />
                    <Route path="/fd"           element={<ProtectedRoute><FixedDeposits /></ProtectedRoute>} />
                    <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                    <Route path="/statement"    element={<ProtectedRoute><Statement /></ProtectedRoute>} />
                    <Route path="/checkbook"    element={<ProtectedRoute><Checkbook /></ProtectedRoute>} />
                    <Route path="/notifications"element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/kyc"          element={<ProtectedRoute><KycUpload /></ProtectedRoute>} />
                    <Route path="/complaints"   element={<ProtectedRoute><Complaints /></ProtectedRoute>} />

                    {/* ── Admin ── */}
                    <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

                    {/* ── 404 ── */}
                    <Route path="*" element={<NotFound />} />

                </Routes>
            </Suspense>
        </>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}