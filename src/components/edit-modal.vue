<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { X, Key, Bookmark, FileText, Eye, EyeOff, Copy, Trash, Globe } from "lucide-vue-next";
import { TOTP, Secret } from "otpauth";
import PasswordGenerator from "@/components/PasswordGenerator.vue";

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['password', 'bookmark', 'note'].includes(value)
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["save", "cancel", "edit", "delete", "copy"]);

// Form data
const formData = ref({});
const showPassword = ref(false);
const showPasswordGenerator = ref(false);
const currentTOTP = ref("");
const totpTimeLeft = ref(30);
let totpInterval = null;

// TOTP Generation
const generateTOTP = (secret, period = 30) => {
  if (!secret) return "";
  try {
    // Clean and validate the secret
    const cleanSecret = secret.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z2-7]+$/.test(cleanSecret)) {
      console.warn('Invalid TOTP secret format');
      return "";
    }
    
    const totp = new TOTP({
      secret: Secret.fromBase32(cleanSecret),
      algorithm: "SHA1",
      digits: 6,
      period,
    });
    return totp.generate();
  } catch (error) {
    console.warn('Error generating TOTP:', error);
    return "";
  }
};

const updateTOTP = () => {
  if (formData.value.totpSecret && props.type === 'password') {
    currentTOTP.value = generateTOTP(formData.value.totpSecret, 30);
    
    // Calculate time left in current period
    const now = Math.floor(Date.now() / 1000);
    totpTimeLeft.value = 30 - (now % 30);
  } else {
    currentTOTP.value = "";
    totpTimeLeft.value = 30;
  }
};

const startTOTPTimer = () => {
  // Clear any existing timer first
  stopTOTPTimer();
  
  // Update immediately
  updateTOTP();
  
  // Set up interval for updates
  if (formData.value.totpSecret && props.type === 'password') {
    totpInterval = setInterval(() => {
      updateTOTP();
    }, 1000); // Update every second for the countdown
  }
};

const stopTOTPTimer = () => {
  if (totpInterval) {
    clearInterval(totpInterval);
    totpInterval = null;
  }
  currentTOTP.value = "";
  totpTimeLeft.value = 30;
};

// Initialize form data
const initializeForm = () => {
  switch (props.type) {
    case 'password':
      formData.value = {
        id: props.item.id || null,
        title: props.item.title || "",
        username: props.item.username || "",
        email: props.item.email || "",
        password: props.item.password || "",
        totpSecret: props.item.totpSecret || "",
        urls: props.item.urls || "",
      };
      break;
    case 'bookmark':
      formData.value = {
        id: props.item.id || null,
        title: props.item.title || "",
        url: props.item.url || "",
        note: props.item.note || "",
      };
      break;
    case 'note':
      formData.value = {
        id: props.item.id || null,
        title: props.item.title || "",
        content: props.item.content || "",
      };
      break;
  }
};

// Computed properties
const modalTitle = computed(() => {
  if (props.readOnly) {
    const typeTitle = props.type.charAt(0).toUpperCase() + props.type.slice(1);
    return `${typeTitle} Details`;
  }
  const action = formData.value.id ? 'Edit' : 'Add';
  const typeTitle = props.type.charAt(0).toUpperCase() + props.type.slice(1);
  return `${action} ${typeTitle}`;
});

const typeIcon = computed(() => {
  switch (props.type) {
    case 'password': return Key;
    case 'bookmark': return Bookmark;
    case 'note': return FileText;
    default: return Key;
  }
});

const getSubtitle = () => {
  if (props.readOnly) {
    return 'View and manage your item';
  }
  return formData.value.id ? 'Update your information' : 'Add new item to your collection';
};

const getTitle = () => {
  if (props.readOnly) {
    return formData.value.title || 'Item Details';
  }
  return formData.value.id ? 'Edit Item' : 'New Item';
};

const getPasswordStrengthColor = (index) => {
  const password = formData.value.password || '';
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (index < strength) {
    if (strength <= 1) return 'bg-red-400';
    if (strength <= 2) return 'bg-yellow-400';
    if (strength <= 3) return 'bg-blue-400';
    return 'bg-emerald-400';
  }
  return 'bg-gray-200';
};

// Methods
const handleEdit = () => {
  emit("edit", { ...formData.value });
};

const handleDelete = () => {
  emit("delete", { ...formData.value });
};

const handleCopy = () => {
  let textToCopy = "";
  switch (props.type) {
    case 'password':
      textToCopy = formData.value.password;
      break;
    case 'bookmark':
      textToCopy = formData.value.url;
      break;
    case 'note':
      textToCopy = formData.value.content;
      break;
  }
  emit("copy", textToCopy);
};

const handleCopyTOTP = () => {
  if (currentTOTP.value) {
    emit("copy", currentTOTP.value);
  }
};

const openUrl = (url) => {
  if (url) {
    // Ensure the URL has a protocol
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;
    window.open(formattedUrl, '_blank', 'noopener,noreferrer');
  }
};

const handleSave = () => {
  // Validate required fields
  if (!isValid()) return;
  
  emit("save", { ...formData.value });
};

const handleCancel = () => {
  emit("cancel");
};

const isValid = () => {
  switch (props.type) {
    case 'password':
      return formData.value.title && formData.value.password;
    case 'bookmark':
      return formData.value.url;
    case 'note':
      return formData.value.title;
    default:
      return false;
  }
};

const handlePasswordGenerated = (password) => {
  formData.value.password = password;
  showPasswordGenerator.value = false;
};

// Close on escape key
const handleKeyDown = (e) => {
  if (e.key === "Escape") {
    handleCancel();
  }
};

// Initialize form when component mounts or props change
watch(() => props.item, () => {
  initializeForm();
  if (props.readOnly && props.type === 'password') {
    startTOTPTimer();
  } else {
    stopTOTPTimer();
  }
}, { immediate: true, deep: true });

// Add event listener on mount
onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  // Prevent body scroll when modal is open (mobile experience)
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
});

// Cleanup on unmount
onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
  stopTOTPTimer();
  // Restore body scroll
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
});
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-500">
    <!-- Mobile: Slide up from bottom, Desktop: Gentle scale -->
    <div class="w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-500 ease-out">
      
      <!-- Quick Type Indicator -->
      <div class="h-1 bg-gradient-to-r" :class="{
        'from-emerald-400 via-teal-400 to-cyan-400': type === 'password',
        'from-orange-400 via-amber-400 to-yellow-400': type === 'bookmark', 
        'from-violet-400 via-purple-400 to-fuchsia-400': type === 'note'
      }"></div>

      <!-- Header - Clean & Minimal -->
      <div class="px-8 py-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <!-- Animated icon with type-specific colors -->
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300" :class="{
            'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/25': type === 'password',
            'bg-gradient-to-br from-orange-400 to-yellow-500 shadow-orange-500/25': type === 'bookmark',
            'bg-gradient-to-br from-violet-400 to-purple-500 shadow-violet-500/25': type === 'note'
          }">
            <component :is="typeIcon" class="w-6 h-6 text-white drop-shadow-sm" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ getTitle() }}</h2>
            <p class="text-sm text-gray-500 mt-0.5">{{ getSubtitle() }}</p>
          </div>
        </div>
        
        <!-- Close button -->
        <button @click="handleCancel" class="w-10 h-10 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95">
          <X class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <!-- Content Area -->
      <div class="px-8 pb-8 max-h-[80vh] overflow-y-auto">
        
        <!-- Password Form -->
        <div v-if="type === 'password'" class="space-y-5">
          <!-- Title -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">What's this for?</label>
            <input
              v-model="formData.title"
              :disabled="readOnly"
              class="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200"
              placeholder="Netflix, Gmail, Work laptop..."
            />
          </div>

          <!-- Username & Email in one row -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Username</label>
              <input
                v-model="formData.username"
                :disabled="readOnly"
                class="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200"
                placeholder="john_doe"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="formData.email"
                :disabled="readOnly"
                type="email"
                class="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200"
                placeholder="you@email.com"
              />
            </div>
          </div>

          <!-- Password with visual strength indicator -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Password</label>
            <div class="relative">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                :disabled="readOnly"
                class="w-full px-4 py-3 pr-20 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200"
                placeholder="Your secure password"
              />
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  v-if="!readOnly"
                  @click="showPasswordGenerator = !showPasswordGenerator"
                  class="w-8 h-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                  title="Generate password"
                >
                  <span class="text-sm">✨</span>
                </button>
                <button
                  @click="showPassword = !showPassword"
                  class="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            <!-- Password strength indicator -->
            <div class="flex gap-1 mt-2" v-if="formData.password && !readOnly">
              <div class="h-1 flex-1 rounded-full" :class="getPasswordStrengthColor(0)"></div>
              <div class="h-1 flex-1 rounded-full" :class="getPasswordStrengthColor(1)"></div>
              <div class="h-1 flex-1 rounded-full" :class="getPasswordStrengthColor(2)"></div>
              <div class="h-1 flex-1 rounded-full" :class="getPasswordStrengthColor(3)"></div>
            </div>

            <!-- Inline Password Generator -->
            <div v-if="showPasswordGenerator && !readOnly" class="mt-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <PasswordGenerator @generated="handlePasswordGenerated" />
            </div>
          </div>

          <!-- 2FA Section -->
          <div class="space-y-2" v-if="formData.totpSecret || !readOnly">
            <label class="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
            <input
              v-if="!readOnly"
              v-model="formData.totpSecret"
              class="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200"
              placeholder="Paste your 2FA secret key here..."
            />
            
            <!-- Live TOTP Display -->
            <div v-if="readOnly && currentTOTP" class="mt-3 p-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl text-white">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-2xl font-mono font-bold tracking-wider">{{ currentTOTP }}</div>
                  <div class="text-emerald-100 text-sm">Expires in {{ totpTimeLeft }}s</div>
                </div>
                <button @click="handleCopyTOTP" class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110">
                  <Copy class="w-5 h-5" />
                </button>
              </div>
              <div class="mt-2 h-1 bg-emerald-300/30 rounded-full overflow-hidden">
                <div class="h-full bg-white/60 rounded-full transition-all duration-1000 ease-linear" :style="{ width: `${(totpTimeLeft / 30) * 100}%` }"></div>
              </div>
            </div>
          </div>

          <!-- Website URLs -->
          <div class="space-y-2" v-if="formData.urls || !readOnly">
            <label class="text-sm font-medium text-gray-700">Related websites</label>
            <textarea
              v-model="formData.urls"
              :disabled="readOnly"
              rows="2"
              class="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 resize-none"
              placeholder="https://netflix.com&#10;https://app.netflix.com"
            ></textarea>
          </div>
        </div>

        <!-- Bookmark Form -->
        <div v-if="type === 'bookmark'" class="space-y-5">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Website URL</label>
            <div v-if="readOnly" class="relative">
              <input
                v-model="formData.url"
                :disabled="readOnly"
                class="w-full px-4 py-3 pr-12 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-400/50 transition-all duration-200 cursor-pointer"
                placeholder="https://awesome-website.com"
                @click="openUrl(formData.url)"
                readonly
              />
              <button
                @click="openUrl(formData.url)"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="Open URL"
              >
                <Globe class="w-4 h-4 text-orange-600" />
              </button>
            </div>
            <input
              v-else
              v-model="formData.url"
              :disabled="readOnly"
              class="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-400/50 transition-all duration-200"
              placeholder="https://awesome-website.com"
            />
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Name this bookmark</label>
            <input
              v-model="formData.title"
              :disabled="readOnly"
              class="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-400/50 transition-all duration-200"
              placeholder="Cool Design Tool, Recipe Blog..."
            />
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Why did you save this?</label>
            <textarea
              v-model="formData.note"
              :disabled="readOnly"
              rows="3"
              class="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-orange-400/50 transition-all duration-200 resize-none"
              placeholder="Great for inspiration, has free templates, recommend by Sarah..."
            ></textarea>
          </div>
        </div>

        <!-- Note Form -->
        <div v-if="type === 'note'" class="space-y-5">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Note title</label>
            <input
              v-model="formData.title"
              :disabled="readOnly"
              class="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-violet-400/50 transition-all duration-200"
              placeholder="Meeting notes, Ideas, Shopping list..."
            />
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Write your thoughts</label>
            <textarea
              v-model="formData.content"
              :disabled="readOnly"
              rows="8"
              class="w-full px-4 py-3 bg-gray-50/50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-violet-400/50 transition-all duration-200 resize-none leading-relaxed"
              placeholder="Start writing... you can add anything here - ideas, reminders, links, or whatever comes to mind."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Action Buttons - Floating bottom -->
      <div class="p-8 pt-0">
        <div v-if="readOnly" class="flex gap-3">
          <button @click="handleCopy" class="flex-1 py-3 px-4 bg-gray-100/80 hover:bg-gray-200/80 rounded-2xl font-medium text-gray-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
            <Copy class="w-4 h-4" />
            Copy
          </button>
          <button @click="handleDelete" class="flex-1 py-3 px-4 bg-red-100/80 hover:bg-red-200/80 rounded-2xl font-medium text-red-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
            <Trash class="w-4 h-4" />
            Delete
          </button>
          <button @click="handleEdit" class="flex-1 py-3 px-4 rounded-2xl font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg" :class="{
            'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-500/25': type === 'password',
            'bg-gradient-to-r from-orange-400 to-yellow-500 shadow-orange-500/25': type === 'bookmark',
            'bg-gradient-to-r from-violet-400 to-purple-500 shadow-violet-500/25': type === 'note'
          }">
            Edit
          </button>
        </div>
        
        <div v-else class="flex gap-3">
          <button @click="handleCancel" class="py-3 px-6 bg-gray-100/80 hover:bg-gray-200/80 rounded-2xl font-medium text-gray-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            Cancel
          </button>
          <button @click="handleSave" :disabled="!isValid()" class="flex-1 py-3 px-4 rounded-2xl font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg" :class="{
            'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-500/25': type === 'password',
            'bg-gradient-to-r from-orange-400 to-yellow-500 shadow-orange-500/25': type === 'bookmark',
            'bg-gradient-to-r from-violet-400 to-purple-500 shadow-violet-500/25': type === 'note'
          }">
            {{ formData.id ? 'Save Changes' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

