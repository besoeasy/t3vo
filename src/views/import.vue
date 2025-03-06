<script setup>
import { ref, computed } from "vue";
import { addBookmarkEntry, addPasswordEntry } from "@/db.js";
import Papa from "papaparse";
import { AlertCircle } from "lucide-vue-next";

const file = ref(null);
const importStatus = ref("");
const importProgress = ref(0);
const csvHeaders = ref([]);
const csvData = ref([]);
const activeTab = ref("bookmarks");
const isLoading = ref(false);
const error = ref("");

// Column mapping state
const columnMapping = ref({
  bookmarks: {
    title: "",
    url: "",
    note: "",
  },
  passwords: {
    title: "",
    username: "",
    email: "",
    password: "",
    totpSecret: "",
    urls: "",
  },
});

// File handling
const handleFileUpload = (event) => {
  const uploadedFile = event.target.files[0];
  if (!uploadedFile) return;

  if (uploadedFile.type !== "text/csv") {
    error.value = "Please upload a valid CSV file";
    return;
  }

  file.value = uploadedFile;
  parseCSV();
};

const parseCSV = () => {
  error.value = "";
  importStatus.value = "Parsing CSV...";

  Papa.parse(file.value, {
    complete: (results) => {
      if (results.data.length < 2) {
        error.value = "CSV file is empty or invalid";
        return;
      }

      csvHeaders.value = results.data[0];
      csvData.value = results.data.slice(1).filter((row) => row.some((cell) => cell && cell.trim())); // Remove empty rows

      importStatus.value = "CSV parsed. Please map the columns and start import.";
    },
    error: (error) => {
      error.value = `Error parsing CSV: ${error.message}`;
      importStatus.value = "";
    },
    header: false,
  });
};

// Data validation
const validateRow = (row, mapping, type) => {
  if (type === "bookmarks") {
    const url = row[csvHeaders.value.indexOf(mapping.url)];
    return url && url.trim();
  } else {
    const password = row[csvHeaders.value.indexOf(mapping.password)];
    return password && password.trim();
  }
};

// Import process
const importData = async () => {
  if (!file.value) {
    error.value = "Please select a CSV file to import.";
    return;
  }

  const mapping = columnMapping.value[activeTab.value];
  const requiredField = activeTab.value === "bookmarks" ? "url" : "password";

  if (!mapping[requiredField]) {
    error.value = `Please map the ${requiredField} column before importing.`;
    return;
  }

  try {
    isLoading.value = true;
    error.value = "";
    importStatus.value = "Importing...";
    importProgress.value = 0;

    const totalRows = csvData.value.length;
    let importedCount = 0;
    const batchSize = 50; // Process in batches to optimize memory

    for (let i = 0; i < totalRows; i += batchSize) {
      const batch = csvData.value.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (row) => {
          if (!validateRow(row, mapping, activeTab.value)) return;

          try {
            if (activeTab.value === "bookmarks") {
              await addBookmarkEntry({
                title: mapping.title ? row[csvHeaders.value.indexOf(mapping.title)] : "",
                url: row[csvHeaders.value.indexOf(mapping.url)],
                note: mapping.note ? row[csvHeaders.value.indexOf(mapping.note)] : "",
              });
              importedCount++;
            } else {
              await addPasswordEntry({
                title: mapping.title ? row[csvHeaders.value.indexOf(mapping.title)] : "",
                username: mapping.username ? row[csvHeaders.value.indexOf(mapping.username)] : "",
                email: mapping.email ? row[csvHeaders.value.indexOf(mapping.email)] : "",
                password: row[csvHeaders.value.indexOf(mapping.password)],
                totpSecret: mapping.totpSecret ? row[csvHeaders.value.indexOf(mapping.totpSecret)] : "",
                urls: mapping.urls ? row[csvHeaders.value.indexOf(mapping.urls)] : "",
              });
              importedCount++;
            }
          } catch (err) {
            console.error(`Error importing row:`, err);
          }
        })
      );

      importProgress.value = Math.round(((i + batch.length) / totalRows) * 100);
    }

    importStatus.value = `Import complete. ${importedCount} ${activeTab.value} imported.`;
  } catch (err) {
    error.value = `Import failed: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

// Computed properties
const isReadyToImport = computed(() => {
  return file.value && !isLoading.value && ((activeTab.value === "bookmarks" && columnMapping.value.bookmarks.url) || (activeTab.value === "passwords" && columnMapping.value.passwords.password));
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
    <div class="p-8 m-auto max-w-4xl">
      <h1 class="text-4xl font-extrabold text-gray-800 mb-8 text-center uppercase">Import <span class="text-blue-600">Data</span></h1>

      <div class="mb-8 p-6 bg-white rounded-xl shadow-lg">
        <div class="mb-4 border-b border-gray-200">
          <button v-for="tab in ['bookmarks', 'passwords']" :key="tab" @click="activeTab = tab" :class="['px-4 py-2 -mb-px', activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700']">
            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2"> Upload CSV File </label>
          <input type="file" accept=".csv" @change="handleFileUpload" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" :disabled="isLoading" />
        </div>

        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle class="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>

        <div v-if="csvHeaders.length > 0" class="mb-6">
          <h2 class="text-xl font-semibold mb-4">Map CSV Columns</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <template v-if="activeTab === 'bookmarks'">
              <div v-for="field in ['title', 'url', 'note']" :key="field">
                <label :for="field" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ field.charAt(0).toUpperCase() + field.slice(1) }}
                  <span v-if="field === 'url'" class="text-red-500">*</span>
                </label>
                <select :id="field" v-model="columnMapping.bookmarks[field]" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" :disabled="isLoading">
                  <option value="">Select column</option>
                  <option v-for="header in csvHeaders" :key="header" :value="header">
                    {{ header }}
                  </option>
                </select>
              </div>
            </template>

            <template v-else>
              <div v-for="field in ['title', 'username', 'email', 'password', 'totpSecret', 'urls']" :key="field">
                <label :for="field" class="block text-sm font-medium text-gray-700 mb-1">
                  {{ field.charAt(0).toUpperCase() + field.slice(1) }}
                  <span v-if="field === 'password'" class="text-red-500">*</span>
                </label>
                <select :id="field" v-model="columnMapping.passwords[field]" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" :disabled="isLoading">
                  <option value="">Select column</option>
                  <option v-for="header in csvHeaders" :key="header" :value="header">
                    {{ header }}
                  </option>
                </select>
              </div>
            </template>
          </div>
        </div>

        <div class="space-y-4">
          <button @click="importData" :disabled="!isReadyToImport || isLoading" class="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            <span v-if="isLoading" class="mr-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Import {{ activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }}
          </button>

          <div v-if="importStatus" class="text-sm text-gray-600">
            {{ importStatus }}
          </div>

          <div v-if="importProgress > 0" class="space-y-2">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${importProgress}%` }"></div>
            </div>
            <p class="text-sm text-gray-600">{{ importProgress }}% complete</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
