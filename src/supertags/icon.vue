<template>
  <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Icon</div>
    <div class="flex items-center gap-3">
      <span class="text-4xl">{{ value }}</span>
      <div class="text-sm text-gray-600">
        Custom emoji icon for this note
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: {
    type: String,
    default: '📄'
  }
})
</script>

<script>
export const tagMetadata = {
  name: 'icon',
  displayName: 'Icon',
  description: 'Set a custom emoji icon for your note card',
  example: 'icon=🎯',
  category: 'metadata',
  icon: '🎨',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'Icon cannot be empty' }
    }
    // Check if it's a valid emoji or single character
    const trimmed = value.trim()
    if (trimmed.length > 10) {
      return { valid: false, error: 'Icon should be a single emoji or short symbol' }
    }
    return { valid: true }
  }
}
</script>
