import { useTheme } from './ThemeContext';

export interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
  onClick?: () => void;
  active?: boolean;
}

export function StatCard({ label, value, color, icon, onClick, active }: StatCardProps) {
  const { t } = useTheme();
  const accentColor = color || t.accent;
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      style={{
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
      }}
    >
      <span style={{ fontSize: 12, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 700, color: accentColor }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
