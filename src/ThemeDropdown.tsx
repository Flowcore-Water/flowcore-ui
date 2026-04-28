import React, { useState, useRef, useEffect } from 'react';
import type { ThemeColors, ThemeName } from './theme';

export interface ThemeDropdownProps {
  /** Current theme name */
  theme: ThemeName;
  /** Callback when user selects a theme */
  onSelect: (name: ThemeName) => void;
  /** Theme color tokens for styling the dropdown itself */
  t: ThemeColors;
}

const THEME_LABELS: Record<ThemeName, string> = {
  default: 'DEFAULT',
  retro: 'RETRO',
  light: 'LIGHT',
};

const THEME_ORDER: ThemeName[] = ['default', 'retro', 'light'];

/**
 * Shared theme selector dropdown for the sidebar.
 * Displays current theme as "// GO {THEME}" and opens a menu to pick another.
 */
export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({ theme, onSelect, t }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const otherThemes = THEME_ORDER.filter((n) => n !== theme);

  // Pill colors per theme
  const pillStyle = (): React.CSSProperties => {
    if (theme === 'retro') {
      return {
        background: 'rgba(255, 42, 109, 0.15)',
        border: '1px solid rgba(255, 42, 109, 0.4)',
        color: '#ff2a6d',
      };
    }
    if (theme === 'light') {
      return {
        background: 'rgba(55, 148, 234, 0.12)',
        border: '1px solid rgba(55, 148, 234, 0.3)',
        color: '#3794EA',
      };
    }
    // default
    return {
      background: 'rgba(139, 92, 246, 0.12)',
      border: '1px solid rgba(139, 92, 246, 0.3)',
      color: '#a78bfa',
    };
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          ...pillStyle(),
          borderRadius: 9999,
          padding: '6px 12px',
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          transition: 'all 150ms',
          fontFamily: 'ui-monospace, monospace',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>// GO {THEME_LABELS[theme]}</span>
        <span style={{ fontSize: 8, opacity: 0.7 }}>{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: 4,
            minWidth: 140,
            background: t.cardBg,
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            zIndex: 50,
          }}
        >
          {otherThemes.map((name) => (
            <button
              key={name}
              onClick={() => { onSelect(name); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'ui-monospace, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: t.textSecondary,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 100ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = t.surfaceHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              // GO {THEME_LABELS[name]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
