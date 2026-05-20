import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
const THEME_LABELS = {
    default: 'DEFAULT',
    retro: 'RETRO',
    light: 'LIGHT',
};
const THEME_ORDER = ['default', 'retro', 'light'];
/**
 * Shared theme selector dropdown for the sidebar.
 * Displays current theme as "// GO {THEME}" and opens a menu to pick another.
 */
export const ThemeDropdown = ({ theme, onSelect, t }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    // Close on outside click
    useEffect(() => {
        if (!open)
            return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);
    const otherThemes = THEME_ORDER.filter((n) => n !== theme);
    // Pill colors per theme
    const pillStyle = () => {
        if (theme === 'retro') {
            return {
                background: 'rgba(255, 42, 109, 0.15)',
                border: '1px solid rgba(255, 42, 109, 0.4)',
                color: '#ff2a6d',
            };
        }
        if (theme === 'light') {
            return {
                background: 'rgba(55, 148, 234, 0.12)',
                border: '1px solid rgba(55, 148, 234, 0.3)',
                color: '#3794EA',
            };
        }
        // default
        return {
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: '#a78bfa',
        };
    };
    return (_jsxs("div", { ref: ref, style: { position: 'relative' }, children: [_jsxs("button", { onClick: () => setOpen((v) => !v), style: {
                    ...pillStyle(),
                    borderRadius: 9999,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                    fontFamily: 'ui-monospace, monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }, children: [_jsxs("span", { children: ["// GO ", THEME_LABELS[theme]] }), _jsx("span", { style: { fontSize: 8, opacity: 0.7 }, children: open ? '\u25B2' : '\u25BC' })] }), open && (_jsx("div", { style: {
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    marginBottom: 4,
                    minWidth: 140,
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: 8,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    overflow: 'hidden',
                    zIndex: 50,
                }, children: otherThemes.map((name) => (_jsxs("button", { onClick: () => { onSelect(name); setOpen(false); }, style: {
                        display: 'block',
                        width: '100%',
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: 'ui-monospace, monospace',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: t.textSecondary,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 100ms',
                    }, onMouseEnter: (e) => { e.currentTarget.style.background = t.surfaceHover; }, onMouseLeave: (e) => { e.currentTarget.style.background = 'transparent'; }, children: ["// GO ", THEME_LABELS[name]] }, name))) }))] }));
};
//# sourceMappingURL=ThemeDropdown.js.map