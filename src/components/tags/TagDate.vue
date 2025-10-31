<template>
  <div class="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
    <div class="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
    <div class="flex flex-col flex-1 min-w-0">
      <span class="text-xs text-gray-500 font-medium mb-1">Date</span>
      <span class="text-lg font-bold text-black select-all">{{ value }}</span>
      <span v-if="relative" class="text-xs text-gray-400 mt-1">({{ relative }})</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { format as timeagoFormat } from "timeago.js";

const props = defineProps({ value: String });

const relative = computed(() => {
  if (!props.value) return "";
  // Try to parse as date string
  const date = new Date(props.value);
  if (isNaN(date.getTime())) return "";
  return timeagoFormat(date);
});
</script>
