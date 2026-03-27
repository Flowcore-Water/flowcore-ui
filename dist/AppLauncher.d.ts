import React from 'react';
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
    /** Which edge of the button the dropdown aligns to. Default 'right'. */
    dropdownAlign?: 'left' | 'right';
}
export declare const AppLauncher: React.FC<AppLauncherProps>;
//# sourceMappingURL=AppLauncher.d.ts.map