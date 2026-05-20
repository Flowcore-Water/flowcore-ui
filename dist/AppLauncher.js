import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
const GRID_COLS = 3;
export const AppLauncher = ({ apps, currentAppSlug, theme: t, dropdownAlign = 'right', isOpen, onOpenChange }) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const open = isOpen !== undefined ? isOpen : internalOpen;
    const setOpen = (next) => {
        const resolved = typeof next === 'function' ? next(open) : next;
        if (onOpenChange)
            onOpenChange(resolved);
        else
            setInternalOpen(resolved);
    };
    const containerRef = useRef(null);
    // Reset selection when opening
    useEffect(() => {
        if (open)
            setSelectedIdx(0);
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
                return;
            }
            const move = (dx, dy) => {
                e.preventDefault();
                setSelectedIdx((prev) => {
                    const col = prev % GRID_COLS;
                    const row = Math.floor(prev / GRID_COLS);
                    const maxRow = Math.floor((apps.length - 1) / GRID_COLS);
                    let nextCol = col + dx;
                    let nextRow = row + dy;
                    if (nextCol < 0)
                        nextCol = 0;
                    if (nextCol >= GRID_COLS)
                        nextCol = GRID_COLS - 1;
                    if (nextRow < 0)
                        nextRow = 0;
                    if (nextRow > maxRow)
                        nextRow = maxRow;
                    const idx = nextRow * GRID_COLS + nextCol;
                    return Math.min(idx, apps.length - 1);
                });
            };
            switch (e.key) {
                case 'h':
                case 'ArrowLeft':
                    move(-1, 0);
                    break;
                case 'l':
                case 'ArrowRight':
                    move(1, 0);
                    break;
                case 'k':
                case 'ArrowUp':
                    move(0, -1);
                    break;
                case 'j':
                case 'ArrowDown':
                    move(0, 1);
                    break;
                case 'Enter': {
                    e.preventDefault();
                    const app = apps[selectedIdx];
                    if (app) {
                        setOpen(false);
                        window.location.href = app.url;
                    }
                    break;
                }
            }
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open, apps, selectedIdx]);
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
                        }, children: "Flowcore Apps" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gap: 8 }, children: apps.map((app, idx) => {
                            const isCurrent = app.slug === currentAppSlug;
                            const isSelected = idx === selectedIdx;
                            return (_jsxs("a", { href: app.url, onMouseEnter: () => setSelectedIdx(idx), style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 6,
                                    borderRadius: 8,
                                    padding: '10px 8px',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    transition: 'background 150ms',
                                    background: isCurrent ? t.accentBg : isSelected ? t.surfaceHover : 'transparent',
                                    border: 'none',
                                    boxShadow: isCurrent ? `inset 0 0 0 1px ${t.accent}` : isSelected ? `inset 0 0 0 1px ${t.border}` : 'none',
                                }, children: [_jsx(AppIcon, { app: app, theme: t }), _jsx("span", { style: {
                                            fontSize: 12,
                                            lineHeight: 1.3,
                                            color: isCurrent ? t.accent : isSelected ? t.textPrimary : t.textSecondary,
                                            fontWeight: isCurrent || isSelected ? 600 : 400,
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