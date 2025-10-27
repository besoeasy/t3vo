
<template>
  <main class="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-2 py-6 sm:px-4 sm:py-8">
    <header class="w-full max-w-3xl text-center mb-6">
      <h1 class="text-3xl sm:text-4xl font-bold mb-2 text-gray-900 dark:text-white">Backup & Sync Options</h1>
      <p class="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-xl mx-auto">
        Securely sync or backup your notes. Choose a method below:
      </p>
    </header>
    <section aria-label="Sync and Backup Methods" class="flex flex-col gap-6 w-full max-w-3xl md:flex-row md:gap-8 justify-center">
      <!-- P2P Sync -->
      <router-link
        to="/p2p"
        class="flex flex-1 flex-col items-center justify-center rounded-2xl shadow-md p-6 sm:p-8 min-w-[180px] min-h-[220px] sm:min-w-[220px] sm:min-h-[320px] text-center transition-all duration-200 cursor-pointer border-2 border-transparent hover:shadow-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 group focus:outline-none focus:ring-2 focus:ring-blue-400"
        tabindex="0"
        aria-label="Peer-to-Peer: Encrypted device-to-device sync"
      >
        <div class="flex items-center justify-center rounded-full w-20 h-20 sm:w-22 sm:h-22 bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>
        <div class="mt-4 text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">Peer-to-Peer</div>
        <div class="text-gray-500 dark:text-gray-400 text-sm">Encrypted device-to-device sync</div>
      </router-link>
      <!-- S3 Sync -->
      <router-link
        to="/s3"
        class="flex flex-1 flex-col items-center justify-center rounded-2xl shadow-md p-6 sm:p-8 min-w-[180px] min-h-[220px] sm:min-w-[220px] sm:min-h-[320px] text-center transition-all duration-200 cursor-pointer border-2 border-transparent hover:shadow-xl hover:bg-green-50 dark:hover:bg-green-900/30 group focus:outline-none focus:ring-2 focus:ring-green-400"
        tabindex="0"
        aria-label="S3 / MinIO: Encrypted cloud backup & sync"
      >
        <div class="flex items-center justify-center rounded-full w-20 h-20 sm:w-22 sm:h-22 bg-green-100 dark:bg-green-900 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-200 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 sm:h-16 sm:w-16 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h10a4 4 0 100-8h-1.26A8 8 0 103 15z" />
          </svg>
        </div>
        <div class="mt-4 text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">S3 / MinIO</div>
        <div class="text-gray-500 dark:text-gray-400 text-sm">Encrypted cloud backup & sync</div>
      </router-link>
      <!-- Local Backup -->
      <router-link
        to="/backup"
        class="flex flex-1 flex-col items-center justify-center rounded-2xl shadow-md p-6 sm:p-8 min-w-[180px] min-h-[220px] sm:min-w-[220px] sm:min-h-[320px] text-center transition-all duration-200 cursor-pointer border-2 border-transparent hover:shadow-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/30 group focus:outline-none focus:ring-2 focus:ring-yellow-400"
        tabindex="0"
        aria-label="Local Backup: Unencrypted export/import"
      >
        <div class="flex items-center justify-center rounded-full w-20 h-20 sm:w-22 sm:h-22 bg-yellow-100 dark:bg-yellow-900 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors duration-200 mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 sm:h-16 sm:w-16 text-yellow-600 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div class="mt-4 text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">Local Backup</div>
        <div class="text-gray-500 dark:text-gray-400 text-sm">Unencrypted export/import</div>
      </router-link>
    </section>
  </main>
</template>
