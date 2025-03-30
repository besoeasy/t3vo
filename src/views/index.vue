<script setup>
import { ref, onMounted, computed } from "vue";
import { version } from "../../package.json";
import { fetchNotes, fetchBookmarks, fetchPasswords } from "@/db";
import {
  KeyIcon, BookmarkIcon, FileTextIcon, GithubIcon,
  AlertCircleIcon, UsersRound, ClipboardCopyIcon,
  CheckIcon, SettingsIcon, ShieldIcon, LockIcon,
  RefreshCwIcon, MinusIcon, PlusIcon, HashIcon,
  Hash, ActivityIcon, DownloadIcon, XIcon
} from "lucide-vue-next";
import { format } from "timeago.js";

// Stats

const isLoading = ref(false);

const stats = computed(() => [
  { title: "Passwords", icon: KeyIcon },
  { title: "Bookmarks", icon: BookmarkIcon },
  { title: "Notes", icon: FileTextIcon },
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
    password: "bg-indigo-600",
    bookmark: "bg-emerald-600",
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
    Passwords: "bg-indigo-600",
    Bookmarks: "bg-emerald-600",
    Notes: "bg-amber-600",
    Version: "bg-purple-600",
  };
  return colors[title] || "bg-gray-600";
};

// Password Generator
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
    // Implementation would go here
  } catch (error) {
    console.error("Error loading counts:", error);
  }
};

const fetchRecentActivities = async () => {
  try {
    isLoading.value = true;
    const [notes, bookmarks, passwords] = await Promise.all([
      fetchNotes(currentPage.value),
      fetchBookmarks(currentPage.value),
      fetchPasswords(currentPage.value)
    ]);

    const activities = [
      ...notes.map((note) => ({
        id: note.id,
        type: "note",
        message: note.data.title,
        updated_at: note.updatedAt,
      })),
      ...bookmarks.map((bookmark) => ({
        id: bookmark.id,
        type: "bookmark",
        message: bookmark.data.title,
        updated_at: bookmark.updatedAt,
      })),
      ...passwords.map((password) => ({
        id: password.id,
        type: "password",
        message: password.data.title,
        updated_at: password.updatedAt,
      })),
    ];

    // Sort by updated_at and update the activities list
    const sortedActivities = activities.sort((a, b) => b.updated_at - a.updated_at);

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

<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
    <div class="m-auto">

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Password Generator Card -->
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div class="p-5 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                  <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                    <LockIcon class="w-4 h-4 text-indigo-600" />
                  </div>
                  Password Generator
                </h2>
                <button @click="togglePasswordOptions"
                  class="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-indigo-50"
                  aria-label="Toggle password options">
                  <component :is="showPasswordOptions ? XIcon : SettingsIcon" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="p-5">
              <div
                class="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200 group hover:border-indigo-300 transition-all duration-200">
                <div class="flex items-center justify-between">
                  <p class="text-lg font-mono text-gray-800 truncate group-hover:text-indigo-700 transition-colors">
                    {{ suggestedPassword }}
                  </p>
                  <button @click="copyToClipboard"
                    class="text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors ml-2 p-1.5 rounded-full hover:bg-indigo-100"
                    :class="{ 'text-emerald-500 bg-emerald-50': passwordCopied }"
                    :aria-label="passwordCopied ? 'Password copied' : 'Copy password'">
                    <component :is="passwordCopied ? CheckIcon : ClipboardCopyIcon" class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button @click="generatePassword"
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                aria-label="Generate new password">
                <RefreshCwIcon class="w-4 h-4 mr-2" />
                Generate New Password
              </button>
            </div>

            <!-- Password Options Panel -->
            <div v-if="showPasswordOptions" class="px-5 py-4 border-t border-gray-100 bg-gray-50 animate-fadeIn">
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Password Length</label>
                  <div class="flex items-center">
                    <button @click="decreaseLength"
                      class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                      aria-label="Decrease password length">
                      <MinusIcon class="w-4 h-4" />
                    </button>
                    <span class="mx-3 text-sm font-medium w-6 text-center">{{ passwordLength }}</span>
                    <button @click="increaseLength"
                      class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                      aria-label="Increase password length">
                      <PlusIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700 flex items-center">
                    <HashIcon class="w-4 h-4 mr-2 text-gray-500" />
                    Include Symbols
                  </label>
                  <button class="w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200"
                    :class="includeSymbols ? 'bg-indigo-600' : 'bg-gray-300'"
                    @click="includeSymbols = !includeSymbols; generatePassword()" :aria-checked="includeSymbols"
                    role="switch" aria-label="Include symbols">
                    <div
                      class="absolute w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 top-0.5"
                      :class="includeSymbols ? 'translate-x-6' : 'translate-x-0.5'"></div>
                  </button>
                </div>

                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700 flex items-center">
                    <Hash class="w-4 h-4 mr-2 text-gray-500" />
                    Include Numbers
                  </label>
                  <button class="w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200"
                    :class="includeNumbers ? 'bg-indigo-600' : 'bg-gray-300'"
                    @click="includeNumbers = !includeNumbers; generatePassword()" :aria-checked="includeNumbers"
                    role="switch" aria-label="Include numbers">
                    <div
                      class="absolute w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 top-0.5"
                      :class="includeNumbers ? 'translate-x-6' : 'translate-x-0.5'"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Logs Section -->
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div class="p-5 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                  <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mr-3">
                    <ActivityIcon class="w-4 h-4 text-amber-600" />
                  </div>
                  Recent Activity
                </h2>
                <span class="text-sm text-gray-500">{{ recentActivities.length }} items</span>
              </div>
            </div>

            <div class="p-5">
              <div v-if="isLoading" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>

              <template v-else>
                <div class="space-y-3">
                  <div v-for="activity in recentActivities" :key="activity.id"
                    class="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-100">
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      :class="getActivityBgColor(activity.type)">
                      <component :is="getIcon(activity.type)" class="w-4 h-4 text-white" />
                    </div>
                    <div class="ml-3 flex-grow min-w-0">
                      <p class="text-gray-800 font-medium truncate">
                        {{ activity.message }}
                      </p>
                      <p class="text-gray-500 text-xs mt-0.5">{{ format(activity.updated_at) }}</p>
                    </div>
                  </div>
                </div>

                <div v-if="hasMoreActivities" class="mt-6 text-center">
                  <button @click="loadMoreActivities"
                    class="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    :disabled="isLoading">
                    <DownloadIcon class="w-4 h-4 mr-2" />
                    Load More
                  </button>
                </div>

                <div v-else-if="recentActivities.length === 0" class="py-8 text-center text-gray-500">
                  No recent activities found
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Open Source Card -->
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div class="p-5 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                  <UsersRound class="w-4 h-4 text-emerald-600" />
                </div>
                Open Source
              </h2>
            </div>

            <div class="p-5">
              <p class="text-gray-600 text-sm mb-4">
                We believe in the power of community-driven development. That's why T3VO is open source and available
                for anyone
                to contribute.
              </p>
              <div class="flex flex-col space-y-3">
                <a href="https://github.com/t3volabs/t3vo-app" target="_blank"
                  class="inline-flex items-center px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                  <GithubIcon class="h-4 w-4 mr-2 text-gray-700" />
                  View on GitHub
                </a>
                <a href="https://github.com/t3volabs/t3vo-app/issues" target="_blank"
                  class="inline-flex items-center px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                  <AlertCircleIcon class="h-4 w-4 mr-2 text-gray-700" />
                  Report Issue
                </a>
              </div>
            </div>
          </div>

          <!-- App Version Card -->
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div class="p-5 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                  <ShieldIcon class="w-4 h-4 text-purple-600" />
                </div>
                App Information
              </h2>
            </div>

            <div class="p-5">
              <div class="flex items-center justify-between py-2 border-b border-gray-100">
                <span class="text-sm text-gray-600">Version</span>
                <span class="text-sm font-medium text-gray-900">{{ version }}</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>