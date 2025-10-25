<template>
  <div class="h-full flex flex-col">
    <NoteEditor
      v-if="isLoaded"
      :initialContent="noteContent"
      :isNew="isNewNote"
      :noteId="noteId"
      @save="handleSave"
      @cancel="handleCancel"
      @delete="handleDelete"
    />
    <div v-else class="flex items-center justify-center h-full">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchNoteById, addNote, updateNote, softDeleteNote, addAttachments } from "@/db";
import NoteEditor from "@/components/NoteEditor.vue";

const route = useRoute();
const router = useRouter();

const noteContent = ref("");
const isNewNote = ref(false);
const noteId = ref(null);
const isLoaded = ref(false);

onMounted(async () => {
  noteId.value = route.params.id;
  
  console.log("Loading note for editing with ID:", noteId.value);

  // Check if note exists
  try {
    const note = await fetchNoteById(noteId.value);
    if (note) {
      console.log("Note found:", note);
      noteContent.value = note.content;
      isNewNote.value = false;
    } else {
      // Note doesn't exist, treat as new note
      console.log("Note not found, creating new note");
      noteContent.value = "";
      isNewNote.value = true;
    }
  } catch (error) {
    // Error loading note, treat as new
    console.log("Error loading note, creating new note with ID:", noteId.value);
    noteContent.value = "";
    isNewNote.value = true;
  }
  
  isLoaded.value = true;
});

const handleSave = async (content, attachments = []) => {
  try {
    if (isNewNote.value) {
      // Create new note with specific ID
      const files = attachments.map((att) => att.file).filter((f) => f);
      await addNote(content, files, noteId.value);
      isNewNote.value = false;
      // Navigate to view mode after saving new note
      router.push(`/notes/${noteId.value}`);
    } else {
      // Update existing note
      await updateNote(noteId.value, content);
      if (attachments.length > 0) {
        const files = attachments.map((att) => att.file).filter((f) => f);
        await addAttachments(noteId.value, files);
      }
      // Navigate to view mode after saving
      router.push(`/notes/${noteId.value}`);
    }
  } catch (error) {
    console.error("Error saving note:", error);
    alert(`Failed to save note: ${error.message}`);
  }
};

const handleCancel = () => {
  if (isNewNote.value) {
    // If it's a new note, go back to dashboard
    router.push("/dashboard");
  } else {
    // If editing existing note, go to view mode
    router.push(`/notes/${noteId.value}`);
  }
};

const handleDelete = async () => {
  if (!noteId.value || isNewNote.value) {
    router.push("/dashboard");
    return;
  }

  if (confirm("Are you sure you want to delete this note?")) {
    try {
      await softDeleteNote(noteId.value);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Please try again.");
    }
  }
};
</script>
