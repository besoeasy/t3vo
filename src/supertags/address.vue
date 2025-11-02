<template>
  <div class="flex flex-col gap-3 w-full">
    <span class="text-sm font-semibold text-gray-900 tracking-tight">Address</span>
    <a
      class="group relative bg-white px-4 py-3 rounded-xl select-all text-gray-900 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
      :href="mapUrl"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="text-sm leading-relaxed">{{ value }}</span>
      <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
    <button
      v-if="value"
      @click="locateOnMap"
      class="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="loading"
    >
      <span v-if="loading" class="flex items-center justify-center gap-2">
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Locating...</span>
      </span>
      <span v-else class="flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Show on Map</span>
      </span>
    </button>
    <div v-if="showMap && lat && lon" class="w-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
      <iframe
        :src="computedEmbedUrl"
        width="100%"
        height="280"
        style="border:0;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="OpenStreetMap Embed"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
const props = defineProps({ value: String });
const mapUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(props.value)}`;

const lat = ref(null);
const lon = ref(null);
const loading = ref(false);
const showMap = ref(false);

const computedEmbedUrl = computed(() => {
  if (!lat.value || !lon.value) return '';
  // Zoom 16, marker at lat/lon
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon.value-0.005},${lat.value-0.003},${lon.value+0.005},${lat.value+0.003}&layer=mapnik&marker=${lat.value},${lon.value}`;
});

async function locateOnMap() {
  if (!props.value) return;
  loading.value = true;
  showMap.value = false;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(props.value)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    if (data && data.length > 0) {
      lat.value = parseFloat(data[0].lat);
      lon.value = parseFloat(data[0].lon);
      showMap.value = true;
    } else {
      lat.value = null;
      lon.value = null;
      showMap.value = false;
      alert('Location not found.');
    }
  } catch (e) {
    alert('Error locating address.');
  } finally {
    loading.value = false;
  }
}
</script>

<script>
export const tagMetadata = {
  name: "address",
  displayName: "Physical Address",
  description: "Display physical addresses with OpenStreetMap integration and geocoding",
  example: "address=123 Main St, New York, NY",
  category: "contact",
  icon: "📍",
  aliases: ["addr", "location"],
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: "Address is required" };
    }
    return { valid: true };
  },
};
</script>
