<template>
  <div class="flex h-screen bg-white overflow-hidden">
    <aside class="bg-white flex flex-col items-center border-r border-gray-200 w-20 py-6 px-2 relative">
      <h1 class="text-xl font-semibold text-gray-900 mb-6 md:mb-8 uppercase">Zero<br />Note</h1>

      <button
        v-if="isDashboard"
        @click="handleNewNote"
        class="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors shadow-md mb-8"
        title="New Note"
      >
        <Plus class="w-5 h-5" />
      </button>

      <router-link
        v-else
        to="/dashboard"
        class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors mb-8"
        title="Back to Notes"
      >
        <ArrowLeft class="w-5 h-5" />
      </router-link>

      <div class="flex-1"></div>

      <router-link
        to="/sync"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Backup & Sync Options"
      >
        <Database class="w-5 h-5" />
      </router-link>

      <router-link
        to="/import"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Import Data"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </router-link>

      <router-link
        to="/stats"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Statistics"
      >
        <BarChart3 class="w-5 h-5" />
      </router-link>

      <router-link
        to="/about"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="About ZeroNote"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </router-link>

      <button
        @click="handleLogout"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
        title="Lock App"
      >
        <Lock class="w-5 h-5" />
      </button>
    </aside>

    <main class="flex-1 overflow-auto">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Lock, Database, BarChart3, ArrowLeft } from "lucide-vue-next";

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
