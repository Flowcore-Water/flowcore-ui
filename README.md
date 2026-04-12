# @flowcore-water/ui

Shared UI component library for Flowcore Water web applications.

## What it provides

- **SidebarShell** — Vertical sidebar layout with nav links, app launcher, theme toggle slot
- **AppShell** — Full-featured container wrapping SidebarShell with routing and bug reporting
- **AppLauncher** — Cross-app navigation grid dropdown
- **ThemeProvider / useTheme** — Dark and retro (synthwave) theme system with cookie persistence
- **BugReportWidget** — In-app bug report modal with screenshot capture and identity-service submission
- **VersionBanner** — App version display component
- **Design tokens** — `defaultTheme` (navy/cyan) and `retroTheme` (synthwave/pink)

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
import { ThemeProvider, useTheme, SidebarShell, FLOWCORE_APPS } from '@flowcore-water/ui';
import type { NavItem, ThemeColors, AppShellUser } from '@flowcore-water/ui';
```

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
