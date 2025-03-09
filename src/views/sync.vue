<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { db } from "@/db.js";
import CryptoJS from "crypto-js";

const fileInput = ref(null);
const SERVER_URL = ref(localStorage.getItem("server_url") || "https://sh.t3vo.com");
const userID = ref(localStorage.getItem("user_id") || "");

const generateRandomID = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@&$#";
  return Array.from({ length: 16 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
};

const setUserID = () => {
  userID.value = generateRandomID() + "-" + generateRandomID();
  localStorage.setItem("user_id", userID.value);
};

const getUserAndKey = () => {
  if (!userID.value.includes("-")) {
    alert("Invalid User ID format");
    return {};
  }
  const [uid, key] = userID.value.split("-");
  return { uid, key };
};

const encryptData = (data, key) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

const decryptData = (ciphertext, key) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const saveToServer = async (data) => {
  const { uid, key } = getUserAndKey();
  if (!uid || !key) return;

  try {
    for (const entry of data) {
      const encryptedEntry = { id: entry.id, data: encryptData(entry, key) };
      await axios.post(`${SERVER_URL.value}/save/${uid}`, encryptedEntry, {
        headers: { "Content-Type": "application/json" },
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
  const { uid, key } = getUserAndKey();
  if (!uid || !key) return;

  try {
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await axios.get(`${SERVER_URL.value}/fetch/${uid}/${page}`);
      const { data, hasNextPage: nextPage } = response.data;

      for (const entry of data) {
        try {
          const decryptedData = decryptData(entry.data, key);
          const existingEntry = await db.entries.get(decryptedData.id);
          if (existingEntry) {
            if (existingEntry.updatedAt < decryptedData.updatedAt) {
              await db.entries.update(decryptedData.id, decryptedData);
            }
          } else {
            await db.entries.add(decryptedData);
          }
        } catch (error) {
          console.warn("Failed to decrypt an entry", error);
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
      <input v-model="SERVER_URL" type="text" placeholder="Enter Server URL" class="w-full px-4 py-2 border rounded-lg mb-4" @change="localStorage.setItem('server_url', SERVER_URL)" />

      <label class="block text-sm font-medium text-gray-600">User ID</label>
      <div class="flex items-center gap-2">
        <input v-model="userID" type="text" placeholder="Enter User ID" class="flex-1 px-4 py-2 border rounded-lg" @input="localStorage.setItem('user_id', userID)" />
        <button @click="setUserID" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Generate</button>
      </div>

      <button @click="backupDatabase" class="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Backup Database</button>
      <button @click="fetchFromServer" class="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Restore from Server</button>
    </div>
  </div>
</template>
