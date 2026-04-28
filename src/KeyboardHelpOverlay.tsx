import React, { useEffect, useRef } from 'react';
import type { ThemeColors } from './theme';

export interface KeyboardHelpOverlayProps {
  open: boolean;
  onClose: () => void;
  t: ThemeColors;
}

interface Binding {
  keys: string;
  action: string;
}

const VIM_BINDINGS: Binding[] = [
  { keys: 'j / k', action: 'Move down / up' },
  { keys: 'h / l', action: 'Toggle sidebar' },
  { keys: '/', action: 'Focus search' },
  { keys: 'g g', action: 'Go to top' },
  { keys: 'G', action: 'Go to bottom' },
  { keys: 'o', action: 'Open / expand' },
  { keys: 'Esc', action: 'Close / blur / deselect' },
  { keys: 'Enter', action: 'Activate focused item' },
  { keys: '?', action: 'Toggle this help' },
];

const TMUX_BINDINGS: Binding[] = [
  { keys: 'Ctrl+b  t', action: 'Cycle theme' },
  { keys: 'Ctrl+b  a', action: 'App launcher' },
  { keys: 'Ctrl+b  1-9', action: 'Jump to nav item' },
  { keys: 'Ctrl+b  s', action: 'Focus search' },
  { keys: 'Ctrl+b  ?', action: 'Show shortcuts' },
];

function BindingRow({ keys, action, t }: Binding & { t: ThemeColors }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <span style={{ color: t.textSecondary, fontSize: 13 }}>{action}</span>
      <kbd style={{
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 4,
        background: t.surfaceHover,
        color: t.textPrimary,
        border: `1px solid ${t.borderSubtle}`,
        whiteSpace: 'nowrap',
      }}>
        {keys}
      </kbd>
    </div>
  );
}

export const KeyboardHelpOverlay: React.FC<KeyboardHelpOverlayProps> = ({ open, onClose, t }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(480px, 100%)',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          background: t.cardBg,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.textPrimary }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: t.textMuted,
              fontSize: 20,
              cursor: 'pointer',
              padding: 4,
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>

        {/* Vim section */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: t.accent,
            marginBottom: 8,
            fontFamily: 'ui-monospace, monospace',
          }}>
            vim
          </div>
          {VIM_BINDINGS.map((b) => (
            <BindingRow key={b.keys} {...b} t={t} />
          ))}
        </div>

        {/* Tmux section */}
        <div style={{ borderTop: `1px solid ${t.borderSubtle}`, paddingTop: 16 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: t.accent,
            marginBottom: 8,
            fontFamily: 'ui-monospace, monospace',
          }}>
            tmux (Ctrl+b prefix)
          </div>
          {TMUX_BINDINGS.map((b) => (
            <BindingRow key={b.keys} {...b} t={t} />
          ))}
        </div>

        <div style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: `1px solid ${t.borderSubtle}`,
          fontSize: 11,
          color: t.textMuted,
        }}>
          Keyboard shortcuts are disabled when typing in inputs. Press Esc to blur.
        </div>
      </div>
    </div>
  );
};
