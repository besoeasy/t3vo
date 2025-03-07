<template>
  <div class="min-h-screen bg-white p-4 md:p-8">
    <div class="m-auto">
      <div class="space-y-8">
        <!-- Top Row - Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Password Generator Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-900 flex items-center">
                  <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                    <LockIcon class="w-5 h-5 text-blue-600" />
                  </div>
                  Password Generator
                </h2>
                <button @click="togglePasswordOptions" class="text-gray-400 hover:text-gray-600 transition-colors">
                  <SettingsIcon class="w-5 h-5" />
                </button>
              </div>

              <div class="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100 group hover:border-blue-200 transition-all duration-200">
                <div class="flex items-center justify-between">
                  <p class="text-lg font-mono text-gray-800 truncate group-hover:text-blue-700 transition-colors">{{ suggestedPassword }}</p>
                  <button @click="copyToClipboard" class="text-gray-400 hover:text-blue-600 focus:outline-none transition-colors ml-2" :class="{ 'text-green-500': passwordCopied }">
                    <component :is="passwordCopied ? CheckIcon : ClipboardCopyIcon" class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button @click="generatePassword" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center">
                <RefreshCwIcon class="w-4 h-4 mr-2" />
                Generate New Password
              </button>
            </div>

            <!-- Password Options Panel -->
            <div v-if="showPasswordOptions" class="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50">
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Password Length</label>
                  <div class="flex items-center">
                    <button @click="decreaseLength" class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
                      <MinusIcon class="w-4 h-4" />
                    </button>
                    <span class="mx-3 text-sm font-medium">{{ passwordLength }}</span>
                    <button @click="increaseLength" class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors">
                      <PlusIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700 flex items-center">
                    <HashIcon class="w-4 h-4 mr-2 text-gray-500" />
                    Include Symbols
                  </label>
                  <div class="w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200" :class="includeSymbols ? 'bg-blue-600' : 'bg-gray-300'" @click="includeSymbols = !includeSymbols">
                    <div class="absolute w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 top-0.5" :class="includeSymbols ? 'translate-x-6' : 'translate-x-0.5'"></div>
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700 flex items-center">
                    <Hash class="w-4 h-4 mr-2 text-gray-500" />
                    Include Numbers
                  </label>
                  <div class="w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200" :class="includeNumbers ? 'bg-blue-600' : 'bg-gray-300'" @click="includeNumbers = !includeNumbers">
                    <div class="absolute w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 top-0.5" :class="includeNumbers ? 'translate-x-6' : 'translate-x-0.5'"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vault Stats Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-6">
            <div class="flex items-center mb-5">
              <div class="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                <ShieldIcon class="w-5 h-5 text-purple-600" />
              </div>
              <h2 class="text-xl font-bold text-gray-900">Your Vault</h2>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div v-for="(stat, index) in stats" :key="index" class="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200">
                <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="getStatBgColor(stat.title)">
                  <component :is="getStatIcon(stat.title)" class="w-5 h-5 text-white" />
                </div>
                <div class="ml-3">
                  <p class="text-sm text-gray-500">{{ stat.title }}</p>
                  <p class="text-lg font-semibold text-gray-900">{{ stat.count }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Open Source Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-6">
            <div class="flex items-center mb-5">
              <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                <UsersRound class="w-5 h-5 text-blue-600" />
              </div>
              <h2 class="text-xl font-bold text-gray-900">Open Source</h2>
            </div>

            <div class="flex flex-col">
              <p class="text-gray-600 mb-4">We believe in the power of community-driven development. That's why T3VO is open source and available for anyone to contribute.</p>
              <div class="text-sm space-x-6">
                <a href="https://github.com/t3volabs/t3vo-app" target="_blank" class="inline-flex items-center font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  <GithubIcon class="h-4 w-4 mr-1.5" />
                  View on GitHub
                </a>
                <a href="https://github.com/t3volabs/t3vo-app/issues" target="_blank" class="inline-flex items-center font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  <AlertCircleIcon class="h-4 w-4 mr-1.5" />
                  Report Issue
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Logs Section -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
              <div class="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mr-3">
                <ActivityIcon class="w-5 h-5 text-amber-600" />
              </div>
              <h2 class="text-xl font-bold text-gray-900">Activity Logs</h2>
            </div>
            <div class="text-sm text-gray-500">Showing recent activities</div>
          </div>

          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>

          <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center p-4 rounded-xl hover:bg-yellow-50 transition-all duration-200">
                <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="getActivityBgColor(activity.type)">
                  <component :is="getIcon(activity.type)" class="w-5 h-5 text-white" />
                </div>
                <div class="ml-3 flex-grow">
                  <p class="text-gray-800 font-medium truncate">
                    {{ activity.message.length > 30 ? activity.message.slice(0, 30) + "..." : activity.message }}
                  </p>
                  <p class="text-gray-500 text-xs mt-1">Updated : {{ format(activity.updated_at) }}</p>
                </div>
              </div>
            </div>

            <div v-if="hasMoreActivities" class="mt-8 text-center">
              <button @click="loadMoreActivities" class="inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors" :disabled="isLoading">
                <DownloadIcon class="w-4 h-4 mr-2" />
                Load More Activities
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { version } from "../../package.json";
import { fetchEntriesByType } from "@/db";
import { KeyIcon, BookmarkIcon, FileTextIcon, GithubIcon, AlertCircleIcon, UsersRound, ClipboardCopyIcon, CheckIcon, SettingsIcon, ShieldIcon, LockIcon, RefreshCwIcon, MinusIcon, PlusIcon, HashIcon, Hash, ActivityIcon, DownloadIcon } from "lucide-vue-next";
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
    password: "bg-blue-600",
    bookmark: "bg-green-600",
    note: "bg-amber-600",
  };
  return colors[type] || "bg-gray-600";
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
    Passwords: "bg-blue-600",
    Bookmarks: "bg-green-600",
    Notes: "bg-amber-600",
    Version: "bg-purple-600",
  };
  return colors[title] || "bg-gray-600";
};

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

  const charsetLength = charset.length;
  const randomValues = new Uint32Array(passwordLength.value);
  crypto.getRandomValues(randomValues);

  let password = "";

  for (let i = 0; i < randomValues.length; i++) {
    let randomValue = randomValues[i];

    // Reject values that would cause modulo bias
    while (randomValue >= 2 ** 32 - (2 ** 32 % charsetLength)) {
      randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
    }

    password += charset[randomValue % charsetLength];
  }

  suggestedPassword.value = password;
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

const loadData = async () => {
  try {
    savedPasswords.value = await fetchEntriesByType("password").then((entries) => entries.length);
    savedBookmarks.value = await fetchEntriesByType("bookmark").then((entries) => entries.length);
    savedNotes.value = await fetchEntriesByType("note").then((entries) => entries.length);
  } catch (error) {
    console.error("Error loading counts:", error);
  }
};

const fetchRecentActivities = async () => {
  try {
    isLoading.value = true;
    const [notes, bookmarks, passwords] = await Promise.all([
      fetchEntriesByType("note", currentPage.value),
      fetchEntriesByType("bookmark", currentPage.value),
      fetchEntriesByType("password", currentPage.value),
    ]);

    const activities = [
      ...notes.map((note) => ({
        ...note,
        type: "note",
        message: `${note.title}`,
      })),
      ...bookmarks.map((bookmark) => ({
        ...bookmark,
        type: "bookmark",
        message: `${bookmark.title}`,
      })),
      ...passwords.map((password) => ({
        ...password,
        type: "password",
        message: `${password.title}`,
      })),
    ];

    // Sort by updated_at and update the activities list
    const sortedActivities = activities
      .filter((activity) => !activity.deletedAt) // Filter out soft-deleted items
      .sort((a, b) => b.updatedAt - a.updatedAt);

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
