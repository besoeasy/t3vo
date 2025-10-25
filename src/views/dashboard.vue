<template>
  <!-- Notes Grid View -->
  <div class="w-full mx-auto p-4 md:p-8 pt-16 md:pt-8">
    <!-- Search Bar -->
    <div class="mb-6 md:mb-8">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="w-full pl-12 pr-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
    </div>

    <!-- Notes Grid -->
    <div v-if="!isLoading && filteredNotes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      <div
        v-for="note in filteredNotes"
        :key="note.id"
        @click="openNote(note)"
        class="group cursor-pointer rounded-xl p-5 transition-all duration-200 hover:shadow-lg min-h-[180px] flex flex-col relative bg-white border border-black"
      >
        <!-- Pin Indicator -->
        <div v-if="note.parsed.pinned" class="absolute top-3 right-3 text-lg opacity-70">📌</div>

        <!-- Content -->
        <div class="flex-1 mb-3">
          <h3 v-if="note.parsed.title" class="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
            {{ note.parsed.title }}
          </h3>

          <p class="text-sm text-gray-600 line-clamp-3">
            {{ note.parsed.content || "Empty note" }}
          </p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-xs text-gray-500 mt-auto">
          <div class="flex items-center gap-1.5">
            <span v-if="note.parsed.icon">{{ note.parsed.icon }}</span>
            <span v-for="tag in note.parsed.customTags.slice(0, 2)" :key="tag" class="px-2 py-0.5 bg-black/80 text-white rounded">
              {{ tag }}
            </span>
            <span v-if="note.parsed.customTags.length > 2">+{{ note.parsed.customTags.length - 2 }}</span>
          </div>

          <div class="flex items-center gap-1.5">
            <span v-if="note.parsed.type !== 'note'">
              <Key v-if="note.parsed.type === 'password'" class="w-3 h-3" />
              <Bookmark v-else-if="note.parsed.type === 'bookmark'" class="w-3 h-3" />
            </span>
            <span>{{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && filteredNotes.length === 0" class="text-center py-20">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-sm">
        <FileText class="w-10 h-10 text-gray-400" />
      </div>
      <h3 class="text-2xl font-semibold text-gray-900 mb-2">
        {{ searchQuery ? "No notes found" : "No notes yet" }}
      </h3>
      <p class="text-gray-600 mb-6">
        {{ searchQuery ? "Try adjusting your search" : "Click the + button to create your first note" }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchNotes } from "@/db";
import { Search, FileText, Key, Bookmark } from "lucide-vue-next";
import { format } from "timeago.js";

const router = useRouter();

// State
const searchQuery = ref("");
const isLoading = ref(false);
const notes = ref([]);

// Computed
const filteredNotes = computed(() => {
  let filtered = notes.value;

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((note) => note.parsed.title?.toLowerCase().includes(query) || note.parsed.content?.toLowerCase().includes(query));
  }

  // Sort: pinned notes first, then by updatedAt
  return filtered.sort((a, b) => {
    // Pinned notes come first
    if (a.parsed.pinned && !b.parsed.pinned) return -1;
    if (!a.parsed.pinned && b.parsed.pinned) return 1;

    // Otherwise sort by updatedAt (newest first)
    return b.updatedAt - a.updatedAt;
  });
});

// Methods
const loadNotes = async () => {
  isLoading.value = true;
  try {
    const loadedNotes = await fetchNotes(1, "", "all");
    notes.value = loadedNotes;
  } catch (error) {
    console.error("Error loading notes:", error);
  } finally {
    isLoading.value = false;
  }
};

const startNewNote = () => {
  // Generate a random ID for new note
  const newNoteId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  router.push(`/notes/${newNoteId}`);
};

// Expose startNewNote to parent via event
defineExpose({
  startNewNote,
});

const openNote = (note) => {
  router.push(`/notes/${note.id}`);
};

const formatDate = (timestamp) => {
  return format(timestamp);
};

// Lifecycle
onMounted(() => {
  loadNotes();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
