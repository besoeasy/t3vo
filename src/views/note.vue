<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { fetchEntriesByType, addEntry, softDeleteEntry } from "@/db";
import { Search, ChevronLeft, ChevronRight, Trash, Plus, FileText, Calendar } from "lucide-vue-next";

const newNote = ref({ title: "", content: "" });
const notes = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const totalNotes = ref(0);
const showAddForm = ref(false);
const isLoading = ref(false);

const loadNotes = async () => {
  try {
    isLoading.value = true;
    const fetchedNotes = await fetchEntriesByType("note", currentPage.value, searchQuery.value);
    notes.value = fetchedNotes.map((note) => ({
      ...note,
      expanded: false,
    }));

    // Update total count (only non-deleted notes)
    totalNotes.value = await db.data.where("type").equals("note").and((entry) => entry.deletedAt === null).count();
  } catch (error) {
    console.error("Error loading notes:", error);
  } finally {
    isLoading.value = false;
  }
};

// Add new note using the new database function
const addNote = async () => {
  if (!newNote.value.content) return;

  try {
    await addEntry("note", {
      title: newNote.value.title || "Untitled Note",
      content: newNote.value.content,
      tags: [],
    });

    // Reset form and reload first page
    newNote.value = { title: "", content: "" };
    showAddForm.value = false;
    currentPage.value = 1;
    await loadNotes();
  } catch (error) {
    console.error("Error adding note:", error);
  }
};

// Soft delete note instead of permanent deletion
const removeNote = async (id) => {
  if (!confirm("Are you sure you want to delete this note?")) return;

  try {
    await softDeleteEntry(id);
    await loadNotes();
  } catch (error) {
    console.error("Error removing note:", error);
  }
};

// Navigation functions
const totalPages = computed(() => Math.ceil(totalNotes.value / 10)); // Using the itemsPerPage constant from db.js

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    await loadNotes();
  }
};

const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await loadNotes();
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

// Watch for search query changes
watch(searchQuery, async () => {
  currentPage.value = 1;
  await loadNotes();
});

// Initialize
onMounted(loadNotes);
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="m-auto">
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
          <Plus size="20"  />
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

      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
      </div>

      <div v-else class="space-y-6 mb-8">
        <div v-for="note in notes" :key="note.id" class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-2xl font-semibold text-gray-800">{{ note.title || "Untitled Note" }}</h3>
              <button @click="removeNote(note.id)" class="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors">
                <Trash size="20" />
              </button>
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
                {{ formatDate(note.updatedAt) }}
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

      <!-- Pagination -->
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
