import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
const NAV_BINDINGS = [
    { keys: 'j / k', action: 'Move cursor down / up' },
    { keys: '{ / }', action: 'Previous / next card' },
    { keys: 'g g', action: 'Go to top' },
    { keys: 'G', action: 'Go to bottom' },
    { keys: '/', action: 'Cursor to search' },
    { keys: 'Space', action: 'Activate selected element' },
    { keys: 'Enter', action: 'Activate selected element' },
    { keys: 'Esc', action: 'Exit scope / clear / blur' },
    { keys: '?', action: 'Toggle this help' },
];
const SELECTION_BINDINGS = [
    { keys: 'x', action: 'Select / deselect row' },
    { keys: '* a', action: 'Select all rows' },
    { keys: '* n', action: 'Select none' },
    { keys: ']', action: 'Preview selected row' },
    { keys: 'e', action: 'Archive selected rows' },
    { keys: '#', action: 'Delete selected rows' },
    { keys: 'Esc', action: 'Clear selection' },
];
const CLIPBOARD_BINDINGS = [
    { keys: 'c', action: 'Copy (click copy button)' },
    { keys: 'y', action: 'Yank record to clipboard' },
];
const SIDEBAR_BINDINGS = [
    { keys: '[', action: 'Toggle left sidebar' },
    { keys: 'Ctrl+h', action: 'Move to left sidebar' },
    { keys: 'Ctrl+l', action: 'Move to right sidebar' },
];
const GLOBAL_BINDINGS = [
    { keys: 'Ctrl/Cmd+K', action: 'Spotlight search' },
];
const TMUX_BINDINGS = [
    { keys: 'Ctrl+b  t', action: 'Cycle theme' },
    { keys: 'Ctrl+b  a', action: 'App launcher' },
    { keys: 'Ctrl+b  b', action: 'Bug report' },
    { keys: 'Ctrl+b  1-9', action: 'Jump to nav item' },
    { keys: 'Ctrl+b  s', action: 'Cursor to search' },
    { keys: 'Ctrl+b  ?', action: 'Show shortcuts' },
];
function BindingRow({ keys, action, t }) {
    return (_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }, children: [_jsx("span", { style: { color: t.textSecondary, fontSize: 13 }, children: action }), _jsx("kbd", { style: {
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: t.surfaceHover,
                    color: t.textPrimary,
                    border: `1px solid ${t.borderSubtle}`,
                    whiteSpace: 'nowrap',
                }, children: keys })] }));
}
function BindingSection({ label, bindings, t, border }) {
    return (_jsxs("div", { style: border ? { borderTop: `1px solid ${t.borderSubtle}`, paddingTop: 12, marginTop: 8 } : { marginBottom: 16 }, children: [_jsx("div", { style: {
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: t.accent,
                    marginBottom: 8,
                    fontFamily: 'ui-monospace, monospace',
                }, children: label }), bindings.map((b) => (_jsx(BindingRow, { ...b, t: t }, b.keys)))] }));
}
export const KeyboardHelpOverlay = ({ open, onClose, t }) => {
    const panelRef = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const handler = (e) => {
            if (e.key === 'Escape' || e.key === '?') {
                e.preventDefault();
                onClose();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);
    if (!open)
        return null;
    return (_jsx("div", { onClick: onClose, style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
        }, children: _jsxs("div", { ref: panelRef, onClick: (e) => e.stopPropagation(), style: {
                width: 'min(480px, 100%)',
                maxHeight: 'calc(100vh - 48px)',
                overflowY: 'auto',
                background: t.cardBg,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                padding: 24,
            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }, children: [_jsx("h2", { style: { margin: 0, fontSize: 18, fontWeight: 700, color: t.textPrimary }, children: "Keyboard Shortcuts" }), _jsx("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                color: t.textMuted,
                                fontSize: 20,
                                cursor: 'pointer',
                                padding: 4,
                                lineHeight: 1,
                            }, children: "x" })] }), _jsx(BindingSection, { label: "navigation", bindings: NAV_BINDINGS, t: t }), _jsx(BindingSection, { label: "selection", bindings: SELECTION_BINDINGS, t: t, border: true }), _jsx(BindingSection, { label: "clipboard", bindings: CLIPBOARD_BINDINGS, t: t, border: true }), _jsx(BindingSection, { label: "sidebars", bindings: SIDEBAR_BINDINGS, t: t, border: true }), _jsx(BindingSection, { label: "global", bindings: GLOBAL_BINDINGS, t: t, border: true }), _jsx(BindingSection, { label: "app commands (Ctrl+b prefix)", bindings: TMUX_BINDINGS, t: t, border: true }), _jsxs("div", { style: {
                        marginTop: 16,
                        paddingTop: 12,
                        borderTop: `1px solid ${t.borderSubtle}`,
                        fontSize: 11,
                        color: t.textMuted,
                    }, children: ["Navigation uses a visual cursor (blue outline). Press Space to activate.", _jsx("br", {}), "Shortcuts are disabled when typing in inputs. Press Esc to exit."] })] }) }));
};
//# sourceMappingURL=KeyboardHelpOverlay.js.map