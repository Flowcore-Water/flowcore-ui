import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
  children?: React.ReactNode;
}

/** Rasterized chrome "FLOWCORE" image for retro mode */
const RetroFlowcoreText: React.FC = () => (
  <img
    src="/flowcore-retro.png"
    alt="FLOWCORE"
    className="w-auto"
    style={{ height: '40px', filter: 'drop-shadow(0 0 8px rgba(5, 217, 232, 0.4))' }}
  />
);

export const AppShell: React.FC<AppShellProps> = ({
  appSlug,
  appTitle,
  navItems,
  user,
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
    <div className="flex h-screen flex-col" style={{ background: t.pageBg }}>
      <VersionBanner />

      {/* Navigation Bar */}
      <nav
        className="border-b shadow-lg relative z-10"
        style={{ background: t.navBg, borderColor: t.navBorder }}
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          {/* Logo + App Launcher group — anchored left */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="/" className="shrink-0">
              {isRetro ? (
                <div className="flex items-center gap-2">
                  <img
                    src="/retro-favicon2.png"
                    alt="Flowcore"
                    className="w-auto"
                    style={{ height: '40px', borderRadius: '4px' }}
                  />
                  <RetroFlowcoreText />
                </div>
              ) : (
                <img
                  src="/flowcore-logo.svg"
                  alt="Flowcore"
                  className="w-auto"
                  style={{ height: '40px' }}
                />
              )}
            </a>

            {/* App Launcher + App Title — bounding box with vertical divider */}
            <div
              className="flex items-center rounded-lg border"
              style={{ borderColor: t.border, background: t.surfaceHover }}
            >
              <AppLauncher apps={FLOWCORE_APPS} currentAppSlug={appSlug} />
              <div
                className="hidden sm:block w-px self-stretch"
                style={{ background: t.border }}
              />
              <span
                className="hidden sm:inline px-3 py-1.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap"
                style={{ color: t.accent }}
              >
                {appTitle}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
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
              className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
              style={{
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
              }}
            >
              {isRetro ? '// Default' : '// Go Retro'}
            </button>

            {/* User Menu (optional) */}
            {user && (
              <div
                className="flex items-center gap-4 border-l pl-6"
                style={{ borderColor: t.border }}
              >
                <div className="flex flex-col items-end">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: t.textPrimary }}
                  >
                    {user.displayName}
                  </p>
                  <p
                    className="text-xs uppercase tracking-wide"
                    style={{ color: t.accent }}
                  >
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={user.onSignOut}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    background: t.buttonBg,
                    borderColor: t.buttonBorder,
                    color: t.buttonText,
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ color: t.textSecondary }}
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
            className="lg:hidden border-t px-4 py-4 flex flex-col gap-4"
            style={{ background: t.navBg, borderColor: t.border }}
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
              className="flex items-center justify-between pt-3 border-t"
              style={{ borderColor: t.border }}
            >
              {user && (
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: t.textPrimary }}
                  >
                    {user.displayName}
                  </p>
                  <p
                    className="text-xs uppercase tracking-wide"
                    style={{ color: t.accent }}
                  >
                    {user.role}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: isRetro
                      ? 'rgba(255, 42, 109, 0.15)'
                      : 'rgba(139, 92, 246, 0.12)',
                    border: `1px solid ${
                      isRetro
                        ? 'rgba(255, 42, 109, 0.4)'
                        : 'rgba(139, 92, 246, 0.3)'
                    }`,
                    color: isRetro ? '#ff2a6d' : '#a78bfa',
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
                    className="rounded-lg border px-4 py-2 text-sm font-medium"
                    style={{
                      background: t.buttonBg,
                      borderColor: t.buttonBorder,
                      color: t.buttonText,
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
      <main className="flex-1 overflow-auto relative">
        {/* Synthwave background for retro theme */}
        {isRetro && <SynthwaveBackground />}
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 relative z-[1]">
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
      className="font-medium text-sm uppercase tracking-wide transition-colors"
      style={({ isActive }) => ({
        color: isActive ? t.accent : t.textSecondary,
      })}
      onMouseEnter={(e) =>
        (e.currentTarget.style.color = t.accent)
      }
      onMouseLeave={(e) => {
        // Only reset if not active — NavLink re-renders handle active state
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
    className="fixed inset-0 overflow-hidden pointer-events-none"
    style={{ zIndex: 0 }}
  >
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: 'url(/synthwave.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
    {/* Fade overlay so content is readable */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, rgba(13, 2, 33, 0.2) 0%, rgba(13, 2, 33, 0.5) 40%, rgba(13, 2, 33, 0.8) 70%, rgba(13, 2, 33, 0.95) 100%)',
      }}
    />
  </div>
);
