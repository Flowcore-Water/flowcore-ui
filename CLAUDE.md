Read [DEAR_AGENT.md](./DEAR_AGENT.md) for repo-specific agent guidance.

This is the canonical shared UI library for all Flowcore Water web apps. Changes here propagate to 5+ consumer repos via git-based package refs.

Brand accent color is FlowCore Blue `#3794EA` (from official brand guidelines PDF). Do not use `#00B4D8` — that was the old cyan accent and is no longer in the brand palette.

## Key constraints

- Requires react-router-dom (not compatible with Next.js App Router)
- flowcore-analytics has a manual port — changes here should be synced there
- Bug report widget submits to identity-service — keep that contract stable
- Theme persistence uses cookies on `.flowcorewater.com` for cross-app sharing

## AlertBanner — mandatory for all error/warning displays

All Flowcore apps MUST use `AlertBanner` for error, warning, info, and success messages. Do NOT create ad-hoc error divs with `t.failBg`/`t.failBorder`/`t.fail` inline styles. If you see one in existing code, migrate it to `AlertBanner`.

```tsx
import { AlertBanner } from '@flowcore-water/ui';

// Persistent = blocks the page, can't dismiss
<AlertBanner variant="error" message="Failed to load" error={err} persistent onRetry={() => load()} />

// Dismissable = non-blocking (default)
<AlertBanner variant="error" message={error} onDismiss={() => setError(null)} />
```

- Pass the raw `Error` object to `error` prop (not `String(err)`) to enable stack trace copying
- Pass `Sentry.lastEventId()` to `sentryEventId` if the app uses Sentry
- Use `persistent` when the error prevents the page from working
- Use `onRetry` when the operation can be retried
- See README.md for full props table
