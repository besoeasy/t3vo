<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { version } from "../../package.json";
import { fetchNotes, fetchBookmarks, fetchPasswords } from "@/db";
import {
  KeyIcon, BookmarkIcon, FileTextIcon, GithubIcon,
  AlertCircleIcon, UsersRound, ShieldIcon,
  ActivityIcon, DownloadIcon, CalendarIcon,
  SearchIcon, FilterIcon, XIcon, RefreshCwIcon
} from "lucide-vue-next";
import { format } from "timeago.js";

import PasswordGenerator from "@/components/PasswordGenerator.vue";

const isLoading = ref(false);
const isRefreshing = ref(false);
const searchQuery = ref("");
const selectedFilter = ref("all");

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

const fetchRecentActivities = async (refresh = false) => {
  try {
    if (refresh) {
      isRefreshing.value = true;
      currentPage.value = 1;
    } else {
      isLoading.value = true;
    }
    
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
    isRefreshing.value = false;
  }
};

const loadMoreActivities = () => {
  currentPage.value++;
  fetchRecentActivities();
};

const refreshActivities = () => {
  fetchRecentActivities(true);
};

const resetSearch = () => {
  searchQuery.value = "";
};

const setFilter = (filter) => {
  selectedFilter.value = filter;
};

// Filtered activities based on search and type filter
const filteredActivities = computed(() => {
  let filtered = [...recentActivities.value];
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(activity => 
      activity.message.toLowerCase().includes(query)
    );
  }
  
  // Apply type filter
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(activity => activity.type === selectedFilter.value);
  }
  
  return filtered;
});

// Group activities by date for organization
const groupedActivities = computed(() => {
  const groups = {};

  filteredActivities.value.forEach(activity => {
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

// Activity counts by type
const activityCounts = computed(() => {
  const counts = {
    all: recentActivities.value.length,
    password: 0,
    bookmark: 0,
    note: 0
  };
  
  recentActivities.value.forEach(activity => {
    if (counts[activity.type] !== undefined) {
      counts[activity.type]++;
    }
  });
  
  return counts;
});

// Reset to page 1 when search or filter changes
watch([searchQuery, selectedFilter], () => {
  // If we had pagination state that depended on the filtered results,
  // we would reset it here
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
            <a href="https://github.com/besoeasy/t3vo" target="_blank"
              class="inline-flex items-center px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
              <GithubIcon class="h-4 w-4 mr-2 text-gray-700" />
              View on GitHub
            </a>
            <a href="https://github.com/besoeasy/t3vo/issues" target="_blank"
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

    <!-- Activity Timeline -->
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
          <div class="flex items-center gap-2">
            <button @click="refreshActivities" 
                    class="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    :disabled="isRefreshing"
                    title="Refresh">
              <RefreshCwIcon class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" />
            </button>
            <span class="text-sm text-gray-500">{{ filteredActivities.length }} items</span>
          </div>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="p-4 bg-gray-50 border-b border-gray-100">
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Search input -->
          <div class="relative flex-grow">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search updates..."
              class="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              v-if="searchQuery"
              @click="resetSearch"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XIcon class="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <!-- Filter buttons -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 flex-nowrap">
            <button
              @click="setFilter('all')"
              class="px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors"
              :class="selectedFilter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >
              All ({{ activityCounts.all }})
            </button>
            <button
              @click="setFilter('password')"
              class="px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors"
              :class="selectedFilter === 'password' ? 'bg-indigo-100 text-indigo-800' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >
              <KeyIcon class="inline-block w-3 h-3 mr-1" />
              Passwords ({{ activityCounts.password }})
            </button>
            <button
              @click="setFilter('bookmark')"
              class="px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors"
              :class="selectedFilter === 'bookmark' ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >
              <BookmarkIcon class="inline-block w-3 h-3 mr-1" />
              Bookmarks ({{ activityCounts.bookmark }})
            </button>
            <button
              @click="setFilter('note')"
              class="px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors"
              :class="selectedFilter === 'note' ? 'bg-amber-100 text-amber-800' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >
              <FileTextIcon class="inline-block w-3 h-3 mr-1" />
              Notes ({{ activityCounts.note }})
            </button>
          </div>
        </div>
      </div>

      <div class="p-5">
        <div v-if="isLoading && currentPage.value === 1" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>

        <template v-else>
          <!-- Card-based Activity Timeline -->
          <div class="space-y-6">
            <!-- Empty state when filtered -->
            <div v-if="filteredActivities.length === 0 && recentActivities.length > 0" class="py-8 text-center">
              <div class="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <SearchIcon class="w-8 h-8 text-gray-400" />
              </div>
              <h3 class="text-gray-700 font-medium mb-1">No matching updates</h3>
              <p class="text-gray-500 text-sm">
                Try adjusting your search or filter to find what you're looking for
              </p>
              <button @click="resetSearch" class="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-800">
                Clear search
              </button>
            </div>

            <!-- Date groups -->
            <div v-else v-for="(group, index) in groupedActivities" :key="index" class="space-y-4">
              <!-- Date header with sticky positioning -->
              <div class="sticky top-0 z-10 bg-white py-2 flex items-center gap-2">
                <div class="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                  <CalendarIcon class="w-3.5 h-3.5 text-gray-600" />
                </div>
                <h3 class="text-sm font-medium text-gray-700">{{ group.formattedDate }}</h3>
                <div class="h-px bg-gray-200 flex-grow"></div>
              </div>

              <!-- Activity cards with hover effects -->
              <div class="space-y-3">
                <div v-for="activity in group.items" :key="activity.id"
                  class="bg-white rounded-lg border transition-all duration-200 hover:shadow-md overflow-hidden transform hover:-translate-y-0.5"
                  :class="getActivityBorderColor(activity.type)">
                  <!-- Card content -->
                  <div class="p-4 flex items-start gap-3">
                    <!-- Icon with pulse animation on hover -->
                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:animate-pulse"
                      :class="getActivityLightBgColor(activity.type)">
                      <component :is="getIcon(activity.type)" class="w-4 h-4"
                        :class="getActivityTextColor(activity.type)" />
                    </div>

                    <!-- Content -->
                    <div class="flex-grow min-w-0">
                      <div class="flex items-center gap-2 mb-1 flex-wrap">
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

            <!-- Empty state when no activities -->
            <div v-if="recentActivities.length === 0" class="py-8 text-center">
              <div class="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ActivityIcon class="w-8 h-8 text-gray-400" />
              </div>
              <h3 class="text-gray-700 font-medium mb-1">No recent activities</h3>
              <p class="text-gray-500 text-sm">
                Your recent activities will appear here
              </p>
            </div>

            <!-- Load more button -->
            <div v-if="hasMoreActivities && !searchQuery && selectedFilter === 'all'" class="flex justify-center mt-4">
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