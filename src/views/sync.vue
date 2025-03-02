<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <div class="m-auto p-6">
      <!-- Header -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-medium tracking-tight text-gray-900 mb-4">Sync</h1>
        <p class="text-lg text-gray-500">Securely synchronize your data across devices</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <!-- Main Controls -->
        <div class="space-y-8">
          <!-- Configuration Card -->
          <div class="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-gray-200/50 p-6 transition-all duration-500">
            <h2 class="text-xl font-medium text-gray-900 mb-6">Configuration</h2>

            <div class="space-y-4 mb-6">
              <label class="block text-sm font-medium text-gray-700">Relay URL</label>
              <div class="relative">
                <input v-model="serverUrl" type="text" class="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="https://your-server.com" />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <ServerIcon class="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <!-- Crypto Seed Input -->
            <div class="space-y-4 mb-6">
              <label class="block text-sm font-medium text-gray-700">Encryption Seed</label>
              <div class="flex space-x-3">
                <div class="relative flex-1">
                  <input v-model="cryptoSeed" type="text" class="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="Auto-generated secure seed" />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <KeyIcon class="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <button @click="toggleSaveSeed" class="px-4 py-3 rounded-xl transition-all duration-200" :class="[isSeedSaved ? 'bg-blue-500/10 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
                  {{ isSeedSaved ? "Saved" : "Save" }}
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-4 mb-6">
            <label class="block text-sm font-medium text-gray-700">Your Anonymous ID</label>
            <div class="relative">
              <input v-model="userIDHash" disabled type="text" class="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" placeholder="https://your-server.com" />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <FingerprintIcon class="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Sync Button and Status -->
          <div class="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-gray-200/50 p-6">
            <button @click="syncAll" :disabled="isLoading || !cryptoSeed" class="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3">
              <SyncIcon v-if="!isLoading" class="w-5 h-5" />
              <LoaderIcon v-else class="w-5 h-5 animate-spin" />
              <span class="text-lg font-medium">
                {{ isLoading ? `Syncing... ${currentOperation}` : "Start Sync" }}
              </span>
            </button>

            <!-- Current Operation Display -->
            <div v-if="isLoading" class="mt-4 text-center text-sm text-gray-500">
              {{ currentItem }}
            </div>

            <!-- Sync Summary -->
            <div v-if="syncSummary.show" class="mt-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <h4 class="text-sm font-medium text-gray-700">Uploaded</h4>
                  <ul class="space-y-1 text-sm text-gray-500">
                    <li>Notes: {{ syncSummary.uploaded.notes }}</li>
                    <li>Bookmarks: {{ syncSummary.uploaded.bookmarks }}</li>
                    <li>Passwords: {{ syncSummary.uploaded.passwords }}</li>
                  </ul>
                </div>
                <div class="space-y-2">
                  <h4 class="text-sm font-medium text-gray-700">Downloaded</h4>
                  <ul class="space-y-1 text-sm text-gray-500">
                    <li>Notes: {{ syncSummary.downloaded.notes }}</li>
                    <li>Bookmarks: {{ syncSummary.downloaded.bookmarks }}</li>
                    <li>Passwords: {{ syncSummary.downloaded.passwords }}</li>
                  </ul>
                </div>
              </div>
              <div class="pt-4 border-t border-gray-200">
                <p class="text-sm text-gray-500">{{ syncSummary.skipped }} skipped • {{ syncSummary.deleted }} deleted • {{ syncSummary.errors }} errors</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Logs Section -->
        <div class="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden transition-all duration-500">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-medium text-gray-900">Activity Log</h2>
              <div class="flex items-center space-x-2">
                <button @click="logFilter = 'all'" class="px-3 py-1.5 text-sm rounded-lg transition-all duration-200" :class="logFilter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'">All</button>
                <button @click="logFilter = 'error'" class="px-3 py-1.5 text-sm rounded-lg transition-all duration-200" :class="logFilter === 'error' ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:text-gray-700'">Errors</button>
                <button @click="clearLogs" class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">Clear</button>
              </div>
            </div>
          </div>

          <div class="divide-y divide-gray-200">
            <div v-if="filteredLogs.length === 0" class="p-8 text-center text-gray-500">No logs to display</div>
            <div v-else class="overflow-y-auto max-h-[600px]">
              <div v-for="(log, index) in filteredLogs" :key="index" class="p-4 transition-colors hover:bg-gray-50">
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 mt-1">
                    <CheckCircleIcon v-if="log.level === 'success'" class="w-4 h-4 text-green-500" />
                    <XCircleIcon v-else-if="log.level === 'error'" class="w-4 h-4 text-red-500" />
                    <InfoIcon v-else class="w-4 h-4 text-blue-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">
                      {{ log.message }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ log.timestamp }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification -->
      <transition enter-active-class="transform transition ease-out duration-300" enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2" enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="notification.show" class="fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-xl shadow-lg pointer-events-auto border border-gray-200 overflow-hidden">
          <div class="p-6">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <CheckCircleIcon v-if="notification.type === 'success'" class="h-6 w-6 text-green-500" />
                <XCircleIcon v-else class="h-6 w-6 text-red-500" />
              </div>
              <div class="ml-3 w-0 flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ notification.message }}
                </p>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button @click="notification.show = false" class="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span class="sr-only">Close</span>
                  <XIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { RefreshCw as SyncIcon, Loader as LoaderIcon, Server as ServerIcon, Key as KeyIcon, CheckCircle as CheckCircleIcon, XCircle as XCircleIcon, Info as InfoIcon, X as XIcon, Fingerprint as FingerprintIcon } from "lucide-vue-next";
import { db } from "@/db";
import CryptoJS from "crypto-js";
import axios from "axios";

// Constants
const STORAGE_KEYS = {
  SERVER_URL: "backup_manager_server_url",
  CRYPTO_SEED: "backup_manager_crypto_seed",
  SAVE_SEED: "backup_manager_save_seed",
  LAST_SYNC: "backup_manager_last_sync",
};

const DATA_TYPES = ["notes", "bookmarks", "passwords"];

// State variables
const serverUrl = ref("https://sh.t3vo.com");
const cryptoSeed = ref("");
const isSeedSaved = ref(false);
const isLoading = ref(false);
const currentOperation = ref("");
const currentItem = ref("");
const notification = ref({ show: false, message: "", type: "success" });
const logs = ref([]);
const showLogs = ref(false);
const logFilter = ref("all");
const userIDHash = ref("00000000000000000000000000");

// Sync summary with more detailed tracking
const syncSummary = ref({
  show: false,
  uploaded: {
    notes: 0,
    bookmarks: 0,
    passwords: 0,
  },
  downloaded: {
    notes: 0,
    bookmarks: 0,
    passwords: 0,
  },
  skipped: 0,
  deleted: 0, // Added counter for deleted items
  errors: 0,
});

// Computed properties for logs
const filteredLogs = computed(() => {
  if (logFilter.value === "all") {
    return logs.value;
  }
  return logs.value.filter((log) => log.level === logFilter.value);
});

const hasErrorLogs = computed(() => {
  return logs.value.some((log) => log.level === "error");
});

// Function to clear logs
function clearLogs() {
  logs.value = [];
  logMessage("Logs cleared", "info");
}

function generateSecureRandomSeed() {
  const marker = "-t3vo-";

  // Define number of bytes for each random part (8 bytes = 16 hex characters)
  const byteCount = 8;
  const prefix = new Uint8Array(byteCount);
  const suffix = new Uint8Array(byteCount);

  // Generate cryptographically secure random numbers
  window.crypto.getRandomValues(prefix);
  window.crypto.getRandomValues(suffix);

  // Helper function to convert byte array to hex string
  const toHex = (arr) =>
    Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const prefixHex = toHex(prefix);
  const suffixHex = toHex(suffix);

  return prefixHex + marker + suffixHex;
}

// Axios instance with interceptors for logging
const api = axios.create();

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const requestId = Math.random().toString(36).substring(2, 9);
    config.requestId = requestId;

    logMessage(`Request: ${config.method.toUpperCase()} ${config.url}`, "info");

    const startTime = new Date();
    config.metadata = { startTime };

    return config;
  },
  (error) => {
    logMessage(`REQUEST ERROR: ${error.message}`, "error");
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const { config } = response;
    const endTime = new Date();
    const duration = endTime - config.metadata.startTime;

    logMessage(`Response: ${response.status}`, "info");

    return response;
  },
  (error) => {
    if (!error.config) {
      logMessage(`NETWORK ERROR: ${error.message}`, "error");
      return Promise.reject(error);
    }

    const { config } = error;
    let duration = 0;

    if (config.metadata) {
      const endTime = new Date();
      duration = endTime - config.metadata.startTime;
    }

    const requestId = config.requestId || "unknown";
    const status = error.response ? error.response.status : "network error";

    logMessage(`Error: ${error.message}`, "error");

    return Promise.reject(error);
  }
);

// Load saved values on component mount
onMounted(() => {
  logMessage("Component mounted", "info");

  const savedServerUrl = localStorage.getItem(STORAGE_KEYS.SERVER_URL);
  if (savedServerUrl) {
    serverUrl.value = savedServerUrl;
    logMessage(`Loaded saved server URL: ${savedServerUrl}`, "info");
  }

  const savedSeedFlag = localStorage.getItem(STORAGE_KEYS.SAVE_SEED);
  isSeedSaved.value = savedSeedFlag === "true";
  logMessage(`Seed saving is ${isSeedSaved.value ? "enabled" : "disabled"}`, "info");

  // Check for saved seed or generate a new one
  if (isSeedSaved.value) {
    const savedSeed = localStorage.getItem(STORAGE_KEYS.CRYPTO_SEED);
    if (savedSeed) {
      cryptoSeed.value = savedSeed;
      logMessage("Loaded saved encryption seed", "info");
    } else {
      // Generate and save a new seed
      cryptoSeed.value = generateSecureRandomSeed();
      localStorage.setItem(STORAGE_KEYS.CRYPTO_SEED, cryptoSeed.value);
      logMessage("Generated and saved new secure encryption seed", "info");
    }
  } else {
    // Generate a new seed but don't save it
    cryptoSeed.value = generateSecureRandomSeed();
    logMessage("Generated new secure encryption seed (not saved)", "info");
  }
});

// Toggle seed saving
function toggleSaveSeed() {
  isSeedSaved.value = !isSeedSaved.value;
  localStorage.setItem(STORAGE_KEYS.SAVE_SEED, isSeedSaved.value.toString());

  logMessage(`Seed saving ${isSeedSaved.value ? "enabled" : "disabled"}`, "info");

  if (isSeedSaved.value) {
    localStorage.setItem(STORAGE_KEYS.CRYPTO_SEED, cryptoSeed.value);
    logMessage("Saved encryption seed to local storage", "info");
  } else {
    localStorage.removeItem(STORAGE_KEYS.CRYPTO_SEED);
    logMessage("Removed encryption seed from local storage", "info");
  }
}

// Watch for changes and save them
watch(serverUrl, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.SERVER_URL, newValue);
  logMessage(`Server URL updated: ${newValue}`, "info");
});

watch(cryptoSeed, (newValue) => {
  if (isSeedSaved.value && newValue) {
    localStorage.setItem(STORAGE_KEYS.CRYPTO_SEED, newValue);
    logMessage("Updated saved encryption seed", "info");
  }
});

// Logging functions
function logMessage(message, level = "info") {
  const timestamp = new Date().toISOString().substring(11, 23);
  logs.value.unshift({ message, level, timestamp });

  // Keep logs limited to prevent memory issues
  if (logs.value.length > 50) {
    logs.value.pop();
  }

  // Also log to console with appropriate method
  switch (level) {
    case "error":
      console.error(`[${timestamp}] ${message}`);
      break;
    case "warn":
      console.warn(`[${timestamp}] ${message}`);
      break;
    case "debug":
      console.debug(`[${timestamp}] ${message}`);
      break;
    default:
      console.log(`[${timestamp}] ${message}`);
  }
}

// Show notification helper
const showNotification = (message, type = "success") => {
  notification.value = { show: true, message, type };
  logMessage(`Notification: ${message}`, type === "success" ? "success" : "error");

  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

// Generate userId from cryptoSeed
function generateUserId(seed) {
  const userId = CryptoJS.SHA256(seed).toString();

  logMessage(`Generated user ID: ${userId.substring(0, 8)}...`, "info");
  userIDHash.value = userId;
  return userId;
}

// Convert object to encrypted blob
function encryptToBlob(data, seed) {
  try {
    const startTime = performance.now();

    const jsonStr = JSON.stringify(data);
    const wordArray = CryptoJS.enc.Utf8.parse(jsonStr);
    const encrypted = CryptoJS.AES.encrypt(wordArray, seed);
    const encryptedBase64 = encrypted.toString();
    const blob = new TextEncoder().encode(encryptedBase64);

    const endTime = performance.now();
    return blob;
  } catch (error) {
    logMessage(`Encryption error: ${error.message}`, "error");
    throw error;
  }
}

// Convert encrypted blob to object
function decryptFromBlob(encryptedBlob, seed) {
  try {
    const startTime = performance.now();

    const encryptedBase64 = new TextDecoder().decode(encryptedBlob);
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, seed);
    const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
    const data = JSON.parse(jsonStr);

    const endTime = performance.now();

    return data;
  } catch (error) {
    logMessage(`Decryption error: ${error.message}`, "error");
    throw error;
  }
}

// Main sync function that handles both directions
async function syncAll() {
  if (!cryptoSeed.value || isLoading.value) return;
  if (!serverUrl.value) {
    showNotification("Please enter a server URL", "error");
    return;
  }

  try {
    isLoading.value = true;

    // Reset sync summary
    syncSummary.value = {
      show: false,
      uploaded: {
        notes: 0,
        bookmarks: 0,
        passwords: 0,
      },
      downloaded: {
        notes: 0,
        bookmarks: 0,
        passwords: 0,
      },
      skipped: 0,
      deleted: 0, // Added counter for deleted items
      errors: 0,
    };

    logMessage("Starting full sync process", "info");
    const syncStartTime = performance.now();
    const userId = generateUserId(cryptoSeed.value);

    // First sync to server (upload)
    currentOperation.value = "Uploading";
    logMessage("Starting upload phase", "info");

    for (let i = 0; i < DATA_TYPES.length; i++) {
      const dataType = DATA_TYPES[i];
      await syncToServer(dataType, userId);
    }

    // Then sync from server (download)
    currentOperation.value = "Downloading";
    logMessage("Starting download phase", "info");

    for (let i = 0; i < DATA_TYPES.length; i++) {
      const dataType = DATA_TYPES[i];
      await syncFromServer(dataType, userId);
    }

    const syncEndTime = performance.now();
    const totalTime = (syncEndTime - syncStartTime) / 1000;

    // Save last sync timestamp
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

    syncSummary.value.show = true;
    logMessage(`Sync completed in ${totalTime.toFixed(2)} seconds`, "success");
    showNotification(`Sync completed in ${totalTime.toFixed(2)} seconds`);
  } catch (error) {
    logMessage(`Sync failed: ${error.message}`, "error");
    showNotification(`Sync failed: ${error.message}`, "error");
    syncSummary.value.errors++;
  } finally {
    isLoading.value = false;
    currentOperation.value = "";
    currentItem.value = "";
  }
}

// Sequential sync to server
async function syncToServer(dataType, userId) {
  try {
    logMessage(`Starting upload for ${dataType}`, "info");

    // Get all items including deleted ones
    const items = await db[dataType].toArray();

    // Filter valid items (both active and deleted)
    const validItems = items.filter((item) => item !== null);

    logMessage(`Found ${validItems.length} ${dataType} to upload (${items.length - validItems.length} skipped)`, "info");
    syncSummary.value.skipped += items.length - validItems.length;

    // Process items sequentially
    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      currentItem.value = `Uploading ${dataType} ${i + 1}/${validItems.length}: ${item.id}`;

      try {
        await uploadItem(dataType, userId, item);
        syncSummary.value.uploaded[dataType]++;

        // If this is a deleted item, increment the deleted counter
        if (item.deleted_at) {
          logMessage(`Uploaded deleted ${dataType} item: ${item.id}`, "info");
        }
      } catch (error) {
        logMessage(`Failed to upload ${dataType} ${item.id}: ${error.message}`, "error");
        syncSummary.value.errors++;
        // Continue with next item despite error
      }
    }

    logMessage(`Completed upload for ${dataType}: ${syncSummary.value.uploaded[dataType]} items`, "success");
  } catch (error) {
    logMessage(`Error in syncToServer for ${dataType}: ${error.message}`, "error");
    throw error;
  }
}

// Sequential sync from server with pagination support
async function syncFromServer(dataType, userId) {
  try {
    logMessage(`Starting download for ${dataType}`, "info");

    let page = 1;
    let hasMorePages = true;
    let totalDownloaded = 0;
    let totalDeleted = 0;

    // Process all pages
    while (hasMorePages) {
      logMessage(`Fetching ${dataType} page ${page}`, "info");

      // Get list of objects from server with pagination
      const response = await api.get(`${serverUrl.value}/fetch/${dataType}/${userId}`, {
        params: { page },
        timeout: 15000,
      });

      const objects = response.data.objects || [];
      const pagination = response.data.pagination || {};

      logMessage(`Found ${objects.length} ${dataType} objects on page ${page}/${pagination.totalPages || 1}`, "info");

      if (objects.length === 0) {
        logMessage(`No ${dataType} to download on page ${page}`, "info");
        break;
      }

      // Process items sequentially
      for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        currentItem.value = `Downloading ${dataType} ${i + 1}/${objects.length} (Page ${page}): ${obj.objectId}`;

        try {
          const result = await downloadItem(dataType, obj.objectId);
          if (result === "skipped") {
            syncSummary.value.skipped++;
          } else if (result === "deleted") {
            syncSummary.value.deleted++;
            totalDeleted++;
          } else {
            syncSummary.value.downloaded[dataType]++;
            totalDownloaded++;
          }
        } catch (error) {
          logMessage(`Failed to download ${dataType} ${obj.objectId}: ${error.message}`, "error");
          syncSummary.value.errors++;
          // Continue with next item despite error
        }
      }

      // Check if there are more pages
      hasMorePages = pagination.hasNextPage === true;
      if (hasMorePages) {
        page++;
        logMessage(`Moving to next page (${page}) for ${dataType}`, "info");
      }
    }

    logMessage(`Completed download for ${dataType}: ${totalDownloaded} items downloaded, ${totalDeleted} items deleted across ${page} page(s)`, "success");
  } catch (error) {
    logMessage(`Error in syncFromServer for ${dataType}: ${error.message}`, "error");
    throw error;
  }
}

async function uploadItem(dataType, userId, item) {
  try {
    const encryptedBlob = encryptToBlob(item, cryptoSeed.value);

    const response = await api.post(`${serverUrl.value}/save/${dataType}/${userId}`, encryptedBlob, {
      headers: { "Content-Type": "application/octet-stream" },
      timeout: 55000,
    });

    logMessage(`Uploaded ${dataType}: ${item.id}`, "success");
    return response.data;
  } catch (error) {
    logMessage(`Failed to upload ${dataType} ${item.id}: ${error.message}`, "error");
    throw error;
  }
}

async function downloadItem(dataType, objectId) {
  try {
    // Retrieve the remote object as an encrypted blob
    const response = await api.get(`${serverUrl.value}/object/${objectId}`, {
      responseType: "arraybuffer",
      timeout: 15000,
    });
    const encryptedBlob = new Uint8Array(response.data);
    const remoteItem = decryptFromBlob(encryptedBlob, cryptoSeed.value);

    // Check if the item already exists locally
    const localItem = await db[dataType].get(remoteItem.id);

    // If both local and remote items have an updated_at timestamp, compare them
    if (localItem && localItem.updated_at && remoteItem.updated_at) {
      const localDate = new Date(localItem.updated_at);
      const remoteDate = new Date(remoteItem.updated_at);

      if (remoteDate > localDate) {
        // Remote version is more recent—update the local record
        await db[dataType].put(remoteItem);
        logMessage(`Replaced local ${dataType}/${objectId} with remote version (remote is newer)`, "info");
        return "downloaded";
      } else {
        logMessage(`Local ${dataType}/${objectId} is more recent; skipping update`, "info");
        return "skipped";
      }
    } else {
      // If no local item exists or timestamps cannot be compared, add/update the item by default
      await db[dataType].put(remoteItem);
      logMessage(`Added or updated ${dataType}/${objectId} (no valid timestamp comparison)`, "info");
      return "downloaded";
    }
  } catch (error) {
    logMessage(`Failed to download ${dataType}/${objectId}: ${error.message}`, "error");
    throw error;
  }
}
</script>

<style>
/* Smooth scrolling for the logs container */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

/* Dark mode scrollbar */
.dark .overflow-y-auto {
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
}
</style>
