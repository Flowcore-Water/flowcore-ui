import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { AppLauncher } from './AppLauncher';
import { BugReportProvider, BugReportWidget } from './bugReport';
import { VersionBanner } from './VersionBanner';
import { FLOWCORE_APPS } from './appRegistry';
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
export const AppShell = ({ theme: t, appSlug, appTitle, navItems, user, logo, themeToggle, background, topBanner, apps = FLOWCORE_APPS, bugReport, children, }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const defaultLogo = (_jsx("img", { src: "/flowcore-logo.svg", alt: "Flowcore", className: "appshell-logo" }));
    return (_jsxs(BugReportProvider, { config: bugReport, children: [_jsxs("div", { style: { display: 'flex', height: '100vh', flexDirection: 'column', background: t.pageBg }, children: [_jsx("style", { children: APPSHELL_STYLES }), topBanner, _jsx(VersionBanner, {}), _jsxs("nav", { style: {
                            background: t.navBg,
                            borderBottom: `1px solid ${t.navBorder}`,
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)',
                            position: 'relative',
                            zIndex: 10,
                        }, children: [_jsxs("div", { className: "appshell-nav-inner", style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }, children: [_jsx(Link, { to: "/", style: { flexShrink: 0 }, children: logo ?? defaultLogo }), _jsxs("div", { style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${t.border}`,
                                                    background: t.surfaceHover,
                                                }, children: [_jsx(AppLauncher, { apps: apps, currentAppSlug: appSlug, theme: t }), _jsx("div", { className: "appshell-divider", style: { background: t.border } }), _jsx("span", { className: "appshell-app-title", style: { color: t.accent }, children: appTitle })] })] }), _jsxs("div", { className: "appshell-desktop-nav", children: [navItems.map((item) => (_jsx(ShellNavItem, { to: item.to, label: item.label, theme: t, onClick: () => setMenuOpen(false) }, item.to))), themeToggle, user && (_jsxs("div", { style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                    borderLeft: `1px solid ${t.border}`,
                                                    paddingLeft: '24px',
                                                }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }, children: [_jsx("p", { style: { fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: 0 }, children: user.displayName }), _jsx("p", { style: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: t.accent, margin: 0 }, children: user.role })] }), _jsx("button", { onClick: user.onSignOut, style: {
                                                            borderRadius: '8px',
                                                            border: `1px solid ${t.buttonBorder}`,
                                                            padding: '8px 16px',
                                                            fontSize: '14px',
                                                            fontWeight: 500,
                                                            background: t.buttonBg,
                                                            color: t.buttonText,
                                                            cursor: 'pointer',
                                                        }, children: "Sign Out" })] }))] }), _jsx("button", { className: "appshell-hamburger", style: { padding: '8px', borderRadius: '8px', color: t.textSecondary, background: 'none', border: 'none', cursor: 'pointer' }, onClick: () => setMenuOpen(!menuOpen), "aria-label": "Toggle menu", children: _jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: menuOpen ? (_jsxs(_Fragment, { children: [_jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" }), _jsx("line", { x1: "6", y1: "18", x2: "18", y2: "6" })] })) : (_jsxs(_Fragment, { children: [_jsx("line", { x1: "4", y1: "7", x2: "20", y2: "7" }), _jsx("line", { x1: "4", y1: "12", x2: "20", y2: "12" }), _jsx("line", { x1: "4", y1: "17", x2: "20", y2: "17" })] })) }) })] }), menuOpen && (_jsxs("div", { className: "appshell-mobile-dropdown", style: { flexDirection: 'column', gap: '16px', borderTop: `1px solid ${t.border}`, padding: '16px', background: t.navBg }, children: [navItems.map((item) => (_jsx(ShellNavItem, { to: item.to, label: item.label, theme: t, onClick: () => setMenuOpen(false) }, item.to))), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: `1px solid ${t.border}` }, children: [user && (_jsxs("div", { children: [_jsx("p", { style: { fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: 0 }, children: user.displayName }), _jsx("p", { style: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: t.accent, margin: 0 }, children: user.role })] })), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' }, children: [themeToggle, user && (_jsx("button", { onClick: () => { setMenuOpen(false); user.onSignOut(); }, style: { borderRadius: '8px', border: `1px solid ${t.buttonBorder}`, padding: '8px 16px', fontSize: '14px', fontWeight: 500, background: t.buttonBg, color: t.buttonText, cursor: 'pointer' }, children: "Sign Out" }))] })] })] }))] }), _jsxs("main", { style: { flex: 1, overflow: 'auto', position: 'relative' }, children: [background, _jsx("div", { className: "appshell-content", style: { maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', width: '100%', position: 'relative', zIndex: 1 }, children: children ?? _jsx(Outlet, {}) })] })] }), _jsx(BugReportWidget, {})] }));
};
function ShellNavItem({ to, label, theme: t, onClick }) {
    return (_jsx(NavLink, { to: to, onClick: onClick, style: ({ isActive }) => ({
            fontWeight: 500,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'color 150ms',
            textDecoration: 'none',
            color: isActive ? t.accent : t.textSecondary,
        }), onMouseEnter: (e) => (e.currentTarget.style.color = t.accent), onMouseLeave: (e) => {
            const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
            if (!isActive)
                e.currentTarget.style.color = t.textSecondary;
        }, children: label }));
}
//# sourceMappingURL=AppShell.js.map