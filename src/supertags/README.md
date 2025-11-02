# Modular Supertag System

The T3VO supertag system is fully modular - each supertag is a self-contained Vue component with metadata that describes its behavior.

Supertags are different from regular tags (`#tag`). They are interactive components with the `#@` prefix that provide rich functionality like displaying cryptocurrency prices, generating QR codes, managing passwords, etc.

## 📁 Structure

```
src/supertags/
├── index.js          # Supertag registry (auto-discovers all supertags)
├── crypto.vue        # Supertag component with metadata
├── bookmark.vue      # Supertag component with metadata
├── password.vue      # Supertag component with metadata
└── ...              # More supertag components
```

## 🎯 How It Works

1. **Auto-Discovery**: The supertag registry (`index.js`) automatically discovers and registers all `.vue` files in the `src/supertags/` directory
2. **Metadata Export**: Each supertag component exports its configuration via `tagMetadata`
3. **Dynamic Loading**: Components are loaded dynamically when needed
4. **Type Safety**: Validation and parsing logic is defined per-supertag

## 🔨 Creating a New Supertag

### Step 1: Create the Component File

Create a new `.vue` file in `src/supertags/` with the supertag name (e.g., `email.vue` for `#@email=`)

### Step 2: Build the Component

```vue
<template>
  <div>
    <!-- Your supertag's UI here -->
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

### Step 3: Export Supertag Metadata

Add a second `<script>` block to export the supertag configuration:

```vue
<script>
export const tagMetadata = {
  name: 'email',                    // Supertag identifier (used as #@email=)
  displayName: 'Email Address',     // Human-readable name
  description: 'Store and display email addresses',  // What it does
  example: 'email=user@example.com', // Example usage
  category: 'contact',               // Category for organization
  icon: '📧',                        // Display icon
  
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

The supertag is automatically registered and available! No need to:
- ❌ Update any import statements
- ❌ Modify the parser
- ❌ Register it manually
- ❌ Update documentation

## 📋 Supertag Metadata Reference

| Property      | Type     | Required | Description                                    |
|---------------|----------|----------|------------------------------------------------|
| `name`        | string   | Yes      | Supertag identifier (used as `#@name=`)        |
| `displayName` | string   | Yes      | Human-readable name for UI                     |
| `description` | string   | Yes      | What the supertag does                         |
| `example`     | string   | Yes      | Example usage (e.g., `crypto=bitcoin`)         |
| `category`    | string   | Yes      | Category (`security`, `finance`, `reference`)  |
| `icon`        | string   | Yes      | Emoji or icon for display                      |
| `parseValue`  | function | No       | Transform value when parsed                    |
| `validate`    | function | No       | Validate value (return `{valid, error?}`)      |

## 🏷️ Categories

Organize your supertags into categories:

- **`security`**: Passwords, API keys, secrets, 2FA
- **`finance`**: Cryptocurrency, cards, invoices  
- **`reference`**: Bookmarks, URLs, documents
- **`contact`**: Emails, phones, addresses
- **`organization`**: Tags, pins, icons, dates
- **`data`**: QR codes, IPs, domains
- **`other`**: Uncategorized supertags

## 🎨 Component Props

Your supertag component receives these props:

```javascript
props: {
  value: String,    // The supertag's value (e.g., for #@crypto=bitcoin, value is "bitcoin")
  parsed: Object    // Full parsed note object with all supertags
}
```

## 🔍 Using the Supertag Registry

```javascript
import { supertagRegistry, getSupertagComponent, getSupertagMetadata, getAllSupertags } from '@/supertags'

// Get a specific supertag's component
const CryptoComponent = getSupertagComponent('crypto')

// Get supertag metadata
const metadata = getSupertagMetadata('crypto')

// Get all registered supertags
const allSupertags = getAllSupertags()

// Get supertags by category
const securitySupertags = supertagRegistry.getSupertagsByCategory('security')

// Search supertags
const results = supertagRegistry.searchSupertags('password')

// Validate a value
const validation = supertagRegistry.validateSupertagValue('email', 'test@example.com')
```

## ✨ Examples

### Simple Display Supertag

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

### Interactive Supertag with API

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

✅ **Modular**: Each supertag is independent and self-contained  
✅ **Auto-Discovery**: No manual registration needed  
✅ **Type-Safe**: Built-in validation per supertag  
✅ **Maintainable**: Easy to add, update, or remove supertags  
✅ **Documented**: Metadata serves as inline documentation  
✅ **Flexible**: Custom parsing and validation per supertag  
✅ **Searchable**: Built-in search and filtering  

## 📝 Migration from Old System

Old tag components in `src/components/tags/` can be migrated by:
1. Moving them to `src/supertags/`
2. Adding the `tagMetadata` export
3. That's it!

The registry will automatically pick them up.
