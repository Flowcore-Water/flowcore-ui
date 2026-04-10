import React from 'react';
import type { ThemeColors } from './theme';
import { type BugReportConfig } from './bugReport';
import type { AppInfo } from './AppLauncher';
import type { NavEntry, AppShellUser } from './AppShell';
export interface SidebarShellProps {
    /** Color tokens — pass from useTheme() or supply your own */
    theme: ThemeColors;
    /** App identifier for the launcher highlight */
    appSlug: string;
    /** Display name shown in the sidebar header */
    appTitle: string;
    /** Navigation links rendered vertically in the sidebar. Supports flat items or grouped sections. */
    navItems: NavEntry[];
    /** Authenticated user info + sign-out callback */
    user?: AppShellUser;
    /** Logo element rendered at the top of the sidebar */
    logo?: React.ReactNode;
    /** Optional widget rendered below nav links (e.g. theme toggle) */
    themeToggle?: React.ReactNode;
    /** Optional background layer rendered behind main content */
    background?: React.ReactNode;
    /** Banner rendered above everything */
    topBanner?: React.ReactNode;
    /** App registry for the launcher — defaults to FLOWCORE_APPS */
    apps?: AppInfo[];
    /** Optional shared bug-report widget configuration */
    bugReport?: BugReportConfig | null;
    children?: React.ReactNode;
}
export declare const SidebarShell: React.FC<SidebarShellProps>;
//# sourceMappingURL=SidebarShell.d.ts.map