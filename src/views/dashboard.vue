<template>
  <!-- Notes Grid View -->
  <div v-if="!showEditor" class="w-full mx-auto p-4 md:p-8 pt-16 md:pt-8">
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
        :class="[
          'group cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl min-h-[200px] flex flex-col relative',
          getCardColorClass(note),
        ]"
      >
        <div v-if="note.parsed.pinned" class="absolute top-3 right-3 text-xl">📌</div>

        <div class="flex-1">
          <h3 v-if="note.parsed.title" class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex items-center gap-2">
            <span class="flex-1">{{ note.parsed.title }}</span>
          </h3>

          <p class="text-gray-800 text-sm line-clamp-4">
            {{ note.parsed.content || "Empty note" }}
          </p>
        </div>

        <!-- Note Footer -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-black border-opacity-10">
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Icon and Tags -->

            <span v-for="tag in note.parsed.customTags" :key="tag" class="text-xs font-medium px-2 py-1 bg-gray-900 text-white">
              {{ tag }}
            </span>
          </div>

          <span v-if="note.updatedAt" class="text-xs text-gray-700">
            {{ formatDate(note.updatedAt) }}
          </span>

          <div class="flex items-center space-x-2">
            <span v-if="note.parsed.icon" class="text-base w-8 h-8 bg-white rounded-full flex items-center justify-center">
              {{ note.parsed.icon }}
            </span>
            <!-- Type Badge -->
            <span v-if="note.parsed.type !== 'note'" class="flex items-center justify-center w-8 h-8 bg-white bg-opacity-80 rounded-full text-black">
              <Key v-if="note.parsed.type === 'password'" class="w-4 h-4" />
              <Bookmark v-else-if="note.parsed.type === 'bookmark'" class="w-4 h-4" />
            </span>
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

  <!-- Note Editor View -->
  <NoteEditor
    v-else
    :initialContent="editingContent"
    :isNew="isNewNote"
    :noteId="editingNoteId"
    @save="handleSave"
    @cancel="closeEditor"
    @delete="handleDelete"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchNotes, addNote, updateNote, softDeleteNote, addAttachments } from "@/db";
import { Search, FileText, Key, Bookmark } from "lucide-vue-next";
import NoteEditor from "@/components/NoteEditor.vue";
import { format } from "timeago.js";

const route = useRoute();

// Props to receive newNote event from parent
defineProps({
  onNewNote: Function,
});

// State
const searchQuery = ref("");
const isLoading = ref(false);
const notes = ref([]);
const showEditor = ref(false);
const editingContent = ref("");
const editingNoteId = ref(null);
const isNewNote = ref(true);

// Watch for route query changes to trigger new note
watch(
  () => route.query.action,
  (action) => {
    if (action === "new") {
      startNewNote();
    }
  }
);

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
  editingContent.value = "";
  editingNoteId.value = null;
  isNewNote.value = true;
  showEditor.value = true;
};

// Expose startNewNote to parent via event
defineExpose({
  startNewNote,
});

const openNote = (note) => {
  editingContent.value = note.content;
  editingNoteId.value = note.id;
  isNewNote.value = false;
  showEditor.value = true;
};

const closeEditor = () => {
  showEditor.value = false;
  editingContent.value = "";
  editingNoteId.value = null;
};

const handleSave = async (content, attachments = []) => {
  try {
    if (isNewNote.value) {
      // Extract File objects from attachments
      const files = attachments.map((att) => att.file).filter((f) => f);
      await addNote(content, files);
    } else {
      await updateNote(editingNoteId.value, content);
      // Handle attachments for existing notes
      if (attachments.length > 0) {
        const files = attachments.map((att) => att.file).filter((f) => f);
        await addAttachments(editingNoteId.value, files);
      }
    }
    await loadNotes();
    closeEditor();
  } catch (error) {
    console.error("Error saving note:", error);
    alert(`Failed to save note: ${error.message}`);
  }
};

const handleDelete = async () => {
  if (!editingNoteId.value) return;

  if (confirm("Are you sure you want to delete this note?")) {
    try {
      await softDeleteNote(editingNoteId.value);
      await loadNotes();
      closeEditor();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    }
  }
};

const formatDate = (timestamp) => {
  return format(timestamp);
};

// Get card color class based on custom color or default
const getCardColorClass = (note) => {
  const color = note.parsed.color;

  if (!color) {
    return "bg-[#F5C26B]"; // Default yellow color
  }

  const colorMap = {
    blue: "bg-blue-100",
    red: "bg-red-100",
    green: "bg-green-100",
    yellow: "bg-yellow-100",
    purple: "bg-purple-100",
    pink: "bg-pink-100",
    gray: "bg-gray-100",
    indigo: "bg-indigo-100",
    teal: "bg-teal-100",
    orange: "bg-orange-100",
    amber: "bg-amber-100",
  };

  return colorMap[color] || "bg-[#F5C26B]";
};

// Lifecycle
onMounted(() => {
  loadNotes();
});

// Debounced search
watch(searchQuery, () => {
  // Search is computed, no need to reload
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
