<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// Get the PWA registration function
const updateSW = import.meta.env.DEV ? () => console.log("PWA update triggered (dev mode)") : window.__VITE_SW_REGISTER;

const router = useRouter();
const showUpdateAlert = ref(false);
const forceShow = ref(false); // For testing purposes

// Force show the dialog after 2 seconds in development mode
onMounted(() => {
  if (import.meta.env.DEV) {
    setTimeout(() => {
      forceShow.value = true;
      showUpdateAlert.value = true;
      console.log("Update dialog forced to show (dev mode)");
    }, 2000);
  }

  // Register for updates
  if (!import.meta.env.DEV && typeof updateSW === "function") {
    const intervalMS = 60 * 60 * 1000; // Check every hour
    const updateServiceWorker = updateSW({
      onNeedRefresh() {
        showUpdateAlert.value = true;
        console.log("New content available, refresh needed");
      },
      onOfflineReady() {
        console.log("App ready to work offline");
      },
    });

    // Periodically check for updates
    setInterval(() => {
      updateServiceWorker(true);
    }, intervalMS);
  }
});

const close = () => {
  showUpdateAlert.value = false;
};

const update = () => {
  if (forceShow.value) {
    console.log("Update simulation complete (dev mode)");
    showUpdateAlert.value = false;
    return;
  }

  // Reload the page to apply the update
  window.location.reload();
  showUpdateAlert.value = false;
};
</script>

<template>
  <div v-if="showUpdateAlert" class="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-50" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
      <div class="mb-6 space-y-3">
        <p class="text-gray-700 dark:text-gray-300">A new version of the app is available.</p>

        <div class="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-amber-700 dark:text-amber-400"><strong>Warning:</strong> Please backup your data before updating to avoid potential data loss.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col space-y-3">
        <div class="flex justify-between space-x-3">
          <button @click="close" class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Later</button>
          <button @click="update" class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">Update Now</button>
        </div>
      </div>
    </div>
  </div>
</template>
