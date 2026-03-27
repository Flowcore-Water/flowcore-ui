import React from 'react';
import { type ThemeColors } from './theme';
export type { ThemeColors };
interface ThemeContextType {
    isRetro: boolean;
    toggleTheme: () => void;
    t: ThemeColors;
}
export declare const ThemeProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useTheme: () => ThemeContextType;
//# sourceMappingURL=ThemeContext.d.ts.map