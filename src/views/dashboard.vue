<template>
  <div class="flex h-screen bg-white overflow-hidden">
    <!-- Left Sidebar -->
    <aside class="w-[120px] bg-white flex flex-col items-center py-8 px-4 border-r border-gray-200">
      <!-- App Branding -->
      <h1 class="text-2xl font-semibold text-gray-900 mb-8 writing-mode-vertical transform -rotate-0">T3VO</h1>

      <!-- New Note Button -->
      <button
        @click="startNewNote"
        class="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors shadow-md mb-12"
        title="New Note"
      >
        <Plus class="w-6 h-6" />
      </button>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Sync Link -->
      <router-link
        to="/sync"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Device Sync"
      >
        <Wifi class="w-5 h-5" />
      </router-link>

      <!-- Stats Link -->
      <router-link
        to="/stats"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Statistics"
      >
        <BarChart3 class="w-5 h-5" />
      </router-link>

      <!-- Backup Link -->
      <router-link
        to="/backup"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Backup & Restore"
      >
        <Database class="w-5 h-5" />
      </router-link>

      <!-- GitHub Link -->
      <a
        href="https://github.com/besoeasy/t3vo"
        target="_blank"
        rel="noopener noreferrer"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="GitHub Repository"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clip-rule="evenodd"
          />
        </svg>
      </a>

      <!-- Settings/Lock Button -->
      <button
        @click="handleLogout"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
        title="Lock App"
      >
        <Lock class="w-5 h-5" />
      </button>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-auto">
      <!-- Notes Grid View -->
      <div v-if="!showEditor" class="w-full mx-auto p-8">
        <!-- Search Bar -->
        <div class="mb-8">
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
        <div v-if="!isLoading && filteredNotes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            @click="openNote(note)"
            class="group cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl min-h-[200px] flex flex-col bg-[#F5C26B]"
          >
            <!-- Note Content -->
            <div class="flex-1">
              <h3 v-if="note.parsed.title" class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {{ note.parsed.title }}
              </h3>
              <p class="text-gray-800 text-sm line-clamp-4">
                {{ note.parsed.content || "Empty note" }}
              </p>
            </div>

            <!-- Note Footer -->
            <div class="flex items-center justify-between mt-4 pt-4 border-t border-black border-opacity-10">
              <span v-if="note.updatedAt" class="text-xs text-gray-700">
                {{ formatDate(note.updatedAt) }}
              </span>
              <div class="flex items-center space-x-2">
                <!-- Type Badge -->
                <span v-if="note.parsed.type !== 'note'" class="flex items-center justify-center w-8 h-8 bg-gray-900 bg-opacity-80 rounded-full text-white">
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
      <NoteEditor v-else :initialContent="editingContent" :isNew="isNewNote" @save="handleSave" @cancel="closeEditor" @delete="handleDelete" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { fetchNotes, addNote, updateNote, softDeleteNote } from "@/db";
import {
  Plus,
  Search,
  Lock,
  FileText,
  Key,
  Bookmark,
  Database,
  BarChart3,
  Wifi,
} from 'lucide-vue-next';
import NoteEditor from "@/components/NoteEditor.vue";
import { format } from "timeago.js";

// State
const searchQuery = ref("");
const isLoading = ref(false);
const notes = ref([]);
const showEditor = ref(false);
const editingContent = ref("");
const editingNoteId = ref(null);
const isNewNote = ref(true);

// Computed
const filteredNotes = computed(() => {
  let filtered = notes.value;

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((note) => note.parsed.title?.toLowerCase().includes(query) || note.parsed.content?.toLowerCase().includes(query));
  }

  return filtered;
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

const handleSave = async (content) => {
  try {
    if (isNewNote.value) {
      await addNote(content);
    } else {
      await updateNote(editingNoteId.value, content);
    }
    await loadNotes();
    closeEditor();
  } catch (error) {
    console.error("Error saving note:", error);
    alert("Failed to save note. Please try again.");
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

const handleLogout = () => {
  if (confirm("Are you sure you want to lock the app?")) {
    sessionStorage.removeItem("ENCRYPTION_KEY");
    location.reload();
  }
};

const formatDate = (timestamp) => {
  return format(timestamp);
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
