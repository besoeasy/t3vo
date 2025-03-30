<script setup>
import { ref, onMounted, computed } from "vue";
import { version } from "../../package.json";
import { fetchNotes, fetchBookmarks, fetchPasswords } from "@/db";
import {
  KeyIcon, BookmarkIcon, FileTextIcon, GithubIcon,
  AlertCircleIcon, UsersRound, ShieldIcon,
  ActivityIcon, DownloadIcon, CalendarIcon
} from "lucide-vue-next";
import { format } from "timeago.js";

import PasswordGenerator from "@/components/PasswordGenerator.vue";

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

const getActivityLightBgColor = (type) => {
  const colors = {
    password: "bg-indigo-50",
    bookmark: "bg-emerald-50",
    note: "bg-amber-50",
  };
  return colors[type] || "bg-gray-50";
};

const getActivityTextColor = (type) => {
  const colors = {
    password: "text-indigo-600",
    bookmark: "text-emerald-600",
    note: "text-amber-600",
  };
  return colors[type] || "text-gray-600";
};

const getActivityBorderColor = (type) => {
  const colors = {
    password: "border-indigo-100",
    bookmark: "border-emerald-100",
    note: "border-amber-100",
  };
  return colors[type] || "border-gray-100";
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

// Group activities by date for organization
const groupedActivities = computed(() => {
  const groups = {};

  recentActivities.value.forEach(activity => {
    // Create a simple date string (without time) for grouping
    const date = new Date(activity.updated_at);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: date,
        formattedDate: new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(date),
        items: []
      };
    }

    groups[dateKey].items.push(activity);
  });

  // Convert to array and sort by date (newest first)
  return Object.values(groups).sort((a, b) => b.date - a.date);
});

// Lifecycle hooks
onMounted(() => {
  loadData();
  fetchRecentActivities();
});
</script>

<template>
  <div class="space-y-6">
    <PasswordGenerator />

    <!-- Open Source and App Info Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            for anyone to contribute.
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

    <!-- Activity Timeline (Now at the bottom) -->
    <div
      class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div class="p-5 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mr-3">
              <ActivityIcon class="w-4 h-4 text-amber-600" />
            </div>
            Recent Updates
          </h2>
          <span class="text-sm text-gray-500">{{ recentActivities.length }} items</span>
        </div>
      </div>

      <div class="p-5">
        <div v-if="isLoading && currentPage.value === 1" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>

        <template v-else>
          <!-- Card-based Activity Timeline -->
          <div class="space-y-6">
            <!-- Date groups -->
            <div v-for="(group, index) in groupedActivities" :key="index" class="space-y-4">
              <!-- Date header -->
              <div class="flex items-center gap-2 mb-3">
                <CalendarIcon class="w-4 h-4 text-gray-500" />
                <h3 class="text-sm font-medium text-gray-700">{{ group.formattedDate }}</h3>
              </div>

              <!-- Activity cards in a single column -->
              <div class="space-y-3">
                <div v-for="activity in group.items" :key="activity.id"
                  class="bg-white rounded-lg border transition-all duration-200 hover:shadow-md overflow-hidden"
                  :class="getActivityBorderColor(activity.type)">
                  <!-- Card content -->
                  <div class="p-4 flex items-start gap-3">
                    <!-- Icon -->
                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      :class="getActivityLightBgColor(activity.type)">
                      <component :is="getIcon(activity.type)" class="w-4 h-4"
                        :class="getActivityTextColor(activity.type)" />
                    </div>

                    <!-- Content -->
                    <div class="flex-grow min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-medium uppercase px-2 py-0.5 rounded-full"
                          :class="`${getActivityLightBgColor(activity.type)} ${getActivityTextColor(activity.type)}`">
                          {{ activity.type }}
                        </span>
                        <span class="text-xs text-gray-500">{{ format(activity.updated_at) }}</span>
                      </div>
                      <p class="text-gray-800 font-medium text-sm">
                        {{ activity.message }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="recentActivities.length === 0" class="py-8 text-center text-gray-500">
              No recent activities found
            </div>

            <!-- Load more button -->
            <div v-if="hasMoreActivities" class="flex justify-center mt-4">
              <button @click="loadMoreActivities"
                class="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                :disabled="isLoading">
                <DownloadIcon v-if="!isLoading" class="w-4 h-4 mr-2" />
                <div v-else
                  class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                {{ isLoading ? 'Loading...' : 'Load More' }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

</template>