<template>
  <div class="h-full flex flex-col bg-[#E8EBF0]">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-8 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="$emit('cancel')"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Notes"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h2 class="text-2xl font-bold text-gray-900">
            {{ isNew ? 'New Note' : 'Edit Note' }}
          </h2>
          <span
            v-if="detectedType"
            class="px-3 py-1 text-xs font-medium rounded-full"
            :class="typeClass"
          >
            {{ detectedType }}
          </span>
        </div>
        <div class="flex items-center space-x-3">
          <button
            v-if="!isNew"
            @click="$emit('delete')"
            class="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 class="w-4 h-4 mr-2" />
            Delete
          </button>
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            :disabled="!content.trim()"
            class="flex items-center px-6 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Save class="w-4 h-4 mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="flex-1 overflow-hidden flex p-8 gap-8">
      <!-- Editor Panel -->
      <div class="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
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
                title="Tag Help"
              >
                <HelpCircle class="w-3.5 h-3.5 mr-1.5" />
                Tags
              </button>
              <button
                @click="insertTemplate('password')"
                class="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Insert Password Template"
              >
                <Key class="w-3.5 h-3.5 mr-1.5" />
                Password
              </button>
              <button
                @click="insertTemplate('bookmark')"
                class="flex items-center px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Insert Bookmark Template"
              >
                <Bookmark class="w-3.5 h-3.5 mr-1.5" />
                Bookmark
              </button>
            </div>
          </div>

          <!-- Tag Help -->
          <div
            v-if="showTagHelp"
            class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs"
          >
            <p class="font-semibold text-blue-900 mb-3">Available Tags:</p>
            <div class="grid grid-cols-2 gap-3 text-blue-800">
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@title=</code> Title</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@color=</code> Color</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@email=</code> Email</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@username=</code> Username</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@password=</code> Password</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@2fa=</code> 2FA Secret</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@domains=</code> Domains</div>
              <div><code class="bg-white px-2 py-1 rounded font-mono">#@bookmark=</code> URL</div>
            </div>
          </div>

          <!-- Validation Warnings -->
          <div v-if="warnings.length > 0" class="mt-3 space-y-2">
            <div
              v-for="(warning, index) in warnings"
              :key="index"
              class="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-900"
            >
              <AlertCircle class="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              {{ warning }}
            </div>
          </div>
        </div>

        <!-- Textarea -->
        <div class="flex-1 p-6 overflow-auto">
          <textarea
            ref="textareaRef"
            v-model="content"
            @input="handleInput"
            @keydown.tab.prevent="handleTab"
            placeholder="Start typing your note... Use #@tag= to add metadata"
            class="w-full h-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 focus:outline-none resize-none text-sm leading-relaxed"
            :class="{ 'border-yellow-400': warnings.length > 0 }"
            style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace"
          ></textarea>
        </div>

        <!-- Character Count -->
        <div class="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>{{ content.length }} characters</span>
          <span v-if="tagCount > 0" class="font-medium">{{ tagCount }} tag{{ tagCount !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="w-1/2 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-900">Live Preview</h3>
        </div>
        <div class="flex-1 p-6 overflow-auto">
          <div
            v-if="parsed && content.trim()"
            class="space-y-4"
          >
            <!-- Title -->
            <div v-if="parsed.title">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ parsed.title }}</h3>
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full"
                  :class="typeClass"
                >
                  <component :is="typeIcon" class="w-3.5 h-3.5 mr-1.5" />
                  {{ detectedType }}
                </span>
                <span
                  v-if="parsed.color"
                  class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full"
                  :style="{ backgroundColor: getNoteColor(parsed.color), color: '#000' }"
                >
                  {{ parsed.color }}
                </span>
              </div>
            </div>

            <!-- Password Fields -->
            <div v-if="parsed.type === 'password'" class="space-y-3 mt-6">
              <div v-if="parsed.tags.email || parsed.tags.username" class="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span class="text-xs text-gray-600 font-semibold">{{ parsed.tags.email ? 'Email' : 'Username' }}</span>
                <p class="text-sm text-gray-900 mt-1.5" style="font-family: 'SF Mono', 'Monaco', monospace">{{ parsed.tags.email || parsed.tags.username }}</p>
              </div>

              <div v-if="parsed.tags.password" class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span class="text-xs text-blue-700 font-semibold">Password</span>
                <p class="text-sm text-blue-900 mt-1.5 font-bold" style="font-family: 'SF Mono', 'Monaco', monospace">{{ parsed.tags.password }}</p>
              </div>

              <div v-if="parsed.tags['2fa'] || parsed.tags.totp" class="p-4 bg-green-50 rounded-xl border border-green-200">
                <span class="text-xs text-green-700 font-semibold">2FA Secret</span>
                <p class="text-xs text-green-900 mt-1.5 break-all" style="font-family: 'SF Mono', 'Monaco', monospace">{{ parsed.tags['2fa'] || parsed.tags.totp }}</p>
              </div>

              <div v-if="parsed.tags.domains" class="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span class="text-xs text-gray-600 font-semibold">Domains</span>
                <p class="text-sm text-gray-900 mt-1.5">{{ parsed.tags.domains }}</p>
              </div>
            </div>

            <!-- Bookmark Fields -->
            <div v-if="parsed.type === 'bookmark' && (parsed.tags.bookmark || parsed.tags.url)" class="mt-6">
              <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span class="text-xs text-blue-700 font-semibold">URL</span>
                <p class="text-sm text-blue-700 mt-1.5 break-all">{{ parsed.tags.bookmark || parsed.tags.url }}</p>
              </div>
            </div>

            <!-- Content/Notes -->
            <div v-if="parsed.content" class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span class="text-xs text-gray-600 font-semibold">{{ parsed.type === 'note' ? 'Content' : 'Notes' }}</span>
              <p class="text-sm text-gray-900 mt-2 whitespace-pre-wrap leading-relaxed">{{ parsed.content }}</p>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            <div class="text-center">
              <FileText class="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p class="text-sm font-medium">Preview will appear here</p>
              <p class="text-xs mt-1">Start typing to see your note</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { parseNote, validateNote, NOTE_COLORS } from '@/utils/noteParser';
import {
  ArrowLeft,
  Save,
  Trash2,
  Key,
  Bookmark,
  FileText,
  HelpCircle,
  AlertCircle,
} from 'lucide-vue-next';

const props = defineProps({
  initialContent: {
    type: String,
    default: '',
  },
  isNew: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['save', 'cancel', 'delete']);

const content = ref(props.initialContent);
const showTagHelp = ref(false);
const textareaRef = ref(null);

// Parse content in real-time
const parsed = computed(() => {
  if (!content.value) return null;
  return parseNote(content.value);
});

// Detect type and get styling
const detectedType = computed(() => parsed.value?.type || 'note');

const typeIcon = computed(() => {
  switch (detectedType.value) {
    case 'password':
      return Key;
    case 'bookmark':
      return Bookmark;
    default:
      return FileText;
  }
});

const typeColor = computed(() => {
  switch (detectedType.value) {
    case 'password':
      return 'text-blue-600';
    case 'bookmark':
      return 'text-amber-600';
    default:
      return 'text-green-600';
  }
});

const typeClass = computed(() => {
  switch (detectedType.value) {
    case 'password':
      return 'bg-blue-100 text-blue-700';
    case 'bookmark':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-green-100 text-green-700';
  }
});

// Get note color
const getNoteColor = (colorKey) => {
  return NOTE_COLORS[colorKey]?.bg || NOTE_COLORS.yellow.bg;
};

// Count tags
const tagCount = computed(() => {
  return Object.keys(parsed.value?.tags || {}).length;
});

// Validate content
const warnings = computed(() => {
  if (!content.value) return [];
  return validateNote(content.value);
});

// Insert templates
const insertTemplate = (type) => {
  const templates = {
    password: `#@title=My Account
#@email=user@example.com
#@password=
#@2fa=
#@domains=example.com

Notes about this account...`,
    bookmark: `#@title=Useful Website
#@bookmark=https://example.com

Description of the website...`,
  };

  if (templates[type]) {
    content.value = templates[type];
    // Focus textarea
    setTimeout(() => {
      if (textareaRef.value) {
        textareaRef.value.focus();
      }
    }, 100);
  }
};

// Handle tab key for indentation
const handleTab = (e) => {
  const start = e.target.selectionStart;
  const end = e.target.selectionEnd;
  const value = content.value;

  // Insert tab character
  content.value = value.substring(0, start) + '  ' + value.substring(end);

  // Move cursor after tab
  setTimeout(() => {
    e.target.selectionStart = e.target.selectionEnd = start + 2;
  }, 0);
};

// Handle input for live parsing
const handleInput = () => {
  // Auto-close tag help if content is being edited
  if (content.value.length > 10) {
    showTagHelp.value = false;
  }
};

// Save handler
const handleSave = () => {
  if (content.value.trim()) {
    emit('save', content.value);
  }
};

// Focus textarea on mount
onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.focus();
    // If new note, show tag help briefly
    if (props.isNew && !content.value) {
      showTagHelp.value = true;
      setTimeout(() => {
        showTagHelp.value = false;
      }, 5000);
    }
  }
});

// Handle Escape key
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    emit('cancel');
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
/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f5f9;
}

textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
