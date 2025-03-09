<script setup>
import { ref } from "vue";
import axios from "axios";
import { db } from "@/db.js";

const fileInput = ref(null);
const SERVER_URL = "http://localhost:57303";
const userID = ref("");

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

const fetchFromServer = async () => {
  if (!userID.value) {
    alert("Please set a user ID before restoring.");
    return;
  }

  try {
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await axios.get(`${SERVER_URL}/fetch/${userID.value}/${page}`);
      const { data, hasNextPage: nextPage } = response.data;

      for (const entry of data) {
        const existingEntry = await db.entries.get(entry.id);
        if (existingEntry) {
          if (existingEntry.updatedAt < entry.updatedAt) {
            await db.entries.update(entry.id, entry);
          }
        } else {
          await db.entries.add(entry);
        }
      }

      hasNextPage = nextPage;
      page++;
    }

    alert("Database restored successfully!");
  } catch (error) {
    alert("Failed to restore database.");
    console.error(error);
  }
};
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div class="p-6 max-w-lg w-full bg-white rounded-lg shadow-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Database Backup & Restore</h2>

      <input v-model="userID" type="text" placeholder="Enter User ID" class="w-full px-4 py-2 border rounded-lg mb-4" />

      <button @click="backupDatabase" class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Backup Database</button>
      <button @click="fetchFromServer" class="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Restore from Server</button>
    </div>
  </div>
</template>
