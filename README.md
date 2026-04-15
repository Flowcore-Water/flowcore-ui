# @flowcore-water/ui

Shared UI component library for Flowcore Water web applications.

## What it provides

- **SidebarShell** — Vertical sidebar layout with nav links, app launcher, theme toggle slot
- **AppShell** — Full-featured container wrapping SidebarShell with routing and bug reporting
- **AppLauncher** — Cross-app navigation grid dropdown
- **ThemeProvider / useTheme** — Dark and retro (synthwave) theme system with cookie persistence
- **BugReportWidget** — In-app bug report modal with screenshot capture and identity-service submission
- **VersionBanner** — App version display component
- **StatCard** — Themed stat display card with label, value, optional accent color
- **Button** — Themed button with default/accent/primary variants and sm/md sizes
- **AlertBanner** — Standardized error/warning/info/success banner with copy-error and copy-stack-trace buttons
- **Design tokens** — `defaultTheme` (navy/FlowCore Blue) and `retroTheme` (synthwave/pink)

## What it does NOT provide

- **FlowcoreLogo / ThemeToggle / SynthwaveBackground** — Each app provides its own via SidebarShell props
- **AuthGate / useBootstrap** — Auth depends on Firebase context, lives in each app
- **Next.js support** — Requires react-router-dom. flowcore-analytics uses a manual port.

## Installation

```bash
# In package.json dependencies:
"@flowcore-water/ui": "github:Flowcore-Water/flowcore-ui"
```

## Usage

```tsx
import { ThemeProvider, useTheme, SidebarShell, FLOWCORE_APPS, StatCard, Button, AlertBanner } from '@flowcore-water/ui';
import type { NavItem, ThemeColors, AppShellUser, StatCardProps, ButtonProps, AlertBannerProps } from '@flowcore-water/ui';
```

### AlertBanner

Use `AlertBanner` for all error, warning, info, and success messages in Flowcore apps. Do NOT create ad-hoc error divs with `t.failBg`/`t.failBorder` — use this component instead.

```tsx
// Dismissable error (default)
<AlertBanner variant="error" message="Something went wrong" />

// Persistent error that blocks the page, with retry
<AlertBanner variant="error" message="Failed to load data" error={caughtError} persistent onRetry={() => reload()} />

// With Sentry event ID for debugging
<AlertBanner variant="error" error={err} sentryEventId={Sentry.lastEventId()} persistent />

// Dismissable with callback
<AlertBanner variant="error" message={error} onDismiss={() => setError(null)} />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'error' \| 'warning' \| 'info' \| 'success'` | required | Color scheme and icon |
| `message` | `string` | — | Display message. Falls back to `error.message` if omitted |
| `error` | `unknown` | — | Error object. Enables "Copy Stack Trace" button if it has `.stack` |
| `sentryEventId` | `string` | — | Included in copied output. Pass `Sentry.lastEventId()` from the app |
| `persistent` | `boolean` | `false` | If true, hides the dismiss (×) button |
| `onDismiss` | `() => void` | — | Called when user dismisses the banner |
| `onRetry` | `() => void` | — | Shows a "Retry" button if provided |

**When to use `persistent`:** When the error blocks the page from functioning (e.g., API unreachable, data failed to load). The user can't do anything useful, so don't let them dismiss it.

**When to use dismissable (default):** When the error is non-blocking (e.g., one widget failed but the rest of the page works).

## Build

```bash
npm install
npm run build   # tsc → dist/
```

## Consumer repos

| App | Package ref |
|-----|-------------|
| ops-console | `@flowcore-water/ui` |
| wellscope-firebase | `@flowcore-water/ui` |
| training-tracker | `@flowcore-water/ui` |
| identity-service/ui | `@flowcore-water/ui` |
| st-mirror-browser | `@flowcore-water/ui` |
| flowcore-analytics | Manual Next.js port in `app/src/lib/flowcore-ui/` |

## Peer dependencies

- React 19+
- react-router-dom 7+
