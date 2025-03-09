<script setup>
import { ref } from "vue";
import { db, decryptData, encryptData } from "@/db.js";
import { saveAs } from "file-saver";

const fileInput = ref(null);

const backupDatabase = async () => {
  const entries = await db.entries.filter((entry) => !entry.deletedAt).toArray();

  const decryptedEntries = entries.map((entry) => ({
    ...entry,
    data: decryptData(entry.data),
  }));

  const jsonData = JSON.stringify(decryptedEntries, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  saveAs(blob, "t3vo.json");
};

const restoreDatabase = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const jsonData = JSON.parse(e.target.result);

      for (const entry of jsonData) {
        console.log("entry", entry);

        const encryptedData = encryptData(entry.data);

        const existingEntry = await db.entries.where({ updatedAt: entry.updatedAt, type: entry.type }).first();

        if (existingEntry) {
          console.log("Entry already exists, skipping...");
        } else {
          console.log("Adding new entry...");

          await db.entries.add({
            type: entry.type,
            data: encryptedData,
            updatedAt: entry.updatedAt,
            deletedAt: entry.deletedAt,
          });
        }
      }

      alert("Database restored successfully!");
    } catch (error) {
      alert("Failed to restore database.  ");
      console.error(error);
    }
  };
  reader.readAsText(file);
};
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div class="p-6 max-w-lg w-full bg-white rounded-lg shadow-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Database Backup & Restore</h2>

      <button @click="backupDatabase" class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Backup Database</button>

      <input type="file" ref="fileInput" @change="restoreDatabase" class="hidden" />
      <button @click="fileInput.click()" class="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Restore Database</button>
    </div>
  </div>
</template>
