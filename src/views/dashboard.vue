<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500">
            Manage your passwords, bookmarks, and notes
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span>{{ filteredItems.length }} items</span>
            <span v-if="searchQuery">• Filtered</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search passwords, bookmarks, and notes..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
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
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              activeFilter === filter.key
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
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
            class="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
          >
            <Plus class="w-4 h-4 mr-2" />
            Add New
          </button>

          <!-- Add Menu Dropdown -->
          <div
            v-if="showAddMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 animate-in slide-in-from-top-2 duration-200"
          >
            <button
              v-for="addOption in addOptions"
              :key="addOption.type"
              @click="startAdding(addOption.type)"
              class="flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors duration-200"
            >
              <component
                :is="addOption.icon"
                class="w-4 h-4 mr-3 text-gray-400"
              />
              <span class="text-sm font-medium text-gray-700">{{ addOption.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Items Display -->
      <div
        v-for="item in filteredItems"
        :key="`${item.type}-${item.id}`"
        class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden group"
      >
        <!-- Clickable card content -->
        <div
          @click="viewItemDetails(item)"
          class="p-6 cursor-pointer hover:bg-gray-25 transition-colors duration-200"
        >
          <!-- Password Card -->
          <div v-if="item.type === 'password'" class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-50 rounded-lg">
                  <Key class="w-5 h-5 text-blue-600" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-gray-900 truncate text-lg">
                    {{ item.title }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">Password Entry</p>
                </div>
              </div>
            </div>

            <div class="space-y-3 text-sm">
              <div v-if="item.username" class="flex items-center justify-between">
                <span class="text-gray-500 font-medium">Username:</span>
                <span class="font-mono text-gray-900 truncate ml-2">{{ item.username }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-500 font-medium">Password:</span>
                <span class="font-mono text-gray-900">{{
                  item.visible ? item.password : "••••••••"
                }}</span>
              </div>

              <div v-if="item.totp30" class="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                <span class="text-green-700 font-medium text-xs">2FA Code:</span>
                <span class="font-mono text-green-800 font-semibold">{{ item.totp30 }}</span>
              </div>
            </div>
          </div>

          <!-- Bookmark Card -->
          <div v-if="item.type === 'bookmark'" class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-amber-50 rounded-lg">
                  <Bookmark class="w-5 h-5 text-amber-600" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-gray-900 truncate text-lg">
                    {{ item.title }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">Bookmark</p>
                </div>
              </div>
            </div>

            <div class="space-y-3 text-sm">
              <div class="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <Globe class="w-4 h-4 flex-shrink-0" />
                <span class="truncate font-medium">{{ item.url }}</span>
              </div>

              <p v-if="item.note" class="text-gray-600 line-clamp-2 leading-relaxed">
                {{ item.note }}
              </p>
            </div>
          </div>

          <!-- Note Card -->
          <div v-if="item.type === 'note'" class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-green-50 rounded-lg">
                  <FileText class="w-5 h-5 text-green-600" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-gray-900 truncate text-lg">
                    {{ item.title }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">Note</p>
                </div>
              </div>
            </div>

            <div class="text-sm">
              <p class="text-gray-600 line-clamp-3 leading-relaxed">{{ item.content }}</p>
            </div>
          </div>

          <!-- Updated timestamp -->
          <div class="flex items-center justify-between text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
            <span class="flex items-center space-x-1">
              <span>Updated {{ formatDate(item.updated_at) }}</span>
            </span>
            <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize font-medium">
              {{ item.type }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p class="text-sm text-gray-500">Loading your data...</p>
      </div>
    </div>

    <!-- Load more indicator -->
    <div v-if="isLoadingMore" class="flex justify-center py-8">
      <div class="flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="text-sm text-gray-500">Loading more items...</span>
      </div>
    </div>

    <!-- No more data indicator -->
    <div v-if="!isLoading && !isLoadingMore && !hasMoreData && filteredItems.length > 0" class="text-center py-8">
      <div class="bg-gray-50 rounded-lg p-6">
        <p class="text-gray-500 font-medium">✨ All items loaded</p>
        <p class="text-sm text-gray-400 mt-1">No more items to display</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!isLoading && filteredItems.length === 0" class="text-center py-16">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div class="text-gray-400 mb-6">
          <FileText class="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 class="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
          <p class="text-gray-500 max-w-md mx-auto">
            {{ searchQuery ? 
                'Try adjusting your search terms or filters to find what you\'re looking for.' :
                'Get started by adding your first password, bookmark, or note using the "Add New" button above.'
            }}
          </p>
        </div>
        <button
          v-if="!searchQuery"
          @click="showAddMenu = true"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Your First Item
        </button>
      </div>
    </div>

    <!-- Manual load more button for testing -->
    <div v-if="hasMoreData && !isLoading" class="flex justify-center py-6">
      <button 
        @click="loadMore" 
        :disabled="isLoadingMore"
        class="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
      >
        <component :is="isLoadingMore ? 'RotateCw' : 'Plus'" 
                   :class="[isLoadingMore ? 'animate-spin' : '', 'w-4 h-4 mr-2']" />
        {{ isLoadingMore ? 'Loading...' : 'Load More Items' }}
      </button>
    </div>

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
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
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
  RotateCw,
} from "lucide-vue-next";
import { TOTP, Secret } from "otpauth";
import EditModal from "@/components/edit-modal.vue";
import { useInfiniteScroll } from "@/mixins.js";

// Reactive data
const searchQuery = ref("");
const activeFilter = ref("all");
const showAddMenu = ref(false);
const isLoading = ref(false);
const isLoadingMore = ref(false);

// Pagination state for each type
const passwordsPage = ref(1);
const bookmarksPage = ref(1);
const notesPage = ref(1);
const passwordsHasMore = ref(true);
const bookmarksHasMore = ref(true);
const notesHasMore = ref(true);
const hasMoreData = ref(true);

// Data arrays
const passwords = ref([]);
const bookmarks = ref([]);
const notes = ref([]);

// Modal state
const showEditModal = ref(false);
const editingItem = ref(null);
const editingType = ref("");
const isReadOnlyMode = ref(false);
const loaderRef = ref(null);

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
const loadAllData = async (isInitial = true) => {
  if (isInitial) {
    isLoading.value = true;
    // Reset pagination state
    passwordsPage.value = 1;
    bookmarksPage.value = 1;
    notesPage.value = 1;
    passwordsHasMore.value = true;
    bookmarksHasMore.value = true;
    notesHasMore.value = true;
    // Clear existing data
    passwords.value = [];
    bookmarks.value = [];
    notes.value = [];
  } else {
    isLoadingMore.value = true;
  }

  try {
    // Determine which types to load based on current filter
    const shouldLoadPasswords = activeFilter.value === 'all' || activeFilter.value === 'password';
    const shouldLoadBookmarks = activeFilter.value === 'all' || activeFilter.value === 'bookmark';
    const shouldLoadNotes = activeFilter.value === 'all' || activeFilter.value === 'note';

    const promises = [];
    let passwordsData = [], bookmarksData = [], notesData = [];

    // For initial load, always try to load. For subsequent loads, check hasMore flags
    if (shouldLoadPasswords && (isInitial || passwordsHasMore.value)) {
      promises.push(fetchPasswords(passwordsPage.value, searchQuery.value));
    } else {
      promises.push(Promise.resolve([]));
    }

    if (shouldLoadBookmarks && (isInitial || bookmarksHasMore.value)) {
      promises.push(fetchBookmarks(bookmarksPage.value, searchQuery.value));
    } else {
      promises.push(Promise.resolve([]));
    }

    if (shouldLoadNotes && (isInitial || notesHasMore.value)) {
      promises.push(fetchNotes(notesPage.value, searchQuery.value));
    } else {
      promises.push(Promise.resolve([]));
    }

    [passwordsData, bookmarksData, notesData] = await Promise.all(promises);

    console.log('Data fetched:', {
      passwords: passwordsData.length,
      bookmarks: bookmarksData.length,
      notes: notesData.length,
      isInitial,
      activeFilter: activeFilter.value
    });

    // Check if we have more data for each type (assuming 10 items per page)
    passwordsHasMore.value = shouldLoadPasswords ? passwordsData.length === 10 : false;
    bookmarksHasMore.value = shouldLoadBookmarks ? bookmarksData.length === 10 : false;
    notesHasMore.value = shouldLoadNotes ? notesData.length === 10 : false;

    const newPasswords = passwordsData.map((p) => ({
      id: p.id,
      title: p.data.title,
      username: p.data.username,
      email: p.data.email,
      password: p.data.password,
      totpSecret: p.data.totpSecret,
      urls: p.data.urls,
      updated_at: p.updatedAt,
    }));

    const newBookmarks = bookmarksData.map((b) => ({
      id: b.id,
      title: b.data.title,
      url: b.data.url,
      note: b.data.note,
      updated_at: b.updatedAt,
    }));

    const newNotes = notesData.map((n) => ({
      id: n.id,
      title: n.data.title,
      content: n.data.content,
      updated_at: n.updatedAt,
    }));

    if (isInitial) {
      passwords.value = newPasswords;
      bookmarks.value = newBookmarks;
      notes.value = newNotes;
    } else {
      // Append new data to existing arrays
      passwords.value.push(...newPasswords);
      bookmarks.value.push(...newBookmarks);
      notes.value.push(...newNotes);
    }

    // Update pagination counters for next load only if data was actually loaded
    if (passwordsData.length > 0 && shouldLoadPasswords) passwordsPage.value++;
    if (bookmarksData.length > 0 && shouldLoadBookmarks) bookmarksPage.value++;
    if (notesData.length > 0 && shouldLoadNotes) notesPage.value++;

    // Update hasMoreData based on whether any type has more data
    hasMoreData.value = passwordsHasMore.value || bookmarksHasMore.value || notesHasMore.value;

  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const loadMore = async () => {
  console.log('LoadMore triggered, checking conditions:', {
    isLoading: isLoading.value,
    isLoadingMore: isLoadingMore.value,
    hasMoreData: hasMoreData.value,
    passwordsHasMore: passwordsHasMore.value,
    bookmarksHasMore: bookmarksHasMore.value,
    notesHasMore: notesHasMore.value
  });
  
  if (isLoading.value || isLoadingMore.value || !hasMoreData.value) {
    console.log('LoadMore skipped due to conditions');
    return;
  }
  
  console.log('LoadMore executing...');
  await loadAllData(false);
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
      await loadAllData(true);
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

    await loadAllData(true);
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

// Infinite scroll setup
const { observeElement, unobserveElement } = useInfiniteScroll(loadMore);

// Lifecycle
onMounted(async () => {
  console.log('Dashboard mounted, loading initial data...');
  await loadAllData(true);
  
  // Set up infinite scroll observer with a slight delay
  setTimeout(() => {
    if (loaderRef.value) {
      console.log('Setting up infinite scroll observer');
      observeElement(loaderRef.value);
    } else {
      console.warn('Loader ref not found');
    }
  }, 100);
});

onBeforeUnmount(() => {
  if (loaderRef.value) {
    unobserveElement(loaderRef.value);
  }
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

// Reset pagination when search query changes
watch(searchQuery, () => {
  loadAllData(true);
});

// Reset pagination when active filter changes
watch(activeFilter, () => {
  loadAllData(true);
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
