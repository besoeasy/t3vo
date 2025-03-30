<template>
  <LockScreen v-if="!isUnlocked" @unlock="handleUnlock" />

  <template v-else>
    <div class="flex flex-col md:flex-row h-screen">
      <nav
        class="bg-black text-yellow-400 bg-opacity-30 backdrop-blur-md w-full md:w-16 lg:w-24 h-16 md:h-screen flex md:flex-col justify-center items-center"
      >
        <div
          class="flex md:flex-col items-center justify-around w-full md:space-y-8 md:justify-center"
        >
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="block p-2 rounded-lg transition duration-200 group"
            :title="item.name"
          >
            <component
              :is="item.icon"
              class="w-6 h-6 md:w-8 md:h-8 group-hover:text-red-400 transition-colors duration-200"
            />
          </router-link>
        </div>
      </nav>

      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </template>
</template>

<script setup>
import { ref, onMounted } from "vue";
import LockScreen from "@/components/LockScreen.vue";
import {
  Home,
  Bookmark,
  Key,
  FileText,
  RefreshCw,
  Import,
  Scaling,
} from "lucide-vue-next";

const navItems = [
  { name: "Home", icon: Home, to: "/" },
  { name: "Bookmark", icon: Bookmark, to: "/bookmark" },
  { name: "Password", icon: Key, to: "/password" },
  { name: "Note", icon: FileText, to: "/note" },
  { name: "Import", icon: Import, to: "/import" },
  { name: "Backup", icon: Scaling, to: "/backup" },
  { name: "Sync", icon: RefreshCw, to: "/sync" },
];

const isUnlocked = ref(false);

const handleUnlock = () => {
  location.reload();
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
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
