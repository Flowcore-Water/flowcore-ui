import React from 'react';
import type { ThemeColors } from './theme';
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
export declare const AppShell: React.FC<AppShellProps>;
//# sourceMappingURL=AppShell.d.ts.map