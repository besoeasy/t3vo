<template>
  <div v-if="!isUnlocked" class="w-full p-6 sm:p-12 text-center flex flex-col justify-center h-screen">
    <h1 class="text-3xl sm:text-4xl font-semibold text-gray-800 mb-8">Enter Master Password</h1>
    <input v-model="passwordInput" type="password" placeholder="Master Password" class="w-full max-w-md mx-auto p-4 text-lg border-0 rounded-lg bg-yellow-100 bg-opacity-50 focus:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200" />
    <button @click="unlockApp" class="max-w-md mx-auto mt-6 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">UNLOCK</button>
  </div>

  <template v-else>
    <div class="flex flex-col md:flex-row h-screen">
      <nav class="bg-black text-yellow-400 bg-opacity-30 backdrop-blur-md w-full md:w-16 lg:w-24 h-16 md:h-screen flex md:flex-col justify-center items-center">
        <div class="flex md:flex-col items-center justify-around w-full md:space-y-8 md:justify-center">
          <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="block p-2 rounded-lg transition duration-200 group" :title="item.name">
            <component :is="item.icon" class="w-6 h-6 md:w-8 md:h-8 group-hover:text-red-400 transition-colors duration-200" />
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
import { useRouter } from "vue-router";
import { Home, Bookmark, Key, FileText, RefreshCw, Import, Archive, Scaling } from "lucide-vue-next";

const isUnlocked = ref(false);
const passwordInput = ref("");
const router = useRouter();

const unlockApp = () => {
  sessionStorage.setItem("ENCRYPTION_KEY", passwordInput.value);
  passwordInput.value = "";
  location.reload();
};

onMounted(() => {
  if (sessionStorage.getItem("ENCRYPTION_KEY")) {
    isUnlocked.value = true;
  }
});

const navItems = [
  { name: "Home", icon: Home, to: "/" },
  { name: "Bookmark", icon: Bookmark, to: "/bookmark" },
  { name: "Password", icon: Key, to: "/password" },
  { name: "Note", icon: FileText, to: "/note" },
  { name: "Import", icon: Import, to: "/import" },
  { name: "Backup", icon: Scaling, to: "/backup" },
  { name: "Sync", icon: RefreshCw, to: "/sync" },
];
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
