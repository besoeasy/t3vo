<template>
  <div class="w-full p-4 bg-white border border-gray-200 rounded-xl flex flex-col gap-2">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-black font-bold text-sm">IP Address</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="font-mono text-black bg-gray-100 px-2 py-1 rounded select-all border border-gray-300">{{ value }}</span>
      <button @click="fetchInfo" :disabled="loading" class="px-2 py-1 text-xs rounded-lg border border-gray-300 bg-gray-100 text-black hover:bg-gray-200 transition-colors">
        <span v-if="loading">Loading...</span>
        <span v-else>Lookup</span>
      </button>
    </div>
    <div v-if="info" class="mt-2 text-xs text-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div><span class="font-semibold">Country:</span> {{ info.country || '-' }}</div>
        <div><span class="font-semibold">Region:</span> {{ info.regionName || '-' }}</div>
        <div><span class="font-semibold">City:</span> {{ info.city || '-' }}</div>
        <div><span class="font-semibold">ISP:</span> {{ info.isp || '-' }}</div>
        <div><span class="font-semibold">Org:</span> {{ info.org || '-' }}</div>
        <div><span class="font-semibold">Timezone:</span> {{ info.timezone || '-' }}</div>
        <div><span class="font-semibold">Lat/Lon:</span> {{ info.lat }}, {{ info.lon }}</div>
        <div><span class="font-semibold">ZIP:</span> {{ info.zip || '-' }}</div>
      </div>
      <div v-if="info.query" class="mt-2">
        <a :href="`https://www.openstreetmap.org/?mlat=${info.lat}&mlon=${info.lon}`" target="_blank" rel="noopener" class="text-blue-600 underline text-xs">View on Map</a>
      </div>
    </div>
    <div v-if="error" class="text-xs text-red-600 mt-2">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({ value: String });
const info = ref(null);
const error = ref('');
const loading = ref(false);

async function fetchInfo() {
  if (!props.value) return;
  loading.value = true;
  error.value = '';
  info.value = null;

  // List of APIs to try, each returns a promise for normalized data or null
  const apis = [
    async (ip) => {
      // ip-api.io
      try {
        const res = await fetch(`https://ip-api.io/json/${encodeURIComponent(ip)}`);
        const data = await res.json();
        if (data && data.country) return data;
      } catch {}
      return null;
    },
    async (ip) => {
      // ip-api.com
      try {
        const res = await fetch(`https://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,isp,org,timezone,lat,lon,zip,query`);
        const data = await res.json();
        if (data && data.status === 'success') return data;
      } catch {}
      return null;
    },
    async (ip) => {
      // ipinfo.io
      try {
        const res = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json?token=demo`); // Replace 'demo' with your token if needed
        const data = await res.json();
        if (data && data.country) {
          // Normalize to our format
          const [lat, lon] = (data.loc || '').split(',');
          return {
            country: data.country,
            regionName: data.region,
            city: data.city,
            isp: data.org,
            org: data.org,
            timezone: data.timezone,
            lat,
            lon,
            zip: data.postal,
            query: data.ip,
          };
        }
      } catch {}
      return null;
    },
    async (ip) => {
      // ipwho.is
      try {
        const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
        const data = await res.json();
        if (data && data.success) {
          return {
            country: data.country,
            regionName: data.region,
            city: data.city,
            isp: data.connection?.isp,
            org: data.connection?.org,
            timezone: data.timezone?.id,
            lat: data.latitude,
            lon: data.longitude,
            zip: data.postal,
            query: data.ip,
          };
        }
      } catch {}
      return null;
    },
  ];

  for (const api of apis) {
    const result = await api(props.value);
    if (result) {
      info.value = result;
      loading.value = false;
      return;
    }
  }
  error.value = 'Failed to fetch IP info from all providers.';
  loading.value = false;
}
</script>
