<script setup>
import { addNote } from "@/db";
import { ref, computed } from "vue";
import Papa from "papaparse";
import { AlertCircle, Plus, X } from "lucide-vue-next";
import { supertagRegistry } from "@/supertags";

const file = ref(null);
const importStatus = ref("");
const importProgress = ref(0);
const csvHeaders = ref([]);
const csvData = ref([]);
const isLoading = ref(false);
const error = ref("");

// Universal column mapping: array of { supertag, column }
const columnMappings = ref([]);

// Additional content to append to each note
const additionalContent = ref("");

// Get all available supertags
const availableSupertags = computed(() => supertagRegistry.getAllSupertags());

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
      csvData.value = results.data.slice(1).filter((row) => row.some((cell) => cell && cell.trim()));

      // Reset mappings when new file is uploaded
      columnMappings.value = [];
      
      importStatus.value = "CSV parsed. Map supertags to columns and start import.";
    },
    error: (error) => {
      error.value = `Error parsing CSV: ${error.message}`;
      importStatus.value = "";
    },
    header: false,
  });
};

// Mapping management
const addMapping = () => {
  columnMappings.value.push({ supertag: "", column: "" });
};

const removeMapping = (index) => {
  columnMappings.value.splice(index, 1);
};

// Import process
const importData = async () => {
  if (!file.value) {
    error.value = "Please select a CSV file to import.";
    return;
  }

  if (columnMappings.value.length === 0) {
    error.value = "Please add at least one supertag mapping.";
    return;
  }

  // Check if all mappings are complete
  const incompleteMappings = columnMappings.value.some(m => !m.supertag || !m.column);
  if (incompleteMappings) {
    error.value = "Please complete all supertag mappings.";
    return;
  }

  try {
    isLoading.value = true;
    error.value = "";
    importStatus.value = "Importing...";
    importProgress.value = 0;

    const totalRows = csvData.value.length;
    let importedCount = 0;
    const batchSize = 50;

    for (let i = 0; i < totalRows; i += batchSize) {
      const batch = csvData.value.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (row) => {
          try {
            // Build note content from mappings
            const lines = [];
            
            for (const mapping of columnMappings.value) {
              const columnIndex = csvHeaders.value.indexOf(mapping.column);
              if (columnIndex !== -1) {
                const value = row[columnIndex];
                if (value && value.trim()) {
                  lines.push(`#@${mapping.supertag}=${value.trim()}`);
                }
              }
            }

            if (lines.length > 0) {
              let content = lines.join("\n");
              
              // Append additional content if provided
              if (additionalContent.value.trim()) {
                content += "\n" + additionalContent.value.trim();
              }
              
              content += "\n";
              
              await addNote(content);
              importedCount++;
            }
          } catch (err) {
            console.error(`Error importing row:`, err);
          }
        })
      );

      importProgress.value = Math.round(((i + batch.length) / totalRows) * 100);
    }

    importStatus.value = `Import complete. ${importedCount} notes imported.`;
  } catch (err) {
    error.value = `Import failed: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

// Computed properties
const isReadyToImport = computed(() => {
  return file.value && !isLoading.value && columnMappings.value.length > 0 && 
         !columnMappings.value.some(m => !m.supertag || !m.column);
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="w-full max-w-4xl">
      <h1 class="text-4xl font-extrabold text-gray-800 mb-8 text-center uppercase">
        Import <span class="text-blue-600">CSV Data</span>
      </h1>

      <div class="mb-8 p-6 bg-white rounded-xl shadow-lg">
        <!-- Info Section -->
        <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="text-sm font-semibold text-blue-900 mb-2">Import from Other Platforms</h3>
          <p class="text-xs text-blue-800 mb-2">
            Use this feature to import bookmarks and passwords from other platforms like Chrome, Firefox, Bitwarden, 1Password, etc.
          </p>
          <details class="text-xs text-blue-700">
            <summary class="cursor-pointer font-medium hover:text-blue-900">View examples</summary>
            <ul class="mt-2 space-y-1 ml-4 list-disc">
              <li><strong>Chrome Bookmarks:</strong> Export bookmarks as HTML, convert to CSV, map Title→title, URL→bookmark</li>
              <li><strong>Bitwarden:</strong> Export as CSV, map Name→title, Username→username, Password→password, URI→domains</li>
              <li><strong>1Password:</strong> Export as CSV, map Title→title, Username→email, Password→password, Website→bookmark</li>
              <li><strong>Firefox:</strong> Export bookmarks as JSON/HTML, convert to CSV, map title and url columns</li>
            </ul>
          </details>
        </div>

        <!-- File Upload -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
          <input 
            type="file" 
            accept=".csv" 
            @change="handleFileUpload"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            :disabled="isLoading" 
          />
          <p class="mt-2 text-xs text-gray-500">Upload a CSV file where each row will become a note</p>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle class="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p class="text-red-700 text-sm">{{ error }}</p>
        </div>

        <!-- Column Mapping -->
        <div v-if="csvHeaders.length > 0" class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Map Supertags to CSV Columns</h2>
            <button 
              @click="addMapping"
              :disabled="isLoading"
              class="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Plus class="w-4 h-4" />
              Add Mapping
            </button>
          </div>

          <!-- Mappings List -->
          <div v-if="columnMappings.length > 0" class="space-y-3">
            <div 
              v-for="(mapping, index) in columnMappings" 
              :key="index"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1">
                <label class="block text-xs font-medium text-gray-600 mb-1">Supertag</label>
                <select 
                  v-model="mapping.supertag"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isLoading"
                >
                  <option value="">Select supertag...</option>
                  <option 
                    v-for="tag in availableSupertags" 
                    :key="tag.name" 
                    :value="tag.name"
                  >
                    {{ tag.icon }} {{ tag.displayName }} (#@{{ tag.name }}=)
                  </option>
                </select>
              </div>

              <div class="flex-1">
                <label class="block text-xs font-medium text-gray-600 mb-1">CSV Column</label>
                <select 
                  v-model="mapping.column"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="isLoading"
                >
                  <option value="">Select column...</option>
                  <option v-for="header in csvHeaders" :key="header" :value="header">
                    {{ header }}
                  </option>
                </select>
              </div>

              <button 
                @click="removeMapping(index)"
                :disabled="isLoading"
                class="mt-5 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Remove mapping"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <p v-else class="text-sm text-gray-500 text-center py-4">
            Click "Add Mapping" to start mapping supertags to CSV columns
          </p>
        </div>

        <!-- Additional Content -->
        <div v-if="csvHeaders.length > 0" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Additional Content (Optional)
          </label>
          <textarea
            v-model="additionalContent"
            :disabled="isLoading"
            placeholder="Add custom supertags or notes that will be appended to each imported note...&#10;&#10;Example:&#10;#@tags=imported,2024&#10;#@icon=📥&#10;&#10;Imported from [platform name]"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            rows="5"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            This content will be added to every imported note. Use it to add common tags, icons, or notes.
          </p>
        </div>

        <!-- Import Button & Progress -->
        <div class="space-y-4">
          <button 
            @click="importData" 
            :disabled="!isReadyToImport || isLoading"
            class="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span v-if="isLoading" class="mr-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Import Notes
          </button>

          <div v-if="importStatus" class="text-sm text-gray-600">
            {{ importStatus }}
          </div>

          <div v-if="importProgress > 0" class="space-y-2">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${importProgress}%` }"
              ></div>
            </div>
            <p class="text-sm text-gray-600">{{ importProgress }}% complete</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>