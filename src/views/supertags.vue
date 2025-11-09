<template>
  <div class=" mx-auto p-4 md:p-8 pt-16 md:pt-8">
    <!-- Info about supertag definitions -->
    <div class="mb-4">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        You can read all supertag definitions directly from the
        <a href="https://github.com/besoeasy/ZeroNote/tree/main/src/supertags" target="_blank" rel="noopener noreferrer" class="underline hover:text-blue-700">
          GitHub Supertags Directory
        </a>.
      </div>
    </div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Supertags</h1>
      <p class="text-gray-600">{{ allTags.length }} tags available</p>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search tags..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <!-- Tags List -->
    <div v-if="filteredTags.length > 0" class="space-y-3">
      <div
        v-for="tag in filteredTags"
        :key="tag.name"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl">{{ tag.icon }}</span>
              <h3 class="font-semibold text-gray-900">{{ tag.displayName }}</h3>
              <code class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">#@{{ tag.name }}=</code>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ tag.description }}</p>
            <code class="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded font-mono block w-fit">#@{{ tag.example }}</code>
          </div>
          <button
            @click="copyTag(tag.name)"
            class="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
          >
            Copy
          </button>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">No tags found</p>
    </div>

    <!-- Toast -->
    <div v-if="showCopiedToast" class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
      Copied!
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { supertagRegistry } from "@/supertags";

const searchQuery = ref("");
const showCopiedToast = ref(false);

const allTags = computed(() => supertagRegistry.getAllSupertags());

const filteredTags = computed(() => {
  if (!searchQuery.value.trim()) return allTags.value;
  
  const query = searchQuery.value.toLowerCase();
  return allTags.value.filter(
    (tag) =>
      tag.name.toLowerCase().includes(query) ||
      tag.displayName.toLowerCase().includes(query) ||
      tag.description.toLowerCase().includes(query)
  );
});

const copyTag = async (tagName) => {
  await navigator.clipboard.writeText(`#@${tagName}=`);
  showCopiedToast.value = true;
  setTimeout(() => {
    showCopiedToast.value = false;
  }, 2000);
};
</script>
