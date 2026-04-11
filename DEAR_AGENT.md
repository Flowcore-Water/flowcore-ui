## Flowcore UI

- This package is the shared UI surface for Flowcore web apps. Changes here frequently ship through other repos via git-based package refs, so the consuming repo repin is part of the real delivery path.
- If a workspace-level [`Dear_Agent.md`](../Dear_Agent.md) is present, read it before changing this package.

## Bug Fix Traceability

- Any shared UI change that fixes a Flowcore bug must reference the canonical bug ticket ID and linked GitHub issue in the branch, commit, PR, and final handoff.
- Because shared-package fixes often land here first and ship elsewhere later, record both the `flowcore-ui` fix commit and the consuming repo repin and deploy commit against the bug before closing it.
- Do not treat a shared-package bug as resolved until the consuming app repos that need the fix are tied back to the same ticket.
