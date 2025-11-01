# Design & Styling Guidelines

- **Styling Framework**: Always use Tailwind CSS utility classes for styling. Avoid custom CSS unless absolutely necessary for complex cases that Tailwind cannot handle.
- **Code Comments**: Only add comments when code logic is complex or non-obvious. Keep code self-documenting through clear naming conventions.
- **Responsive Design**: Ensure all components are mobile-compatible and responsive across all screen sizes.
- **Component Width**: All components should be full width by default unless explicitly specified otherwise.
- **Animations**: Use only Tailwind CSS animation utilities (e.g., `animate-*`, `transition-*`, `duration-*`). Do not create custom animation keyframes.
- **Design Consistency**: When creating new components, reference existing components to maintain visual and structural uniformity throughout the project.

# Pre-Response Checklist

Before providing any suggestions or modifications:

1. **Analyze Context**: Review the entire codebase to understand the project structure, patterns, and existing implementations.
2. **Update Available Tags**: In `note-edit.vue`, ensure all available tags from `TAGS.md` are properly reflected and accessible.
3. **Verify Tag Usage**: Cross-reference tag implementations against their definitions in `TAGS.md` to ensure consistency.

# Critical Rules

## Tag Management

- **Strict Adherence**: Do not modify tag usage patterns. Follow the exact specifications and explanations documented in `TAGS.md`.
- **New Tag Protocol**: When adding a new tag:
  1. Update `TAGS.md` with complete documentation
  2. Create the corresponding component if needed
  3. Update `noteviewer` to correctly parse and display the new tag
  4. Ensure the tag appears in the available tags list in `note-edit.vue`

## File-Specific Requirements

- **`TAGS.md`**: The single source of truth for all tag definitions, usage patterns, and behavior
- **`note-edit.vue`**: Must reflect all current tags from `TAGS.md` in its available tags list
- **`noteviewer`**: Must be updated to handle parsing and rendering for any new tag types