<template>
  <div v-if="isLoaded" class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button @click="handleCancel" class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Back">
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h2 class="text-2xl font-bold text-gray-900">
            {{ isNewNote ? "New Note" : "Edit Note" }}
          </h2>
        </div>
        <div class="flex items-center space-x-3">
          <button @click="handleCancel" class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            @click="handleSaveClick"
            :disabled="!noteContent.trim()"
            class="flex items-center px-6 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Save class="w-4 h-4 mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Main Editor Layout -->
    <div class="flex-1 overflow-hidden flex">
      <!-- Left Sidebar - Available Tags (1/3) -->
      <div class="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
        <div class="p-6">
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-2">Available Tags</h3>
            <p class="text-xs text-gray-500">Click to insert into your note</p>
          </div>

          <!-- Search -->
          <div class="mb-6">
            <input
              v-model="tagSearch"
              type="text"
              placeholder="Search tags..."
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none"
            />
          </div>

          <!-- Tags by Category -->
          <div class="space-y-6">
            <div v-for="category in filteredCategories" :key="category" class="space-y-2">
              <h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ category }}</h4>
              <div class="space-y-1">
                <button
                  v-for="tag in getTagsByCategory(category)"
                  :key="tag.name"
                  @click="insertTag(tag)"
                  class="w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all group"
                >
                  <div class="flex items-start gap-3">
                    <span class="text-xl flex-shrink-0">{{ tag.icon }}</span>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-sm font-medium text-gray-900">{{ tag.displayName }}</span>
                      </div>
                      <code class="text-xs text-gray-600 font-mono">#@{{ tag.name }}=</code>
                      <p class="text-xs text-gray-500 mt-1">{{ tag.description }}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Templates -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Quick Templates</h4>
            <div class="space-y-2">
              <button
                @click="insertTemplate('password')"
                class="w-full text-left px-3 py-2.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <Key class="w-4 h-4 text-blue-600" />
                  <span class="text-sm font-medium text-blue-900">Password Template</span>
                </div>
              </button>
              <button
                @click="insertTemplate('bookmark')"
                class="w-full text-left px-3 py-2.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <Bookmark class="w-4 h-4 text-amber-600" />
                  <span class="text-sm font-medium text-amber-900">Bookmark Template</span>
                </div>
              </button>
              <button
                @click="insertTemplate('note')"
                class="w-full text-left px-3 py-2.5 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <FileText class="w-4 h-4 text-green-600" />
                  <span class="text-sm font-medium text-green-900">Note Template</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Markdown Editor (2/3) -->
      <div class="flex-1 flex flex-col bg-white">
        <!-- Editor Toolbar -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <h3 class="text-sm font-semibold text-gray-900">Content</h3>
              <span class="text-xs text-gray-500">{{ noteContent.length }} characters</span>
            </div>
            <div class="flex items-center gap-2">
              <Paperclip class="w-4 h-4 text-gray-600" />
              <span class="text-xs text-gray-600">{{ attachments.length }} attachment{{ attachments.length !== 1 ? "s" : "" }}</span>
            </div>
          </div>
        </div>

        <!-- Textarea -->
        <div class="flex-1 p-6 overflow-auto">
          <textarea
            ref="textareaRef"
            v-model="noteContent"
            @keydown.tab.prevent="handleTab"
            placeholder="Start typing your note... Click tags on the left to insert them."
            class="w-full h-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none resize-none text-sm leading-relaxed"
            style="font-family: 'SF Mono', 'Monaco', monospace"
          ></textarea>
        </div>

        <!-- Attachments Section -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Paperclip class="w-4 h-4 text-gray-600" />
              <span class="text-xs font-semibold text-gray-900">Attachments</span>
            </div>
            <label class="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
              <Upload class="w-3.5 h-3.5 mr-1.5" />
              Add Files
              <input type="file" multiple @change="handleFileSelect" class="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.zip" />
            </label>
          </div>

          <!-- Attachments List -->
          <div v-if="attachments.length > 0" class="grid grid-cols-4 gap-3">
            <div v-for="(att, index) in attachments" :key="index" class="relative p-3 bg-white rounded-lg border border-gray-200">
              <button @click="removeAttachment(index)" class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                <X class="w-3 h-3" />
              </button>
              <div v-if="att.preview" class="w-full h-20 rounded overflow-hidden mb-2">
                <img :src="att.preview" :alt="att.name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-full h-20 rounded bg-gray-100 flex items-center justify-center mb-2">
                <File class="w-8 h-8 text-gray-400" />
              </div>
              <p class="text-xs font-medium text-gray-900 truncate">{{ att.name }}</p>
              <p class="text-xs text-gray-500">{{ formatFileSize(att.size) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-full">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchNoteById, addNote, updateNote, addAttachments } from "@/db";
import { ArrowLeft, Save, Key, Bookmark, FileText, Paperclip, Upload, File, X } from "lucide-vue-next";
import { tagRegistry } from "@/supertags";

const route = useRoute();
const router = useRouter();

const noteContent = ref("");
const isNewNote = ref(false);
const noteId = ref(null);
const isLoaded = ref(false);
const textareaRef = ref(null);
const attachments = ref([]);
const tagSearch = ref("");

// Get all tags from registry
const allTags = computed(() => tagRegistry.getAllTags());
const allCategories = computed(() => tagRegistry.getCategories());

// Filter tags based on search
const filteredTags = computed(() => {
  if (!tagSearch.value.trim()) return allTags.value;
  return tagRegistry.searchTags(tagSearch.value);
});

// Filter categories that have matching tags
const filteredCategories = computed(() => {
  const matchingCategories = new Set();
  filteredTags.value.forEach(tag => {
    if (tag.category) matchingCategories.add(tag.category);
  });
  return Array.from(matchingCategories).sort();
});

// Get tags by category
const getTagsByCategory = (category) => {
  return filteredTags.value.filter(tag => tag.category === category);
};

// Insert tag at cursor position
const insertTag = (tag) => {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = noteContent.value;
  
  const tagText = `#@${tag.name}=`;
  noteContent.value = text.substring(0, start) + tagText + text.substring(end);
  
  // Set cursor position after the inserted tag
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + tagText.length;
  }, 0);
};

onMounted(async () => {
  noteId.value = route.params.id;

  try {
    const note = await fetchNoteById(noteId.value);
    if (note) {
      noteContent.value = note.content;
      isNewNote.value = false;
      await loadExistingAttachments();
    } else {
      noteContent.value = "";
      isNewNote.value = true;
    }
  } catch (error) {
    noteContent.value = "";
    isNewNote.value = true;
  }

  isLoaded.value = true;

  // Focus textarea
  setTimeout(() => {
    if (textareaRef.value) {
      textareaRef.value.focus();
    }
  }, 100);
});

// Templates
const insertTemplate = (type) => {
  const templates = {
    password: `#@title=My Account
#@email=user@example.com
#@password=
#@2fa=
#@domains=example.com
#@tags=
#@icon=🔑

Notes about this account...`,
    bookmark: `#@title=Useful Website
#@bookmark=https://example.com
#@tags=
#@icon=🔖

Description of the website...`,
    note: `#@title=My Note
#@tags=
#@icon=📝

Your note content here...`,
  };

  if (templates[type]) {
    noteContent.value = templates[type];
    setTimeout(() => textareaRef.value?.focus(), 100);
  }
};

const handleTab = (e) => {
  const start = e.target.selectionStart;
  const end = e.target.selectionEnd;
  const value = noteContent.value;

  noteContent.value = value.substring(0, start) + "  " + value.substring(end);
  setTimeout(() => {
    e.target.selectionStart = e.target.selectionEnd = start + 2;
  }, 0);
};

// Attachments
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files || []);
  await processFiles(files);
  if (event.target) event.target.value = "";
};

const processFiles = async (files) => {
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      alert(`File "${file.name}" is too large. Max 10MB.`);
      continue;
    }

    const attachment = {
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: null,
    };

    if (file.type.startsWith("image/")) {
      attachment.preview = await generateImagePreview(file);
    }

    attachments.value.push(attachment);
  }
};

const generateImagePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
};

const removeAttachment = async (index) => {
  const attachment = attachments.value[index];

  if (attachment.existing && attachment.id && noteId.value) {
    try {
      const { deleteAttachment } = await import("@/db");
      await deleteAttachment(noteId.value, attachment.id);
    } catch (error) {
      console.error("Error deleting attachment:", error);
      return;
    }
  }

  attachments.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const loadExistingAttachments = async () => {
  if (!noteId.value || isNewNote.value) return;

  try {
    const { getAttachments } = await import("@/db");
    const existing = await getAttachments(noteId.value);

    for (const att of existing) {
      const blob = new Blob([att.data], { type: att.type });

      const attachment = {
        file: blob,
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        preview: null,
        existing: true,
      };

      if (att.type.startsWith("image/")) {
        attachment.preview = URL.createObjectURL(blob);
      }

      attachments.value.push(attachment);
    }
  } catch (error) {
    console.error("Error loading attachments:", error);
  }
};

// Save/Cancel
const handleSaveClick = async () => {
  try {
    if (isNewNote.value) {
      const files = attachments.value.map((att) => att.file).filter((f) => f);
      await addNote(noteContent.value, files, noteId.value);
      router.push(`/notes/${noteId.value}`);
    } else {
      await updateNote(noteId.value, noteContent.value);
      const newAttachments = attachments.value.filter((att) => !att.existing);
      if (newAttachments.length > 0) {
        const files = newAttachments.map((att) => att.file).filter((f) => f);
        await addAttachments(noteId.value, files);
      }
      router.push(`/notes/${noteId.value}`);
    }
  } catch (error) {
    console.error("Error saving note:", error);
    alert(`Failed to save note: ${error.message}`);
  }
};

const handleCancel = () => {
  if (isNewNote.value) {
    router.push("/dashboard");
  } else {
    router.push(`/notes/${noteId.value}`);
  }
};
</script>
