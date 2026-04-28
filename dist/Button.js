import { jsx as _jsx } from "react/jsx-runtime";
import { useTheme } from './ThemeContext';
export function Button({ children, onClick, variant = 'default', size = 'md', disabled, type = 'button' }) {
    const { t } = useTheme();
    const sizeStyles = size === 'sm'
        ? { padding: '6px 12px', fontSize: 12 }
        : { padding: '8px 16px', fontSize: 14 };
    const colors = variant === 'primary'
        ? { background: t.accent, borderColor: t.accent, color: t.cardBg }
        : variant === 'accent'
            ? { background: t.accentBg, borderColor: t.accent, color: t.accent }
            : { background: t.buttonBg, borderColor: t.buttonBorder, color: t.buttonText };
    return (_jsx("button", { type: type, onClick: onClick, disabled: disabled, style: {
            ...sizeStyles,
            ...colors,
            borderRadius: 6,
            border: `1px solid ${colors.borderColor}`,
            fontWeight: 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.4 : 1,
            transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
        }, children: children }));
}
//# sourceMappingURL=Button.js.map