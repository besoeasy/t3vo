<template>
  <div class="sync-options flex flex-col items-center justify-center min-h-screen bg-white">
    <h1 class="text-3xl font-bold mb-8 text-gray-900">Backup & Sync Options</h1>
    <div class="flex flex-col md:flex-row gap-8 w-full max-w-3xl justify-center">
      <!-- P2P Sync -->
      <router-link to="/p2p" class="sync-card group">
        <div class="icon-wrapper bg-blue-100 group-hover:bg-blue-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </div>
        <div class="mt-4 text-xl font-semibold text-gray-800">Peer-to-Peer</div>
        <div class="text-gray-500 text-sm">Encrypted device-to-device sync</div>
      </router-link>
      <!-- S3 Sync -->
      <router-link to="/s3" class="sync-card group">
        <div class="icon-wrapper bg-green-100 group-hover:bg-green-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h10a4 4 0 100-8h-1.26A8 8 0 103 15z" /></svg>
        </div>
        <div class="mt-4 text-xl font-semibold text-gray-800">S3 / MinIO</div>
        <div class="text-gray-500 text-sm">Encrypted cloud backup & sync</div>
      </router-link>
      <!-- Local Backup -->
      <router-link to="/backup" class="sync-card group">
        <div class="icon-wrapper bg-yellow-100 group-hover:bg-yellow-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        </div>
        <div class="mt-4 text-xl font-semibold text-gray-800">Local Backup</div>
        <div class="text-gray-500 text-sm">Unencrypted export/import</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
// No logic needed, purely presentational
</script>

<style scoped>
.sync-options {
  padding: 2rem 1rem;
}
.sync-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f9fafb;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 2rem 1.5rem;
  min-width: 220px;
  min-height: 320px;
  text-align: center;
  transition: box-shadow 0.2s, background 0.2s;
  cursor: pointer;
  border: 2px solid transparent;
}
.sync-card:hover {
  box-shadow: 0 6px 24px rgba(0,0,0,0.10);
  border-color: #a0aec0;
  background: #f3f4f6;
}
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  width: 5.5rem;
  height: 5.5rem;
  margin: 0 auto;
  transition: background 0.2s;
}
</style>
