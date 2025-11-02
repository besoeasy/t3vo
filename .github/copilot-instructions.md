# Design & Styling Guidelines

- **Styling Framework**: Always use Tailwind CSS utility classes for styling. Avoid custom CSS unless absolutely necessary for complex cases that Tailwind cannot handle.
- **Code Comments**: Only add comments when code logic is complex or non-obvious. Keep code self-documenting through clear naming conventions.
- **Responsive Design**: Ensure all components are mobile-compatible and responsive across all screen sizes.
- **Component Width**: All components should be full width by default unless explicitly specified otherwise.
- **Animations**: Use only Tailwind CSS animation utilities (e.g., `animate-*`, `transition-*`, `duration-*`). Do not create custom animation keyframes.
- **Design Consistency**: When creating new components, reference existing components to maintain visual and structural uniformity throughout the project.

# Regarding Supertags

Each supertag is implemented as a Vue component located in the `src/supertags/` directory. Follow the established patterns in existing supertag components to ensure consistency.

Each supertag should have it own solo component file named after the supertag e.gexample.vue for #@example=

Each supertag component should export its metadata in a similar manner to example below:

```vue
<script setup>
export const tagMetadata = {
  name: "crypto",
  displayName: "Cryptocurrency",
  description: "Track cryptocurrency prices and market data from CoinGecko",
  example: "crypto=bitcoin",
  category: "finance",
  icon: "₿",
  aliases: [],
  parseValue: (value) => value.trim().toLowerCase(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: "Cryptocurrency name is required" };
    }
    return { valid: true };
  },
};
</script>
```
