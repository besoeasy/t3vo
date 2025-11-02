<template>
  <div class="max-w-6xl mx-auto p-4 md:p-8 pt-16 md:pt-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">Available Tags</h1>
      <p class="text-gray-600 dark:text-gray-300 text-lg">Discover all available tags to enhance your notes with powerful features</p>
    </div>

    <!-- Search Bar -->
    <div class="mb-8">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tags..."
          class="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div
        class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
      >
        <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ allTags.length }}</div>
        <div class="text-sm text-blue-800 dark:text-blue-300 font-medium">Total Tags</div>
      </div>
      <div
        class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
      >
        <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ categories.length }}</div>
        <div class="text-sm text-green-800 dark:text-green-300 font-medium">Categories</div>
      </div>
      <div
        class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4"
      >
        <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ filteredTags.length }}</div>
        <div class="text-sm text-purple-800 dark:text-purple-300 font-medium">{{ searchQuery ? "Results" : "Available" }}</div>
      </div>
      <div
        class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4"
      >
        <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">∞</div>
        <div class="text-sm text-orange-800 dark:text-orange-300 font-medium">Extensible</div>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="mb-6 flex flex-wrap gap-2">
      <button
        @click="selectedCategory = null"
        :class="
          selectedCategory === null
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        "
        class="px-4 py-2 rounded-lg font-medium transition-colors text-sm"
      >
        All Categories
      </button>
      <button
        v-for="category in categories"
        :key="category"
        @click="selectedCategory = category"
        :class="
          selectedCategory === category
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        "
        class="px-4 py-2 rounded-lg font-medium transition-colors text-sm capitalize"
      >
        {{ getCategoryIcon(category) }} {{ category }}
      </button>
    </div>

    <!-- Tags Grid -->
    <div v-if="filteredTags.length > 0" class="space-y-8">
      <div v-for="category in displayCategories" :key="category" class="space-y-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
          <span class="text-3xl">{{ getCategoryIcon(category) }}</span>
          {{ category }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="tag in getTagsByCategory(category)"
            :key="tag.name"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 group"
          >
            <!-- Tag Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="text-3xl">{{ tag.icon }}</div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {{ tag.displayName }}
                  </h3>
                  <code class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono"> #@{{ tag.name }}= </code>
                </div>
              </div>
              <button
                @click="copyTag(tag.name)"
                class="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Copy tag"
              >
                📋 Copy
              </button>
            </div>

            <!-- Description -->
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {{ tag.description }}
            </p>

            <!-- Example -->
            <div class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Example</div>
              <code class="text-sm text-gray-900 dark:text-gray-100 font-mono"> #@{{ tag.example }} </code>
            </div>

            <!-- Aliases -->
            <div v-if="tag.aliases && tag.aliases.length > 0" class="mt-3 flex flex-wrap gap-2">
              <span class="text-xs text-gray-500 dark:text-gray-400">Also:</span>
              <span
                v-for="alias in tag.aliases"
                :key="alias"
                class="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded font-mono"
              >
                #@{{ alias }}=
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">🔍</div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No tags found</h3>
      <p class="text-gray-600 dark:text-gray-400">Try a different search term or category</p>
    </div>

    <!-- Info Card -->
    <div
      class="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
    >
      <div class="flex items-start gap-4">
        <div class="p-3 bg-blue-500 rounded-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Modular Tag System</h3>
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
            T3VO uses a modular tag system where each tag is a self-contained component. Want to create your own tag? It's easy!
          </p>
          <div class="flex flex-wrap gap-3">
            <a
              href="https://github.com/besoeasy/t3vo/blob/main/src/tags/README.md"
              target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Developer Guide
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Copied Toast -->
    <div v-if="showCopiedToast" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      Tag copied to clipboard!
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { tagRegistry } from "@/tags";

const searchQuery = ref("");
const selectedCategory = ref(null);
const showCopiedToast = ref(false);

// Get all tags and categories from registry
const allTags = computed(() => tagRegistry.getAllTags());
const categories = computed(() => tagRegistry.getCategories());

// Filter tags based on search and category
const filteredTags = computed(() => {
  let tags = allTags.value;

  // Filter by category
  if (selectedCategory.value) {
    tags = tags.filter((tag) => tag.category === selectedCategory.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    tags = tags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(query) ||
        tag.displayName.toLowerCase().includes(query) ||
        tag.description.toLowerCase().includes(query) ||
        (tag.aliases && tag.aliases.some((alias) => alias.toLowerCase().includes(query)))
    );
  }

  return tags;
});

// Get unique categories from filtered tags
const displayCategories = computed(() => {
  const cats = new Set(filteredTags.value.map((tag) => tag.category));
  return Array.from(cats).sort();
});

// Get tags by category
const getTagsByCategory = (category) => {
  return filteredTags.value.filter((tag) => tag.category === category);
};

// Get category icon
const getCategoryIcon = (category) => {
  const icons = {
    security: "🔐",
    finance: "💰",
    reference: "🔖",
    contact: "📧",
    organization: "🎨",
    data: "💾",
    other: "🏷️",
  };
  return icons[category] || "🏷️";
};

// Copy tag to clipboard
const copyTag = async (tagName) => {
  try {
    await navigator.clipboard.writeText(`#@${tagName}=`);
    showCopiedToast.value = true;
    setTimeout(() => {
      showCopiedToast.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
