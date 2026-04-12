import { useTheme } from './ThemeContext';

export interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
  const { t } = useTheme();
  const accentColor = color || t.accent;

  return (
    <div
      className="flex h-full min-h-[118px] flex-col rounded-xl border md:min-h-[126px]"
      style={{ background: t.cardBg, borderColor: t.border }}
    >
      <div
        className="min-h-[2.875rem] px-5 pt-[18px] pb-2 text-xs font-medium uppercase tracking-wide leading-snug md:px-6 md:pt-5"
        style={{ color: t.textMuted }}
      >
        {label}
      </div>
      <div
        className="flex flex-1 items-center justify-center px-5 pb-[18px] text-3xl font-bold leading-none md:px-6 md:pb-5 md:text-[2rem]"
        style={{ color: accentColor }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
