<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { db } from "@/db.js";

const fileInput = ref(null);
const SERVER_URL = ref(localStorage.getItem("server_url") || "https://sh.t3vo.com");
const userID = ref(localStorage.getItem("user_id") || "");

const generateRandomID = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 16 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
};

const setUserID = () => {
  userID.value = generateRandomID();
  localStorage.setItem("user_id", userID.value);
};

const saveToServer = async (data) => {
  if (!userID.value) {
    alert("Please set a user ID before backing up.");
    return;
  }

  try {
    for (const entry of data) {
      await axios.post(`${SERVER_URL.value}/save/${userID.value}`, entry, {
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
      const response = await axios.get(`${SERVER_URL.value}/fetch/${userID.value}/${page}`);
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

onMounted(() => {
  if (!userID.value) {
    setUserID();
  }
});
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div class="p-6 max-w-lg w-full bg-white rounded-lg shadow-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-5">SYNC</h2>

      <label class="block text-sm font-medium text-gray-600">Server URL</label>
      <input
        v-model="SERVER_URL"
        type="text"
        placeholder="Enter Server URL"
        class="w-full px-4 py-2 border rounded-lg mb-4"
        @change="localStorage.setItem('server_url', SERVER_URL)"
      />

      <label class="block text-sm font-medium text-gray-600">User ID</label>
      <div class="flex items-center gap-2">
        <input
          v-model="userID"
          type="text"
          placeholder="Enter User ID"
          class="flex-1 px-4 py-2 border rounded-lg"
          @input="localStorage.setItem('user_id', userID)"
        />
        <button @click="setUserID" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Generate</button>
      </div>

      <button @click="backupDatabase" class="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
        Backup Database
      </button>
      <button @click="fetchFromServer" class="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
        Restore from Server
      </button>
    </div>
  </div>
</template>
