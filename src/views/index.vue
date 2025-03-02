<template>
  <div class="min-h-screen bg-[#f5f5f7] p-4 md:p-6">
    <div class="space-y-6">
      <!-- Top Row - Full Width Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Password Generator -->
        <div class="bg-white rounded-xl shadow-md p-6 border border-[#e6e6e6] hover:shadow-lg transition-shadow">
          <h2 class="text-xl font-bold text-[#1d1d1f] mb-4 flex items-center">
            <LockIcon class="w-5 h-5 mr-2 text-[#0066cc]" />
            Password Generator
          </h2>
          <div class="flex items-center justify-between bg-[#f5f5f7] p-4 rounded-xl mb-4 border border-[#e6e6e6]">
            <p class="text-lg font-mono text-[#1d1d1f] truncate">{{ suggestedPassword }}</p>
            <button @click="copyToClipboard" class="text-[#0066cc] hover:text-[#004499] focus:outline-none transition-colors ml-2" :class="{ 'text-[#34c759]': passwordCopied }">
              <component :is="passwordCopied ? CheckIcon : ClipboardCopyIcon" class="w-5 h-5" />
            </button>
          </div>
          <div class="flex items-center justify-between">
            <button @click="generatePassword" class="bg-[#0066cc] hover:bg-[#004499] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">Generate New</button>
            <div class="flex items-center">
              <button @click="togglePasswordOptions" class="text-[#0066cc] hover:text-[#004499] text-sm font-medium flex items-center">
                <SettingsIcon class="w-4 h-4 mr-1.5" />
                Options
              </button>
            </div>
          </div>

          <!-- Password Options Panel -->
          <div v-if="showPasswordOptions" class="mt-4 pt-4 border-t border-[#e6e6e6]">
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <label class="text-sm text-[#1d1d1f]">Password Length</label>
                <div class="flex items-center">
                  <button @click="decreaseLength" class="w-6 h-6 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]">-</button>
                  <span class="mx-2 text-sm">{{ passwordLength }}</span>
                  <button @click="increaseLength" class="w-6 h-6 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]">+</button>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <label class="text-sm text-[#1d1d1f]">Include Symbols</label>
                <div class="w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-200" :class="includeSymbols ? 'bg-[#34c759]' : 'bg-[#d1d1d6]'" @click="includeSymbols = !includeSymbols">
                  <div class="absolute w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 top-0.5" :class="includeSymbols ? 'translate-x-4' : 'translate-x-0.5'"></div>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <label class="text-sm text-[#1d1d1f]">Include Numbers</label>
                <div class="w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-200" :class="includeNumbers ? 'bg-[#34c759]' : 'bg-[#d1d1d6]'" @click="includeNumbers = !includeNumbers">
                  <div class="absolute w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 top-0.5" :class="includeNumbers ? 'translate-x-4' : 'translate-x-0.5'"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="bg-white rounded-xl shadow-md p-6 border border-[#e6e6e6] hover:shadow-lg transition-shadow">
          <h2 class="text-xl font-bold text-[#1d1d1f] mb-4 flex items-center">
            <ShieldIcon class="w-5 h-5 mr-2 text-[#5856d6]" />
            Your Vault
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="(stat, index) in stats" :key="index" class="flex items-center p-3 rounded-xl bg-[#f5f5f7] border border-[#e6e6e6] hover:bg-[#f0f0f2] transition-colors">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="getStatBgColor(stat.title)">
                <component :is="getStatIcon(stat.title)" class="w-5 h-5 text-white" />
              </div>
              <div class="ml-3">
                <p class="text-sm text-[#86868b]">{{ stat.title }}</p>
                <p class="text-lg font-medium text-[#1d1d1f]">{{ stat.count }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6 border border-[#e6e6e6] hover:shadow-lg transition-shadow">
          <h2 class="text-xl font-bold text-[#1d1d1f] mb-4 flex items-center">
            <UsersRound class="w-5 h-5 mr-2 text-[#0066cc]" />
            Open Source
          </h2>
          <div class="flex flex-col h-full">
            <p class="text-[#424245] mb-4 flex-grow">We believe in the power of community-driven development. That's why T3VO is open source and available for anyone to contribute.</p>
            <div class="flex flex-wrap gap-3 mt-auto">
              <a href="https://github.com/t3volabs/t3vo-app" target="_blank" class="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-[#1d1d1f] to-[#2d2d2f] hover:from-[#000000] hover:to-[#1d1d1f] transition-colors">
                <GithubIcon class="h-5 w-5 mr-2" />
                View on GitHub
              </a>
              <a href="https://github.com/t3volabs/t3vo-app/issues" target="_blank" class="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e6e6e6] border border-[#e6e6e6] transition-colors">
                <AlertCircleIcon class="h-5 w-5 mr-2" />
                Report Issue
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity (Full Width) -->
      <div class="bg-white rounded-xl shadow-md p-6 border border-[#e6e6e6] hover:shadow-lg transition-shadow">
        <h2 class="text-xl font-bold text-[#1d1d1f] mb-4 flex items-center">
          <FileTextIcon class="w-5 h-5 mr-2 text-[#ff9500]" />
          Activity Logs
        </h2>
        <div v-if="isLoading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
        </div>
        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center text-sm p-3 rounded-xl bg-[#f5f5f7] border border-[#e6e6e6] hover:bg-[#f0f0f2] transition-colors">
              <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="getActivityBgColor(activity.type)">
                <component :is="getIcon(activity.type)" class="w-4 h-4 text-white" />
              </div>
              <div class="ml-3 flex-grow">
                <p class="text-[#1d1d1f] font-medium truncate">{{ activity.message }}</p>
                <p class="text-[#86868b] text-xs">{{ format(activity.updated_at) }}</p>
              </div>
            </div>
          </div>
          <div v-if="hasMoreActivities" class="mt-6 text-center">
            <button @click="loadMoreActivities" class="bg-[#f5f5f7] hover:bg-[#e6e6e6] text-[#1d1d1f] px-5 py-2.5 rounded-full text-sm font-medium transition-colors border border-[#e6e6e6]" :disabled="isLoading">Load More Activities</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { version } from "../../package.json";
import { db, fetchNotes, fetchBookmarks, fetchPasswords } from "@/db";
import { KeyIcon, BookmarkIcon, FileTextIcon, GithubIcon, AlertCircleIcon, UsersRound, ClipboardCopyIcon, CheckIcon, SettingsIcon, ShieldIcon, LockIcon } from "lucide-vue-next";
import { format } from "timeago.js";

// Stats
const savedPasswords = ref(0);
const savedBookmarks = ref(0);
const savedNotes = ref(0);
const isLoading = ref(false);

const stats = computed(() => [
  { title: "Passwords", count: savedPasswords.value, icon: KeyIcon },
  { title: "Bookmarks", count: savedBookmarks.value, icon: BookmarkIcon },
  { title: "Notes", count: savedNotes.value, icon: FileTextIcon },
  { title: "Version", count: version, icon: ShieldIcon },
]);

// Recent Activities
const recentActivities = ref([]);
const currentPage = ref(1);
const hasMoreActivities = ref(true);

const getIcon = (type) => {
  const icons = { password: KeyIcon, bookmark: BookmarkIcon, note: FileTextIcon };
  return icons[type] || FileTextIcon;
};

const getActivityBgColor = (type) => {
  const colors = {
    password: "bg-[#0066cc]",
    bookmark: "bg-[#34c759]",
    note: "bg-[#ff9500]",
  };
  return colors[type] || "bg-[#8e8e93]";
};

const getStatIcon = (title) => {
  const icons = {
    Passwords: KeyIcon,
    Bookmarks: BookmarkIcon,
    Notes: FileTextIcon,
    Version: ShieldIcon,
  };
  return icons[title] || ShieldIcon;
};

const getStatBgColor = (title) => {
  const colors = {
    Passwords: "bg-[#0066cc]",
    Bookmarks: "bg-[#34c759]",
    Notes: "bg-[#ff9500]",
    Version: "bg-[#5856d6]",
  };
  return colors[title] || "bg-[#8e8e93]";
};

// Password Suggester
const suggestedPassword = ref("");
const passwordCopied = ref(false);
const showPasswordOptions = ref(false);
const passwordLength = ref(16);
const includeSymbols = ref(true);
const includeNumbers = ref(true);

const togglePasswordOptions = () => {
  showPasswordOptions.value = !showPasswordOptions.value;
};

const increaseLength = () => {
  if (passwordLength.value < 32) {
    passwordLength.value++;
    generatePassword();
  }
};

const decreaseLength = () => {
  if (passwordLength.value > 8) {
    passwordLength.value--;
    generatePassword();
  }
};

const generatePassword = () => {
  let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if (includeNumbers.value) {
    charset += "0123456789";
  }

  if (includeSymbols.value) {
    charset += "!@#$%^&*()_+{}[]|:;<>,.?~";
  }

  suggestedPassword.value = Array.from(crypto.getRandomValues(new Uint32Array(passwordLength.value)))
    .map((x) => charset[x % charset.length])
    .join("");

  passwordCopied.value = false;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(suggestedPassword.value);
    passwordCopied.value = true;
    setTimeout(() => {
      passwordCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy password: ", err);
  }
};

// Data fetching
const loadData = async () => {
  try {
    // Only count non-deleted items using filter
    savedPasswords.value = await db.passwords.filter((password) => !password.deleted_at).count();

    savedBookmarks.value = await db.bookmarks.filter((bookmark) => !bookmark.deleted_at).count();

    savedNotes.value = await db.notes.filter((note) => !note.deleted_at).count();
  } catch (error) {
    console.error("Error loading counts:", error);
  }
};

const fetchRecentActivities = async () => {
  try {
    isLoading.value = true;
    const [notes, bookmarks, passwords] = await Promise.all([fetchNotes(currentPage.value), fetchBookmarks(currentPage.value), fetchPasswords(currentPage.value)]);

    const activities = [
      ...notes.map((note) => ({
        ...note,
        type: "note",
        message: `Updated note: ${note.title}`,
      })),
      ...bookmarks.map((bookmark) => ({
        ...bookmark,
        type: "bookmark",
        message: `Updated bookmark: ${bookmark.title}`,
      })),
      ...passwords.map((password) => ({
        ...password,
        type: "password",
        message: `Updated password: ${password.title}`,
      })),
    ];

    // Sort by updated_at and update the activities list
    const sortedActivities = activities
      .filter((activity) => !activity.deleted_at) // Filter out soft-deleted items
      .sort((a, b) => b.updated_at - a.updated_at);

    if (currentPage.value === 1) {
      recentActivities.value = sortedActivities;
    } else {
      recentActivities.value = [...recentActivities.value, ...sortedActivities];
    }

    // Update hasMore flag based on received items
    hasMoreActivities.value = sortedActivities.length > 0;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
  } finally {
    isLoading.value = false;
  }
};

const loadMoreActivities = () => {
  currentPage.value++;
  fetchRecentActivities();
};

// Lifecycle hooks
onMounted(() => {
  loadData();
  fetchRecentActivities();
  generatePassword();
});
</script>
