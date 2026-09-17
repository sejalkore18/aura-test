<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Scoped Design & UI Changes

When requested to change designs, layouts, or styles for a specific page, screen, tab, or view:

1. **Strict Component Isolation**: Touch and modify ONLY the components, subcomponents, and styles directly belonging to the specified screen or view.
2. **Preserve Unrelated Screens**: Do NOT touch, modify, refactor, or restyle any other components or views that are not directly related to that particular screen.
3. **No Unintended Collateral Changes**: Avoid making broad or shared changes that alter the appearance or behavior of other screens unless explicitly instructed by the user.
