import React from 'react';
import { type ThemeColors, type ThemeName } from './theme';
export type { ThemeColors, ThemeName };
interface ThemeContextType {
    /** Current theme name */
    theme: ThemeName;
    /** Set theme by name */
    setTheme: (name: ThemeName) => void;
    /** Cycle to the next theme (default → retro → light → default) */
    cycleTheme: () => void;
    /** Current theme color tokens */
    t: ThemeColors;
    /**
     * @deprecated Use `theme === 'retro'` instead
     */
    isRetro: boolean;
    /**
     * @deprecated Use `cycleTheme()` or `setTheme()` instead
     */
    toggleTheme: () => void;
}
export declare const ThemeProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useTheme: () => ThemeContextType;
//# sourceMappingURL=ThemeContext.d.ts.map