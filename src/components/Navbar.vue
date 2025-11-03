<template>
  <div class="flex h-screen bg-white overflow-hidden">
    <!-- Desktop Sidebar Only -->
    <aside class="bg-white flex flex-col items-center border-r border-gray-200 w-20 py-6 px-2 relative">
      <!-- App Branding -->
      <h1 class="text-xl font-semibold text-gray-900 mb-6 md:mb-8 uppercase">Zero<br />Note</h1>

      <!-- New Note Button (Dashboard only) -->
      <button
        v-if="isDashboard"
        @click="handleNewNote"
        class="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors shadow-md mb-8"
        title="New Note"
      >
        <Plus class="w-5 h-5" />
      </button>

      <!-- Back to Dashboard Button (Other pages) -->
      <router-link
        v-else
        to="/dashboard"
        class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors mb-8"
        title="Back to Notes"
      >
        <ArrowLeft class="w-5 h-5" />
      </router-link>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Tags Link -->
      <router-link
        to="/tags"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Available Tags"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      </router-link>

      <!-- Sync Overview Link -->
      <router-link
        to="/sync"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Backup & Sync Options"
      >
        <Database class="w-5 h-5" />
      </router-link>

      <!-- Stats Link -->
      <router-link
        to="/stats"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Statistics"
      >
        <BarChart3 class="w-5 h-5" />
      </router-link>

      <!-- Import Link -->
      <router-link
        to="/import"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Import Data"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </router-link>

      <!-- GitHub Link -->
      <a
        href="https://github.com/besoeasy/ZeroNote"
        target="_blank"
        rel="noopener noreferrer"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="GitHub Repository"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clip-rule="evenodd"
          />
        </svg>
      </a>

      <!-- GitHub Link -->
      <a
        href="https://coinos.io/BeSoEasy"
        target="_blank"
        rel="noopener noreferrer"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Donate Bitcoin"
      >
        <Bitcoin class="w-5 h-5" />
      </a>

      <!-- Settings/Lock Button -->
      <button
        @click="handleLogout"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
        title="Lock App"
      >
        <Lock class="w-5 h-5" />
      </button>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-auto">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Lock, Database, BarChart3, Bitcoin, ArrowLeft } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const isDashboard = computed(() => route.path === "/dashboard" || route.path === "/");

const emit = defineEmits(["newNote"]);

const generateRandomId = () => {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

const handleNewNote = () => {
  router.push(`/notes/${generateRandomId()}/edit`);
};

const handleLogout = () => {
  if (confirm("Are you sure you want to lock the app?")) {
    sessionStorage.clear();
    location.reload();
  }
};
</script>
