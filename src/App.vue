<template>
  <LockScreen v-if="!isUnlocked" @unlock="handleUnlock" />

  <template v-else>
    <div class="min-h-screen bg-gray-50">
      <!-- Top Navigation Bar -->
      <nav
        class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo/Brand -->
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <h1 class="text-xl font-bold text-gray-900">
                  T3VO
                  <span class="text-sm font-medium text-gray-500 ml-2"
                    >v{{ version }}</span
                  >
                </h1>
              </div>
            </div>

            <!-- Navigation Links -->
            <div class="hidden md:block">
              <div class="flex items-center space-x-1">
                <router-link
                  v-for="item in navItems"
                  :key="item.to"
                  :to="item.to"
                  class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 group"
                  :class="[
                    $route.path === item.to
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                  ]"
                >
                  <component
                    :is="item.icon"
                    class="w-4 h-4 mr-2 transition-colors duration-200"
                    :class="[
                      $route.path === item.to
                        ? 'text-blue-600'
                        : 'text-gray-400 group-hover:text-gray-600',
                    ]"
                  />
                  {{ item.name }}
                </router-link>
              </div>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden">
              <button
                @click="mobileMenuOpen = !mobileMenuOpen"
                class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
              >
                <component
                  :is="mobileMenuOpen ? 'X' : 'Menu'"
                  class="w-6 h-6"
                />
              </button>
            </div>

            <!-- User Actions -->
            <div class="flex items-center space-x-3">
              <a
                href="https://github.com/besoeasy/t3vo"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                title="View on GitHub"
              >
                <GithubIcon class="w-4 h-4 mr-1" />
                <span class="hidden sm:inline">GitHub</span>
              </a>
              <button
                @click="handleLogout"
                class="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                title="Lock App"
              >
                <Lock class="w-4 h-4 mr-1" />
                <span class="hidden sm:inline">Lock</span>
              </button>
            </div>
          </div>

          <!-- Mobile Navigation Menu -->
          <div
            v-if="mobileMenuOpen"
            class="md:hidden border-t border-gray-200 py-2"
          >
            <div class="space-y-1">
              <router-link
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                @click="mobileMenuOpen = false"
                class="flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                :class="[
                  $route.path === item.to
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                ]"
              >
                <component
                  :is="item.icon"
                  class="w-5 h-5 mr-3"
                  :class="[
                    $route.path === item.to ? 'text-blue-600' : 'text-gray-400',
                  ]"
                />
                {{ item.name }}
              </router-link>

              <!-- Mobile GitHub Link -->
              <a
                href="https://github.com/besoeasy/t3vo"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 border-t border-gray-200 mt-2 pt-3"
                @click="mobileMenuOpen = false"
              >
                <GithubIcon class="w-5 h-5 mr-3 text-gray-400" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-1">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <RouterView />
        </div>
      </main>
    </div>
  </template>
</template>

<script setup>
import { ref, onMounted } from "vue";
import LockScreen from "@/components/LockScreen.vue";
import {
  Layers,
  RefreshCw,
  Import,
  Scaling,
  Lock,
  Menu,
  X,
  GithubIcon,
} from "lucide-vue-next";
import { version } from "../package.json";

const navItems = [
  { name: "Dashboard", icon: Layers, to: "/dashboard" },
  { name: "Import", icon: Import, to: "/import" },
  { name: "Backup", icon: Scaling, to: "/backup" },
  { name: "Sync", icon: RefreshCw, to: "/sync" },
];

const isUnlocked = ref(false);
const mobileMenuOpen = ref(false);

const handleUnlock = () => {
  location.reload();
};

const handleLogout = () => {
  if (confirm("Are you sure you want to lock the app?")) {
    sessionStorage.removeItem("ENCRYPTION_KEY");
    location.reload();
  }
};

onMounted(() => {
  if (sessionStorage.getItem("ENCRYPTION_KEY")) {
    isUnlocked.value = true;
  }
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Router link active state transitions */
.router-link-active {
  transition: all 0.2s ease-in-out;
}

/* Focus states for accessibility */
button:focus,
a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
