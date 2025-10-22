<template>
  <div class="space-y-8">
    <!-- Clean Centered Search Section -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 py-8 px-6">
      <div class="max-w-4xl mx-auto">
        <!-- Centered Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-semibold text-gray-900 mb-2">Your Digital Vault</h1>
          <p class="text-gray-600">Everything is a note. Use tags to organize.</p>
        </div>

        <!-- Centered Search Input -->
        <div class="max-w-2xl mx-auto mb-8">
          <div class="relative">
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search your notes..."
              class="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <div v-if="searchQuery || notes.length > 0" class="absolute right-4 top-1/2 transform -translate-y-1/2">
              <span class="text-sm text-gray-500">{{ filteredNotes.length }} {{ filteredNotes.length === 1 ? 'note' : 'notes' }}</span>
            </div>
          </div>
        </div>

        <!-- Centered Filter Tabs -->
        <div class="flex justify-center mb-6">
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              v-for="filter in filters"
              :key="filter.key"
              @click="activeFilter = filter.key"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center',
                activeFilter === filter.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              ]"
            >
              <component :is="filter.icon" class="w-4 h-4 mr-2" />
              {{ filter.name }}
            </button>
          </div>
        </div>

        <!-- Centered Add Button with Floating Action -->
        <div class="flex justify-center">
          <button
            @click="startNewNote"
            class="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm font-medium group"
          >
            <Plus class="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            New Note
          </button>
        </div>
      </div>
    </div>

    <!-- Content Grid with Masonry Layout -->
    <div v-if="!isLoading && filteredNotes.length > 0" class="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
      <NoteCard
        v-for="note in paginatedNotes"
        :key="note.id"
        :note="note"
        @click="openNote(note)"
      />
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p class="text-sm text-gray-500">Loading your notes...</p>
      </div>
    </div>

    <!-- Load more indicator -->
    <div v-if="isLoadingMore" class="flex justify-center py-8">
      <div class="flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="text-sm text-gray-500">Loading more notes...</span>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMoreNotes && !isLoading" class="flex justify-center py-6">
      <button 
        @click="loadMore" 
        :disabled="isLoadingMore"
        class="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
      >
        <component :is="isLoadingMore ? 'RotateCw' : 'Plus'" 
                   :class="[isLoadingMore ? 'animate-spin' : '', 'w-4 h-4 mr-2']" />
        {{ isLoadingMore ? 'Loading...' : 'Load More Notes' }}
      </button>
    </div>

    <!-- No more data indicator -->
    <div v-if="!isLoading && !isLoadingMore && !hasMoreNotes && filteredNotes.length > 0" class="text-center py-8">
      <div class="bg-gray-50 rounded-lg p-6">
        <p class="text-gray-500 font-medium">✨ All notes loaded</p>
        <p class="text-sm text-gray-400 mt-1">No more notes to display</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!isLoading && filteredNotes.length === 0" class="text-center py-16">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div class="text-gray-400 mb-6">
          <FileText class="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 class="text-xl font-semibold text-gray-600 mb-2">No notes found</h3>
          <p class="text-gray-500 max-w-md mx-auto mb-4">
            {{ searchQuery ? 
                'Try adjusting your search terms or filters to find what you\'re looking for.' :
                'Get started by creating your first note. Use #@tags to organize passwords, bookmarks, or just write regular notes.'
            }}
          </p>
          <div v-if="!searchQuery" class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-md mx-auto">
            <p class="text-sm text-blue-900 font-medium mb-2">💡 Quick Tips:</p>
            <ul class="text-xs text-blue-800 space-y-1">
              <li>• Use <code class="bg-white px-1 rounded">#@password=</code> to store passwords</li>
              <li>• Use <code class="bg-white px-1 rounded">#@bookmark=</code> to save websites</li>
              <li>• Regular notes don't need any tags</li>
            </ul>
          </div>
        </div>
        <button
          v-if="!searchQuery"
          @click="startNewNote"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus class="w-4 h-4 mr-2" />
          Create Your First Note
        </button>
      </div>
    </div>

    <!-- Note Editor Modal -->
    <NoteEditor
      v-if="showEditor"
      :initialContent="editingContent"
      :isNew="isNewNote"
      @save="handleSave"
      @cancel="closeEditor"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { fetchNotes, addNote, updateNote, softDeleteNote } from '@/db';
import {
  Search,
  Plus,
  Key,
  Bookmark,
  FileText,
  RotateCcw,
  RotateCw,
} from 'lucide-vue-next';
import NoteCard from '@/components/NoteCard.vue';
import NoteEditor from '@/components/NoteEditor.vue';

// Reactive state
const searchQuery = ref('');
const activeFilter = ref('all');
const isLoading = ref(false);
const isLoadingMore = ref(false);

// Pagination
const currentPage = ref(1);
const hasMoreNotes = ref(true);

// Notes data
const notes = ref([]);

// Editor state
const showEditor = ref(false);
const editingContent = ref('');
const editingNoteId = ref(null);
const isNewNote = ref(true);

// Filter options
const filters = [
  { key: 'all', name: 'All', icon: RotateCcw },
  { key: 'password', name: 'Passwords', icon: Key },
  { key: 'bookmark', name: 'Bookmarks', icon: Bookmark },
  { key: 'note', name: 'Notes', icon: FileText },
];

// Computed properties
const filteredNotes = computed(() => {
  let filtered = notes.value;

  // Filter by type
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(note => note.parsed.type === activeFilter.value);
  }

  return filtered;
});

const paginatedNotes = computed(() => {
  // Since we're loading paginated data from DB, just return all filtered notes
  return filteredNotes.value;
});

// Methods
const loadAllNotes = async (isInitial = true) => {
  if (isInitial) {
    isLoading.value = true;
    currentPage.value = 1;
    notes.value = [];
  } else {
    isLoadingMore.value = true;
  }

  try {
    const newNotes = await fetchNotes(
      currentPage.value,
      searchQuery.value,
      activeFilter.value
    );

    console.log('Loaded notes:', newNotes.length);

    if (isInitial) {
      notes.value = newNotes;
    } else {
      notes.value.push(...newNotes);
    }

    // Check if there are more notes (assuming 60 per page)
    hasMoreNotes.value = newNotes.length === 60;
    
    if (newNotes.length > 0) {
      currentPage.value++;
    }
  } catch (error) {
    console.error('Error loading notes:', error);
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const loadMore = async () => {
  if (isLoading.value || isLoadingMore.value || !hasMoreNotes.value) {
    return;
  }
  await loadAllNotes(false);
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
    
    // Reload notes
    await loadAllNotes(true);
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
      await loadAllNotes(true);
      closeEditor();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  }
};

// Watchers
watch([searchQuery, activeFilter], () => {
  // Debounce search
  clearTimeout(window.searchDebounce);
  window.searchDebounce = setTimeout(() => {
    loadAllNotes(true);
  }, 300);
});

// Lifecycle
onMounted(async () => {
  console.log('Dashboard mounted, loading notes...');
  await loadAllNotes(true);
});

// Keyboard shortcuts
const handleKeyDown = (e) => {
  // Cmd/Ctrl + N for new note
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
    e.preventDefault();
    startNewNote();
  }
  // Cmd/Ctrl + K for search focus
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.querySelector('input[type="text"]')?.focus();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/* Masonry layout improvements */
@media (min-width: 768px) {
  .columns-2 > div {
    display: inline-block;
    width: 100%;
  }
}

@media (min-width: 1280px) {
  .columns-3 > div {
    display: inline-block;
    width: 100%;
  }
}
</style>
