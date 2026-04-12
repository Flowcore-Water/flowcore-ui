import { useTheme } from './ThemeContext';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'accent' | 'primary';
  size?: 'sm' | 'md';
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function Button({ children, onClick, variant = 'default', size = 'md', disabled, type = 'button' }: ButtonProps) {
  const { t } = useTheme();

  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-xs'
    : 'px-4 py-2 text-sm';

  const colors = variant === 'primary'
    ? { background: t.accent, borderColor: t.accent, color: t.cardBg }
    : variant === 'accent'
      ? { background: t.accentBg, borderColor: t.accent, color: t.accent }
      : { background: t.buttonBg, borderColor: t.buttonBorder, color: t.buttonText };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md border font-medium transition-colors disabled:opacity-40 ${sizeClasses}`}
      style={colors}
    >
      {children}
    </button>
  );
}
