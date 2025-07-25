<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { X, Key, Bookmark, FileText, Eye, EyeOff, Copy, Trash } from "lucide-vue-next";
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
});

// Cleanup on unmount
onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeyDown);
  stopTOTPTimer();
});
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <component :is="typeIcon" class="w-6 h-6 text-gray-600" />
          <h3 class="text-xl font-semibold text-gray-900">{{ modalTitle }}</h3>
        </div>
        <button @click="handleCancel" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Form Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
        <!-- Password Form -->
        <div v-if="type === 'password'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              v-model="formData.title"
              type="text"
              :disabled="readOnly"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter title"
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                v-model="formData.username"
                type="text"
                :disabled="readOnly"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                v-model="formData.email"
                type="email"
                :disabled="readOnly"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter email"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <div class="flex space-x-2">
              <div class="relative flex-1">
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  :disabled="readOnly"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <component :is="showPassword ? EyeOff : Eye" class="w-4 h-4" />
                </button>
              </div>
              <button
                v-if="!readOnly"
                type="button"
                @click="showPasswordGenerator = !showPasswordGenerator"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate
              </button>
            </div>
            
            <!-- Password Generator -->
            <div v-if="showPasswordGenerator && !readOnly" class="mt-4 p-4 bg-gray-50 rounded-lg">
              <PasswordGenerator @generated="handlePasswordGenerated" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">TOTP Secret</label>
            <input
              v-model="formData.totpSecret"
              type="text"
              :disabled="readOnly"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter TOTP secret (optional)"
            />
          </div>

          <!-- Live TOTP Display (Read-only mode only) -->
          <div v-if="readOnly && currentTOTP" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">2FA Code</label>
            <div class="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex-1">
                <div class="text-2xl font-mono font-bold text-green-700 tracking-wider">
                  {{ currentTOTP }}
                </div>
                <div class="flex items-center space-x-2 mt-1">
                  <div class="text-xs text-green-600">
                    Refreshes in {{ totpTimeLeft }}s
                  </div>
                  <!-- Progress bar -->
                  <div class="flex-1 bg-green-200 rounded-full h-1">
                    <div 
                      class="bg-green-600 h-1 rounded-full transition-all duration-1000 ease-linear"
                      :style="{ width: `${(totpTimeLeft / 30) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
              <button
                @click="handleCopyTOTP"
                class="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                title="Copy TOTP Code"
              >
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">URLs</label>
            <textarea
              v-model="formData.urls"
              rows="2"
              :disabled="readOnly"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter URLs (one per line)"
            ></textarea>
          </div>
        </div>

        <!-- Bookmark Form -->
        <div v-if="type === 'bookmark'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">URL *</label>
            <input
              v-model="formData.url"
              type="url"
              :disabled="readOnly"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              v-model="formData.title"
              type="text"
              :disabled="readOnly"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter title (auto-generated if empty)"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <textarea
              v-model="formData.note"
              rows="4"
              :disabled="readOnly"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Add a note about this bookmark"
            ></textarea>
          </div>
        </div>

        <!-- Note Form -->
        <div v-if="type === 'note'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              v-model="formData.title"
              type="text"
              :disabled="readOnly"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Enter note title"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              v-model="formData.content"
              rows="8"
              :disabled="readOnly"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Write your note content here..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
        <!-- Left side - Action buttons for read-only mode -->
        <div v-if="readOnly" class="flex gap-2">
          <button 
            @click="handleCopy" 
            class="flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            :title="`Copy ${type === 'password' ? 'Password' : type === 'bookmark' ? 'URL' : 'Content'}`"
          >
            <Copy class="w-4 h-4 mr-2" />
            Copy
          </button>
          <button 
            @click="handleDelete" 
            class="flex items-center px-3 py-2 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash class="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
        <div v-else></div>

        <!-- Right side - Close/Cancel and Edit/Save buttons -->
        <div class="flex gap-3">
          <button 
            @click="handleCancel" 
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {{ readOnly ? 'Close' : 'Cancel' }}
          </button>
          <button 
            v-if="readOnly"
            @click="handleEdit" 
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button 
            v-else
            @click="handleSave" 
            :disabled="!isValid()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ formData.id ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

