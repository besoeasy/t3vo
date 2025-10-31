<template>
  <div class="flex items-center gap-2">
    <span class="font-mono text-xs bg-gray-100 px-2 py-1 rounded select-all border border-gray-200">
      {{ address }}
    </span>
    <button @click="copyToClipboard(address)" class="p-1.5 rounded hover:bg-blue-100 transition-colors" title="Copy Address">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16h8M8 12h8m-8-4h8M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  value: String
})

const address = props.value

function copyToClipboard(text) {
  if (!text) return
  navigator.clipboard.writeText(text)
}
</script>
