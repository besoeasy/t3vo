# Modular Tag System

The T3VO tag system is fully modular - each tag is a self-contained Vue component with metadata that describes its behavior.

## 📁 Structure

```
src/tags/
├── index.js          # Tag registry (auto-discovers all tags)
├── crypto.vue        # Tag component with metadata
├── bookmark.vue      # Tag component with metadata
├── password.vue      # Tag component with metadata
└── ...              # More tag components
```

## 🎯 How It Works

1. **Auto-Discovery**: The tag registry (`index.js`) automatically discovers and registers all `.vue` files in the `src/tags/` directory
2. **Metadata Export**: Each tag component exports its configuration via `tagMetadata`
3. **Dynamic Loading**: Components are loaded dynamically when needed
4. **Type Safety**: Validation and parsing logic is defined per-tag

## 🔨 Creating a New Tag

### Step 1: Create the Component File

Create a new `.vue` file in `src/tags/` with the tag name (e.g., `email.vue` for `#@email=`)

### Step 2: Build the Component

```vue
<template>
  <div>
    <!-- Your tag's UI here -->
    <p>{{ value }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  parsed: {
    type: Object,
    default: null
  }
})

// Your component logic here
</script>
```

### Step 3: Export Tag Metadata

Add a second `<script>` block to export the tag configuration:

```vue
<script>
export const tagMetadata = {
  name: 'email',                    // Tag identifier (used as #@email=)
  displayName: 'Email Address',     // Human-readable name
  description: 'Store and display email addresses',  // What it does
  example: 'email=user@example.com', // Example usage
  category: 'contact',               // Category for organization
  icon: '📧',                        // Display icon
  aliases: [],                       // Alternative names (e.g., ['mail'])
  
  // Optional: Transform the value when parsed
  parseValue: (value) => {
    return value.trim().toLowerCase()
  },
  
  // Optional: Validate the value
  validate: (value) => {
    if (!value || !value.includes('@')) {
      return { valid: false, error: 'Invalid email format' }
    }
    return { valid: true }
  }
}
</script>
```

### Step 4: That's It!

The tag is automatically registered and available! No need to:
- ❌ Update any import statements
- ❌ Modify the parser
- ❌ Register it manually
- ❌ Update documentation

## 📋 Tag Metadata Reference

| Property      | Type     | Required | Description                                    |
|---------------|----------|----------|------------------------------------------------|
| `name`        | string   | Yes      | Tag identifier (used as `#@name=`)             |
| `displayName` | string   | Yes      | Human-readable name for UI                     |
| `description` | string   | Yes      | What the tag does                              |
| `example`     | string   | Yes      | Example usage (e.g., `crypto=bitcoin`)         |
| `category`    | string   | Yes      | Category (`security`, `finance`, `reference`)  |
| `icon`        | string   | Yes      | Emoji or icon for display                      |
| `aliases`     | string[] | No       | Alternative names for the tag                  |
| `parseValue`  | function | No       | Transform value when parsed                    |
| `validate`    | function | No       | Validate value (return `{valid, error?}`)      |

## 🏷️ Categories

Organize your tags into categories:

- **`security`**: Passwords, API keys, secrets, 2FA
- **`finance`**: Cryptocurrency, cards, invoices  
- **`reference`**: Bookmarks, URLs, documents
- **`contact`**: Emails, phones, addresses
- **`organization`**: Tags, pins, icons, dates
- **`data`**: QR codes, IPs, domains
- **`other`**: Uncategorized tags

## 🎨 Component Props

Your tag component receives these props:

```javascript
props: {
  value: String,    // The tag's value (e.g., for #@crypto=bitcoin, value is "bitcoin")
  parsed: Object    // Full parsed note object with all tags
}
```

## 🔍 Using the Tag Registry

```javascript
import { tagRegistry, getTagComponent, getTagMetadata, getAllTags } from '@/tags'

// Get a specific tag's component
const CryptoComponent = getTagComponent('crypto')

// Get tag metadata
const metadata = getTagMetadata('crypto')

// Get all registered tags
const allTags = getAllTags()

// Get tags by category
const securityTags = tagRegistry.getTagsByCategory('security')

// Search tags
const results = tagRegistry.searchTags('password')

// Validate a value
const validation = tagRegistry.validateTagValue('email', 'test@example.com')
```

## ✨ Examples

### Simple Display Tag

```vue
<template>
  <div class="p-4 bg-blue-50 rounded">
    <span class="font-mono">{{ value }}</span>
  </div>
</template>

<script setup>
defineProps({
  value: String,
  parsed: Object
})
</script>

<script>
export const tagMetadata = {
  name: 'code',
  displayName: 'Code Snippet',
  description: 'Display code snippets with monospace font',
  example: 'code=console.log("Hello")',
  category: 'data',
  icon: '💻'
}
</script>
```

### Interactive Tag with API

```vue
<template>
  <div v-if="data">
    <h3>{{ data.name }}</h3>
    <p>{{ data.description }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  value: String,
  parsed: Object
})

const data = ref(null)

onMounted(async () => {
  const response = await fetch(`https://api.example.com/${props.value}`)
  data.value = await response.json()
})
</script>

<script>
export const tagMetadata = {
  name: 'github',
  displayName: 'GitHub Repository',
  description: 'Fetch and display GitHub repository information',
  example: 'github=username/repo',
  category: 'reference',
  icon: '🐙',
  parseValue: (value) => value.trim().toLowerCase(),
  validate: (value) => {
    if (!value.includes('/')) {
      return { valid: false, error: 'Must be in format: username/repo' }
    }
    return { valid: true }
  }
}
</script>
```

## 🚀 Benefits

✅ **Modular**: Each tag is independent and self-contained  
✅ **Auto-Discovery**: No manual registration needed  
✅ **Type-Safe**: Built-in validation per tag  
✅ **Maintainable**: Easy to add, update, or remove tags  
✅ **Documented**: Metadata serves as inline documentation  
✅ **Flexible**: Custom parsing and validation per tag  
✅ **Searchable**: Built-in search and filtering  

## 📝 Migration from Old System

Old tag components in `src/components/tags/` can be migrated by:
1. Moving them to `src/tags/`
2. Adding the `tagMetadata` export
3. That's it!

The registry will automatically pick them up.
