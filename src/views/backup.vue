<script setup>
import { ref } from "vue";
import { db, decryptData, encryptData } from "@/db.js";
import { saveAs } from "file-saver";

const fileInput = ref(null);

// Backup database (decrypt before exporting)
const backupDatabase = async () => {
  const entries = await db.entries.toArray();

  // Decrypt each entry before exporting
  const decryptedEntries = entries.map(entry => ({
    ...entry,
    data: decryptData(entry.data),
  }));

  const jsonData = JSON.stringify(decryptedEntries, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  saveAs(blob, "backup.json");
};

// Restore database (encrypt before importing)
const restoreDatabase = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const jsonData = JSON.parse(e.target.result);

      // Encrypt each entry before storing
      const encryptedEntries = jsonData.map(entry => ({
        ...entry,
        data: encryptData(entry.data),
      }));

      await db.entries.bulkAdd(encryptedEntries);
      alert("Database restored successfully!");
    } catch (error) {
      alert("Failed to restore database. Invalid file format.");
    }
  };
  reader.readAsText(file);
};
</script>

<template>
  <div class="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
    <h2 class="text-xl font-semibold text-gray-700 mb-4">Database Backup & Restore</h2>

    <button 
      @click="backupDatabase" 
      class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
      Backup Database
    </button>

    <input type="file" ref="fileInput" @change="restoreDatabase" class="hidden" />
    <button 
      @click="fileInput.click()" 
      class="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
      Restore Database
    </button>
  </div>
</template>
