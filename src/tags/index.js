/**
 * Tag Registry System
 * Auto-discovers and registers all tag modules from the tags directory
 * 
 * Each tag module should export:
 * 1. Default export: Vue component for rendering the tag
 * 2. Named export 'tagMetadata': Object with tag configuration
 * 
 * Example tag metadata structure:
 * {
 *   name: 'crypto',              // Tag name (used as #@crypto=)
 *   displayName: 'Cryptocurrency', // Human-readable name
 *   description: '...',           // What this tag does
 *   example: 'crypto=bitcoin',    // Example usage
 *   category: 'finance',          // Category for grouping
 *   icon: '₿',                    // Display icon
 *   aliases: [],                  // Alternative names (e.g., ['url'] for 'bookmark')
 *   parseValue: (value) => value, // Optional: Transform the value
 *   validate: (value) => {...}    // Optional: Validate the value
 * }
 */

// Import all tag modules using Vite's glob import
const tagModules = import.meta.glob('./*.vue', { eager: true })

class TagRegistry {
  constructor() {
    this.tags = new Map()
    this.components = new Map()
    this.aliases = new Map()
    this.categories = new Map()
    this.initialize()
  }

  initialize() {
    // Process each tag module
    for (const [path, module] of Object.entries(tagModules)) {
      // Skip index.js
      if (path === './index.js') continue

      // Extract filename without extension (e.g., './crypto.vue' -> 'crypto')
      const filename = path.replace('./', '').replace('.vue', '')

      // Get tag metadata
      const metadata = module.tagMetadata || this.createDefaultMetadata(filename)
      
      // Store component
      this.components.set(metadata.name, module.default || module)
      
      // Register tag
      this.tags.set(metadata.name, metadata)

      // Register aliases
      if (metadata.aliases && metadata.aliases.length > 0) {
        metadata.aliases.forEach(alias => {
          this.aliases.set(alias, metadata.name)
        })
      }

      // Organize by category
      if (metadata.category) {
        if (!this.categories.has(metadata.category)) {
          this.categories.set(metadata.category, [])
        }
        this.categories.get(metadata.category).push(metadata)
      }

      console.log(`✓ Registered tag: #@${metadata.name}=`)
    }

    console.log(`🏷️  Tag Registry initialized with ${this.tags.size} tags`)
  }

  createDefaultMetadata(filename) {
    return {
      name: filename,
      displayName: this.toTitleCase(filename),
      description: `${this.toTitleCase(filename)} tag`,
      example: `${filename}=value`,
      category: 'other',
      icon: '🏷️',
      aliases: [],
      parseValue: (value) => value.trim(),
      validate: (value) => ({ valid: true })
    }
  }

  toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Get tag metadata by name or alias
   */
  getTag(name) {
    const tagName = this.aliases.get(name) || name
    return this.tags.get(tagName)
  }

  /**
   * Get component by tag name or alias
   */
  getComponent(name) {
    const tagName = this.aliases.get(name) || name
    return this.components.get(tagName)
  }

  /**
   * Get all tags
   */
  getAllTags() {
    return Array.from(this.tags.values())
  }

  /**
   * Get all tags in a specific category
   */
  getTagsByCategory(category) {
    return this.categories.get(category) || []
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories.keys())
  }

  /**
   * Check if a tag exists
   */
  hasTag(name) {
    return this.tags.has(name) || this.aliases.has(name)
  }

  /**
   * Parse a tag value using its custom parser if available
   */
  parseTagValue(tagName, value) {
    const metadata = this.getTag(tagName)
    if (metadata && metadata.parseValue) {
      return metadata.parseValue(value)
    }
    return value
  }

  /**
   * Validate a tag value using its custom validator if available
   */
  validateTagValue(tagName, value) {
    const metadata = this.getTag(tagName)
    if (metadata && metadata.validate) {
      return metadata.validate(value)
    }
    return { valid: true }
  }

  /**
   * Get tag suggestions for autocomplete
   * Returns array of { tag, description, category, icon }
   */
  getTagSuggestions(filterCategory = null) {
    const tags = filterCategory 
      ? this.getTagsByCategory(filterCategory)
      : this.getAllTags()

    return tags.map(metadata => ({
      tag: `#@${metadata.name}=`,
      displayName: metadata.displayName,
      description: metadata.description,
      example: metadata.example,
      category: metadata.category,
      icon: metadata.icon,
      aliases: metadata.aliases
    }))
  }

  /**
   * Search tags by name or description
   */
  searchTags(query) {
    const lowerQuery = query.toLowerCase()
    return this.getAllTags().filter(metadata => 
      metadata.name.toLowerCase().includes(lowerQuery) ||
      metadata.displayName.toLowerCase().includes(lowerQuery) ||
      metadata.description.toLowerCase().includes(lowerQuery) ||
      (metadata.aliases && metadata.aliases.some(alias => alias.toLowerCase().includes(lowerQuery)))
    )
  }
}

// Create and export singleton instance
export const tagRegistry = new TagRegistry()

// Export helper functions
export function getTagComponent(name) {
  return tagRegistry.getComponent(name)
}

export function getTagMetadata(name) {
  return tagRegistry.getTag(name)
}

export function getAllTags() {
  return tagRegistry.getAllTags()
}

export function getTagSuggestions(category = null) {
  return tagRegistry.getTagSuggestions(category)
}

export function hasTag(name) {
  return tagRegistry.hasTag(name)
}

export function parseTagValue(tagName, value) {
  return tagRegistry.parseTagValue(tagName, value)
}

export function validateTagValue(tagName, value) {
  return tagRegistry.validateTagValue(tagName, value)
}

export default tagRegistry
