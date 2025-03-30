<template>
  <LockScreen v-if="!isUnlocked" @unlock="handleUnlock" />
  
  <template v-else>
    <div class="flex flex-col md:flex-row h-screen">
      <AppNavbar />
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </template>
</template>

<script setup>
import { ref, onMounted } from "vue";
import LockScreen from "@/components/LockScreen.vue";
import AppNavbar from "@/components/NavBar.vue";

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