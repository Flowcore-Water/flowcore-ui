import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { AppLauncher } from './AppLauncher';
import { BugReportProvider, BugReportWidget } from './bugReport';
import { VersionBanner } from './VersionBanner';
import { FLOWCORE_APPS } from './appRegistry';
/**
 * Self-contained responsive styles for the sidebar layout.
 * Uses a <style> block instead of Tailwind responsive prefixes because
 * consuming apps' Tailwind scanners do not scan node_modules.
 */
const SIDEBAR_STYLES = `
  .sidebar-shell-root {
    display: flex;
    height: 100vh;
  }

  /* ── Sidebar ── */
  .sidebar-shell-aside {
    display: flex;
    flex-direction: column;
    width: 240px;
    flex-shrink: 0;
    z-index: 20;
  }

  .sidebar-shell-logo { height: 36px; width: auto; }

  .sidebar-shell-content {
    flex: 1;
    overflow-y: auto;
    padding: 32px 32px;
  }
  .sidebar-shell-content-inner {
    max-width: 80rem;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  /* ── Mobile top bar ── */
  .sidebar-shell-mobile-bar {
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    z-index: 30;
  }
  .sidebar-shell-mobile-bar .sidebar-shell-logo { height: 32px; }

  /* ── Mobile overlay ── */
  .sidebar-shell-overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 19;
    background: rgba(0,0,0,0.5);
  }

  /* ── Responsive ── */
  @media (max-width: 1023px) {
    .sidebar-shell-aside {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      transform: translateX(-100%);
      transition: transform 200ms ease;
      z-index: 20;
    }
    .sidebar-shell-aside.sidebar-open {
      transform: translateX(0);
    }
    .sidebar-shell-overlay.sidebar-open {
      display: block;
    }
    .sidebar-shell-mobile-bar {
      display: flex;
    }
    .sidebar-shell-root {
      flex-direction: column;
    }
    .sidebar-shell-content {
      padding: 24px 16px;
    }
  }
`;
export const SidebarShell = ({ theme: t, appSlug, appTitle, navItems, user, logo, themeToggle, background, topBanner, apps = FLOWCORE_APPS, bugReport, children, }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const defaultLogo = (_jsx("img", { src: "/flowcore-logo.svg", alt: "Flowcore", className: "sidebar-shell-logo" }));
    return (_jsxs(BugReportProvider, { config: bugReport, children: [_jsx("style", { children: SIDEBAR_STYLES }), topBanner, _jsx(VersionBanner, {}), _jsxs("div", { className: "sidebar-shell-mobile-bar", style: { background: t.navBg, borderBottom: `1px solid ${t.navBorder}` }, children: [_jsx(Link, { to: "/", style: { flexShrink: 0 }, children: logo ?? defaultLogo }), _jsx("span", { style: {
                            fontSize: 13,
                            fontFamily: 'ui-monospace, monospace',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: t.accent,
                            fontWeight: 600,
                        }, children: appTitle }), _jsx("button", { onClick: () => setMenuOpen(!menuOpen), "aria-label": "Toggle menu", style: { padding: 8, borderRadius: 8, color: t.textSecondary, background: 'none', border: 'none', cursor: 'pointer' }, children: _jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: menuOpen ? (_jsxs(_Fragment, { children: [_jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" }), _jsx("line", { x1: "6", y1: "18", x2: "18", y2: "6" })] })) : (_jsxs(_Fragment, { children: [_jsx("line", { x1: "4", y1: "7", x2: "20", y2: "7" }), _jsx("line", { x1: "4", y1: "12", x2: "20", y2: "12" }), _jsx("line", { x1: "4", y1: "17", x2: "20", y2: "17" })] })) }) })] }), _jsx("div", { className: `sidebar-shell-overlay${menuOpen ? ' sidebar-open' : ''}`, onClick: () => setMenuOpen(false) }), _jsxs("div", { className: "sidebar-shell-root", style: { background: t.pageBg }, children: [_jsxs("aside", { className: `sidebar-shell-aside${menuOpen ? ' sidebar-open' : ''}`, style: {
                            background: t.navBg,
                            borderRight: `1px solid ${t.navBorder}`,
                        }, children: [_jsx("div", { style: { padding: '16px 18px', borderBottom: `1px solid ${t.border}`, display: 'flex', justifyContent: 'center' }, children: _jsx(Link, { to: "/", style: { flexShrink: 0 }, children: logo ?? defaultLogo }) }), _jsx("div", { style: { padding: '10px 18px', borderBottom: `1px solid ${t.border}` }, children: _jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderRadius: 8,
                                        border: `1px solid ${t.border}`,
                                        background: t.surfaceHover,
                                    }, children: [_jsx(AppLauncher, { apps: apps, currentAppSlug: appSlug, theme: t, dropdownAlign: "left" }), _jsx("div", { style: { width: 1, alignSelf: 'stretch', background: t.border } }), _jsx("span", { style: {
                                                padding: '6px 12px',
                                                fontSize: 12,
                                                fontFamily: 'ui-monospace, monospace',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                whiteSpace: 'nowrap',
                                                color: t.accent,
                                            }, children: appTitle })] }) }), _jsx("nav", { style: { flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }, children: navItems.map((entry, i) => 'kind' in entry && entry.kind === 'group' ? (_jsxs("div", { style: { marginBottom: 4 }, children: [_jsx("div", { style: {
                                                padding: '10px 16px 4px',
                                                fontSize: 10,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                color: t.textMuted,
                                            }, children: entry.label }), entry.items.map((item) => (_jsx(SidebarNavItem, { to: item.to, label: item.label, icon: item.icon, theme: t, onClick: () => setMenuOpen(false) }, item.to)))] }, entry.label)) : (_jsx(SidebarNavItem, { to: entry.to, label: entry.label, icon: entry.icon, theme: t, onClick: () => setMenuOpen(false) }, entry.to))) }), _jsxs("div", { style: { padding: '12px 16px 16px', borderTop: `1px solid ${t.border}` }, children: [themeToggle && (_jsx("div", { style: { marginBottom: user ? 12 : 0 }, children: themeToggle })), user && (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("p", { style: { fontSize: 14, fontWeight: 600, color: t.textPrimary, margin: 0 }, children: user.displayName }), _jsx("p", { style: {
                                                            fontSize: 11,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            color: t.accent,
                                                            margin: '2px 0 0',
                                                        }, children: user.role })] }), _jsx("button", { onClick: () => { setMenuOpen(false); user.onSignOut(); }, style: {
                                                    width: '100%',
                                                    borderRadius: 8,
                                                    border: `1px solid ${t.buttonBorder}`,
                                                    padding: '8px 16px',
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    background: t.buttonBg,
                                                    color: t.buttonText,
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                }, children: "Sign Out" })] }))] })] }), _jsxs("main", { style: { flex: 1, overflow: 'auto', position: 'relative' }, children: [background, _jsx("div", { className: "sidebar-shell-content", children: _jsx("div", { className: "sidebar-shell-content-inner", children: children ?? _jsx(Outlet, {}) }) })] })] }), _jsx(BugReportWidget, {})] }));
};
function SidebarNavItem({ to, label, icon, theme: t, onClick, }) {
    return (_jsxs(NavLink, { to: to, onClick: onClick, style: ({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            fontSize: 13.5,
            fontWeight: isActive ? 500 : 400,
            textDecoration: 'none',
            borderRadius: 8,
            margin: '0 12px',
            transition: 'background 150ms, color 150ms',
            color: isActive ? t.accent : t.textSecondary,
            background: isActive ? `${t.accent}15` : 'transparent',
        }), onMouseEnter: (e) => {
            const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
            if (!isActive) {
                e.currentTarget.style.background = t.surfaceHover;
                e.currentTarget.style.color = t.textPrimary;
            }
        }, onMouseLeave: (e) => {
            const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
            if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = t.textSecondary;
            }
        }, children: [icon && _jsx("span", { style: { width: 18, textAlign: 'center', fontSize: 15, flexShrink: 0 }, children: icon }), _jsx("span", { children: label })] }));
}
//# sourceMappingURL=SidebarShell.js.map