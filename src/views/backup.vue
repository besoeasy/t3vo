<script setup>
import { ref } from 'vue';
import { db } from '@/db.js';
import { saveAs } from 'file-saver';

const fileInput = ref(null);

// Backup database
const backupDatabase = async () => {
  const entries = await db.entries.toArray();
  const jsonData = JSON.stringify(entries, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  saveAs(blob, 'backup.json');
};

// Restore database
const restoreDatabase = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const jsonData = JSON.parse(e.target.result);
      await db.entries.clear(); // Clear existing data before restoring
      await db.entries.bulkAdd(jsonData);
      alert('Database restored successfully!');
    } catch (error) {
      alert('Failed to restore database. Invalid file format.');
    }
  };
  reader.readAsText(file);
};
</script>

<template>
  <div class="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold text-gray-700 mb-4">Database Backup & Restore</h2>
    
    <button @click="backupDatabase" class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
      Backup Database
    </button>

    <input type="file" ref="fileInput" @change="restoreDatabase" class="hidden" />
    <button @click="fileInput.click()" class="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
      Restore Database
    </button>
  </div>
</template>
