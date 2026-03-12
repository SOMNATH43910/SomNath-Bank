import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser]     = useState(null);
    const [token, setToken]   = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser  = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }
        setLoading(false);
    }, []);

    // ── Customer / Admin Login ─────────────────────────────────────────────
    const login = async (email, password) => {
        const response = await API.post('/auth/login', { email, password });
        const { token, role, fullName, email: userEmail } = response.data;
        const userData = { fullName, email: userEmail, role, userType: 'CUSTOMER' };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
        return userData;
    };

    // ── Staff Login (Manager / Branch Manager / Loan Officer / Cashier) ────
    const staffLogin = async (staffId, password, roleId) => {
        const response = await API.post('/auth/staff-login', { staffId, password });
        const { token, name, role, branch, email } = response.data;
        const userData = {
            fullName: name,
            staffId,
            email,
            role,
            branch,
            userType: 'STAFF',
        };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
        return userData;
    };

    // ── Logout ─────────────────────────────────────────────────────────────
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAdmin         = () => user?.role === 'ROLE_ADMIN'         || user?.role === 'ADMIN';
    const isCustomer      = () => user?.role === 'ROLE_CUSTOMER'      || user?.role === 'CUSTOMER'       || user?.role === 'ROLE_USER';
    const isStaff         = () => user?.userType === 'STAFF';
    const isManager       = () => user?.role === 'ROLE_MANAGER'       || user?.role === 'MANAGER';
    const isBranchManager = () => user?.role === 'ROLE_BRANCH_MANAGER'|| user?.role === 'BRANCH_MANAGER';
    const isLoanOfficer   = () => user?.role === 'ROLE_LOAN_OFFICER'  || user?.role === 'LOAN_OFFICER';
    const isCashier       = () => user?.role === 'ROLE_CASHIER'       || user?.role === 'CASHIER';

    return (
        <AuthContext.Provider value={{
            user, token, loading,
            login, staffLogin, logout,
            isAdmin, isCustomer, isStaff,
            isManager, isBranchManager, isLoanOfficer, isCashier,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);