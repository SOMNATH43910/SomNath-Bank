import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // 1. localStorage check first
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        // 2. OS system preference fallback
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
    });

    useEffect(() => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        const root = document.documentElement;

        // Smooth theme transition
        root.style.transition = 'background-color .3s ease, color .3s ease';

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]);

    // Listen to OS theme change (optional — if user hasn't manually set)
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
        if (!mq) return;

        const handler = (e) => {
            // Only auto-switch if user hasn't manually saved a preference
            if (!localStorage.getItem('theme')) {
                setIsDark(e.matches);
            }
        };

        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleTheme = () => setIsDark(prev => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
};