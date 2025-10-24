<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8 pt-16 md:pt-8">
    <!-- Page Title -->
    <h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-2">Statistics</h2>
    <p class="text-gray-600 mb-6 md:mb-8">Overview of your notes and app status</p>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>

        <!-- Stats Grid -->
        <div v-else class="space-y-6">
          <!-- Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Total Notes -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-600">Total Notes</h3>
                <FileText class="w-5 h-5 text-blue-600" />
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalNotes }}</p>
            </div>

            <!-- Deleted Notes -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-600">Deleted Notes</h3>
                <Trash2 class="w-5 h-5 text-red-600" />
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ stats.deletedNotes }}</p>
              <p v-if="stats.deletedNotes > 0" class="text-xs text-gray-500 mt-1">Automatically purged after 90 days</p>
            </div>

            <!-- Created Date -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-600">First Note Created</h3>
                <Calendar class="w-5 h-5 text-green-600" />
              </div>
              <p class="text-lg font-semibold text-gray-900">{{ stats.oldestNoteDate }}</p>
            </div>
          </div>

          <!-- Storage Info -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HardDrive class="w-5 h-5 mr-2" />
              Storage
            </h3>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Database Name</span>
                <span class="text-sm font-mono font-medium text-gray-900">{{ stats.dbName }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">App Version</span>
                <span class="text-sm font-medium text-gray-900">{{ stats.appVersion }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Encryption</span>
                <span class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  <Shield class="w-3 h-3 mr-1" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/db.js";

import { version } from "@/../package.json";

import { FileText, Calendar, HardDrive, Shield, Trash2 } from "lucide-vue-next";

const isLoading = ref(true);
const stats = ref({
  totalNotes: 0,
  deletedNotes: 0,
  oldestNoteDate: "N/A",
  dbName: "",
  appVersion: version,
});

const loadStats = async () => {
  isLoading.value = true;
  try {
    // Get active notes
    const notes = await db.notes.filter((note) => note.deletedAt === null || note.deletedAt === undefined).toArray();

    stats.value.totalNotes = notes.length;

    // Get deleted notes
    const deletedNotes = await db.notes.filter((note) => note.deletedAt !== null && note.deletedAt !== undefined).toArray();

    stats.value.deletedNotes = deletedNotes.length;

    // Find oldest note date
    if (notes.length > 0) {
      const sortedByDate = [...notes].sort((a, b) => a.updatedAt - b.updatedAt);
      const oldestNote = sortedByDate[0];
      stats.value.oldestNoteDate = formatFullDate(oldestNote.updatedAt);
    }

    // Get DB name
    stats.value.dbName = db.name;
  } catch (error) {
    console.error("Error loading stats:", error);
  } finally {
    isLoading.value = false;
  }
};

const formatFullDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(() => {
  loadStats();
});
</script>
