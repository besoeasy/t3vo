<template>
  <div class="w-full p-4 bg-blue-50 rounded-xl border border-blue-200 flex flex-col gap-2">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-blue-700 font-bold text-sm">API Key</span>
    </div>
    <div class="flex items-center gap-2">
      <input
        :type="show ? 'text' : 'password'"
        :value="apiKey"
        readonly
        class="flex-1 px-3 py-2 rounded-lg border border-blue-200 bg-white text-xs font-mono text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all select-all"
        @focus="$event.target.select()"
      />
      <button
        @click="toggleShow"
        type="button"
        class="px-2 py-1 text-xs rounded-lg border border-blue-200 bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        :title="show ? 'Hide' : 'Show'"
      >
        {{ show ? "Hide" : "Show" }}
      </button>
      <button
        @click="copyApiKey"
        type="button"
        class="px-2 py-1 text-xs rounded-lg border border-blue-200 bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        :title="copied ? 'Copied!' : 'Copy'"
      >
        <span v-if="copied">Copied!</span>
        <span v-else>Copy</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  value: {
    type: String,
    default: "",
  },
  parsed: {
    type: Object,
    default: null
  }
});

const apiKey = ref(props.value);
const show = ref(false);
const copied = ref(false);

watch(
  () => props.value,
  (val) => {
    apiKey.value = val;
  }
);

function toggleShow() {
  show.value = !show.value;
}

async function copyApiKey() {
  if (!apiKey.value) return;
  await navigator.clipboard.writeText(apiKey.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1200);
}
</script>

<script>
export const tagMetadata = {
  name: 'apikey',
  displayName: 'API Key',
  description: 'Securely store API keys with show/hide and copy functionality',
  example: 'apikey=sk-1234567890abcdef',
  category: 'security',
  icon: '🔑',
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'API key is required' }
    }
    return { valid: true }
  }
}
</script>
