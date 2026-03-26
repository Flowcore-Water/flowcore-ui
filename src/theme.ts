/**
 * Flowcore UI Theme System
 *
 * Canonical theme tokens for all Flowcore web applications.
 * See docs/STYLE_POLICY.md for usage guidelines.
 */

/** All themeable color tokens used across Flowcore apps */
export interface ThemeColors {
  // Page backgrounds
  pageBg: string;
  cardBg: string;
  navBg: string;
  navBorder: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Accent (primary brand action color)
  accent: string;
  accentDim: string;
  accentBg: string;

  // Success
  success: string;
  successBg: string;
  successBorder: string;

  // Fail/Error
  fail: string;
  failBg: string;
  failBorder: string;

  // Borders & surfaces
  border: string;
  borderSubtle: string;
  surfaceHover: string;

  // Progress bar
  progressTrack: string;
  progressFill: string;
  progressGlow: string;

  // Brand
  logoBg: string;

  // Section headings
  sectionHeading: string;

  // Table
  tableHeaderBg: string;
  expandedRowBg: string;

  // Inputs & buttons
  inputBg: string;
  inputBorder: string;
  buttonBg: string;
  buttonBorder: string;
  buttonText: string;
}

/** Default theme — dark navy with cyan accents */
export const defaultTheme: ThemeColors = {
  pageBg: '#0c1220',
  cardBg: '#111827',
  navBg: '#111827',
  navBorder: 'rgba(71, 85, 105, 0.5)',

  textPrimary: '#f1f5f9',
  textSecondary: '#a1b1c7',
  textMuted: '#7089a8',

  accent: '#22d3ee',
  accentDim: '#0891b2',
  accentBg: '#0e1a28',

  success: '#34d399',
  successBg: '#0f1f14',
  successBorder: 'rgba(52, 211, 153, 0.3)',

  fail: '#f87171',
  failBg: '#1f1010',
  failBorder: 'rgba(239, 68, 68, 0.3)',

  border: 'rgba(71, 85, 105, 0.5)',
  borderSubtle: 'rgba(71, 85, 105, 0.35)',
  surfaceHover: 'rgba(71, 85, 105, 0.25)',

  progressTrack: '#1e2d3d',
  progressFill: '#34d399',
  progressGlow: 'rgba(52, 211, 153, 0.7)',

  logoBg: '#0891b2',

  sectionHeading: '#22d3ee',

  tableHeaderBg: '#0e1525',
  expandedRowBg: '#0a101c',

  inputBg: '#0c1220',
  inputBorder: '#536178',
  buttonBg: '#1e293b',
  buttonBorder: '#536178',
  buttonText: '#d1dae5',
};

/** Retro theme — synthwave with purple backgrounds and hot pink accents */
export const retroTheme: ThemeColors = {
  pageBg: '#0d0221',
  cardBg: '#150535',
  navBg: '#120430',
  navBorder: 'rgba(191, 64, 191, 0.4)',

  textPrimary: '#f0e6ff',
  textSecondary: '#c4a8e0',
  textMuted: '#8b6aad',

  accent: '#ff2a6d',
  accentDim: '#c2185b',
  accentBg: '#1a0a1f',

  success: '#34d399',
  successBg: '#0d1a10',
  successBorder: 'rgba(52, 211, 153, 0.3)',

  fail: '#ff4444',
  failBg: '#1a0808',
  failBorder: 'rgba(255, 68, 68, 0.35)',

  border: 'rgba(191, 64, 191, 0.35)',
  borderSubtle: 'rgba(138, 43, 226, 0.25)',
  surfaceHover: 'rgba(191, 64, 191, 0.15)',

  progressTrack: '#1a0a2e',
  progressFill: '#f5a623',
  progressGlow: 'rgba(245, 166, 35, 0.7)',

  logoBg: '#bf40bf',

  sectionHeading: '#05d9e8',

  tableHeaderBg: '#0f0328',
  expandedRowBg: '#0a0118',

  inputBg: '#0d0221',
  inputBorder: '#6b3a9e',
  buttonBg: '#1a0a2e',
  buttonBorder: '#6b3a9e',
  buttonText: '#d4a0ff',
};
