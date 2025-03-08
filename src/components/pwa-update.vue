<script setup>
import { ref, onMounted, watch } from "vue";
import { useRegisterSW } from "virtual:pwa-register/vue";
import { useRouter } from "vue-router";

const router = useRouter();
const { needRefresh, updateServiceWorker } = useRegisterSW();
const showUpdateAlert = ref(false);

const close = () => {
  showUpdateAlert.value = false;
};

const update = () => {
  updateServiceWorker();
  showUpdateAlert.value = false;
};

const goToBackup = () => {
  router.push("/backup");
  showUpdateAlert.value = false;
};

onMounted(() => {
  // Watch for needRefresh changes
  if (needRefresh.value) {
    showUpdateAlert.value = true;
  }
});

// Watch for changes in needRefresh
watch(needRefresh, (newValue) => {
  if (newValue) {
    showUpdateAlert.value = true;
  }
});
</script>

<template>
  <div v-if="showUpdateAlert" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">App Update Available</h3>
      </div>
      <div class="mb-6 space-y-3">
        <p class="text-gray-700">A new version of the app is available.</p>

        <div class="bg-amber-50 border-l-4 border-amber-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-amber-700"><strong>Warning:</strong> This app is in development. Please backup all your entries before updating to avoid potential data loss.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col space-y-3">
        <button @click="goToBackup" class="w-full px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
          </svg>
          Backup My Data First
        </button>

        <div class="flex justify-between space-x-3">
          <button @click="close" class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Later</button>
          <button @click="update" class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">Update Now</button>
        </div>
      </div>
    </div>
  </div>
</template>
