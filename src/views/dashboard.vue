<template>
  <div class="p-6">
    <!-- Search & Filter Bar -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search passwords, bookmarks, and notes..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex bg-gray-100 rounded-lg p-1">
          <button
            v-for="filter in filters"
            :key="filter.key"
            @click="activeFilter = filter.key"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeFilter === filter.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            <component :is="filter.icon" class="w-4 h-4 inline mr-2" />
            {{ filter.name }}
          </button>
        </div>

        <!-- Add Button -->
        <div class="relative">
          <button
            @click="showAddMenu = !showAddMenu"
            class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus class="w-4 h-4 mr-2" />
            Add New
          </button>

          <!-- Add Menu Dropdown -->
          <div
            v-if="showAddMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
          >
            <button
              v-for="addOption in addOptions"
              :key="addOption.type"
              @click="startAdding(addOption.type)"
              class="flex items-center w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              <component
                :is="addOption.icon"
                class="w-4 h-4 mr-3 text-gray-400"
              />
              {{ addOption.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Items Display -->
      <div
        v-for="item in filteredItems"
        :key="`${item.type}-${item.id}`"
        class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
      >
        <!-- Clickable card content -->
        <div
          @click="viewItemDetails(item)"
          class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <!-- Password Card -->
          <div v-if="item.type === 'password'" class="space-y-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-2">
                <Key class="w-5 h-5 text-blue-600" />
                <h3 class="font-semibold text-gray-900 truncate">
                  {{ item.title }}
                </h3>
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <div v-if="item.username" class="flex items-center space-x-2">
                <span class="text-gray-500">Username:</span>
                <span class="font-mono">{{ item.username }}</span>
              </div>

              <div class="flex items-center space-x-2">
                <span class="text-gray-500">Password:</span>
                <span class="font-mono">{{
                  item.visible ? item.password : "••••••••"
                }}</span>
              </div>

              <div v-if="item.totp30" class="flex items-center space-x-2">
                <span class="text-gray-500">2FA:</span>
                <span class="font-mono text-green-600">{{ item.totp30 }}</span>
              </div>
            </div>
          </div>

          <!-- Bookmark Card -->
          <div v-if="item.type === 'bookmark'" class="space-y-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-2">
                <Bookmark class="w-5 h-5 text-amber-600" />
                <h3 class="font-semibold text-gray-900 truncate">
                  {{ item.title }}
                </h3>
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <div class="text-blue-600 flex items-center space-x-1">
                <Globe class="w-3 h-3" />
                <span class="truncate">{{ item.url }}</span>
              </div>

              <p v-if="item.note" class="text-gray-600 line-clamp-2">
                {{ item.note }}
              </p>
            </div>
          </div>

          <!-- Note Card -->
          <div v-if="item.type === 'note'" class="space-y-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-2">
                <FileText class="w-5 h-5 text-green-600" />
                <h3 class="font-semibold text-gray-900 truncate">
                  {{ item.title }}
                </h3>
              </div>
            </div>

            <div class="text-sm">
              <p class="text-gray-600 line-clamp-3">{{ item.content }}</p>
            </div>
          </div>

          <!-- Updated timestamp -->
          <div
            class="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100"
          >
            <span>{{ formatDate(item.updated_at) }}</span>
            <span class="px-2 py-1 bg-gray-100 rounded-full capitalize">{{
              item.type
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
    </div>

    <!-- Load more trigger -->
    <div ref="loaderRef" class="h-4"></div>

    <!-- Add/Edit Modal -->
    <EditModal
      v-if="showEditModal"
      :item="editingItem"
      :type="editingType"
      :readOnly="isReadOnlyMode"
      @save="saveItem"
      @cancel="cancelEdit"
      @edit="handleEditFromReadOnly"
      @delete="handleDeleteFromModal"
      @copy="handleCopyFromModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
  fetchPasswords,
  fetchBookmarks,
  fetchNotes,
  addPasswordEntry,
  addBookmarkEntry,
  addNoteEntry,
  updatePasswordEntry,
  updateBookmarkEntry,
  updateNoteEntry,
  softDeleteEntry,
} from "@/db";
import {
  Search,
  Plus,
  Key,
  Bookmark,
  FileText,
  Globe,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash,
  RotateCcw,
} from "lucide-vue-next";
import { TOTP, Secret } from "otpauth";
import EditModal from "@/components/edit-modal.vue";
import { useInfiniteScroll } from "@/mixins.js";

// Reactive data
const searchQuery = ref("");
const activeFilter = ref("all");
const showAddMenu = ref(false);
const isLoading = ref(false);
const currentPage = ref(1);

// Data arrays
const passwords = ref([]);
const bookmarks = ref([]);
const notes = ref([]);

// Modal state
const showEditModal = ref(false);
const editingItem = ref(null);
const editingType = ref("");
const isReadOnlyMode = ref(false);

// Filter options
const filters = [
  { key: "all", name: "All", icon: RotateCcw },
  { key: "password", name: "Passwords", icon: Key },
  { key: "bookmark", name: "Bookmarks", icon: Bookmark },
  { key: "note", name: "Notes", icon: FileText },
];

// Add options
const addOptions = [
  { type: "password", name: "Password", icon: Key },
  { type: "bookmark", name: "Bookmark", icon: Bookmark },
  { type: "note", name: "Note", icon: FileText },
];

// TOTP Generation
const generateTOTP = (secret, period = 30) => {
  if (!secret) return "";
  try {
    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      algorithm: "SHA1",
      digits: 6,
      period,
    });
    return totp.generate();
  } catch (error) {
    return "";
  }
};

// Computed properties
const allItems = computed(() => {
  const items = [];

  // Add passwords
  passwords.value.forEach((p) => {
    items.push({
      ...p,
      type: "password",
      visible: false,
      totp30: p.totpSecret ? generateTOTP(p.totpSecret, 30) : "",
    });
  });

  // Add bookmarks
  bookmarks.value.forEach((b) => {
    items.push({
      ...b,
      type: "bookmark",
    });
  });

  // Add notes
  notes.value.forEach((n) => {
    items.push({
      ...n,
      type: "note",
    });
  });

  // Sort by updated date
  return items.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
});

const filteredItems = computed(() => {
  let items = allItems.value;

  // Filter by type
  if (activeFilter.value !== "all") {
    items = items.filter((item) => item.type === activeFilter.value);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter((item) => {
      return (
        item.title?.toLowerCase().includes(query) ||
        item.username?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.url?.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query) ||
        item.note?.toLowerCase().includes(query)
      );
    });
  }

  return items;
});

// Methods
const loadAllData = async () => {
  isLoading.value = true;
  try {
    const [passwordsData, bookmarksData, notesData] = await Promise.all([
      fetchPasswords(1, ""),
      fetchBookmarks(1, ""),
      fetchNotes(1, ""),
    ]);

    passwords.value = passwordsData.map((p) => ({
      id: p.id,
      title: p.data.title,
      username: p.data.username,
      email: p.data.email,
      password: p.data.password,
      totpSecret: p.data.totpSecret,
      urls: p.data.urls,
      updated_at: p.updatedAt,
    }));

    bookmarks.value = bookmarksData.map((b) => ({
      id: b.id,
      title: b.data.title,
      url: b.data.url,
      note: b.data.note,
      updated_at: b.updatedAt,
    }));

    notes.value = notesData.map((n) => ({
      id: n.id,
      title: n.data.title,
      content: n.data.content,
      updated_at: n.updatedAt,
    }));
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    isLoading.value = false;
  }
};

const startAdding = (type) => {
  editingType.value = type;
  editingItem.value = getEmptyItem(type);
  showEditModal.value = true;
  showAddMenu.value = false;
};

const getEmptyItem = (type) => {
  switch (type) {
    case "password":
      return {
        title: "",
        username: "",
        email: "",
        password: "",
        totpSecret: "",
        urls: "",
      };
    case "bookmark":
      return { title: "", url: "", note: "" };
    case "note":
      return { title: "", content: "" };
    default:
      return {};
  }
};

const editItem = (item) => {
  editingType.value = item.type;
  editingItem.value = { ...item };
  isReadOnlyMode.value = false;
  showEditModal.value = true;
};

const viewItemDetails = (item) => {
  editingType.value = item.type;
  editingItem.value = { ...item };
  isReadOnlyMode.value = true;
  showEditModal.value = true;
};

const handleEditFromReadOnly = (item) => {
  // Switch from read-only mode to edit mode
  isReadOnlyMode.value = false;
};

const handleDeleteFromModal = async (item) => {
  if (confirm(`Are you sure you want to delete this ${item.type}?`)) {
    try {
      await softDeleteEntry(item.id);
      await loadAllData();
      cancelEdit();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }
};

const handleCopyFromModal = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // You could add a toast notification here
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

const saveItem = async (data) => {
  try {
    if (data.id) {
      // Update existing item
      switch (editingType.value) {
        case "password":
          await updatePasswordEntry(data.id, data);
          break;
        case "bookmark":
          await updateBookmarkEntry(data.id, data);
          break;
        case "note":
          await updateNoteEntry(data.id, data);
          break;
      }
    } else {
      // Add new item
      switch (editingType.value) {
        case "password":
          await addPasswordEntry(data);
          break;
        case "bookmark":
          await addBookmarkEntry(data);
          break;
        case "note":
          await addNoteEntry(data);
          break;
      }
    }

    await loadAllData();
    cancelEdit();
  } catch (error) {
    console.error("Error saving item:", error);
  }
};

const cancelEdit = () => {
  showEditModal.value = false;
  editingItem.value = null;
  editingType.value = "";
  isReadOnlyMode.value = false;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // You could add a toast notification here
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadAllData();
});

// Close add menu when clicking outside
watch(showAddMenu, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      document.addEventListener(
        "click",
        () => {
          showAddMenu.value = false;
        },
        { once: true }
      );
    }, 100);
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
</style>
