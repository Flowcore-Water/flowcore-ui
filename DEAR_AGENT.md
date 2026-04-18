# Flowcore UI — Agent Instructions

## What This Is

Canonical shared UI component library for all Flowcore Water web applications.
Published as `@flowcore-water/ui` to the GitHub npm registry. React 19 +
TypeScript.

## Consumer Repos

This library is used by:
- ops-console
- st-mirror-browser
- wellscope-firebase
- flowcore-analytics
- training-tracker

Changes here affect all consumer apps. Test thoroughly.

## Components

| Component | Purpose |
|-----------|---------|
| `AppShell` | Page layout wrapper with sidebar |
| `SidebarShell` | Navigation sidebar |
| `AppLauncher` | Cross-app navigation menu |
| `ThemeProvider` | Theme context with cookie persistence on `.flowcorewater.com` |
| `AlertBanner` | **Mandatory** for all error/warning/info displays |
| `BugReportWidget` | In-app bug reporting (submits to identity-service) |
| `Button` | Styled button with variants |
| `StatCard` | KPI display card |

## Key Constraints

- **AlertBanner is mandatory** — all error, warning, and info messages must
  use AlertBanner. No ad-hoc styled divs for status messages.
- **Brand color is #3794EA** (FlowCore Blue) — NOT #00B4D8
- Requires `react-router-dom` — NOT compatible with Next.js App Router
- Theme persistence uses cookies scoped to `.flowcorewater.com`
- BugReportWidget contract with identity-service must stay stable

## Publishing

Published to GitHub npm registry on git tags. Consumers reference via
git-based package refs pinned to commit hashes.

## What NOT to Do

- Don't add components that are specific to one consumer app
- Don't change the AlertBanner API without updating all consumer repos
- Don't use any color other than #3794EA as the primary brand color
- Don't break the BugReportWidget → identity-service contract
- Don't add Next.js dependencies
