<template>
  <div class="flex flex-col gap-1">
    <span class="font-bold text-black">Address:</span>
    <a
      class="bg-gray-100 px-2 py-1 rounded select-all text-black border border-gray-300 underline hover:bg-yellow-100 transition-colors"
      :href="mapUrl"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ value }}
    </a>
  </div>
</template>

<script setup>
const props = defineProps({ value: String });
const mapUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(props.value)}`;
</script>
