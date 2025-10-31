<template>
  <div class="flex flex-col gap-1">
    <span class="font-bold text-black">WiFi:</span>
    <span class="bg-gray-100 px-2 py-1 rounded select-all text-black border border-gray-300">{{ value }}</span>
  </div>
</template>

<script setup>
const props = defineProps({ value: String });
</script>
