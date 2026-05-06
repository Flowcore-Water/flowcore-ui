import React from 'react';
import type { ThemeColors, ThemeName } from './theme';
export interface ThemeDropdownProps {
    /** Current theme name */
    theme: ThemeName;
    /** Callback when user selects a theme */
    onSelect: (name: ThemeName) => void;
    /** Theme color tokens for styling the dropdown itself */
    t: ThemeColors;
}
/**
 * Shared theme selector dropdown for the sidebar.
 * Displays current theme as "// GO {THEME}" and opens a menu to pick another.
 */
export declare const ThemeDropdown: React.FC<ThemeDropdownProps>;
//# sourceMappingURL=ThemeDropdown.d.ts.map