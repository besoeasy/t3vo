<template>
  <!-- Notes Grid View -->
  <div class="w-full mx-auto p-2 md:p-8 pt-8 md:pt-8">
    <!-- Search Bar -->
    <div class="mb-4">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search notes..."
          class="w-full pl-12 pr-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>
    </div>

    <!-- Supertag Filters -->
    <div class="mb-6 md:mb-8">
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          @click="selectedSupertag = null"
          :class="selectedSupertag === null ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border border-gray-200"
        >
          All
        </button>
        <button
          v-for="tag in availableSupertags"
          :key="tag.name"
          @click="selectedSupertag = tag.name"
          :class="selectedSupertag === tag.name ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border border-gray-200 flex items-center gap-1.5"
        >
          <span>{{ tag.icon }}</span>
          <span>{{ tag.displayName }}</span>
        </button>
      </div>
    </div>

    <!-- Notes Grid -->
    <div v-if="!isLoading && filteredNotes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div
        v-for="note in filteredNotes"
        :key="note.id"
        @click="note.deletedAt ? undefined : openNote(note)"
        class="group cursor-pointer rounded-lg p-4 transition-all duration-200 hover:shadow-lg border border-gray-200 flex flex-col relative min-h-[240px]"
        :class="[getCardColor(note), note.deletedAt ? 'opacity-50 grayscale hover:shadow-none' : 'hover:border-gray-300']"
      >
        <!-- Emojis and Supertags in top right -->
        <div class="absolute top-2 right-2 flex items-center gap-1 flex-wrap justify-end max-w-[50%] bg-white rounded-lg px-2 py-1 shadow-sm">
          <span v-if="note.parsed.icon" class="text-2xl">{{ note.parsed.icon }}</span>
          <span
            v-for="supertag in getSupertags(note)"
            :key="supertag.name"
            :title="supertag.displayName"
            class="text-base opacity-60 hover:opacity-100 transition-opacity"
          >
            {{ supertag.icon }}
          </span>
          <span v-if="note.parsed.pinned" class="text-base opacity-60">📌</span>
        </div>

        <!-- Content -->
        <div class="flex-1 mb-3">
          <h3 v-if="note.parsed.title" class="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight pr-12">
            {{ note.parsed.title }}
          </h3>
          <p class="text-xs text-gray-600 line-clamp-4 leading-relaxed">
            {{ note.parsed.content || "......." }}
          </p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
          <div class="flex items-center gap-1 flex-wrap">
            <span
              v-for="tag in (note.parsed.customTags || []).slice(0, 2)"
              :key="tag"
              class="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium"
            >
              {{ tag }}
            </span>
            <span v-if="(note.parsed.customTags || []).length > 2" class="text-[10px] font-medium text-gray-400"
              >+{{ (note.parsed.customTags || []).length - 2 }}</span
            >
          </div>
          <div class="flex items-center gap-1">
            <span class="text-[10px]">{{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>

        <!-- Deleted note badge and countdown -->
        <div v-if="note.deletedAt" class="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-lg z-10 backdrop-blur-sm">
          <div class="text-xs font-semibold text-red-600 mb-1">Pending Deletion</div>
          <div class="text-xs text-gray-600 mb-2">Deleting in {{ getPurgeCountdown(note.deletedAt) }}</div>
          <button
            @click.stop="restoreNote(note)"
            class="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
          >
            Restore
          </button>
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
import { fetchNotes, db } from "@/db";
import { Search, FileText, Key, Bookmark } from "lucide-vue-next";
import { format } from "timeago.js";
import { supertagRegistry } from "@/supertags";

const router = useRouter();

// State
const searchQuery = ref("");
const selectedSupertag = ref(null);
const isLoading = ref(false);
const notes = ref([]);

// Get all available supertags
const availableSupertags = computed(() => supertagRegistry.getAllSupertags());

// Computed
// Show all notes, including deleted, but sort: pinned > not deleted > deleted, then by updatedAt
const filteredNotes = computed(() => {
  let filtered = notes.value;

  // Filter by supertag
  if (selectedSupertag.value) {
    filtered = filtered.filter((note) => {
      return note.parsed.tags && note.parsed.tags[selectedSupertag.value];
    });
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((note) => note.parsed.title?.toLowerCase().includes(query) || note.parsed.content?.toLowerCase().includes(query));
  }

  return filtered.slice().sort((a, b) => {
    // Not deleted before deleted (most important - deleted notes always go to bottom)
    if (!a.deletedAt && b.deletedAt) return -1;
    if (a.deletedAt && !b.deletedAt) return 1;
    // Pinned notes come first (only among non-deleted notes)
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

// Color palette for note cards - curated modern colors
const cardColors = [
  "bg-[#E8F4F8]", // Soft cyan - calm and professional
  "bg-[#F5E6FF]", // Soft purple - creative and elegant
  "bg-[#FFE8E8]", // Soft coral - warm and inviting
  "bg-[#E8F8E8]", // Soft mint - fresh and clean
  "bg-[#FFF4E6]", // Soft amber - warm and cozy
];

const getCardColor = (note) => {
  // Use hash-based color for consistency
  const hash = note.id.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colorIndex = Math.abs(hash) % cardColors.length;
  return cardColors[colorIndex];
};

// Get supertags with their metadata for a note
const getSupertags = (note) => {
  if (!note.parsed.tags) return [];

  const supertags = [];
  for (const [tagName, tagValue] of Object.entries(note.parsed.tags)) {
    const supertagDef = supertagRegistry.getSupertag(tagName);
    if (supertagDef && supertagDef.icon) {
      supertags.push({
        name: tagName,
        icon: supertagDef.icon,
        displayName: supertagDef.displayName,
        value: tagValue,
      });
    }
  }

  return supertags;
};

// Countdown for deleted notes
const getPurgeCountdown = (deletedAt) => {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const msLeft = Number(deletedAt) + SEVEN_DAYS - Date.now();
  if (msLeft <= 0) return "soon";
  const days = Math.floor(msLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  const mins = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));
  return `${mins}m`;
};

// Restore deleted note
const restoreNote = async (note) => {
  await db.notes.update(note.id, { deletedAt: null, updatedAt: Date.now() });
  await loadNotes();
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
