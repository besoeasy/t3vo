<template>
  <div class="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
    <div class="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Username</div>
    <div class="text-sm text-gray-900 font-mono select-all">
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
  name: 'username',
  displayName: 'Username',
  description: 'Store usernames for accounts',
  example: 'username=john_doe',
  category: 'contact',
  icon: '👤',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'Username is required' }
    }
    return { valid: true }
  }
}
</script>
