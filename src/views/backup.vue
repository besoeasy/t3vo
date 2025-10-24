<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8 pt-16 md:pt-8">
    <!-- Page Title -->
    <h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-8">Backup</h2>

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
</template>

<script setup>
import { ref } from "vue";
import { db, decryptData, encryptData } from "@/db.js";
import { saveAs } from "file-saver";
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-vue-next";

const fileInput = ref(null);
const isBackingUp = ref(false);
const isRestoring = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Helper function to convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper function to convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
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
      // Convert ArrayBuffer to base64 for attachments
      attachments: note.attachments?.map((att) => ({
        ...att,
        data: att.data ? arrayBufferToBase64(att.data) : null,
      })) || [],
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
            // Convert base64 back to ArrayBuffer for attachments
            attachments: note.attachments?.map((att) => ({
              ...att,
              data: att.data ? base64ToArrayBuffer(att.data) : null,
            })) || [],
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
