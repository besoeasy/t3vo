<template>
  <div class="w-full p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
    <div class="flex items-center gap-6 mb-4">
      <div class="flex-1">
        <span class="text-sm text-gray-500 font-semibold tracking-wide uppercase mb-2 block">IP Address</span>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="font-mono text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-xl select-all border border-gray-200">{{ value }}</span>
          <button
            @click="fetchInfo"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium rounded-xl bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Loading...</span>
            </span>
            <span v-else class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Lookup</span>
            </span>
          </button>
        </div>
      </div>
    </div>
    <div v-if="info" class="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col">
          <span class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Country</span>
          <span class="text-sm font-medium text-gray-900">{{ info.country || "-" }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Region</span>
          <span class="text-sm font-medium text-gray-900">{{ info.regionName || "-" }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">City</span>
          <span class="text-sm font-medium text-gray-900">{{ info.city || "-" }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">ISP</span>
          <span class="text-sm font-medium text-gray-900">{{ info.isp || "-" }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Organization</span>
          <span class="text-sm font-medium text-gray-900">{{ info.org || "-" }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Timezone</span>
          <span class="text-sm font-medium text-gray-900">{{ info.timezone || "-" }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Coordinates</span>
          <span class="text-sm font-medium text-gray-900">{{ info.lat }}, {{ info.lon }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">ZIP Code</span>
          <span class="text-sm font-medium text-gray-900">{{ info.zip || "-" }}</span>
        </div>
      </div>
      <div v-if="info.query" class="mt-5 pt-4 border-t border-gray-200">
        <a
          :href="`https://www.openstreetmap.org/?mlat=${info.lat}&mlon=${info.lon}`"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white text-purple-600 hover:bg-purple-50 border border-purple-200 transition-all duration-200 shadow-sm hover:shadow"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>View on Map</span>
        </a>
      </div>
    </div>
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
      <p class="text-sm text-red-600 font-medium">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({ value: String });
const info = ref(null);
const error = ref("");
const loading = ref(false);

async function fetchInfo() {
  if (!props.value) return;
  loading.value = true;
  error.value = "";
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
        const res = await fetch(
          `https://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,isp,org,timezone,lat,lon,zip,query`
        );
        const data = await res.json();
        if (data && data.status === "success") return data;
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
          const [lat, lon] = (data.loc || "").split(",");
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
  error.value = "Failed to fetch IP info from all providers.";
  loading.value = false;
}
</script>

<script>
export const tagMetadata = {
  name: "ip",
  displayName: "IP Address",
  description: "Display IP address with geolocation lookup and map integration",
  example: "ip=8.8.8.8",
  category: "data",
  icon: "🌐",
  parseValue: (value) => value.trim(),
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: "IP address is required" };
    }
    // Basic IPv4 validation
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // Basic IPv6 validation (simplified)
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    const trimmed = value.trim();
    if (!ipv4Pattern.test(trimmed) && !ipv6Pattern.test(trimmed)) {
      return { valid: false, error: "Invalid IP address format" };
    }
    return { valid: true };
  },
};
</script>
