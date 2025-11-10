<template>
  <div v-if="bookmarkUrl">
    <!-- Rich Preview (when metadata is available) -->
    <div
      v-if="metadata && !error"
      class="bg-white rounded-xl border border-gray-200 hover:border-violet-400 hover:shadow-md transition-all duration-200 group overflow-hidden"
    >
      <a :href="bookmarkUrl" target="_blank" rel="noopener noreferrer" class="block group">
        <!-- Hero Image -->
        <div v-if="metadata.image?.url" class="relative aspect-2/1 overflow-hidden bg-gray-100">
          <img
            :src="metadata.image.url"
            :alt="metadata.title || displayUrl"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <!-- Favicon overlay -->
          <div v-if="metadata.logo?.url" class="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <img :src="metadata.logo.url" :alt="metadata.publisher" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <!-- Header -->
          <div class="flex items-start gap-3 mb-3">
            <div v-if="!metadata.image?.url && metadata.logo?.url" class="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <img :src="metadata.logo.url" :alt="metadata.publisher" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-violet-600 transition-colors">
                {{ metadata.title || displayUrl }}
              </h3>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span v-if="metadata.publisher">{{ metadata.publisher }}</span>
                <span v-if="metadata.publisher && metadata.author">•</span>
                <span v-if="metadata.author">{{ metadata.author }}</span>
              </div>
            </div>

            <svg
              class="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              ></path>
            </svg>
          </div>

          <!-- Description -->
          <p v-if="metadata.description" class="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
            {{ metadata.description }}
          </p>

          <!-- URL -->
          <div class="text-xs text-gray-500 truncate">
            {{ displayUrl }}
          </div>
        </div>
      </a>
    </div>

    <!-- Basic Bookmark (fallback or while loading) -->
    <div v-else class="bg-white rounded-xl border border-gray-200 hover:border-violet-400 hover:shadow-md transition-all duration-200 group">
      <a :href="bookmarkUrl" target="_blank" rel="noopener noreferrer" class="block p-4 group">
        <div class="flex items-center gap-3">
          <!-- Icon with loading indicator -->
          <div class="relative w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors">
            <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
            <!-- Loading spinner overlay -->
            <div v-if="loading" class="absolute inset-0 bg-violet-100 rounded-lg flex items-center justify-center">
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-violet-600 border-t-transparent"></div>
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
              {{ displayUrl }}
            </div>
            <div class="text-xs text-gray-500 flex items-center gap-2">
              <span>Bookmark</span>
              <span v-if="loading">• Loading preview...</span>
              <span v-else-if="error">• Preview failed</span>
            </div>
          </div>

          <svg
            class="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            ></path>
          </svg>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import axios from "axios";
import { getCachedData, setCachedData } from "../utils/supertagCache";

const props = defineProps({
  value: {
    type: String,
    default: null,
  },
});

const loading = ref(false);
const error = ref(false);
const metadata = ref(null);

const bookmarkUrl = computed(() => {
  return props.value;
});

const displayUrl = computed(() => {
  if (!bookmarkUrl.value) return "";
  return bookmarkUrl.value.replace(/^https?:\/\//, "").replace(/\/$/, "");
});

const fetchMetadata = async (url) => {
  if (!url) return;

  // Check cache first (30 day cache for bookmarks)
  const cached = getCachedData("bookmark", url);
  if (cached) {
    console.log(`Using cached metadata for ${url}`);
    metadata.value = cached;
    return;
  }

  loading.value = true;
  error.value = false;

  try {
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://api.microlink.io/?url=${encodedUrl}&meta=true`;

    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.data.status === "success" && response.data.data) {
      metadata.value = response.data.data;
      setCachedData("bookmark", url, response.data.data, "40d");
    } else {
      error.value = true;
    }
  } catch (err) {
    console.error("Failed to fetch metadata:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

watch(
  bookmarkUrl,
  (newUrl) => {
    if (newUrl) {
      fetchMetadata(newUrl);
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (bookmarkUrl.value) {
    fetchMetadata(bookmarkUrl.value);
  }
});
</script>

<script>
export const tagMetadata = {
  name: "bookmark",
  displayName: "Bookmark",
  description: "Save and organize website bookmarks",
  example: "bookmark=https://example.com",
  category: "reference",
  icon: "🔖",
  parseValue: (value) => {
    const trimmed = value.trim();

    if (trimmed && !trimmed.match(/^https?:\/\//)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  },
  validate: (value) => {
    if (!value || !value.trim()) {
      return { valid: false, error: "URL is required" };
    }
    try {
      new URL(value.trim().match(/^https?:\/\//) ? value.trim() : `https://${value.trim()}`);
      return { valid: true };
    } catch (e) {
      return { valid: false, error: "Invalid URL format" };
    }
  },
};
</script>
