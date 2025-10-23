<template>
  <div class="flex h-screen bg-white overflow-hidden">
    <!-- Left Sidebar -->
    <aside class="w-[120px] bg-white flex flex-col items-center py-8 px-4 border-r border-gray-200">
      <h1 class="text-2xl font-semibold text-gray-900 mb-8">T3VO</h1>
      
      <!-- Back to Notes Button -->
      <router-link
        to="/dashboard"
        class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors mb-8"
        title="Back to Notes"
      >
        <ArrowLeft class="w-6 h-6" />
      </router-link>

      <div class="flex-1"></div>

      <!-- Backup Link -->
      <router-link
        to="/backup"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Backup & Restore"
      >
        <Database class="w-5 h-5" />
      </router-link>

      <!-- GitHub Link -->
      <a
        href="https://github.com/besoeasy/t3vo"
        target="_blank"
        rel="noopener noreferrer"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="GitHub Repository"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
        </svg>
      </a>

      <!-- Lock Button -->
      <button
        @click="handleLogout"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
        title="Lock App"
      >
        <Lock class="w-5 h-5" />
      </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <div class="max-w-4xl mx-auto p-8">
        <!-- Page Title -->
        <h2 class="text-5xl font-bold text-gray-900 mb-2">Statistics</h2>
        <p class="text-gray-600 mb-8">Overview of your notes and app status</p>

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
              <p v-if="stats.deletedNotes > 0" class="text-xs text-gray-500 mt-1">
                Automatically purged after 90 days
              </p>
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/db.js';
import {
  ArrowLeft,
  Lock,
  Database,
  FileText,
  Calendar,
  HardDrive,
  Shield,
  Trash2,
} from 'lucide-vue-next';

const isLoading = ref(true);
const stats = ref({
  totalNotes: 0,
  deletedNotes: 0,
  oldestNoteDate: 'N/A',
  dbName: '',
  appVersion: '0.0.9',
});

const loadStats = async () => {
  isLoading.value = true;
  try {
    // Get active notes
    const notes = await db.notes
      .filter(note => note.deletedAt === null || note.deletedAt === undefined)
      .toArray();

    stats.value.totalNotes = notes.length;

    // Get deleted notes
    const deletedNotes = await db.notes
      .filter(note => note.deletedAt !== null && note.deletedAt !== undefined)
      .toArray();

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
    console.error('Error loading stats:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatFullDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
};

const handleLogout = () => {
  if (confirm('Are you sure you want to lock the app?')) {
    sessionStorage.removeItem('ENCRYPTION_KEY');
    location.reload();
  }
};

onMounted(() => {
  loadStats();
});
</script>
