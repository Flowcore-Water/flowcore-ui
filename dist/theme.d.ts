/**
 * Flowcore UI Theme System
 *
 * Canonical theme tokens for all Flowcore web applications.
 * See docs/STYLE_POLICY.md for usage guidelines.
 */
/** All themeable color tokens used across Flowcore apps */
export interface ThemeColors {
    pageBg: string;
    cardBg: string;
    navBg: string;
    navBorder: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentDim: string;
    accentBg: string;
    success: string;
    successBg: string;
    successBorder: string;
    fail: string;
    failBg: string;
    failBorder: string;
    warn: string;
    warnBg: string;
    warnBorder: string;
    info: string;
    infoBg: string;
    infoBorder: string;
    border: string;
    borderSubtle: string;
    surfaceHover: string;
    progressTrack: string;
    progressFill: string;
    progressGlow: string;
    logoBg: string;
    sectionHeading: string;
    tableHeaderBg: string;
    expandedRowBg: string;
    scoreHot: string;
    scoreWarm: string;
    inputBg: string;
    inputBorder: string;
    buttonBg: string;
    buttonBorder: string;
    buttonText: string;
}
/** Default theme — dark navy with FlowCore Blue accents */
export declare const defaultTheme: ThemeColors;
/** Theme name type for multi-theme support */
export type ThemeName = 'default' | 'retro' | 'light';
/** Retro theme — synthwave with purple backgrounds and hot pink accents */
export declare const retroTheme: ThemeColors;
/** Light theme — brand-aligned light mode using official Flowcore color palette */
export declare const lightTheme: ThemeColors;
/** Map theme names to theme objects */
export declare const themes: Record<ThemeName, ThemeColors>;
/**
 * Injects theme colors as CSS custom properties on the given root element.
 * Call this whenever the active theme changes so CSS-only rules (base.css,
 * scrollbars, focus rings) respond to the active theme.
 */
export declare function applyThemeCSSVars(theme: ThemeColors, root?: HTMLElement): void;
//# sourceMappingURL=theme.d.ts.map