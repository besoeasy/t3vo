<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <div class="p-8 m-auto max-w-4xl">
      <h1 class="text-4xl font-extrabold text-gray-800 mb-8 text-center uppercase">Backup <span class="text-blue-600">Manager</span></h1>

      <div class="space-y-6">
        <!-- Export Options -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Export Data</h2>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input type="radio" v-model="exportOptions.format" value="encrypted" class="form-radio h-4 w-4 text-blue-600">
                <span class="ml-2 text-gray-700">Encrypted</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" v-model="exportOptions.format" value="decrypted" class="form-radio h-4 w-4 text-blue-600">
                <span class="ml-2 text-gray-700">Decrypted</span>
              </label>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Export Location</label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input type="radio" v-model="exportOptions.location" value="download" class="form-radio h-4 w-4 text-blue-600">
                <span class="ml-2 text-gray-700">Download File</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" v-model="exportOptions.location" value="clipboard" class="form-radio h-4 w-4 text-blue-600">
                <span class="ml-2 text-gray-700">Copy to Clipboard</span>
              </label>
            </div>
          </div>
          
          <button @click="exportData" :disabled="isLoading" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <ArrowDownIcon class="h-5 w-5 text-blue-500 group-hover:text-blue-400 transition-all duration-300 ease-in-out" />
            </span>
            <span v-if="isLoading && actionType === 'export'" class="ml-4 flex items-center">
              <LoaderIcon class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Exporting...
            </span>
            <span v-else class="ml-4">Export Data</span>
          </button>
        </div>

        <!-- Import Options -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Import Data</h2>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Import Format</label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input type="radio" v-model="importOptions.format" value="encrypted" class="form-radio h-4 w-4 text-blue-600">
                <span class="ml-2 text-gray-700">Encrypted</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" v-model="importOptions.format" value="decrypted" class="form-radio h-4 w-4 text-blue-600">
                <span class="ml-2 text-gray-700">Decrypted</span>
              </label>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Import Source</label>
            <div class="flex space-x-4">
              <label class="inline-flex items-center">
                <input type="radio" v-model="importOptions.source" value="file" class="form-radio h-4 w-4 text-blue-600">
                <span class="ml-2 text-gray-700">From File</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" v-model="importOptions.source" value="clipboard" class="form-radio h-4 w-4 text-blue-600">
                <span class="ml-2 text-gray-700">From Clipboard</span>
              </label>
            </div>
          </div>
          
          <div v-if="importOptions.source === 'file'">
            <label for="file-upload" :class="['group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 ease-in-out overflow-hidden', isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                <ArrowUpIcon class="h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-all duration-300 ease-in-out" />
              </span>
              <span v-if="isLoading && actionType === 'import'" class="ml-4 flex items-center">
                <LoaderIcon class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Importing...
              </span>
              <span v-else class="ml-4">Select File</span>
            </label>
            <input id="file-upload" type="file" @change="importData" class="hidden" accept=".json" :disabled="isLoading" />
          </div>
          
          <div v-else>
            <button @click="importFromClipboard" :disabled="isLoading" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 ease-in-out overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                <ArrowUpIcon class="h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-all duration-300 ease-in-out" />
              </span>
              <span v-if="isLoading && actionType === 'import'" class="ml-4 flex items-center">
                <LoaderIcon class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Importing...
              </span>
              <span v-else class="ml-4">Paste from Clipboard</span>
            </button>
          </div>
        </div>

        <div class="mt-6 bg-gray-100 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-700">Local DB Size</span>
            <span class="text-lg font-bold text-blue-600">{{ parseFloat(localDbSize).toFixed(2) }} KB</span>
          </div>
          <div class="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" :style="{ width: `${Math.min((localDbSize / 1000) * 100, 100)}%` }"></div>
          </div>
        </div>

        <div v-if="showProgress" class="mt-4 space-y-2">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
          </div>
          <p class="text-sm text-gray-600 text-center">{{ progress }}% complete</p>
        </div>

        <div v-if="importSummary.show" class="mt-6 bg-blue-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-blue-800 mb-2">Import Summary</h3>
          <ul class="space-y-1 text-sm text-blue-700">
            <li>Notes: {{ importSummary.notes }} items</li>
            <li>Bookmarks: {{ importSummary.bookmarks }} items</li>
            <li>Passwords: {{ importSummary.passwords }} items</li>
            <li class="text-blue-500 italic">{{ importSummary.duplicates }} duplicates skipped</li>
          </ul>
        </div>
      </div>

      <transition name="fade">
        <div v-if="notification.show" :class="['mt-6 p-4 rounded-md', notification.type === 'success' ? 'bg-green-100' : 'bg-red-100']">
          <p :class="['text-center', notification.type === 'success' ? 'text-green-700' : 'text-red-700']">
            {{ notification.message }}
          </p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ArrowDownIcon, ArrowUpIcon, LoaderIcon } from "lucide-vue-next";
import { dbname as DataBaseName, db } from "@/db";
import { encryptData, decryptData } from "@/utils";

const localDbSize = ref(0);
const isLoading = ref(false);
const actionType = ref(null);
const progress = ref(0);
const showProgress = ref(false);
const notification = ref({ show: false, message: "", type: "success" });
const importSummary = ref({
  show: false,
  notes: 0,
  bookmarks: 0,
  passwords: 0,
  duplicates: 0,
});

// Export and import options
const exportOptions = ref({
  format: "encrypted", // encrypted or decrypted
  location: "download" // download or clipboard
});

const importOptions = ref({
  format: "encrypted", // encrypted or decrypted
  source: "file" // file or clipboard
});

// Show notification helper
const showNotification = (message, type = "success") => {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

// Export data with progress tracking
async function exportData() {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    actionType.value = "export";
    showProgress.value = true;
    progress.value = 0;

    const data = await exportIndexedDBData(exportOptions.value.format === "decrypted");
    
    if (exportOptions.value.location === "download") {
      // Download as file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `T3VO_backup_${exportOptions.value.format}_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification("Data exported successfully to file!");
    } else {
      // Copy to clipboard
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      showNotification("Data exported successfully to clipboard!");
    }
    
    await updateLocalDbSize();
  } catch (error) {
    console.error("Export failed:", error);
    showNotification("Export failed. Please try again.", "error");
  } finally {
    isLoading.value = false;
    actionType.value = null;
    showProgress.value = false;
  }
}

// Import data with validation and progress tracking
async function importData(event) {
  if (isLoading.value) return;

  const file = event.target.files[0];
  if (!file) return;

  try {
    isLoading.value = true;
    actionType.value = "import";
    showProgress.value = true;
    progress.value = 0;

    // Reset import summary
    importSummary.value = {
      show: false,
      notes: 0,
      bookmarks: 0,
      passwords: 0,
      duplicates: 0,
    };

    const data = await readFileAsJson(file);
    if (!validateBackupData(data)) {
      throw new Error("Invalid backup file format");
    }

    const result = await importDataToIndexedDB(data, importOptions.value.format === "decrypted");
    importSummary.value = {
      show: true,
      ...result,
    };

    showNotification(`Data imported successfully! ${result.duplicates} duplicates skipped.`);
    await updateLocalDbSize();
  } catch (error) {
    console.error("Import failed:", error);
    showNotification(error.message === "Invalid backup file format" ? "Invalid backup file format" : "Import failed. Please try again.", "error");
  } finally {
    isLoading.value = false;
    actionType.value = null;
    showProgress.value = false;
    event.target.value = ""; // Reset file input
  }
}

// Import from clipboard
async function importFromClipboard() {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    actionType.value = "import";
    showProgress.value = true;
    progress.value = 0;

    // Reset import summary
    importSummary.value = {
      show: false,
      notes: 0,
      bookmarks: 0,
      passwords: 0,
      duplicates: 0,
    };

    // Read from clipboard
    const clipboardText = await navigator.clipboard.readText();
    let data;
    
    try {
      data = JSON.parse(clipboardText);
    } catch (error) {
      throw new Error("Invalid JSON in clipboard");
    }
    
    if (!validateBackupData(data)) {
      throw new Error("Invalid backup data format in clipboard");
    }

    const result = await importDataToIndexedDB(data, importOptions.value.format === "decrypted");
    importSummary.value = {
      show: true,
      ...result,
    };

    showNotification(`Data imported successfully! ${result.duplicates} duplicates skipped.`);
    await updateLocalDbSize();
  } catch (error) {
    console.error("Import failed:", error);
    showNotification(error.message || "Import failed. Please try again.", "error");
  } finally {
    isLoading.value = false;
    actionType.value = null;
    showProgress.value = false;
  }
}

// Read file as JSON with validation
function readFileAsJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// Validate backup data structure
function validateBackupData(data) {
  const requiredStores = ["notes", "bookmarks", "passwords"];
  return (
    typeof data === "object" &&
    data !== null &&
    requiredStores.every(
      (store) =>
        Array.isArray(data[store]) &&
        data[store].every(
          (item) => item && typeof item.id === "string"
        )
    )
  );
}

// Export IndexedDB data with progress tracking
async function exportIndexedDBData(decryptExport = false) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DataBaseName);

    request.onerror = () => reject(new Error("Failed to open database"));

    request.onsuccess = async (event) => {
      const db = event.target.result;
      const exportData = {};
      const storeNames = Array.from(db.objectStoreNames);
      let completed = 0;

      try {
        for (const storeName of storeNames) {
          const tx = db.transaction(storeName, "readonly");
          const store = tx.objectStore(storeName);

          // Only export non-deleted items
          const items = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
              let nonDeletedItems = request.result.filter((item) => !item.deleted_at);
              
              // Decrypt data if requested
              if (decryptExport) {
                nonDeletedItems = decryptItems(nonDeletedItems, storeName);
              }
              
              resolve(nonDeletedItems);
            };
            request.onerror = () => reject(new Error(`Failed to read ${storeName}`));
          });

          exportData[storeName] = items;
          completed++;
          progress.value = Math.round((completed / storeNames.length) * 100);
        }

        resolve(exportData);
      } catch (error) {
        reject(error);
      }
    };
  });
}

// Decrypt items based on store type
function decryptItems(items, storeName) {
  const fieldsToDecrypt = {
    notes: ["title", "content"],
    bookmarks: ["title", "url", "note"],
    passwords: ["title", "username", "email", "password", "totpSecret", "urls"]
  };
  
  if (!fieldsToDecrypt[storeName]) return items;
  
  return items.map(item => {
    const decryptedItem = { ...item };
    fieldsToDecrypt[storeName].forEach(field => {
      if (decryptedItem[field] !== undefined) {
        decryptedItem[field] = decryptData(decryptedItem[field]);
      }
    });
    return decryptedItem;
  });
}

// Encrypt items based on store type
function encryptItems(items, storeName) {
  const fieldsToEncrypt = {
    notes: ["title", "content"],
    bookmarks: ["title", "url", "note"],
    passwords: ["title", "username", "email", "password", "totpSecret", "urls"]
  };
  
  if (!fieldsToEncrypt[storeName]) return items;
  
  return items.map(item => {
    const encryptedItem = { ...item };
    fieldsToEncrypt[storeName].forEach(field => {
      if (encryptedItem[field] !== undefined) {
        encryptedItem[field] = encryptData(encryptedItem[field]);
      }
    });
    return encryptedItem;
  });
}

// Import data to IndexedDB with progress tracking and duplicate handling
async function importDataToIndexedDB(data, isDecrypted = false) {
  const request = indexedDB.open(DataBaseName);

  return new Promise((resolve, reject) => {
    request.onerror = () => reject(new Error("Failed to open database"));

    request.onsuccess = async (event) => {
      const db = event.target.result;
      const storeNames = Object.keys(data);
      let completed = 0;
      const summary = {
        notes: 0,
        bookmarks: 0,
        passwords: 0,
        duplicates: 0,
      };

      try {
        for (const storeName of storeNames) {
          if (!db.objectStoreNames.contains(storeName)) continue;

          const tx = db.transaction(storeName, "readwrite");
          const store = tx.objectStore(storeName);
          let items = data[storeName];
          
          // Encrypt data if it was imported as decrypted
          if (isDecrypted) {
            items = encryptItems(items, storeName);
          }

          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Make sure deleted_at is null for imported items
            item.deleted_at = null;

            // Check for existing item
            const existingItem = await new Promise((resolve) => {
              const request = store.get(item.id);
              request.onsuccess = () => resolve(request.result);
            });

            if (!existingItem) {
              // Add new item
              await new Promise((resolve, reject) => {
                const addRequest = store.add(item);
                addRequest.onsuccess = () => {
                  summary[storeName]++;
                  resolve();
                };
                addRequest.onerror = () => reject(new Error(`Failed to import item to ${storeName}`));
              });
            } else {
              summary.duplicates++;
            }

            progress.value = Math.round(((completed + (i + 1) / items.length) / storeNames.length) * 100);
          }

          completed++;
        }

        resolve(summary);
      } catch (error) {
        reject(error);
      }
    };
  });
}

// Update local database size
async function updateLocalDbSize() {
  try {
    const data = await exportIndexedDBData();
    localDbSize.value = new Blob([JSON.stringify(data)]).size / 1024; // Convert to KB
  } catch (error) {
    console.error("Failed to calculate database size:", error);
  }
}

// Initialize
updateLocalDbSize();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>