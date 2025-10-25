<template>
  <div v-if="isLoaded" class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
          <button
            @click="handleCancel"
            class="flex-shrink-0 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h2 class="text-lg md:text-2xl font-bold text-gray-900 truncate">
            {{ isNewNote ? 'New Note' : 'Edit Note' }}
          </h2>
          <span
            v-if="detectedType"
            class="hidden sm:inline-block px-3 py-1 text-xs font-medium rounded-full flex-shrink-0"
            :class="typeClass"
          >
            {{ detectedType }}
          </span>
        </div>
        <div class="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          <button
            @click="handleCancel"
            class="px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleSaveClick"
            :disabled="!noteContent.trim()"
            class="flex items-center px-4 md:px-6 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Save class="w-4 h-4 md:mr-2" />
            <span class="hidden md:inline">Save</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Editor View -->
    <div class="flex-1 overflow-hidden flex flex-col md:flex-row p-4 md:p-8 gap-4 md:gap-8">
      <!-- Editor Panel -->
      <div class="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <!-- Toolbar -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">Content</h3>
            <div class="flex items-center space-x-2">
              <button
                @click="showTagHelp = !showTagHelp"
                :class="[
                  'flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  showTagHelp ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'
                ]"
              >
                <HelpCircle class="w-3.5 h-3.5 mr-1.5" />
                Tags
              </button>
              <button
                @click="insertTemplate('password')"
                class="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Key class="w-3.5 h-3.5 mr-1.5" />
                Password
              </button>
              <button
                @click="insertTemplate('bookmark')"
                class="flex items-center px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <Bookmark class="w-3.5 h-3.5 mr-1.5" />
                Bookmark
              </button>
              <button
                @click="insertTemplate('note')"
                class="flex items-center px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <FileText class="w-3.5 h-3.5 mr-1.5" />
                Note
              </button>
            </div>
          </div>

          <!-- Tag Help -->
          <div v-if="showTagHelp" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs">
            <p class="font-semibold text-blue-900 mb-3">Available Tags:</p>
            <div class="grid grid-cols-2 gap-3 text-blue-800">
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@title=</code> Title</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@tags=</code> Tags</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@pin=true</code> Pin</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@icon=</code> Icon</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@email=</code> Email</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@username=</code> Username</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@password=</code> Password</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@2fa=</code> 2FA</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@domains=</code> Domains</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@bookmark=</code> URL</div>
            </div>
          </div>

          <!-- Warnings -->
          <div v-if="warnings.length > 0" class="mt-3 space-y-2">
            <div
              v-for="(warning, index) in warnings"
              :key="index"
              class="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-900"
            >
              <AlertCircle class="w-4 h-4 mr-2 flex-shrink-0" />
              {{ warning }}
            </div>
          </div>
        </div>

        <!-- Textarea -->
        <div class="flex-1 p-6 overflow-auto">
          <textarea
            ref="textareaRef"
            v-model="noteContent"
            @keydown.tab.prevent="handleTab"
            placeholder="Start typing your note... Use #@tag= to add metadata"
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
              <span v-if="attachments.length > 0" class="text-xs text-gray-500">({{ attachments.length }})</span>
            </div>
            <label class="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
              <Upload class="w-3.5 h-3.5 mr-1.5" />
              Add Files
              <input type="file" multiple @change="handleFileSelect" class="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.zip" />
            </label>
          </div>

          <!-- Attachments List -->
          <div v-if="attachments.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="(att, index) in attachments" :key="index" class="relative p-3 bg-white rounded-lg border border-gray-200">
              <button
                @click="removeAttachment(index)"
                class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
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

        <!-- Footer -->
        <div class="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>{{ noteContent.length }} characters</span>
          <span v-if="tagCount > 0">{{ tagCount }} tag{{ tagCount !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Preview Panel - Detected Tags -->
      <div class="hidden lg:flex lg:w-1/2 flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-900">Detected Tags</h3>
        </div>
        <div class="flex-1 p-6 overflow-auto">
          <div v-if="parsed && noteContent.trim()" class="space-y-3">
            <!-- Type Badge -->
            <div v-if="detectedType" class="flex items-center gap-2 mb-4">
              <span class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full" :class="typeClass">
                <component :is="typeIcon" class="w-4 h-4 mr-1.5" />
                {{ detectedType }}
              </span>
            </div>

            <!-- Tags List -->
            <div class="space-y-2">
              <div v-for="(value, key) in parsed.tags" :key="key" class="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div class="flex-1">
                  <code class="text-xs font-semibold text-gray-700">#@{{ key }}</code>
                  <p class="text-sm text-gray-900 break-all mt-1" style="font-family: 'SF Mono', monospace">{{ value }}</p>
                </div>
              </div>
            </div>

            <!-- Attachments/References Count -->
            <div v-if="attachments.length > 0" class="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div class="flex items-center gap-2">
                <Paperclip class="w-4 h-4 text-emerald-700" />
                <span class="text-sm font-medium text-emerald-900">{{ attachments.length }} attachment{{ attachments.length !== 1 ? 's' : '' }}</span>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            <div class="text-center">
              <FileText class="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p class="text-sm font-medium">Tags will appear here</p>
              <p class="text-xs mt-1">Start typing to see detected tags</p>
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
import { fetchNoteById, addNote, updateNote, softDeleteNote, addAttachments } from "@/db";
import { parseNote, validateNote } from '@/utils/noteParser';
import {
  ArrowLeft, Save, Key, Bookmark, FileText, HelpCircle, AlertCircle,
  Paperclip, Upload, File, X
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const noteContent = ref("");
const isNewNote = ref(false);
const noteId = ref(null);
const isLoaded = ref(false);
const showTagHelp = ref(false);
const textareaRef = ref(null);
const attachments = ref([]);

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

// Parsing
const parsed = computed(() => {
  if (!noteContent.value) return null;
  return parseNote(noteContent.value);
});

const detectedType = computed(() => parsed.value?.type || 'note');

const typeIcon = computed(() => {
  switch (detectedType.value) {
    case 'password': return Key;
    case 'bookmark': return Bookmark;
    default: return FileText;
  }
});

const typeClass = computed(() => {
  switch (detectedType.value) {
    case 'password': return 'bg-blue-100 text-blue-700';
    case 'bookmark': return 'bg-amber-100 text-amber-700';
    default: return 'bg-green-100 text-green-700';
  }
});

const tagCount = computed(() => Object.keys(parsed.value?.tags || {}).length);
const warnings = computed(() => noteContent.value ? validateNote(noteContent.value) : []);

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

  noteContent.value = value.substring(0, start) + '  ' + value.substring(end);
  setTimeout(() => {
    e.target.selectionStart = e.target.selectionEnd = start + 2;
  }, 0);
};

// Attachments
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files || []);
  await processFiles(files);
  if (event.target) event.target.value = '';
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

    if (file.type.startsWith('image/')) {
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
      const { deleteAttachment } = await import('@/db');
      await deleteAttachment(noteId.value, attachment.id);
    } catch (error) {
      console.error("Error deleting attachment:", error);
      return;
    }
  }
  
  attachments.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const loadExistingAttachments = async () => {
  if (!noteId.value || isNewNote.value) return;
  
  try {
    const { getAttachments } = await import('@/db');
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
      
      if (att.type.startsWith('image/')) {
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
      const newAttachments = attachments.value.filter(att => !att.existing);
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
