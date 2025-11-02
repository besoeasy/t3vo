<template>
  <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Title</div>
    <div class="text-lg font-semibold text-gray-900 break-words">
      {{ value }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})
</script>

<script>
export const tagMetadata = {
  name: 'title',
  displayName: 'Title',
  description: 'Set the title for your note',
  example: 'title=My Important Note',
  category: 'metadata',
  icon: '📝',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'Title cannot be empty' }
    }
    if (value.trim().length > 200) {
      return { valid: false, error: 'Title is too long (max 200 characters)' }
    }
    return { valid: true }
  }
}
</script>
