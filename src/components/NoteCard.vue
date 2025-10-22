<template>
  <div
    :class="[
      'break-inside-avoid mb-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden group card-hover relative cursor-pointer',
      cardSizeClass,
      cardThemeClass,
      isRecent ? 'ring-2 ring-blue-200 ring-opacity-50' : ''
    ]"
    @click="$emit('click')"
  >
    <!-- Recently updated indicator -->
    <div v-if="isRecent" class="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-sm animate-pulse z-10"></div>

    <!-- Card Content -->
    <div class="p-6 hover:bg-gradient-to-br hover:from-gray-25 hover:to-transparent transition-all duration-300 h-full flex flex-col justify-between">
      <!-- Password Card -->
      <div v-if="parsed.type === 'password'" class="space-y-4 h-full flex flex-col">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <Key class="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-gray-900 truncate text-xl mb-1">
                {{ parsed.title }}
              </h3>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                  Password
                </span>
                <span v-if="totpCode" class="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full group-hover:bg-green-200 transition-colors duration-300 animate-pulse">
                  2FA
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3 text-sm flex-grow">
          <div v-if="parsed.tags.username || parsed.tags.email" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-gray-600 font-medium flex items-center">
              <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              {{ parsed.tags.email ? 'Email' : 'Username' }}
            </span>
            <span class="font-mono text-gray-900 truncate ml-2 font-medium">{{ parsed.tags.email || parsed.tags.username }}</span>
          </div>

          <div v-if="parsed.tags.password" class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span class="text-blue-600 font-medium flex items-center">
              <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Password
            </span>
            <span class="font-mono text-blue-900 font-bold">••••••••</span>
          </div>

          <div v-if="totpCode" class="relative flex items-center justify-between bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 px-4 py-3 rounded-xl border border-green-200 shadow-sm group-hover:border-green-300 transition-colors duration-300">
            <div class="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-green-700 font-semibold text-sm flex items-center">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              2FA Code
            </span>
            <span class="font-mono text-green-800 font-bold text-lg tracking-wider bg-white px-3 py-1 rounded-lg shadow-sm">{{ totpCode }}</span>
          </div>

          <div v-if="parsed.content" class="p-3 bg-gray-50 rounded-lg border-l-4 border-l-blue-400 mt-auto">
            <p class="text-gray-700 line-clamp-2 leading-relaxed text-sm">{{ parsed.content }}</p>
          </div>
        </div>
      </div>

      <!-- Bookmark Card -->
      <div v-else-if="parsed.type === 'bookmark'" class="space-y-4 h-full flex flex-col">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-3 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <Bookmark class="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-gray-900 truncate text-xl mb-1">
                {{ parsed.title }}
              </h3>
              <span class="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full group-hover:bg-amber-200 transition-colors duration-300">
                Bookmark
              </span>
            </div>
          </div>
        </div>

        <div class="space-y-3 text-sm flex-grow">
          <div class="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm group-hover:border-blue-300 transition-colors duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100" @click.stop="openUrl">
            <Globe class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 group-hover:text-blue-700 transition-colors duration-300" />
            <div class="min-w-0 flex-1">
              <p class="text-blue-700 font-medium text-sm truncate group-hover:text-blue-800 transition-colors duration-300">{{ bookmarkUrl }}</p>
              <p class="text-xs text-blue-500 mt-1 group-hover:text-blue-600 transition-colors duration-300">Click to visit</p>
            </div>
          </div>

          <div v-if="parsed.content" class="p-3 bg-gray-50 rounded-lg border-l-4 border-l-amber-400">
            <p class="text-gray-700 line-clamp-3 leading-relaxed text-sm">{{ parsed.content }}</p>
          </div>
        </div>
      </div>

      <!-- Note Card -->
      <div v-else class="space-y-4 h-full flex flex-col">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <FileText class="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-gray-900 truncate text-xl mb-1">
                {{ parsed.title }}
              </h3>
              <span class="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full group-hover:bg-green-200 transition-colors duration-300">
                Note
              </span>
            </div>
          </div>
        </div>

        <div class="text-sm flex-grow">
          <div class="p-4 bg-gray-50 rounded-lg border-l-4 border-l-green-400">
            <p class="text-gray-700 line-clamp-6 leading-relaxed">{{ parsed.content }}</p>
            <div v-if="parsed.content && parsed.content.length > 150" class="mt-3 pt-3 border-t border-gray-200">
              <span class="text-xs text-gray-500 font-medium">
                {{ parsed.content.length }} characters
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with timestamp -->
      <div class="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
        <span class="flex items-center space-x-2">
          <div class="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
          <span class="font-medium">Updated {{ formattedDate }}</span>
        </span>
        <div class="flex items-center space-x-1">
          <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize font-medium text-xs">
            {{ parsed.type }}
          </span>
          <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { Key, Bookmark, FileText, Globe } from 'lucide-vue-next';
import { TOTP, Secret } from 'otpauth';
import { format } from 'timeago.js';

const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['click']);

// Parse note data
const parsed = computed(() => props.note.parsed);

// Check if recently updated (last 24 hours)
const isRecent = computed(() => {
  const now = Date.now();
  const updated = props.note.updatedAt;
  const diffInHours = (now - updated) / (1000 * 60 * 60);
  return diffInHours < 24;
});

// Format date
const formattedDate = computed(() => {
  return format(props.note.updatedAt);
});

// Card sizing based on content
const cardSizeClass = computed(() => {
  const contentLength = parsed.value.content?.length || 0;
  const type = parsed.value.type;

  if (type === 'note') {
    if (contentLength > 300) return 'min-h-[320px]';
    if (contentLength > 200) return 'min-h-[280px]';
    if (contentLength > 100) return 'min-h-[240px]';
    return 'min-h-[200px]';
  }

  if (type === 'password') {
    const hasTOTP = parsed.value.tags['2fa'] || parsed.value.tags.totp;
    const hasUser = parsed.value.tags.username || parsed.value.tags.email;
    if (hasTOTP && hasUser) return 'min-h-[260px]';
    if (hasTOTP) return 'min-h-[240px]';
    if (hasUser) return 'min-h-[220px]';
    return 'min-h-[200px]';
  }

  if (type === 'bookmark') {
    if (contentLength > 100) return 'min-h-[260px]';
    if (contentLength > 0) return 'min-h-[220px]';
    return 'min-h-[180px]';
  }

  return 'min-h-[200px]';
});

// Card theme based on type
const cardThemeClass = computed(() => {
  switch (parsed.value.type) {
    case 'password':
      return 'border-l-4 border-l-blue-500 hover:border-l-blue-600';
    case 'bookmark':
      return 'border-l-4 border-l-amber-500 hover:border-l-amber-600';
    case 'note':
      return 'border-l-4 border-l-green-500 hover:border-l-green-600';
    default:
      return 'border-l-4 border-l-gray-500 hover:border-l-gray-600';
  }
});

// TOTP generation
const totpCode = ref('');
const totpInterval = ref(null);

const generateTOTP = () => {
  const secret = parsed.value.tags['2fa'] || parsed.value.tags.totp;
  if (!secret) {
    totpCode.value = '';
    return;
  }

  try {
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z2-7]+$/.test(cleanSecret)) {
      totpCode.value = '';
      return;
    }

    const totp = new TOTP({
      secret: Secret.fromBase32(cleanSecret),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });
    totpCode.value = totp.generate();
  } catch (error) {
    console.warn('Error generating TOTP:', error);
    totpCode.value = '';
  }
};

// Bookmark URL
const bookmarkUrl = computed(() => {
  return parsed.value.tags.bookmark || parsed.value.tags.url || '';
});

const openUrl = () => {
  if (bookmarkUrl.value) {
    const url = bookmarkUrl.value.startsWith('http') 
      ? bookmarkUrl.value 
      : 'https://' + bookmarkUrl.value;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

// Setup TOTP interval for password cards
onMounted(() => {
  if (parsed.value.type === 'password') {
    generateTOTP();
    totpInterval.value = setInterval(generateTOTP, 1000);
  }
});

onBeforeUnmount(() => {
  if (totpInterval.value) {
    clearInterval(totpInterval.value);
  }
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-6 {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
