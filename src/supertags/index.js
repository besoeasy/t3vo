/**
 * Supertag Registry System
 * Auto-discovers and registers all supertag modules from the supertags directory
 * 
 * Each supertag module should export:
 * 1. Default export: Vue component for rendering the supertag
 * 2. Named export 'tagMetadata': Object with supertag configuration
 * 
 * Example supertag metadata structure:
 * {
 *   name: 'crypto',              // Supertag name (used as #@crypto=)
 *   displayName: 'Cryptocurrency', // Human-readable name
 *   description: '...',           // What this supertag does
 *   example: 'crypto=bitcoin',    // Example usage
 *   category: 'finance',          // Category for grouping
 *   icon: '₿',                    // Display icon
 *   parseValue: (value) => value, // Optional: Transform the value
 *   validate: (value) => {...}    // Optional: Validate the value
 * }
 */

// Import all supertag modules using Vite's glob import
const supertagModules = import.meta.glob('./*.vue', { eager: true })

class SupertagRegistry {
  constructor() {
    this.supertags = new Map()
    this.components = new Map()
    this.categories = new Map()
    this.initialize()
  }

  initialize() {
    // Process each supertag module
    for (const [path, module] of Object.entries(supertagModules)) {
      // Skip index.js
      if (path === './index.js') continue

      // Extract filename without extension (e.g., './crypto.vue' -> 'crypto')
      const filename = path.replace('./', '').replace('.vue', '')

      // Get supertag metadata
      const metadata = module.tagMetadata || this.createDefaultMetadata(filename)
      
      // Store component
      this.components.set(metadata.name, module.default || module)
      
      // Register supertag
      this.supertags.set(metadata.name, metadata)

      // Organize by category
      if (metadata.category) {
        if (!this.categories.has(metadata.category)) {
          this.categories.set(metadata.category, [])
        }
        this.categories.get(metadata.category).push(metadata)
      }

      console.log(`✓ Registered supertag: #@${metadata.name}=`)
    }

    console.log(`🏷️  Supertag Registry initialized with ${this.supertags.size} supertags`)
  }

  createDefaultMetadata(filename) {
    return {
      name: filename,
      displayName: this.toTitleCase(filename),
      description: `${this.toTitleCase(filename)} supertag`,
      example: `${filename}=value`,
      category: 'other',
      icon: '🏷️',
      parseValue: (value) => value.trim(),
      validate: (value) => ({ valid: true })
    }
  }

  toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Get supertag metadata by name
   */
  getSupertag(name) {
    return this.supertags.get(name)
  }

  /**
   * Get component by supertag name
   */
  getComponent(name) {
    return this.components.get(name)
  }

  /**
   * Get all supertags
   */
  getAllSupertags() {
    return Array.from(this.supertags.values())
  }

  /**
   * Get all supertags in a specific category
   */
  getSupertagsByCategory(category) {
    return this.categories.get(category) || []
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories.keys())
  }

  /**
   * Check if a supertag exists
   */
  hasSupertag(name) {
    return this.supertags.has(name)
  }

  /**
   * Parse a supertag value using its custom parser if available
   */
  parseSupertagValue(supertagName, value) {
    const metadata = this.getSupertag(supertagName)
    if (metadata && metadata.parseValue) {
      return metadata.parseValue(value)
    }
    return value
  }

  /**
   * Validate a supertag value using its custom validator if available
   */
  validateSupertagValue(supertagName, value) {
    const metadata = this.getSupertag(supertagName)
    if (metadata && metadata.validate) {
      return metadata.validate(value)
    }
    return { valid: true }
  }

  /**
   * Get supertag suggestions for autocomplete
   * Returns array of { tag, description, category, icon }
   */
  getSupertagSuggestions(filterCategory = null) {
    const supertags = filterCategory 
      ? this.getSupertagsByCategory(filterCategory)
      : this.getAllSupertags()

    return supertags.map(metadata => ({
      tag: `#@${metadata.name}=`,
      displayName: metadata.displayName,
      description: metadata.description,
      example: metadata.example,
      category: metadata.category,
      icon: metadata.icon
    }))
  }

  /**
   * Search supertags by name or description
   */
  searchSupertags(query) {
    const lowerQuery = query.toLowerCase()
    return this.getAllSupertags().filter(metadata => 
      metadata.name.toLowerCase().includes(lowerQuery) ||
      metadata.displayName.toLowerCase().includes(lowerQuery) ||
      metadata.description.toLowerCase().includes(lowerQuery)
    )
  }
}

// Create and export singleton instance
export const supertagRegistry = new SupertagRegistry()

// Export helper functions
export function getSupertagComponent(name) {
  return supertagRegistry.getComponent(name)
}

export function getSupertagMetadata(name) {
  return supertagRegistry.getSupertag(name)
}

export function getAllSupertags() {
  return supertagRegistry.getAllSupertags()
}

export function getSupertagSuggestions(category = null) {
  return supertagRegistry.getSupertagSuggestions(category)
}

export function hasSupertag(name) {
  return supertagRegistry.hasSupertag(name)
}

export function parseSupertagValue(supertagName, value) {
  return supertagRegistry.parseSupertagValue(supertagName, value)
}

export function validateSupertagValue(supertagName, value) {
  return supertagRegistry.validateSupertagValue(supertagName, value)
}

export default supertagRegistry
