import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultTheme, retroTheme, type ThemeColors } from './theme';

export type { ThemeColors };

interface ThemeContextType {
  isRetro: boolean;
  toggleTheme: () => void;
  t: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'flowcore_theme';
const COOKIE_DOMAIN = '.flowcorewater.com';
const COOKIE_MAX_AGE = 31536000; // 1 year in seconds

function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookieValue(name: string, value: string): void {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const domainPart = isLocalhost ? '' : `; domain=${COOKIE_DOMAIN}`;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/${domainPart}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function readTheme(): string | null {
  // Cookie first, localStorage fallback
  return getCookieValue(THEME_KEY) ?? (() => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  })();
}

function persistTheme(value: string): void {
  setCookieValue(THEME_KEY, value);
  try { localStorage.setItem(THEME_KEY, value); } catch {}
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <ThemeContext.Provider value={{ isRetro, toggleTheme, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
