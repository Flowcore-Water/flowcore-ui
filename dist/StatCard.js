import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from './ThemeContext';
export function StatCard({ label, value, color, icon, onClick, active }) {
    const { t } = useTheme();
    const accentColor = color || t.accent;
    const isClickable = !!onClick;
    return (_jsxs("div", { onClick: onClick, style: {
            background: t.cardBg,
            border: `1px solid ${active ? accentColor : t.border}`,
            borderRadius: 10,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            cursor: isClickable ? 'pointer' : undefined,
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxShadow: active ? `0 0 0 1px ${accentColor}40` : undefined,
            outline: 'none',
        }, children: [_jsxs("span", { style: { fontSize: 12, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }, children: [icon && _jsx("span", { style: { marginRight: 6 }, children: icon }), label] }), _jsx("span", { style: { fontSize: 28, fontWeight: 700, color: accentColor }, children: typeof value === 'number' ? value.toLocaleString() : value })] }));
}
//# sourceMappingURL=StatCard.js.map