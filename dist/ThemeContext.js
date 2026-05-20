import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { themes, applyThemeCSSVars } from './theme';
const ThemeContext = createContext(undefined);
const THEME_KEY = 'flowcore_theme';
const COOKIE_DOMAIN = '.flowcorewater.com';
const COOKIE_MAX_AGE = 31536000; // 1 year in seconds
const THEME_ORDER = ['default', 'retro', 'light'];
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
    const raw = getCookieValue(THEME_KEY) ?? (() => {
        try {
            return localStorage.getItem(THEME_KEY);
        }
        catch {
            return null;
        }
    })();
    if (raw === 'retro' || raw === 'light')
        return raw;
    return 'default';
}
function persistTheme(value) {
    setCookieValue(THEME_KEY, value);
    try {
        localStorage.setItem(THEME_KEY, value);
    }
    catch { }
}
export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(readTheme);
    const setTheme = useCallback((name) => {
        setThemeState(name);
        persistTheme(name);
    }, []);
    const cycleTheme = useCallback(() => {
        setThemeState((prev) => {
            const idx = THEME_ORDER.indexOf(prev);
            const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
            persistTheme(next);
            return next;
        });
    }, []);
    const t = themes[theme];
    // Backward compat
    const isRetro = theme === 'retro';
    const toggleTheme = cycleTheme;
    useEffect(() => {
        document.body.style.background = t.pageBg;
        document.body.style.color = t.textPrimary;
        applyThemeCSSVars(t);
    }, [t]);
    return (_jsx(ThemeContext.Provider, { value: { theme, setTheme, cycleTheme, t, isRetro, toggleTheme }, children: children }));
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
//# sourceMappingURL=ThemeContext.js.map