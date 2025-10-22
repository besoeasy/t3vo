<template>
  <div class="flex h-screen bg-[#E8EBF0] overflow-hidden">
    <!-- Left Sidebar -->
    <aside class="w-[120px] bg-white flex flex-col items-center py-8 px-4 shadow-sm">
      <!-- App Branding -->
      <h1 class="text-2xl font-semibold text-gray-900 mb-8 writing-mode-vertical transform -rotate-0">
        T3VO
      </h1>

      <!-- New Note Button -->
      <button
        @click="startNewNote"
        class="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors shadow-md mb-12"
        title="New Note"
      >
        <Plus class="w-6 h-6" />
      </button>

      <!-- Color Filters -->
      <div class="flex flex-col space-y-4">
        <button
          v-for="(colorData, colorKey) in availableColors"
          :key="colorKey"
          @click="toggleColorFilter(colorKey)"
          :class="[
            'w-5 h-5 rounded-full transition-all',
            activeColorFilters.includes(colorKey) ? 'ring-2 ring-gray-900 ring-offset-2' : 'hover:scale-110'
          ]"
          :style="{ backgroundColor: colorData.bg }"
          :title="colorData.name"
        ></button>
        
        <!-- All Colors Button -->
        <button
          @click="clearColorFilters"
          :class="[
            'w-5 h-5 rounded-full border-2 transition-all',
            activeColorFilters.length === 0 ? 'border-gray-900 bg-gray-100' : 'border-gray-400 hover:border-gray-900'
          ]"
          title="All Colors"
        >
          <span class="sr-only">All</span>
        </button>
      </div>

      <!-- Spacer -->
      <div class="flex-1"></div>

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
      <div v-if="!showEditor" class="max-w-7xl mx-auto p-8">
        <!-- Search Bar -->
        <div class="mb-8">
          <div class="relative max-w-md">
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search"
              class="w-full pl-12 pr-4 py-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Page Title -->
        <h2 class="text-5xl font-bold text-gray-900 mb-8">Notes</h2>

        <!-- Notes Grid -->
        <div v-if="!isLoading && filteredNotes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="note in filteredNotes"
            :key="note.id"
            @click="openNote(note)"
            class="group cursor-pointer rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl min-h-[200px] flex flex-col"
            :style="{ backgroundColor: getNoteColor(note.parsed.color) }"
          >
            <!-- Note Content -->
            <div class="flex-1">
              <h3 v-if="note.parsed.title" class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {{ note.parsed.title }}
              </h3>
              <p class="text-gray-800 text-sm line-clamp-4">
                {{ note.parsed.content || 'Empty note' }}
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
            {{ searchQuery || activeColorFilters.length > 0 ? 'No notes found' : 'No notes yet' }}
          </h3>
          <p class="text-gray-600 mb-6">
            {{ searchQuery || activeColorFilters.length > 0 
               ? 'Try adjusting your search or filters' 
               : 'Click the + button to create your first note' }}
          </p>
        </div>
      </div>

      <!-- Note Editor View -->
      <NoteEditor
        v-else
        :initialContent="editingContent"
        :isNew="isNewNote"
        @save="handleSave"
        @cancel="closeEditor"
        @delete="handleDelete"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { fetchNotes, addNote, updateNote, softDeleteNote } from '@/db';
import { NOTE_COLORS } from '@/utils/noteParser';
import {
  Plus,
  Search,
  Lock,
  FileText,
  Key,
  Bookmark,
} from 'lucide-vue-next';
import NoteEditor from '@/components/NoteEditor.vue';
import { format } from 'timeago.js';

// State
const searchQuery = ref('');
const activeColorFilters = ref([]);
const isLoading = ref(false);
const notes = ref([]);
const showEditor = ref(false);
const editingContent = ref('');
const editingNoteId = ref(null);
const isNewNote = ref(true);

// Available colors
const availableColors = NOTE_COLORS;

// Computed
const filteredNotes = computed(() => {
  let filtered = notes.value;

  // Filter by color
  if (activeColorFilters.value.length > 0) {
    filtered = filtered.filter(note => 
      activeColorFilters.value.includes(note.parsed.color)
    );
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(note => 
      note.parsed.title?.toLowerCase().includes(query) ||
      note.parsed.content?.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Methods
const getNoteColor = (colorKey) => {
  return availableColors[colorKey]?.bg || availableColors.yellow.bg;
};

const toggleColorFilter = (colorKey) => {
  const index = activeColorFilters.value.indexOf(colorKey);
  if (index > -1) {
    activeColorFilters.value.splice(index, 1);
  } else {
    activeColorFilters.value.push(colorKey);
  }
};

const clearColorFilters = () => {
  activeColorFilters.value = [];
};

const loadNotes = async () => {
  isLoading.value = true;
  try {
    const loadedNotes = await fetchNotes(1, '', 'all');
    notes.value = loadedNotes;
  } catch (error) {
    console.error('Error loading notes:', error);
  } finally {
    isLoading.value = false;
  }
};

const startNewNote = () => {
  editingContent.value = '';
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
  editingContent.value = '';
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
    console.error('Error saving note:', error);
    alert('Failed to save note. Please try again.');
  }
};

const handleDelete = async () => {
  if (!editingNoteId.value) return;
  
  if (confirm('Are you sure you want to delete this note?')) {
    try {
      await softDeleteNote(editingNoteId.value);
      await loadNotes();
      closeEditor();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  }
};

const handleLogout = () => {
  if (confirm('Are you sure you want to lock the app?')) {
    sessionStorage.removeItem('ENCRYPTION_KEY');
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
