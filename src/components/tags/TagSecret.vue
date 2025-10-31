<template>
  <div class="w-full p-4 bg-white border border-gray-200 rounded-xl flex flex-col gap-2">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-black font-bold text-sm">Secret</span>
    </div>
    <div class="flex items-center gap-2">
      <input
        :type="show ? 'text' : 'password'"
        :value="value"
        readonly
        class="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs font-mono text-black focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all select-all"
        @focus="$event.target.select()"
      />
      <button
        @click="toggleShow"
        type="button"
        class="px-2 py-1 text-xs rounded-lg border border-gray-300 bg-gray-100 text-black hover:bg-gray-200 transition-colors"
        :title="show ? 'Hide' : 'Show'"
      >
        {{ show ? "Hide" : "Show" }}
      </button>
      <button
        @click="copySecret"
        type="button"
        class="px-2 py-1 text-xs rounded-lg border border-gray-300 bg-gray-100 text-black hover:bg-gray-200 transition-colors"
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
const props = defineProps({ value: String });

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
