import React from 'react';
import type { ThemeColors } from './theme';
import type { AppInfo } from './AppLauncher';
import type { NavEntry } from './AppShell';
export interface SpotlightSearchProps {
    open: boolean;
    onClose: () => void;
    theme: ThemeColors;
    /** All known Flowcore apps — shows cross-app navigation */
    apps?: AppInfo[];
    /** Nav items from the current app */
    navItems?: NavEntry[];
    currentAppSlug?: string;
    currentAppTitle?: string;
    /** Called for internal routes (same app). Receives the path string. */
    onNavigate?: (path: string) => void;
}
export declare const SpotlightSearch: React.FC<SpotlightSearchProps>;
//# sourceMappingURL=SpotlightSearch.d.ts.map