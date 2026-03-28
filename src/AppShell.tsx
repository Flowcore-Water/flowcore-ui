import React, { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import type { ThemeColors } from './theme';
import { AppLauncher } from './AppLauncher';
import { VersionBanner } from './VersionBanner';
import { FLOWCORE_APPS } from './appRegistry';
import type { AppInfo } from './AppLauncher';

export interface NavItem {
  to: string;
  label: string;
  /** Optional icon (emoji string or ReactNode) shown before the label */
  icon?: string;
}

/** A labeled group of nav items rendered with a section header */
export interface NavGroup {
  kind: 'group';
  label: string;
  items: NavItem[];
}

/** Union type: flat nav items or grouped sections */
export type NavEntry = NavItem | NavGroup;

export interface AppShellUser {
  displayName: string;
  role: string;
  photoURL?: string | null;
  onSignOut: () => void;
}

export interface AppShellProps {
  /** Color tokens — pass from useTheme() or supply your own */
  theme: ThemeColors;
  /** App identifier for the launcher highlight */
  appSlug: string;
  /** Display name shown next to the launcher */
  appTitle: string;
  /** Navigation links rendered in the header (desktop) or hamburger (mobile) */
  navItems: NavItem[];
  /** Authenticated user info + sign-out callback */
  user?: AppShellUser;
  /** Logo element rendered at the left of the nav bar */
  logo?: React.ReactNode;
  /** Optional widget rendered between nav links and user menu (e.g. theme toggle) */
  themeToggle?: React.ReactNode;
  /** Optional background layer rendered behind main content (e.g. synthwave) */
  background?: React.ReactNode;
  /** Banner rendered above the nav inside the viewport container */
  topBanner?: React.ReactNode;
  /** App registry for the launcher — defaults to FLOWCORE_APPS */
  apps?: AppInfo[];
  children?: React.ReactNode;
}

/**
 * Self-contained responsive styles.
 * Uses a <style> block instead of Tailwind responsive prefixes because
 * consuming apps' Tailwind scanners do not scan node_modules.
 */
const APPSHELL_STYLES = `
  .appshell-logo { height: 40px; width: auto; }

  .appshell-divider   { display: none; width: 1px; align-self: stretch; }
  .appshell-app-title  { display: none; padding: 6px 12px; font-size: 12px;
    font-family: ui-monospace, monospace; text-transform: uppercase;
    letter-spacing: 0.05em; white-space: nowrap; }

  .appshell-nav-inner { padding: 12px 16px; }
  .appshell-desktop-nav { display: none; align-items: center; gap: 24px; }
  .appshell-hamburger { display: block; }
  .appshell-mobile-dropdown { display: flex; }
  .appshell-content { padding: 24px 16px; }

  @media (min-width: 640px) {
    .appshell-divider   { display: block; }
    .appshell-app-title  { display: inline; }
  }

  @media (min-width: 768px) {
    .appshell-logo        { height: 64px; }
    .appshell-nav-inner   { padding: 16px 24px; }
    .appshell-content     { padding: 32px 24px; }
  }

  @media (min-width: 1024px) {
    .appshell-desktop-nav    { display: flex; }
    .appshell-hamburger      { display: none; }
    .appshell-mobile-dropdown { display: none; }
  }
`;

export const AppShell: React.FC<AppShellProps> = ({
  theme: t,
  appSlug,
  appTitle,
  navItems,
  user,
  logo,
  themeToggle,
  background,
  topBanner,
  apps = FLOWCORE_APPS,
  children,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const defaultLogo = (
    <img src="/flowcore-logo.svg" alt="Flowcore" className="appshell-logo" />
  );

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: t.pageBg }}>
      <style>{APPSHELL_STYLES}</style>
      {topBanner}
      <VersionBanner />

      {/* Navigation Bar */}
      <nav
        style={{
          background: t.navBg,
          borderBottom: `1px solid ${t.navBorder}`,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          className="appshell-nav-inner"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {/* Logo + App Launcher group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <Link to="/" style={{ flexShrink: 0 }}>
              {logo ?? defaultLogo}
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                border: `1px solid ${t.border}`,
                background: t.surfaceHover,
              }}
            >
              <AppLauncher apps={apps} currentAppSlug={appSlug} theme={t} />
              <div className="appshell-divider" style={{ background: t.border }} />
              <span className="appshell-app-title" style={{ color: t.accent }}>
                {appTitle}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="appshell-desktop-nav">
            {navItems.map((item) => (
              <ShellNavItem key={item.to} to={item.to} label={item.label} theme={t} onClick={() => setMenuOpen(false)} />
            ))}

            {themeToggle}

            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  borderLeft: `1px solid ${t.border}`,
                  paddingLeft: '24px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: 0 }}>
                    {user.displayName}
                  </p>
                  <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: t.accent, margin: 0 }}>
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={user.onSignOut}
                  style={{
                    borderRadius: '8px',
                    border: `1px solid ${t.buttonBorder}`,
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    background: t.buttonBg,
                    color: t.buttonText,
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="appshell-hamburger"
            style={{ padding: '8px', borderRadius: '8px', color: t.textSecondary, background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div
            className="appshell-mobile-dropdown"
            style={{ flexDirection: 'column', gap: '16px', borderTop: `1px solid ${t.border}`, padding: '16px', background: t.navBg }}
          >
            {navItems.map((item) => (
              <ShellNavItem key={item.to} to={item.to} label={item.label} theme={t} onClick={() => setMenuOpen(false)} />
            ))}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: `1px solid ${t.border}` }}>
              {user && (
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: 0 }}>{user.displayName}</p>
                  <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: t.accent, margin: 0 }}>{user.role}</p>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {themeToggle}
                {user && (
                  <button
                    onClick={() => { setMenuOpen(false); user.onSignOut(); }}
                    style={{ borderRadius: '8px', border: `1px solid ${t.buttonBorder}`, padding: '8px 16px', fontSize: '14px', fontWeight: 500, background: t.buttonBg, color: t.buttonText, cursor: 'pointer' }}
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {background}
        <div
          className="appshell-content"
          style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', width: '100%', position: 'relative', zIndex: 1 }}
        >
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
};

function ShellNavItem({ to, label, theme: t, onClick }: { to: string; label: string; theme: ThemeColors; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) => ({
        fontWeight: 500,
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        transition: 'color 150ms',
        textDecoration: 'none',
        color: isActive ? t.accent : t.textSecondary,
      })}
      onMouseEnter={(e) => (e.currentTarget.style.color = t.accent)}
      onMouseLeave={(e) => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
        if (!isActive) e.currentTarget.style.color = t.textSecondary;
      }}
    >
      {label}
    </NavLink>
  );
}
