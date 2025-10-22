<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="p-3 bg-blue-100 rounded-xl">
            <RefreshCw :class="[migrating ? 'animate-spin' : '', 'w-6 h-6 text-blue-600']" />
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Database Migration</h2>
            <p class="text-sm text-gray-600">Upgrade to the new note system</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        <div v-if="!migrating && !complete" class="space-y-4">
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-sm text-blue-900">
              <strong>What's changing?</strong><br>
              We're upgrading to a simpler, more flexible note system. Everything (passwords, bookmarks, and notes) will become unified notes with smart tags.
            </p>
          </div>

          <div class="space-y-2">
            <h3 class="text-sm font-medium text-gray-700">Benefits:</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li class="flex items-start">
                <span class="text-green-600 mr-2">✓</span>
                <span>Simpler, more intuitive interface</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-600 mr-2">✓</span>
                <span>Mix passwords, bookmarks, and notes in one place</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-600 mr-2">✓</span>
                <span>Use tags to organize (#@password=, #@bookmark=)</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-600 mr-2">✓</span>
                <span>All your data will be preserved</span>
              </li>
            </ul>
          </div>

          <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-xs text-yellow-900">
              <strong>Note:</strong> This process is automatic and safe. Your encrypted data will be converted to the new format.
            </p>
          </div>
        </div>

        <!-- Migration Progress -->
        <div v-if="migrating" class="space-y-4">
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <div class="text-center">
            <p class="text-gray-700 font-medium">{{ status }}</p>
            <p class="text-sm text-gray-500 mt-1">Please wait...</p>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <!-- Migration Complete -->
        <div v-if="complete" class="space-y-4">
          <div class="flex justify-center">
            <div class="p-4 bg-green-100 rounded-full">
              <Check class="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Migration Complete!</h3>
            <p class="text-sm text-gray-600 mb-4">Successfully migrated {{ stats.total }} items</p>
            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="p-3 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ stats.passwords }}</div>
                <div class="text-xs text-gray-600">Passwords</div>
              </div>
              <div class="p-3 bg-amber-50 rounded-lg">
                <div class="text-2xl font-bold text-amber-600">{{ stats.bookmarks }}</div>
                <div class="text-xs text-gray-600">Bookmarks</div>
              </div>
              <div class="p-3 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ stats.notes }}</div>
                <div class="text-xs text-gray-600">Notes</div>
              </div>
            </div>
            <div v-if="stats.errors > 0" class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              {{ stats.errors }} item{{ stats.errors !== 1 ? 's' : '' }} could not be migrated
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50 space-x-3">
        <button
          v-if="!migrating && !complete"
          @click="startMigration"
          class="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <RefreshCw class="w-4 h-4 mr-2" />
          Start Migration
        </button>
        <button
          v-if="complete"
          @click="$emit('complete')"
          class="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
        >
          <Check class="w-4 h-4 mr-2" />
          Continue to Notes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RefreshCw, Check } from 'lucide-vue-next';
import { migrateData } from '@/utils/migration';

const emit = defineEmits(['complete']);

const migrating = ref(false);
const complete = ref(false);
const status = ref('Preparing migration...');
const progress = ref(0);
const stats = ref({
  passwords: 0,
  bookmarks: 0,
  notes: 0,
  errors: 0,
  total: 0,
});

const startMigration = async () => {
  migrating.value = true;
  progress.value = 10;
  
  try {
    status.value = 'Reading old database...';
    progress.value = 30;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    status.value = 'Converting entries...';
    progress.value = 50;
    
    const result = await migrateData();
    
    progress.value = 90;
    status.value = 'Finalizing...';
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    stats.value = result;
    progress.value = 100;
    migrating.value = false;
    complete.value = true;
  } catch (error) {
    console.error('Migration failed:', error);
    alert('Migration failed: ' + error.message);
    migrating.value = false;
  }
};
</script>
