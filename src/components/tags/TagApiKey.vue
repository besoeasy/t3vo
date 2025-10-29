<template>
  <div class="flex flex-col gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200 w-full">
    <div class="flex items-center gap-2">
      <span class="text-blue-600 font-semibold text-sm">API Key</span>
      <span class="text-xs text-blue-400">#@apikey</span>
    </div>
    <div class="flex flex-col gap-1">
      <input
        v-model="apiKey"
        type="text"
        class="input input-bordered w-full text-xs"
        placeholder="Enter your API key"
        readonly
        @focus="$event.target.select()"
      />
      <button
        class="btn btn-xs btn-outline btn-primary mt-1 self-end"
        @click="copyApiKey"
        type="button"
      >
        Copy
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: ''
  }
})

const apiKey = ref(props.value)

watch(() => props.value, (val) => {
  apiKey.value = val
})

function copyApiKey() {
  if (!apiKey.value) return
  navigator.clipboard.writeText(apiKey.value)
}
</script>
