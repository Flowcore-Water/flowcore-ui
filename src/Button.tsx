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

  const sizeStyles = size === 'sm'
    ? { padding: '6px 12px', fontSize: 12 }
    : { padding: '8px 16px', fontSize: 14 };

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
      style={{
        ...sizeStyles,
        ...colors,
        borderRadius: 6,
        border: `1px solid ${colors.borderColor}`,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
      }}
    >
      {children}
    </button>
  );
}
