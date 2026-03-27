import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultTheme, retroTheme } from './theme';
const ThemeContext = createContext(undefined);
const THEME_KEY = 'flowcore_theme';
const COOKIE_DOMAIN = '.flowcorewater.com';
const COOKIE_MAX_AGE = 31536000; // 1 year in seconds
function getCookieValue(name) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}
function setCookieValue(name, value) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const domainPart = isLocalhost ? '' : `; domain=${COOKIE_DOMAIN}`;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/${domainPart}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}
function readTheme() {
    // Cookie first, localStorage fallback
    return getCookieValue(THEME_KEY) ?? (() => {
        try {
            return localStorage.getItem(THEME_KEY);
        }
        catch {
            return null;
        }
    })();
}
function persistTheme(value) {
    setCookieValue(THEME_KEY, value);
    try {
        localStorage.setItem(THEME_KEY, value);
    }
    catch { }
}
export const ThemeProvider = ({ children }) => {
    const [isRetro, setIsRetro] = useState(() => readTheme() === 'retro');
    const toggleTheme = useCallback(() => {
        setIsRetro((prev) => {
            const next = !prev;
            persistTheme(next ? 'retro' : 'default');
            return next;
        });
    }, []);
    const t = isRetro ? retroTheme : defaultTheme;
    useEffect(() => {
        document.body.style.background = t.pageBg;
        document.body.style.color = t.textPrimary;
    }, [t]);
    return (_jsx(ThemeContext.Provider, { value: { isRetro, toggleTheme, t }, children: children }));
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
//# sourceMappingURL=ThemeContext.js.map