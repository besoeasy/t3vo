<template>
  <div class="h-full flex flex-col bg-white">
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
      <div class="w-1/2 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
                
                <!-- TOTP Code -->
                <div v-if="totpCode && totpCode !== 'Invalid Secret'" class="mt-3 pt-3 border-t border-green-300">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-green-700 font-semibold">Current Code</span>
                    <span class="text-xs text-green-600">{{ totpTimeRemaining }}s</span>
                  </div>
                  <p class="text-3xl font-bold text-green-900 tracking-wider" style="font-family: 'SF Mono', 'Monaco', monospace">
                    {{ totpCode.slice(0, 3) }} {{ totpCode.slice(3, 6) }}
                  </p>
                  <div class="mt-2 h-1 bg-green-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-green-600 transition-all duration-1000 ease-linear"
                      :style="{ width: `${(totpTimeRemaining / 30) * 100}%` }"
                    ></div>
                  </div>
                </div>
                <div v-else-if="totpCode === 'Invalid Secret'" class="mt-3 pt-3 border-t border-green-300">
                  <p class="text-xs text-red-600">Invalid 2FA secret format</p>
                </div>
              </div>

              <div v-if="parsed.tags.domains" class="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span class="text-xs text-gray-600 font-semibold">Domains</span>
                <p class="text-sm text-gray-900 mt-1.5">{{ parsed.tags.domains }}</p>
              </div>
            </div>

            <!-- Bookmark Fields -->
            <div v-if="parsed.type === 'bookmark' && (parsed.tags.bookmark || parsed.tags.url)" class="mt-6">
              <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <span class="text-xs text-blue-700 font-semibold">URL</span>
                    <p class="text-sm text-blue-700 mt-1.5 break-all">{{ parsed.tags.bookmark || parsed.tags.url }}</p>
                  </div>
                  <a
                    :href="parsed.tags.bookmark || parsed.tags.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex-shrink-0 flex items-center px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
                    title="Open in new tab"
                  >
                    <ExternalLink class="w-3.5 h-3.5 mr-1.5" />
                    Open
                  </a>
                </div>
              </div>
            </div>

            <!-- Content/Notes -->
            <div v-if="parsed.content" class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <span class="text-xs text-gray-600 font-semibold">{{ parsed.type === 'note' ? 'Content' : 'Notes' }}</span>
              <p class="text-sm text-gray-900 mt-2 whitespace-pre-wrap leading-relaxed">{{ parsed.content }}</p>
            </div>

            <!-- References Section -->
            <div v-if="parsed.references && parsed.references.length > 0" class="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div class="flex items-center mb-3">
                <Link2 class="w-4 h-4 text-purple-700 mr-2" />
                <span class="text-xs text-purple-700 font-semibold">References ({{ parsed.references.length }})</span>
              </div>
              <div class="space-y-2">
                <a
                  v-for="(ref, index) in parsed.references"
                  :key="index"
                  :href="ref.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-start p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
                >
                  <!-- Platform Icon -->
                  <div class="flex-shrink-0 mr-3">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center"
                      :class="getPlatformColorClass(ref.type)"
                    >
                      <component :is="getPlatformIcon(ref.type)" class="w-4 h-4" />
                    </div>
                  </div>
                  
                  <!-- Reference Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-semibold text-gray-900">{{ ref.platform }}</span>
                      <ExternalLink class="w-3 h-3 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <p class="text-xs text-gray-600 truncate">{{ ref.url }}</p>
                    <div v-if="ref.subreddit" class="text-xs text-gray-500 mt-1">
                      r/{{ ref.subreddit }}
                    </div>
                    <div v-if="ref.username" class="text-xs text-gray-500 mt-1">
                      @{{ ref.username }}
                    </div>
                  </div>
                </a>
              </div>
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
import { parseNote, validateNote } from '@/utils/noteParser';
import * as OTPAuth from 'otpauth';
import {
  ArrowLeft,
  Save,
  Trash2,
  Key,
  Bookmark,
  FileText,
  HelpCircle,
  AlertCircle,
  Link2,
  ExternalLink,
  Youtube,
  Instagram,
  Twitter,
  MessageSquare,
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
const totpCode = ref('');
const totpTimeRemaining = ref(30);
let totpInterval = null;

// Parse content in real-time
const parsed = computed(() => {
  if (!content.value) return null;
  return parseNote(content.value);
});

// Generate TOTP code
const generateTOTP = () => {
  const secret = parsed.value?.tags['2fa'] || parsed.value?.tags.totp;
  if (!secret) {
    totpCode.value = '';
    totpTimeRemaining.value = 30;
    return;
  }

  try {
    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      secret: secret.replace(/\s/g, ''), // Remove spaces
      digits: 6,
      period: 30,
    });

    // Generate current token
    totpCode.value = totp.generate();

    // Calculate time remaining
    const now = Math.floor(Date.now() / 1000);
    totpTimeRemaining.value = 30 - (now % 30);
  } catch (error) {
    console.error('Error generating TOTP:', error);
    totpCode.value = 'Invalid Secret';
    totpTimeRemaining.value = 0;
  }
};

// Watch for changes in 2FA secret
watch(() => parsed.value?.tags['2fa'] || parsed.value?.tags.totp, () => {
  generateTOTP();
}, { immediate: true });

// Update TOTP every second
onMounted(() => {
  totpInterval = setInterval(() => {
    if (parsed.value?.tags['2fa'] || parsed.value?.tags.totp) {
      generateTOTP();
    }
  }, 1000);
});

onBeforeUnmount(() => {
  if (totpInterval) {
    clearInterval(totpInterval);
  }
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

// Helper functions for references
const getPlatformIcon = (type) => {
  switch (type) {
    case 'youtube':
      return Youtube;
    case 'instagram':
      return Instagram;
    case 'twitter':
      return Twitter;
    case 'reddit':
      return MessageSquare;
    default:
      return Link2;
  }
};

const getPlatformColorClass = (type) => {
  switch (type) {
    case 'youtube':
      return 'bg-red-100 text-red-600';
    case 'instagram':
      return 'bg-pink-100 text-pink-600';
    case 'twitter':
      return 'bg-blue-100 text-blue-600';
    case 'reddit':
      return 'bg-orange-100 text-orange-600';
    default:
      return 'bg-gray-100 text-gray-600';
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
