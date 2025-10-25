<template>
  <div class="flex h-screen bg-white overflow-hidden">
    <!-- Mobile Menu Toggle -->
    <button
      @click="toggleMobileMenu"
      class="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-lg"
      title="Menu"
    >
      <Menu v-if="!mobileMenuOpen" class="w-5 h-5" />
      <X v-else class="w-5 h-5" />
    </button>

    <!-- Overlay for mobile menu -->
    <div
      v-if="mobileMenuOpen"
      @click="toggleMobileMenu"
      class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
    ></div>

    <!-- Left Sidebar -->
    <aside
      :class="[
        'bg-white flex flex-col items-center transition-all duration-300',
        isDashboard ? '' : 'border-r border-gray-200',
        'md:w-[80px] md:py-6 md:px-3 md:relative md:translate-x-0',
        'fixed inset-y-0 left-0 z-40 w-[200px] py-8 px-4',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- App Branding -->
      <h1 class="text-xl md:text-2xl font-semibold text-gray-900 mb-6 md:mb-8">T3VO</h1>

      <!-- New Note Button (Dashboard only) -->
      <button
        v-if="isDashboard"
        @click="handleNewNote"
        class="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors shadow-md mb-8 md:mb-12"
        title="New Note"
      >
        <Plus class="w-6 h-6" />
      </button>

      <!-- Back to Dashboard Button (Other pages) -->
      <router-link
        v-else
        to="/dashboard"
        @click="mobileMenuOpen = false"
        class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors mb-8"
        title="Back to Notes"
      >
        <ArrowLeft class="w-6 h-6" />
      </router-link>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Sync Link -->
      <router-link
        to="/sync"
        @click="mobileMenuOpen = false"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Device Sync"
      >
        <Wifi class="w-5 h-5" />
      </router-link>

      <!-- Stats Link -->
      <router-link
        to="/stats"
        @click="mobileMenuOpen = false"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Statistics"
      >
        <BarChart3 class="w-5 h-5" />
      </router-link>

      <!-- Backup Link -->
      <router-link
        to="/backup"
        @click="mobileMenuOpen = false"
        class="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors mb-3"
        title="Backup & Restore"
      >
        <Database class="w-5 h-5" />
      </router-link>

      <!-- GitHub Link -->
      <a
        href="https://github.com/besoeasy/t3vo"
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
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Lock, Database, BarChart3, Wifi, Menu, X, ArrowLeft } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const mobileMenuOpen = ref(false);

const isDashboard = computed(() => route.path === "/dashboard" || route.path === "/");

const emit = defineEmits(["newNote"]);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const handleNewNote = () => {
  mobileMenuOpen.value = false;
  // Generate a random ID for new note and navigate directly
  const newNoteId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  router.push(`/notes/${newNoteId}`);
};

const handleLogout = () => {
  if (confirm("Are you sure you want to lock the app?")) {
    sessionStorage.removeItem("ENCRYPTION_KEY");
    sessionStorage.removeItem("ENCRYPTION_PIN");
    location.reload();
  }
};
</script>
