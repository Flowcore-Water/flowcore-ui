import React, { useState, useRef, useEffect } from 'react';
import type { ThemeColors } from './theme';

export interface AppInfo {
  slug: string;
  display_name: string;
  url: string;
  icon_url?: string | null;
}

export interface AppLauncherProps {
  apps: AppInfo[];
  currentAppSlug?: string;
  theme: ThemeColors;
}

export const AppLauncher: React.FC<AppLauncherProps> = ({ apps, currentAppSlug, theme: t }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="App launcher"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          padding: 8,
          transition: 'background 150ms',
          background: open ? t.surfaceHover : 'transparent',
          color: t.textSecondary,
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = t.surfaceHover;
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = open ? t.surfaceHover : 'transparent';
        }}
      >
        <GridIcon color={t.textSecondary} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 8,
            borderRadius: 12,
            border: `1px solid ${t.border}`,
            padding: 16,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)',
            background: t.cardBg,
            width: 280,
            zIndex: 9999,
            animation: 'appLauncherFadeIn 150ms ease-out',
          }}
        >
          <p
            style={{
              marginBottom: 12,
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: t.sectionHeading,
              margin: '0 0 12px',
            }}
          >
            Flowcore Apps
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {apps.map((app) => {
              const isCurrent = app.slug === currentAppSlug;
              return (
                <a
                  key={app.slug}
                  href={app.url}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    borderRadius: 8,
                    padding: 12,
                    textAlign: 'center',
                    textDecoration: 'none',
                    transition: 'background 150ms',
                    background: isCurrent ? t.accentBg : 'transparent',
                    border: `1px solid ${isCurrent ? t.accent : 'transparent'}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = t.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <AppIcon app={app} theme={t} />
                  <span
                    style={{
                      fontSize: 12,
                      lineHeight: 1.3,
                      color: isCurrent ? t.accent : t.textSecondary,
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                  >
                    {app.display_name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes appLauncherFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

interface GridIconProps {
  color: string;
  size?: number;
}

const GridIcon: React.FC<GridIconProps> = ({ color, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
    <circle cx="4" cy="4" r="1.8" />
    <circle cx="10" cy="4" r="1.8" />
    <circle cx="16" cy="4" r="1.8" />
    <circle cx="4" cy="10" r="1.8" />
    <circle cx="10" cy="10" r="1.8" />
    <circle cx="16" cy="10" r="1.8" />
    <circle cx="4" cy="16" r="1.8" />
    <circle cx="10" cy="16" r="1.8" />
    <circle cx="16" cy="16" r="1.8" />
  </svg>
);

interface AppIconProps {
  app: AppInfo;
  theme: ThemeColors;
}

const AppIcon: React.FC<AppIconProps> = ({ app, theme }) => {
  if (app.icon_url) {
    return (
      <img
        src={app.icon_url}
        alt=""
        width={32}
        height={32}
        style={{ borderRadius: 8, background: theme.surfaceHover }}
      />
    );
  }

  const initial = app.display_name.charAt(0).toUpperCase();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 700,
        width: 32,
        height: 32,
        background: theme.accentDim,
        color: '#fff',
      }}
    >
      {initial}
    </div>
  );
};
