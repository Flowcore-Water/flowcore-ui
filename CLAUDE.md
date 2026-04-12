Read [DEAR_AGENT.md](./DEAR_AGENT.md) for repo-specific agent guidance.

This is the canonical shared UI library for all Flowcore Water web apps. Changes here propagate to 5+ consumer repos via git-based package refs.

## Key constraints

- Requires react-router-dom (not compatible with Next.js App Router)
- flowcore-analytics has a manual port — changes here should be synced there
- Bug report widget submits to identity-service — keep that contract stable
- Theme persistence uses cookies on `.flowcorewater.com` for cross-app sharing
