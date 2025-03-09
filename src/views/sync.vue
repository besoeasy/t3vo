<script setup>
import { ref } from "vue";
import { db } from "@/db.js";

const SERVER_URL = "http://localhost:57303";
const USER_ID = "your-unique-user-id"; 

// Pagination state
const currentPage = ref(1);
const totalPages = ref(1);
const entries = ref([]);

// Fetch entries from the server
const fetchEntries = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/fetch/${USER_ID}/${currentPage.value}`);
    if (!response.ok) throw new Error("Failed to fetch entries");

    const data = await response.json();
    entries.value = data.data;

    // Calculate total pages based on the total entries
    totalPages.value = Math.ceil(data.totalCount / 30); // Assuming 30 entries per page
  } catch (error) {
    console.error("Error fetching entries:", error);
    alert("Failed to fetch entries.");
  }
};

// Backup entries to the server (in batches)
const backupDatabase = async () => {
  try {
    const entriesData = await db.entries.filter((entry) => !entry.deletedAt).toArray();
    const batchSize = 20; // Adjust this based on the server's capacity

    for (let i = 0; i < entriesData.length; i += batchSize) {
      const batch = entriesData.slice(i, i + batchSize);
      
      // Send entries in batches
      const response = await fetch(`${SERVER_URL}/save/${USER_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch), // Send an array of entries in one request
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error("Backup failed for entries batch");
      }
    }

    alert("Backup successful!");
  } catch (error) {
    console.error("Backup failed:", error);
    alert("Failed to backup data.");
  }
};

// Restore entries from the server
const restoreDatabase = async () => {
  try {
    let page = 1;
    let totalRestored = 0;
    let isMoreData = true;

    while (isMoreData) {
      const response = await fetch(`${SERVER_URL}/fetch/${USER_ID}/${page}`);
      if (!response.ok) throw new Error("No data found or failed to fetch data");

      const jsonData = await response.json();
      if (!jsonData.data || jsonData.data.length === 0) {
        isMoreData = false; // No more data to restore
        break;
      }

      console.log(`Restoring page ${page}, ${jsonData.data.length} entries`);

      // Loop through and add entries to the local DB
      for (const entry of jsonData.data) {
        // Check if the entry already exists in the DB using unique identifier (e.g., `updatedAt`)
        const existingEntry = await db.entries.where({ updatedAt: entry.updatedAt }).first();
        if (!existingEntry) {
          await db.entries.add(entry); // Add to DB directly
          totalRestored++;
        }
      }

      page++; // Move to the next page
    }

    alert(`${totalRestored} entries restored successfully!`);
  } catch (error) {
    console.error("Restore failed:", error);
    alert("Failed to restore database.");
  }
};

// Go to the next page
const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchEntries();
  }
};

// Go to the previous page
const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchEntries();
  }
};
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div class="p-6 max-w-lg w-full bg-white rounded-lg shadow-lg">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Database Backup & Restore</h2>

      <button @click="backupDatabase" class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
        Backup Database
      </button>

      <button @click="restoreDatabase" class="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
        Restore Database
      </button>

      <div v-if="entries.length > 0" class="mt-6">
        <h3 class="text-lg font-semibold text-gray-700">Entries</h3>
        <ul class="space-y-2">
          <li v-for="entry in entries" :key="entry.updatedAt" class="p-2 border-b">
            <pre>{{ entry.data }}</pre> <!-- Display the data of each entry -->
          </li>
        </ul>
        <div class="mt-4 flex justify-between">
          <button 
            @click="goToPrevPage" 
            :disabled="currentPage === 1"
            class="bg-gray-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-600"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button 
            @click="goToNextPage" 
            :disabled="currentPage === totalPages"
            class="bg-gray-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
