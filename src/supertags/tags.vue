<template>
  <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Tags</div>
    <div class="flex flex-wrap gap-2">
      <span
        v-for="tag in parsedTags"
        :key="tag"
        class="px-3 py-1 bg-gray-900 text-white text-sm rounded-full"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

const parsedTags = computed(() => {
  if (!props.value) return []
  return props.value.split(',').map(t => t.trim()).filter(Boolean)
})
</script>

<script>
export const tagMetadata = {
  name: 'tags',
  displayName: 'Tags',
  description: 'Add comma-separated tags to organize your notes',
  example: 'tags=work,important,project',
  category: 'metadata',
  icon: '🏷️',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'At least one tag is required' }
    }
    const tags = value.split(',').map(t => t.trim()).filter(Boolean)
    if (tags.length === 0) {
      return { valid: false, error: 'No valid tags found' }
    }
    return { valid: true }
  }
}
</script>
