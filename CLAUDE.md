Read [DEAR_AGENT.md](./DEAR_AGENT.md) for repo-specific agent guidance.

This is the canonical shared UI library for all Flowcore Water web apps. Changes here propagate to 5+ consumer repos via git-based package refs.

Brand accent color is FlowCore Blue `#3794EA` (from official brand guidelines PDF). Do not use `#00B4D8` — that was the old cyan accent and is no longer in the brand palette.

## Key constraints

- Requires react-router-dom (not compatible with Next.js App Router)
- flowcore-analytics has a manual port — changes here should be synced there
- Bug report widget submits to identity-service — keep that contract stable
- Theme persistence uses cookies on `.flowcorewater.com` for cross-app sharing
