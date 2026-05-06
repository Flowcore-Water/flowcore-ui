import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useMemo } from 'react';
function buildResults(apps, navItems, currentAppSlug, currentAppTitle) {
    const results = [];
    // Current app nav items first
    for (const entry of navItems) {
        if ('kind' in entry && entry.kind === 'group') {
            for (const item of entry.items) {
                results.push({
                    label: item.label,
                    url: item.to,
                    category: currentAppTitle || 'Current App',
                    icon: item.icon,
                });
            }
        }
        else {
            const item = entry;
            results.push({
                label: item.label,
                url: item.to,
                category: currentAppTitle || 'Current App',
                icon: item.icon,
            });
        }
    }
    // Cross-app links (skip current app)
    for (const app of apps) {
        if (app.slug === currentAppSlug)
            continue;
        results.push({
            label: app.display_name,
            url: app.url,
            category: 'Apps',
        });
    }
    return results;
}
export const SpotlightSearch = ({ open, onClose, theme: t, apps = [], navItems = [], currentAppSlug, currentAppTitle, onNavigate, }) => {
    const [query, setQuery] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);
    const inputRef = useRef(null);
    const allResults = useMemo(() => buildResults(apps, navItems, currentAppSlug, currentAppTitle), [apps, navItems, currentAppSlug, currentAppTitle]);
    const filtered = useMemo(() => {
        if (!query.trim())
            return allResults;
        const q = query.toLowerCase();
        return allResults.filter((r) => r.label.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }, [query, allResults]);
    // Reset on open
    useEffect(() => {
        if (open) {
            setQuery('');
            setSelectedIdx(0);
            requestAnimationFrame(() => inputRef.current?.focus());
        }
    }, [open]);
    // Clamp selection
    useEffect(() => {
        if (selectedIdx >= filtered.length) {
            setSelectedIdx(Math.max(0, filtered.length - 1));
        }
    }, [filtered.length, selectedIdx]);
    function navigate(result) {
        if (result.url.startsWith('http')) {
            window.location.href = result.url;
        }
        else if (onNavigate) {
            onNavigate(result.url);
        }
        onClose();
    }
    useEffect(() => {
        if (!open)
            return;
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                onClose();
                return;
            }
            if (e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'j')) {
                e.preventDefault();
                setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
                return;
            }
            if (e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'k')) {
                e.preventDefault();
                setSelectedIdx((i) => Math.max(i - 1, 0));
                return;
            }
            if (e.key === 'Enter' && filtered.length > 0) {
                e.preventDefault();
                navigate(filtered[selectedIdx]);
                return;
            }
        }
        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [open, onClose, filtered, selectedIdx]);
    if (!open)
        return null;
    return (_jsxs("div", { onClick: onClose, style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            zIndex: 9500,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '15vh',
        }, children: [_jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
                    width: 'min(560px, 90vw)',
                    maxHeight: '60vh',
                    background: t.cardBg,
                    border: `1px solid ${t.border}`,
                    borderRadius: 16,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'spotlightFadeIn 120ms ease-out',
                }, children: [_jsxs("div", { style: {
                            padding: '16px 20px',
                            borderBottom: `1px solid ${t.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                        }, children: [_jsx(SearchIcon, { color: t.textMuted }), _jsx("input", { ref: inputRef, type: "text", value: query, onChange: (e) => {
                                    setQuery(e.target.value);
                                    setSelectedIdx(0);
                                }, placeholder: "Search pages, apps, and actions\\u2026", style: {
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: t.textPrimary,
                                    fontSize: 16,
                                    fontFamily: 'inherit',
                                } }), _jsx("kbd", { style: {
                                    fontFamily: 'ui-monospace, monospace',
                                    fontSize: 11,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    background: t.surfaceHover,
                                    color: t.textMuted,
                                    border: `1px solid ${t.borderSubtle}`,
                                }, children: "esc" })] }), _jsx("div", { style: { overflowY: 'auto', padding: '4px 0' }, children: filtered.length === 0 ? (_jsxs("div", { style: {
                                padding: '32px 20px',
                                textAlign: 'center',
                                color: t.textMuted,
                                fontSize: 13,
                            }, children: ["No results for \u201C", query, "\u201D"] })) : (filtered.map((result, i) => (_jsxs("button", { onClick: () => navigate(result), style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '10px 20px',
                                border: 'none',
                                background: i === selectedIdx ? t.surfaceHover : 'transparent',
                                color: i === selectedIdx ? t.textPrimary : t.textSecondary,
                                fontSize: 14,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 80ms',
                            }, onMouseEnter: () => setSelectedIdx(i), children: [_jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [result.icon && (_jsx("span", { style: { width: 18, textAlign: 'center', fontSize: 15, flexShrink: 0 }, children: result.icon })), _jsx("span", { children: result.label })] }), _jsx("span", { style: {
                                        fontSize: 11,
                                        color: t.textMuted,
                                        fontFamily: 'ui-monospace, monospace',
                                    }, children: result.category })] }, `${result.category}-${result.url}`)))) }), _jsxs("div", { style: {
                            padding: '10px 20px',
                            borderTop: `1px solid ${t.border}`,
                            display: 'flex',
                            gap: 16,
                            fontSize: 11,
                            color: t.textMuted,
                        }, children: [_jsxs("span", { children: [_jsx("kbd", { style: { fontFamily: 'ui-monospace, monospace', fontWeight: 600 }, children: "\u2191\u2193" }), ' ', "navigate"] }), _jsxs("span", { children: [_jsx("kbd", { style: { fontFamily: 'ui-monospace, monospace', fontWeight: 600 }, children: "\u21B5" }), ' ', "open"] }), _jsxs("span", { children: [_jsx("kbd", { style: { fontFamily: 'ui-monospace, monospace', fontWeight: 600 }, children: "esc" }), ' ', "close"] })] })] }), _jsx("style", { children: `
        @keyframes spotlightFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      ` })] }));
};
function SearchIcon({ color, size = 18 }) {
    return (_jsxs("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })] }));
}
//# sourceMappingURL=SpotlightSearch.js.map