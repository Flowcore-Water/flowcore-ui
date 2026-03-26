import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { AppLauncher } from './AppLauncher';
import { VersionBanner } from './VersionBanner';
import { FLOWCORE_APPS } from './appRegistry';

export interface NavItem {
  to: string;
  label: string;
}

export interface AppShellProps {
  appSlug: string;
  appTitle: string;
  navItems: NavItem[];
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  appSlug,
  appTitle,
  navItems,
  children,
}) => {
  const { t, isRetro, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen flex-col" style={{ background: t.pageBg }}>
      <VersionBanner />
      {isRetro && (
        <div
          className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/synthwave.png)' }}
        />
      )}
      <nav
        className="relative z-10 flex items-center justify-between border-b px-4 py-3 shadow-lg md:px-6"
        style={{ background: t.navBg, borderColor: t.navBorder }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img
              src={isRetro ? '/flowcore-retro.png' : '/flowcore-logo.svg'}
              alt="FlowCore"
              className="h-7"
            />
            <span
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: t.textPrimary }}
            >
              {appTitle}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <ShellNavItem key={item.to} to={item.to} label={item.label} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AppLauncher apps={FLOWCORE_APPS} currentAppSlug={appSlug} />
          <button
            onClick={toggleTheme}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: t.buttonBg,
              borderColor: t.buttonBorder,
              color: t.buttonText,
            }}
          >
            {isRetro ? 'Default' : 'Retro'}
          </button>
        </div>
      </nav>
      <main className="relative z-10 flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
};

function ShellNavItem({ to, label }: { to: string; label: string }) {
  const { t } = useTheme();

  return (
    <NavLink
      to={to}
      className="rounded-md px-3 py-1.5 text-sm font-medium uppercase tracking-wide transition-colors"
      style={({ isActive }) => ({
        color: isActive ? t.accent : t.textSecondary,
        background: isActive ? t.accentBg : 'transparent',
      })}
    >
      {label}
    </NavLink>
  );
}
