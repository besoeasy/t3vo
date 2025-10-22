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
        <h2 class="text-5xl font-bold text-gray-900 mb-8">Backup</h2>

        <div class="space-y-6">
          <!-- Backup Section -->
          <div class="bg-white rounded-xl shadow-sm p-8">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="p-3 bg-green-100 rounded-xl">
                  <Download class="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Backup Your Notes</h3>
                <p class="text-gray-600 mb-4">
                  Download all your notes as a JSON file. This file is encrypted with your master password.
                </p>
                <button
                  @click="backupDatabase"
                  :disabled="isBackingUp"
                  class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <Download class="w-5 h-5 mr-2" />
                  {{ isBackingUp ? 'Creating Backup...' : 'Download Backup' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Restore Section -->
          <div class="bg-white rounded-xl shadow-sm p-8">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="p-3 bg-blue-100 rounded-xl">
                  <Upload class="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Restore From Backup</h3>
                <p class="text-gray-600 mb-4">
                  Upload a previously created backup file to restore your notes. This will not delete existing notes.
                </p>
                
                <!-- Warning -->
                <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                  <AlertTriangle class="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div class="text-sm text-yellow-800">
                    <p class="font-medium mb-1">Important:</p>
                    <p>Make sure you're logged in with the same master password that was used to create the backup.</p>
                  </div>
                </div>

                <input
                  type="file"
                  ref="fileInput"
                  @change="restoreDatabase"
                  accept=".json"
                  class="hidden"
                />
                <button
                  @click="fileInput.click()"
                  :disabled="isRestoring"
                  class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <Upload class="w-5 h-5 mr-2" />
                  {{ isRestoring ? 'Restoring...' : 'Upload Backup File' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div
            v-if="successMessage"
            class="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div class="flex items-start">
              <CheckCircle class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-green-900">{{ successMessage }}</p>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div class="flex items-start">
              <XCircle class="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-red-900">{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { db, decryptData, encryptData } from "@/db.js";
import { saveAs } from "file-saver";
import {
  Database,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Lock,
} from "lucide-vue-next";

const fileInput = ref(null);
const isBackingUp = ref(false);
const isRestoring = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const handleLogout = () => {
  sessionStorage.removeItem("masterPassword");
  location.reload();
};

const backupDatabase = async () => {
  try {
    isBackingUp.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    const notes = await db.notes.filter((note) => !note.deletedAt).toArray();

    if (notes.length === 0) {
      errorMessage.value = "No notes to backup. Create some notes first!";
      return;
    }

    const decryptedNotes = notes.map((note) => ({
      ...note,
      content: decryptData(note.content),
    }));

    const jsonData = JSON.stringify(decryptedNotes, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `t3vo-backup-${timestamp}.json`);

    successMessage.value = `Successfully backed up ${notes.length} note${notes.length !== 1 ? 's' : ''}!`;
  } catch (error) {
    console.error("Backup failed:", error);
    errorMessage.value = "Backup failed. Please try again.";
  } finally {
    isBackingUp.value = false;
  }
};

const restoreDatabase = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isRestoring.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const jsonData = JSON.parse(e.target.result);

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        errorMessage.value = "Invalid backup file or empty backup.";
        isRestoring.value = false;
        return;
      }

      let restoredCount = 0;
      let skippedCount = 0;

      for (const note of jsonData) {
        const encryptedContent = encryptData(note.content);
        const existingNote = await db.notes.where({ id: note.id }).first();

        if (existingNote) {
          skippedCount++;
        } else {
          await db.notes.add({
            id: note.id,
            content: encryptedContent,
            updatedAt: note.updatedAt,
            deletedAt: note.deletedAt,
          });
          restoredCount++;
        }
      }

      successMessage.value = `Restored ${restoredCount} note${restoredCount !== 1 ? 's' : ''}${skippedCount > 0 ? ` (${skippedCount} skipped as duplicates)` : ''}. Reloading...`;
      
      // Reload after 2 seconds to show the notes
      setTimeout(() => {
        location.reload();
      }, 2000);
    } catch (error) {
      console.error("Restore failed:", error);
      errorMessage.value = "Failed to restore backup. Make sure you're using the correct master password.";
    } finally {
      isRestoring.value = false;
      // Reset file input
      if (fileInput.value) {
        fileInput.value.value = "";
      }
    }
  };
  reader.readAsText(file);
};
</script>
