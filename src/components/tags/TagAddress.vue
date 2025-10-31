
<template>
  <div class="flex flex-col gap-2 w-full">
    <span class="font-bold text-black">Address:</span>
    <a
      class="bg-gray-100 px-2 py-1 rounded select-all text-black border border-gray-300 underline hover:bg-yellow-100 transition-colors mb-2"
      :href="mapUrl"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ value }}
    </a>
    <button
      v-if="value"
      @click="locateOnMap"
      class="w-max px-3 py-1 text-xs rounded-lg border border-gray-300 bg-gray-100 text-black hover:bg-gray-200 transition-colors mb-2"
      :disabled="loading"
    >
      <span v-if="loading">Locating...</span>
      <span v-else>Locate on Map</span>
    </button>
    <div v-if="showMap && lat && lon" class="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
      <iframe
        :src="computedEmbedUrl"
        width="100%"
        height="220"
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
