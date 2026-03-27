import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { AppLauncher } from './AppLauncher';
import { VersionBanner } from './VersionBanner';
import { FLOWCORE_APPS } from './appRegistry';

export interface NavItem {
  to: string;
  label: string;
}

export interface AppShellUser {
  displayName: string;
  role: string;
  photoURL?: string | null;
  onSignOut: () => void;
}

export interface AppShellProps {
  appSlug: string;
  appTitle: string;
  navItems: NavItem[];
  user?: AppShellUser;
  topBanner?: React.ReactNode;
  children?: React.ReactNode;
}

/** Rasterized chrome "FLOWCORE" image for retro mode */
const RetroFlowcoreText: React.FC = () => (
  <img
    src="/flowcore-retro.png"
    alt="FLOWCORE"
    className="appshell-retro-text"
    style={{ height: '40px', width: 'auto', filter: 'drop-shadow(0 0 8px rgba(5, 217, 232, 0.4))' }}
  />
);

/**
 * Self-contained responsive styles for AppShell.
 * We use a <style> block instead of Tailwind responsive prefixes because
 * consuming apps' Tailwind scanners do not scan node_modules, so classes
 * like lg:flex and md:h-16 would never generate CSS.
 */
const APPSHELL_STYLES = `
  /* Logo responsive sizing */
  .appshell-logo-default { height: 40px; width: auto; }
  .appshell-logo-retro  { height: 48px; width: auto; border-radius: 4px; }

  /* App title + divider — hidden on narrow, visible on sm+ */
  .appshell-divider   { display: none; width: 1px; align-self: stretch; }
  .appshell-app-title  { display: none; padding: 6px 12px; font-size: 12px;
    font-family: ui-monospace, monospace; text-transform: uppercase;
    letter-spacing: 0.05em; white-space: nowrap; }

  /* Nav bar padding */
  .appshell-nav-inner { padding: 12px 16px; }

  /* Desktop nav — hidden by default, flex row at lg */
  .appshell-desktop-nav { display: none; align-items: center; gap: 24px; }

  /* Hamburger — visible by default, hidden at lg */
  .appshell-hamburger { display: block; }

  /* Mobile dropdown — visible by default when open, hidden at lg */
  .appshell-mobile-dropdown { display: flex; }

  /* Content area padding */
  .appshell-content { padding: 24px 16px; }

  @media (min-width: 640px) {
    .appshell-divider   { display: block; }
    .appshell-app-title  { display: inline; }
  }

  @media (min-width: 768px) {
    .appshell-logo-default { height: 64px; }
    .appshell-logo-retro  { height: 56px; }
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
  appSlug,
  appTitle,
  navItems,
  user,
  topBanner,
  children,
}) => {
  const { t, isRetro, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Swap favicon based on theme
  useEffect(() => {
    const link = document.getElementById('favicon') as HTMLLinkElement | null;
    if (link) {
      link.href = isRetro ? '/retro-favicon2.png' : '/flowcore-logo.svg';
      link.type = isRetro ? 'image/png' : 'image/svg+xml';
    }
  }, [isRetro]);

  return (
    <div
      style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: t.pageBg }}
    >
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
          {/* Logo + App Launcher group — anchored left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <Link to="/" style={{ flexShrink: 0 }}>
              {isRetro ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src="/retro-favicon2.png"
                    alt="Flowcore"
                    className="appshell-logo-retro"
                  />
                  <RetroFlowcoreText />
                </div>
              ) : (
                <img
                  src="/flowcore-logo.svg"
                  alt="Flowcore"
                  className="appshell-logo-default"
                />
              )}
            </Link>

            {/* App Launcher + App Title — bounding box with vertical divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                border: `1px solid ${t.border}`,
                background: t.surfaceHover,
              }}
            >
              <AppLauncher apps={FLOWCORE_APPS} currentAppSlug={appSlug} />
              <div
                className="appshell-divider"
                style={{ background: t.border }}
              />
              <span
                className="appshell-app-title"
                style={{ color: t.accent }}
              >
                {appTitle}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="appshell-desktop-nav">
            {navItems.map((item) => (
              <ShellNavItem
                key={item.to}
                to={item.to}
                label={item.label}
                onClick={() => setMenuOpen(false)}
              />
            ))}

            {/* Theme Toggle Pill */}
            <button
              onClick={toggleTheme}
              style={{
                borderRadius: '9999px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 150ms',
                background: isRetro
                  ? 'rgba(255, 42, 109, 0.15)'
                  : 'rgba(139, 92, 246, 0.12)',
                border: `1px solid ${
                  isRetro
                    ? 'rgba(255, 42, 109, 0.4)'
                    : 'rgba(139, 92, 246, 0.3)'
                }`,
                color: isRetro ? '#ff2a6d' : '#a78bfa',
                boxShadow: isRetro
                  ? '0 0 12px rgba(255, 42, 109, 0.2)'
                  : 'none',
                cursor: 'pointer',
              }}
            >
              {isRetro ? '// Default' : '// Go Retro'}
            </button>

            {/* User Menu (optional) */}
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
                  <p
                    style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: 0 }}
                  >
                    {user.displayName}
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: t.accent,
                      margin: 0,
                    }}
                  >
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
                    transition: 'background 150ms',
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
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
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
            style={{
              flexDirection: 'column',
              gap: '16px',
              borderTop: `1px solid ${t.border}`,
              padding: '16px',
              background: t.navBg,
            }}
          >
            {navItems.map((item) => (
              <ShellNavItem
                key={item.to}
                to={item.to}
                label={item.label}
                onClick={() => setMenuOpen(false)}
              />
            ))}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: `1px solid ${t.border}`,
              }}
            >
              {user && (
                <div>
                  <p
                    style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: 0 }}
                  >
                    {user.displayName}
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: t.accent,
                      margin: 0,
                    }}
                  >
                    {user.role}
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={toggleTheme}
                  style={{
                    borderRadius: '9999px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: isRetro
                      ? 'rgba(255, 42, 109, 0.15)'
                      : 'rgba(139, 92, 246, 0.12)',
                    border: `1px solid ${
                      isRetro
                        ? 'rgba(255, 42, 109, 0.4)'
                        : 'rgba(139, 92, 246, 0.3)'
                    }`,
                    color: isRetro ? '#ff2a6d' : '#a78bfa',
                    cursor: 'pointer',
                  }}
                >
                  {isRetro ? '// Default' : '// Retro'}
                </button>
                {user && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      user.onSignOut();
                    }}
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
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {/* Synthwave background for retro theme */}
        {isRetro && <SynthwaveBackground />}
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

function ShellNavItem({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick?: () => void;
}) {
  const { t } = useTheme();

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
      onMouseEnter={(e) =>
        (e.currentTarget.style.color = t.accent)
      }
      onMouseLeave={(e) => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
        if (!isActive) {
          e.currentTarget.style.color = t.textSecondary;
        }
      }}
    >
      {label}
    </NavLink>
  );
}

/** Synthwave background with gradient overlay for readability */
const SynthwaveBackground: React.FC = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/synthwave.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(180deg, rgba(13, 2, 33, 0.2) 0%, rgba(13, 2, 33, 0.5) 40%, rgba(13, 2, 33, 0.8) 70%, rgba(13, 2, 33, 0.95) 100%)',
      }}
    />
  </div>
);
