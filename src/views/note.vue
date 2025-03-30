<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { fetchNotes, addNoteEntry, softDeleteEntry, updateNoteEntry } from "@/db";
import { Search, Trash, Plus, FileText, Calendar, Edit } from "lucide-vue-next";
import EditModal from "@/components/edit-modal.vue";
import { useInfiniteScroll } from "@/mixins.js";

const newNote = ref({ title: "", content: "" });
const notes = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const hasMoreNotes = ref(true);
const showAddForm = ref(false);
const isLoading = ref(false);
const loadingMore = ref(false);
const loaderRef = ref(null);

const editingNote = ref(null);
const showEditModal = ref(false);

const loadNotes = async (reset = false) => {
  if (isLoading.value || (loadingMore.value && !reset)) return;
  
  try {
    if (reset) {
      isLoading.value = true;
      currentPage.value = 1;
      notes.value = [];
    } else {
      loadingMore.value = true;
    }
    
    const fetchedNotes = await fetchNotes(currentPage.value, searchQuery.value);
    
    if (fetchedNotes.length === 0) {
      hasMoreNotes.value = false;
    } else {
      const newNotes = fetchedNotes.map((note) => ({
        id: note.id,
        title: note.data.title,
        content: note.data.content,
        tags: note.data.tags || [],
        updated_at: note.updatedAt,
        expanded: false,
      }));
      
      notes.value = [...notes.value, ...newNotes];
      currentPage.value++;
    }
  } catch (error) {
    console.error("Error loading notes:", error);
  } finally {
    isLoading.value = false;
    loadingMore.value = false;
  }
};

// Add new note using the new database function
const addNote = async () => {
  if (!newNote.value.content) return;

  try {
    await addNoteEntry({
      title: newNote.value.title || "Untitled Note",
      content: newNote.value.content,
      tags: [],
    });

    // Reset form and reload notes
    newNote.value = { title: "", content: "" };
    showAddForm.value = false;
    await loadNotes(true);
  } catch (error) {
    console.error("Error adding note:", error);
  }
};

// Soft delete note
const removeNote = async (id) => {
  if (!confirm("Are you sure you want to delete this note?")) return;

  try {
    await softDeleteEntry(id);
    await loadNotes(true);
  } catch (error) {
    console.error("Error removing note:", error);
  }
};

const editNote = (note) => {
  editingNote.value = { ...note };
  showEditModal.value = true;
};

const saveNoteEdit = async () => {
  try {
    await updateNoteEntry(editingNote.value.id, {
      title: editingNote.value.title,
      content: editingNote.value.content,
      tags: editingNote.value.tags || [],
    });
    
    showEditModal.value = false;
    await loadNotes(true);
  } catch (error) {
    console.error("Error updating note:", error);
  }
};

// Helper functions
const truncateContent = (content, length = 150) => {
  if (content.length <= length) return content;
  return content.slice(0, length) + "...";
};

const toggleExpandNote = (note) => {
  note.expanded = !note.expanded;
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Infinite scroll implementation
const { observeElement, unobserveElement } = useInfiniteScroll(() => {
  if (!isLoading.value && !loadingMore.value && hasMoreNotes.value) {
    loadNotes();
  }
});

// Watch for search query changes
watch(searchQuery, async () => {
  hasMoreNotes.value = true;
  await loadNotes(true);
});

// Initialize
onMounted(() => {
  loadNotes();
});

// Update observer when loaderRef changes
watch(loaderRef, (newRef, oldRef) => {
  if (oldRef) unobserveElement(oldRef);
  if (newRef) observeElement(newRef);
});
</script>

<template>
  <div>
    <div>
      <h1 class="text-4xl font-bold mb-8 text-gray-800 flex items-center">
        <FileText class="mr-4" size="36" />
        Notes Manager
      </h1>

      <div class="mb-8 flex items-center justify-between">
        <div class="relative flex-grow mr-4">
          <input v-model="searchQuery" placeholder="Search notes..." class="w-full pl-10 pr-4 py-2 rounded-full border-2 border-gray-300 focus:border-green-500 focus:outline-none transition-colors" />
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
        </div>
        <button @click="showAddForm = !showAddForm" class="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors flex items-center">
          <Plus size="20" />
        </button>
      </div>

      <div v-if="showAddForm" class="mb-8 p-6 bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out">
        <h2 class="text-2xl font-bold mb-4">Add New Note</h2>
        <input v-model="newNote.title" placeholder="Note Title" class="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        <textarea v-model="newNote.content" placeholder="Write your note here..." class="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-32 resize-y"></textarea>
        <button @click="addNote" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg w-full transition duration-300 flex items-center justify-center">
          <Plus class="mr-2" size="20" />
          Save Note
        </button>
      </div>

      <div v-if="isLoading && notes.length === 0" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
      </div>

      <div v-else class="space-y-6 mb-8">
        <div v-for="note in notes" :key="note.id" class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-2xl font-semibold text-gray-800">{{ note.title || "Untitled Note" }}</h3>
              <div class="flex">
                <button @click="editNote(note)" class="text-gray-500 hover:text-blue-500 p-1 rounded-full hover:bg-blue-100 transition-colors mr-1">
                  <Edit size="20" />
                </button>
                <button @click="removeNote(note.id)" class="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors">
                  <Trash size="20" />
                </button>
              </div>
            </div>
            <p class="text-gray-600 break-words mb-4">
              {{ note.expanded ? note.content : truncateContent(note.content) }}
            </p>
            <div class="flex justify-between items-center">
              <button v-if="note.content.length > 150" @click="toggleExpandNote(note)" class="text-green-500 hover:text-green-600 transition-colors">
                {{ note.expanded ? "Show less" : "Show more" }}
              </button>
              <div class="flex items-center text-sm text-gray-500">
                <Calendar size="16" class="mr-1" />
                {{ formatDate(note.updated_at) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <p v-if="notes.length === 0 && !isLoading" class="text-center text-gray-500 mt-8 text-lg flex items-center justify-center">
        <Search size="24" class="mr-2" />
        No notes found matching your search.
      </p>

      <!-- Infinite Scroll Loader -->
      <div v-if="hasMoreNotes && notes.length > 0" ref="loaderRef" class="flex justify-center py-4">
        <div v-if="loadingMore" class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <div v-else class="h-8"></div>
      </div>
    </div>
  </div>

  <EditModal 
    :show="showEditModal" 
    title="Edit Note" 
    @close="showEditModal = false" 
    @save="saveNoteEdit"
  >
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input 
          v-model="editingNote.title" 
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea 
          v-model="editingNote.content" 
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          rows="6"
        ></textarea>
      </div>
    </div>
  </EditModal>
</template>