<template>
  <div class="w-full p-4 bg-white rounded-xl border border-gray-200 flex flex-col gap-2">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-gray-900 font-bold text-sm">Secret</span>
    </div>
    <div class="flex items-center gap-2">
      <input
        :type="show ? 'text' : 'password'"
        :value="value"
        readonly
        class="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all select-all"
        @focus="$event.target.select()"
      />
      <button
        @click="toggleShow"
        type="button"
        class="px-2 py-1 text-xs rounded-lg border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
        :title="show ? 'Hide' : 'Show'"
      >
        {{ show ? "Hide" : "Show" }}
      </button>
      <button
        @click="copySecret"
        type="button"
        class="px-2 py-1 text-xs rounded-lg border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
        :title="copied ? 'Copied!' : 'Copy'"
      >
        <span v-if="copied">Copied!</span>
        <span v-else>Copy</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  value: {
    type: String,
    default: ""
  },
  parsed: {
    type: Object,
    default: null
  }
});

const show = ref(false);
const copied = ref(false);

function toggleShow() {
  show.value = !show.value;
}

async function copySecret() {
  if (!props.value) return;
  await navigator.clipboard.writeText(props.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1200);
}
</script>

<script>
export const tagMetadata = {
  name: 'secret',
  displayName: 'Secret',
  description: 'Store generic secrets securely with show/hide functionality',
  example: 'secret=MySecretValue123',
  category: 'security',
  icon: '🔒',
  aliases: [],
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: 'Secret value is required' }
    }
    return { valid: true }
  }
}
</script>
