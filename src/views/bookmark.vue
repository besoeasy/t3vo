<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { fetchBookmarks, addBookmarkEntry, softDeleteEntry, updateBookmarkEntry } from "@/db";
import { Search, Plus, X, FileText, Edit } from "lucide-vue-next";

import EditModal from "@/components/edit-modal.vue";
import { useInfiniteScroll } from "@/mixins.js";

const newBookmark = ref({ title: "", url: "", note: "" });
const searchQuery = ref("");
const currentPage = ref(1);
const bookmarks = ref([]);
const hasMoreBookmarks = ref(true);
const showAddForm = ref(false);
const isLoading = ref(false);
const loadingMore = ref(false);
const loaderRef = ref(null);

const editingBookmark = ref(null);
const showEditModal = ref(false);

// Generate a random gradient for bookmark cards
const getRandomGradient = () => {
  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 40%, 90%), hsl(${hue2}, 30%, 100%))`;
};

const loadBookmarks = async (reset = false) => {
  if (isLoading.value || (loadingMore.value && !reset)) return;

  try {
    if (reset) {
      isLoading.value = true;
      currentPage.value = 1;
      bookmarks.value = [];
    } else {
      loadingMore.value = true;
    }

    const fetchedBookmarks = await fetchBookmarks(currentPage.value, searchQuery.value);

    if (fetchedBookmarks.length === 0) {
      hasMoreBookmarks.value = false;
    } else {
      const newBookmarks = fetchedBookmarks.map(bookmark => ({
        id: bookmark.id,
        title: bookmark.data.title,
        url: bookmark.data.url,
        note: bookmark.data.note,
        updated_at: bookmark.updatedAt
      }));

      bookmarks.value = [...bookmarks.value, ...newBookmarks];
      currentPage.value++;
    }
  } catch (error) {
    console.error("Error loading bookmarks:", error);
  } finally {
    isLoading.value = false;
    loadingMore.value = false;
  }
};

// Add new bookmark using the new database function
const addBookmark = async () => {
  if (!newBookmark.value.url) return;

  try {
    await addBookmarkEntry({
      title: newBookmark.value.title || extractDomain(newBookmark.value.url),
      url: newBookmark.value.url,
      note: newBookmark.value.note,
    });

    // Reset form and reload bookmarks
    newBookmark.value = { title: "", url: "", note: "" };
    showAddForm.value = false;
    await loadBookmarks(true);
  } catch (error) {
    console.error("Error adding bookmark:", error);
  }
};

// Soft delete bookmark
const removeBookmark = async (id) => {
  try {
    await softDeleteEntry(id);
    await loadBookmarks(true);
  } catch (error) {
    console.error("Error removing bookmark:", error);
  }
};

const editBookmark = (bookmark) => {
  editingBookmark.value = { ...bookmark };
  showEditModal.value = true;
};

const saveBookmarkEdit = async () => {
  try {
    await updateBookmarkEntry(editingBookmark.value.id, {
      title: editingBookmark.value.title,
      url: editingBookmark.value.url,
      note: editingBookmark.value.note,
    });

    showEditModal.value = false;
    await loadBookmarks(true);
  } catch (error) {
    console.error("Error updating bookmark:", error);
  }
};

const extractDomain = (url) => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace("www.", "");
  } catch {
    return "";
  }
};

// Infinite scroll implementation
const { observeElement, unobserveElement } = useInfiniteScroll(() => {
  if (!isLoading.value && !loadingMore.value && hasMoreBookmarks.value) {
    loadBookmarks();
  }
});

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
  hasMoreBookmarks.value = true;
  await loadBookmarks(true);
});

// Update observer when loaderRef changes
watch(loaderRef, (newRef, oldRef) => {
  if (oldRef) unobserveElement(oldRef);
  if (newRef) observeElement(newRef);
});

// Lifecycle hooks
onMounted(loadBookmarks);
</script>

<template>
  <div>
    <div>
      <h1 class="text-4xl font-bold mb-8 text-gray-800 flex items-center">
        <FileText class="mr-4" size="36" />
        Bookmarks
      </h1>

      <div class="mb-8 flex items-center justify-between">
        <div class="relative flex-grow mr-4">
          <input v-model="searchQuery" placeholder="Search bookmarks..."
            class="w-full pl-10 pr-4 py-2 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors" />
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
        </div>
        <button @click="showAddForm = !showAddForm"
          class="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors flex items-center">
          <Plus size="20" />
        </button>
      </div>

      <div v-if="showAddForm" class="mb-8 p-6 bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out">
        <h2 class="text-2xl font-bold mb-4">Add New Bookmark</h2>
        <input v-model="newBookmark.title" placeholder="Title"
          class="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <input v-model="newBookmark.url" placeholder="URL"
          class="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <textarea v-model="newBookmark.note" placeholder="Note"
          class="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"></textarea>
        <button @click="addBookmark"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
          <Plus size="20" />
        </button>
      </div>

      <div v-if="isLoading && bookmarks.length === 0" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div v-for="bookmark in bookmarks" :key="bookmark.id"
          class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          :style="{ background: getRandomGradient() }">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <a :href="bookmark.url" target="_blank"
                class="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors break-words flex items-center">
                {{ bookmark.title || extractDomain(bookmark.url) }}
              </a>
              <div class="flex">
                <button @click="editBookmark(bookmark)"
                  class="text-gray-500 hover:text-blue-500 p-1 rounded-full hover:bg-blue-100 transition-colors mr-1">
                  <Edit size="20" />
                </button>
                <button @click="removeBookmark(bookmark.id)"
                  class="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors">
                  <X size="20" />
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-2 break-words">{{ bookmark.url }}</p>
            <p v-if="bookmark.note" class="text-sm break-words mt-2 bg-opacity-50 p-2 rounded">{{ bookmark.note }}</p>
          </div>
        </div>
      </div>

      <p v-if="bookmarks.length === 0 && !isLoading" class="text-center text-gray-500 mt-8 text-lg">No bookmarks found
        matching your search.</p>

      <!-- Infinite Scroll Loader -->
      <div v-if="hasMoreBookmarks && bookmarks.length > 0" ref="loaderRef" class="flex justify-center py-4">
        <div v-if="loadingMore" class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <div v-else class="h-8"></div>
      </div>
    </div>
  </div>
  <EditModal :show="showEditModal" title="Edit Bookmark" @close="showEditModal = false" @save="saveBookmarkEdit">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input v-model="editingBookmark.title"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
        <input v-model="editingBookmark.url"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
        <textarea v-model="editingBookmark.note"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"></textarea>
      </div>
    </div>
  </EditModal>
</template>