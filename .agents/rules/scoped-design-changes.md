# Scoped Design & UI Changes

When requested to change designs, layouts, or styles for a specific page, screen, tab, or view:

1. **Strict Component Isolation**: Touch and modify ONLY the components, subcomponents, and styles directly belonging to the specified screen or view.
2. **Preserve Unrelated Screens**: Do NOT touch, modify, refactor, or restyle any other components or views that are not directly related to that particular screen.
3. **No Unintended Global Collateral**: Avoid making broad or shared style changes that could alter the appearance or behavior of other screens unless explicitly instructed by the user.
