import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
export const AppLauncher = ({ apps, currentAppSlug, theme: t, dropdownAlign = 'right' }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape')
                setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);
    return (_jsxs("div", { ref: containerRef, style: { position: 'relative' }, children: [_jsx("button", { onClick: () => setOpen((prev) => !prev), "aria-label": "App launcher", "aria-expanded": open, style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    padding: 8,
                    transition: 'background 150ms',
                    background: open ? t.surfaceHover : 'transparent',
                    color: t.textSecondary,
                    border: 'none',
                    cursor: 'pointer',
                }, onMouseEnter: (e) => {
                    if (!open)
                        e.currentTarget.style.background = t.surfaceHover;
                }, onMouseLeave: (e) => {
                    if (!open)
                        e.currentTarget.style.background = open ? t.surfaceHover : 'transparent';
                }, children: _jsx(GridIcon, { color: t.textSecondary }) }), open && (_jsxs("div", { style: {
                    position: 'absolute',
                    ...(dropdownAlign === 'left' ? { left: 0 } : { right: 0 }),
                    top: '100%',
                    marginTop: 8,
                    borderRadius: 12,
                    border: `1px solid ${t.border}`,
                    padding: 16,
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)',
                    background: t.cardBg,
                    width: 320,
                    zIndex: 9999,
                    animation: 'appLauncherFadeIn 150ms ease-out',
                }, children: [_jsx("p", { style: {
                            marginBottom: 12,
                            fontSize: 12,
                            fontFamily: 'ui-monospace, monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: t.sectionHeading,
                            margin: '0 0 12px',
                        }, children: "Flowcore Apps" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }, children: apps.map((app) => {
                            const isCurrent = app.slug === currentAppSlug;
                            return (_jsxs("a", { href: app.url, style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 6,
                                    borderRadius: 8,
                                    padding: '10px 8px',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    transition: 'background 150ms',
                                    background: isCurrent ? t.accentBg : 'transparent',
                                    border: 'none',
                                    boxShadow: isCurrent ? `inset 0 0 0 1px ${t.accent}` : 'none',
                                }, onMouseEnter: (e) => {
                                    if (!isCurrent)
                                        e.currentTarget.style.background = t.surfaceHover;
                                }, onMouseLeave: (e) => {
                                    if (!isCurrent)
                                        e.currentTarget.style.background = 'transparent';
                                }, children: [_jsx(AppIcon, { app: app, theme: t }), _jsx("span", { style: {
                                            fontSize: 12,
                                            lineHeight: 1.3,
                                            color: isCurrent ? t.accent : t.textSecondary,
                                            fontWeight: isCurrent ? 600 : 400,
                                        }, children: app.display_name })] }, app.slug));
                        }) })] })), _jsx("style", { children: `
        @keyframes appLauncherFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      ` })] }));
};
const GridIcon = ({ color, size = 20 }) => (_jsxs("svg", { width: size, height: size, viewBox: "0 0 20 20", fill: color, children: [_jsx("circle", { cx: "4", cy: "4", r: "1.8" }), _jsx("circle", { cx: "10", cy: "4", r: "1.8" }), _jsx("circle", { cx: "16", cy: "4", r: "1.8" }), _jsx("circle", { cx: "4", cy: "10", r: "1.8" }), _jsx("circle", { cx: "10", cy: "10", r: "1.8" }), _jsx("circle", { cx: "16", cy: "10", r: "1.8" }), _jsx("circle", { cx: "4", cy: "16", r: "1.8" }), _jsx("circle", { cx: "10", cy: "16", r: "1.8" }), _jsx("circle", { cx: "16", cy: "16", r: "1.8" })] }));
const AppIcon = ({ app, theme }) => {
    if (app.icon_url) {
        return (_jsx("img", { src: app.icon_url, alt: "", width: 32, height: 32, style: { borderRadius: 8, background: theme.surfaceHover } }));
    }
    const initial = app.display_name.charAt(0).toUpperCase();
    return (_jsx("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            width: 32,
            height: 32,
            background: theme.accentDim,
            color: '#fff',
        }, children: initial }));
};
//# sourceMappingURL=AppLauncher.js.map