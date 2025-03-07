<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { fetchEntriesByType, addEntry, softDeleteEntry } from "@/db.js";
import { Search, Plus, X, FileText, ChevronLeft, ChevronRight } from "lucide-vue-next";

const newBookmark = ref({ title: "", url: "", note: "" });
const searchQuery = ref("");
const currentPage = ref(1);
const bookmarks = ref([]);
const totalBookmarks = ref(0);
const showAddForm = ref(false);
const isLoading = ref(false);

// Generate a random gradient for bookmark cards
const getRandomGradient = () => {
  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 40%, 90%), hsl(${hue2}, 30%, 100%))`;
};

const loadBookmarks = async () => {
  try {
    isLoading.value = true;
    const fetchedBookmarks = await fetchEntriesByType("bookmark", currentPage.value, searchQuery.value);
    bookmarks.value = fetchedBookmarks;

    // Update total count (only non-deleted bookmarks)
    totalBookmarks.value = await db.data.where("type").equals("bookmark").and((entry) => entry.deletedAt === null).count();
  } catch (error) {
    console.error("Error loading bookmarks:", error);
  } finally {
    isLoading.value = false;
  }
};

// Add new bookmark using the new database function
const addBookmark = async () => {
  if (!newBookmark.value.url) return;

  try {
    await addEntry("bookmark", {
      title: newBookmark.value.title || extractDomain(newBookmark.value.url),
      url: newBookmark.value.url,
      note: newBookmark.value.note,
    });

    // Reset form and reload first page
    newBookmark.value = { title: "", url: "", note: "" };
    showAddForm.value = false;
    currentPage.value = 1;
    await loadBookmarks();
  } catch (error) {
    console.error("Error adding bookmark:", error);
  }
};

// Soft delete bookmark instead of permanent deletion
const removeBookmark = async (id) => {
  try {
    await softDeleteEntry(id);
    await loadBookmarks();
  } catch (error) {
    console.error("Error removing bookmark:", error);
  }
};

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(totalBookmarks.value / 10); // Using the itemsPerPage constant from db.js
});

const extractDomain = (url) => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace("www.", "");
  } catch {
    return "";
  }
};

// Navigation functions
const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    await loadBookmarks();
  }
};

const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await loadBookmarks();
  }
};

// Watchers
watch(
  () => newBookmark.value.url,
  (newVal) => {
    if (newVal && !newBookmark.value.title) {
      newBookmark.value.title = extractDomain(newVal);
    }
  }
);

watch(searchQuery, async (newVal) => {
  currentPage.value = 1;
  await loadBookmarks();
});

// Lifecycle hooks
onMounted(loadBookmarks);
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="m-auto">
      <h1 class="text-4xl font-bold mb-8 text-gray-800 flex items-center">
        <FileText class="mr-4" size="36" />
        Bookmarks
      </h1>

      <div class="mb-8 flex items-center justify-between">
        <div class="relative flex-grow mr-4">
          <input v-model="searchQuery" placeholder="Search bookmarks..." class="w-full pl-10 pr-4 py-2 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors" />
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
        </div>
        <button @click="showAddForm = !showAddForm" class="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors flex items-center">
          <Plus size="20"  />
        </button>
      </div>

      <div v-if="showAddForm" class="mb-8 p-6 bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out">
        <h2 class="text-2xl font-bold mb-4">Add New Bookmark</h2>
        <input v-model="newBookmark.title" placeholder="Title" class="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <input v-model="newBookmark.url" placeholder="URL" class="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <textarea v-model="newBookmark.note" placeholder="Note" class="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3"></textarea>
        <button @click="addBookmark" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
          <Plus size="20"  />
        </button>
      </div>

      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" :style="{ background: getRandomGradient() }">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <a :href="bookmark.url" target="_blank" class="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors break-words flex items-center">
                {{ bookmark.title || extractDomain(bookmark.url) }}
              </a>
              <button @click="removeBookmark(bookmark.id)" class="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors">
                <X size="20" />
              </button>
            </div>
            <p class="text-sm text-gray-600 mb-2 break-words">{{ bookmark.url }}</p>
            <p v-if="bookmark.note" class="text-sm break-words mt-2 bg-opacity-50 p-2 rounded">{{ bookmark.note }}</p>
          </div>
        </div>
      </div>

      <p v-if="bookmarks.length === 0 && !isLoading" class="text-center text-gray-500 mt-8 text-lg">No bookmarks found matching your search.</p>

      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-4">
        <button @click="prevPage" :disabled="currentPage === 1 || isLoading" class="p-2 rounded-full bg-white shadow disabled:opacity-50 hover:bg-gray-100 transition-colors">
          <ChevronLeft size="24" />
        </button>
        <span class="text-lg font-medium">Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages || isLoading" class="p-2 rounded-full bg-white shadow disabled:opacity-50 hover:bg-gray-100 transition-colors">
          <ChevronRight size="24" />
        </button>
      </div>
    </div>
  </div>
</template>
