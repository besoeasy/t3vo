<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('cancel')"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <component
            :is="typeIcon"
            class="w-6 h-6"
            :class="typeColor"
          />
          <h2 class="text-xl font-semibold text-gray-900">
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
        <button
          @click="$emit('cancel')"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Editor Content -->
      <div class="flex-1 overflow-hidden flex">
        <!-- Editor Panel -->
        <div class="flex-1 flex flex-col border-r border-gray-200">
          <!-- Toolbar -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-700">Content</h3>
              <div class="flex items-center space-x-2">
                <button
                  @click="showTagHelp = !showTagHelp"
                  class="flex items-center px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  title="Tag Help"
                >
                  <HelpCircle class="w-3 h-3 mr-1" />
                  Tags
                </button>
                <button
                  @click="insertTemplate('password')"
                  class="flex items-center px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Insert Password Template"
                >
                  <Key class="w-3 h-3 mr-1" />
                  Password
                </button>
                <button
                  @click="insertTemplate('bookmark')"
                  class="flex items-center px-2 py-1 text-xs text-amber-600 hover:bg-amber-100 rounded transition-colors"
                  title="Insert Bookmark Template"
                >
                  <Bookmark class="w-3 h-3 mr-1" />
                  Bookmark
                </button>
              </div>
            </div>

            <!-- Tag Help -->
            <div
              v-if="showTagHelp"
              class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1"
            >
              <p class="font-medium text-blue-900 mb-2">Available Tags:</p>
              <div class="grid grid-cols-2 gap-2 text-blue-800">
                <div><code class="bg-white px-1 rounded">#@title=</code> Title</div>
                <div><code class="bg-white px-1 rounded">#@email=</code> Email</div>
                <div><code class="bg-white px-1 rounded">#@username=</code> Username</div>
                <div><code class="bg-white px-1 rounded">#@password=</code> Password</div>
                <div><code class="bg-white px-1 rounded">#@2fa=</code> 2FA Secret</div>
                <div><code class="bg-white px-1 rounded">#@domains=</code> Domains</div>
                <div><code class="bg-white px-1 rounded">#@bookmark=</code> URL</div>
                <div><code class="bg-white px-1 rounded">#@url=</code> URL (alt)</div>
              </div>
            </div>

            <!-- Validation Warnings -->
            <div v-if="warnings.length > 0" class="mt-3 space-y-1">
              <div
                v-for="(warning, index) in warnings"
                :key="index"
                class="flex items-start p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800"
              >
                <AlertCircle class="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                {{ warning }}
              </div>
            </div>
          </div>

          <!-- Textarea -->
          <div class="flex-1 p-4 overflow-auto">
            <textarea
              ref="textareaRef"
              v-model="content"
              @input="handleInput"
              @keydown.tab.prevent="handleTab"
              placeholder="Start typing your note... Use #@tag= to add metadata"
              class="w-full h-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
              :class="{ 'border-yellow-400': warnings.length > 0 }"
            ></textarea>
          </div>

          <!-- Character Count -->
          <div class="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <span>{{ content.length }} characters</span>
            <span v-if="tagCount > 0">{{ tagCount }} tag{{ tagCount !== 1 ? 's' : '' }}</span>
          </div>
        </div>

        <!-- Preview Panel -->
        <div class="w-1/2 flex flex-col bg-gray-50">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700">Live Preview</h3>
          </div>
          <div class="flex-1 p-4 overflow-auto">
            <div
              v-if="parsed"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <!-- Preview based on detected type -->
              <div v-if="parsed.type === 'password'" class="space-y-4">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="p-3 bg-blue-100 rounded-xl">
                    <Key class="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 text-lg">{{ parsed.title }}</h3>
                    <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Password</span>
                  </div>
                </div>

                <div v-if="parsed.tags.email || parsed.tags.username" class="p-3 bg-gray-50 rounded-lg">
                  <span class="text-xs text-gray-600 font-medium">{{ parsed.tags.email ? 'Email' : 'Username' }}</span>
                  <p class="font-mono text-sm text-gray-900 mt-1">{{ parsed.tags.email || parsed.tags.username }}</p>
                </div>

                <div v-if="parsed.tags.password" class="p-3 bg-blue-50 rounded-lg">
                  <span class="text-xs text-blue-600 font-medium">Password</span>
                  <p class="font-mono text-sm text-blue-900 mt-1 font-bold">{{ parsed.tags.password }}</p>
                </div>

                <div v-if="parsed.tags['2fa'] || parsed.tags.totp" class="p-3 bg-green-50 rounded-lg border border-green-200">
                  <span class="text-xs text-green-600 font-medium">2FA Secret</span>
                  <p class="font-mono text-xs text-green-900 mt-1 break-all">{{ parsed.tags['2fa'] || parsed.tags.totp }}</p>
                </div>

                <div v-if="parsed.tags.domains" class="p-3 bg-gray-50 rounded-lg">
                  <span class="text-xs text-gray-600 font-medium">Domains</span>
                  <p class="text-sm text-gray-900 mt-1">{{ parsed.tags.domains }}</p>
                </div>

                <div v-if="parsed.content" class="mt-4 pt-4 border-t border-gray-200">
                  <span class="text-xs text-gray-600 font-medium">Notes</span>
                  <p class="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{{ parsed.content }}</p>
                </div>
              </div>

              <div v-else-if="parsed.type === 'bookmark'" class="space-y-4">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="p-3 bg-amber-100 rounded-xl">
                    <Bookmark class="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 text-lg">{{ parsed.title }}</h3>
                    <span class="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Bookmark</span>
                  </div>
                </div>

                <div v-if="parsed.tags.bookmark || parsed.tags.url" class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span class="text-xs text-blue-600 font-medium">URL</span>
                  <p class="text-sm text-blue-700 mt-1 break-all">{{ parsed.tags.bookmark || parsed.tags.url }}</p>
                </div>

                <div v-if="parsed.content" class="mt-4 pt-4 border-t border-gray-200">
                  <span class="text-xs text-gray-600 font-medium">Notes</span>
                  <p class="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{{ parsed.content }}</p>
                </div>
              </div>

              <div v-else class="space-y-4">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="p-3 bg-green-100 rounded-xl">
                    <FileText class="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 text-lg">{{ parsed.title }}</h3>
                    <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Note</span>
                  </div>
                </div>

                <div class="p-3 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ parsed.content || 'Start typing to see preview...' }}</p>
                </div>
              </div>
            </div>
            <div v-else class="flex items-center justify-center h-full text-gray-400">
              <div class="text-center">
                <FileText class="w-12 h-12 mx-auto mb-2" />
                <p class="text-sm">Preview will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center space-x-2">
          <button
            v-if="!isNew"
            @click="$emit('delete')"
            class="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 class="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            :disabled="!content.trim()"
            class="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Save class="w-4 h-4 mr-2" />
            Save Note
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { parseNote, validateNote } from '@/utils/noteParser';
import {
  X,
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
