<script setup>
import { ref } from "vue";
import axios from "axios";
import { db } from "@/db.js";

const fileInput = ref(null);
const SERVER_URL = "http://localhost:57303"; // Change this to your actual server URL
const userID = ref(""); // User can set this value

const saveToServer = async (data) => {
  if (!userID.value) {
    alert("Please set a user ID before backing up.");
    return;
  }

  try {
    for (const entry of data) {
      await axios.post(`${SERVER_URL}/save/${userID.value}`, entry, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    alert("Database backed up successfully!");
  } catch (error) {
    console.error("Backup failed:", error);
    alert("Backup failed. Please try again.");
  }
};

const backupDatabase = async () => {
  const entries = await db.entries.filter((entry) => !entry.deletedAt).toArray();
  await saveToServer(entries);
};

const restoreDatabase = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const jsonData = JSON.parse(e.target.result);

      for (const entry of jsonData) {
        const existingEntry = await db.entries.where({ updatedAt: entry.updatedAt, type: entry.type }).first();

        if (existingEntry) {
          console.log("Entry already exists, skipping...");
        } else {
          console.log("Adding new entry...");
          await db.entries.add(entry);
        }
      }

      alert("Database restored successfully!");
    } catch (error) {
      alert("Failed to restore database.");
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

      <input v-model="userID" type="text" placeholder="Enter User ID" class="w-full px-4 py-2 border rounded-lg mb-4" />

      <button @click="backupDatabase" class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Backup Database</button>

      <input type="file" ref="fileInput" @change="restoreDatabase" class="hidden" />
      <button @click="fileInput.click()" class="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Restore Database</button>
    </div>
  </div>
</template>