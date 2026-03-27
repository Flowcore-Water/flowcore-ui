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
        className="flex items-center justify-center rounded-lg p-2 transition-colors"
        style={{
          background: open ? t.surfaceHover : 'transparent',
          color: t.textSecondary,
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = t.surfaceHover;
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = 'transparent';
        }}
      >
        <GridIcon color={t.textSecondary} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 rounded-xl border p-4 shadow-2xl"
          style={{
            background: t.cardBg,
            borderColor: t.border,
            width: 280,
            zIndex: 9999,
            animation: 'appLauncherFadeIn 150ms ease-out',
          }}
        >
          <p
            className="mb-3 text-xs font-mono uppercase tracking-wide"
            style={{ color: t.sectionHeading }}
          >
            Flowcore Apps
          </p>
          <div className="grid grid-cols-3 gap-2">
            {apps.map((app) => {
              const isCurrent = app.slug === currentAppSlug;
              return (
                <a
                  key={app.slug}
                  href={app.url}
                  className="flex flex-col items-center gap-1.5 rounded-lg p-3 text-center transition-colors"
                  style={{
                    background: isCurrent ? t.accentBg : 'transparent',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: isCurrent ? t.accent : 'transparent',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.background = t.surfaceHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <AppIcon app={app} theme={t} />
                  <span
                    className="text-xs leading-tight"
                    style={{
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
        className="rounded-lg"
        style={{ background: theme.surfaceHover }}
      />
    );
  }

  const initial = app.display_name.charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-lg text-sm font-bold"
      style={{
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
