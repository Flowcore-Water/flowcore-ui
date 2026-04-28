import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme } from './ThemeContext';
import { pushCapturedError } from './bugReport';
const VARIANT_ICONS = {
    error: '\u2715', // ✕
    warning: '\u26A0', // ⚠
    info: '\u2139', // ℹ
    success: '\u2713', // ✓
};
export function AlertBanner({ variant, message, error, sentryEventId, persistent = false, onDismiss, onRetry, }) {
    const { t } = useTheme();
    const [dismissed, setDismissed] = useState(false);
    const [copyState, setCopyState] = useState('idle');
    const errorObj = error instanceof Error ? error : null;
    const displayMessage = message ?? (errorObj ? errorObj.message : error != null ? String(error) : 'An error occurred');
    const stack = errorObj?.stack ?? null;
    const capturedRef = useRef(false);
    useEffect(() => {
        if (variant === 'error' && !capturedRef.current) {
            capturedRef.current = true;
            pushCapturedError({
                message: displayMessage,
                stack: stack ?? null,
                timestamp: Date.now(),
            });
        }
    }, [variant, displayMessage, stack]);
    const colors = {
        error: { text: t.fail, bg: t.failBg, border: t.failBorder },
        warning: { text: t.warn, bg: t.warnBg, border: t.warnBorder },
        info: { text: t.info, bg: t.infoBg, border: t.infoBorder },
        success: { text: t.success, bg: t.successBg, border: t.successBorder },
    }[variant];
    const handleCopy = useCallback(async (type) => {
        let text;
        if (type === 'error') {
            text = displayMessage;
            if (sentryEventId)
                text += `\nSentry Event ID: ${sentryEventId}`;
        }
        else {
            const parts = [`Error: ${displayMessage}`];
            if (sentryEventId)
                parts.push(`Sentry Event ID: ${sentryEventId}`);
            parts.push('', 'Stack Trace:', stack ?? '(no stack trace)');
            text = parts.join('\n');
        }
        await navigator.clipboard.writeText(text);
        setCopyState(type === 'error' ? 'copied-error' : 'copied-stack');
        setTimeout(() => setCopyState('idle'), 1500);
    }, [displayMessage, sentryEventId, stack]);
    const handleDismiss = useCallback(() => {
        setDismissed(true);
        onDismiss?.();
    }, [onDismiss]);
    if (dismissed)
        return null;
    const ghostButton = (label, copiedLabel, isActive, onClick) => (_jsx("button", { onClick: onClick, style: {
            background: 'transparent',
            border: `1px solid ${colors.text}`,
            borderRadius: 5,
            padding: '3px 10px',
            fontSize: 12,
            color: colors.text,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            opacity: isActive ? 1 : 0.8,
            fontWeight: isActive ? 600 : 400,
        }, children: isActive ? copiedLabel : label }));
    return (_jsxs("div", { role: "alert", style: {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            color: colors.text,
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            animation: 'alertBannerSlideIn 200ms ease-out',
        }, children: [_jsx("span", { style: { fontSize: 16, lineHeight: 1, flexShrink: 0 }, children: VARIANT_ICONS[variant] }), _jsx("span", { style: { flex: 1, color: t.textPrimary }, children: displayMessage }), _jsxs("div", { style: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }, children: [ghostButton(variant === 'error' ? 'Copy Error' : 'Copy Message', 'Copied!', copyState === 'copied-error', () => void handleCopy('error')), stack && ghostButton('Copy Stack', 'Copied!', copyState === 'copied-stack', () => void handleCopy('stack')), onRetry && (_jsx("button", { onClick: onRetry, style: {
                            background: colors.text,
                            color: colors.bg,
                            border: 'none',
                            borderRadius: 5,
                            padding: '3px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }, children: "Retry" })), !persistent && (_jsx("button", { onClick: handleDismiss, "aria-label": "Dismiss alert", style: {
                            background: 'transparent',
                            border: 'none',
                            color: t.textMuted,
                            cursor: 'pointer',
                            fontSize: 18,
                            lineHeight: 1,
                            padding: '0 4px',
                        }, children: "\u00D7" }))] }), _jsx("style", { children: `
        @keyframes alertBannerSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      ` })] }));
}
//# sourceMappingURL=AlertBanner.js.map