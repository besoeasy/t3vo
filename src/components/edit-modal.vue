<script setup>
import { ref, watch, computed } from "vue";
import { X, Key, Bookmark, FileText, Eye, EyeOff } from "lucide-vue-next";
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
  }
});

const emit = defineEmits(["save", "cancel"]);

// Form data
const formData = ref({});
const showPassword = ref(false);
const showPasswordGenerator = ref(false);

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
watch(() => props.item, initializeForm, { immediate: true, deep: true });

// Add event listener
document.addEventListener("keydown", handleKeyDown);

// Cleanup
const cleanup = () => {
  document.removeEventListener("keydown", handleKeyDown);
};

// Cleanup on unmount
import { onBeforeUnmount } from "vue";
onBeforeUnmount(cleanup);
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
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter title"
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                v-model="formData.username"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                type="button"
                @click="showPasswordGenerator = !showPasswordGenerator"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate
              </button>
            </div>
            
            <!-- Password Generator -->
            <div v-if="showPasswordGenerator" class="mt-4 p-4 bg-gray-50 rounded-lg">
              <PasswordGenerator @generated="handlePasswordGenerated" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">TOTP Secret</label>
            <input
              v-model="formData.totpSecret"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter TOTP secret (optional)"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">URLs</label>
            <textarea
              v-model="formData.urls"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter title (auto-generated if empty)"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <textarea
              v-model="formData.note"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter note title"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              v-model="formData.content"
              rows="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your note content here..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button 
          @click="handleCancel" 
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="handleSave" 
          :disabled="!isValid()"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ formData.id ? 'Update' : 'Create' }}
        </button>
      </div>
    </div>
  </div>
</template>

