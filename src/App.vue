<template>
  <PwaUpdate />
  <div v-if="!isUnlocked" class="w-full p-6 sm:p-12 text-center flex flex-col justify-center min-h-screen">
    <RoboHashAvatar :password="passwordInput" />

    <div class="w-full max-w-md mx-auto">
      <input v-model="passwordInput" type="password" placeholder="Enter Master Password" class="w-full p-4 text-lg border-0 rounded-lg bg-yellow-100 bg-opacity-50 focus:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200" @input="checkPasswordStrength" />

      <div v-if="passwordInput" class="mt-3 w-full flex items-center">
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full transition-all duration-300 ease-in-out" :class="strengthInfo.colorClass" :style="{ width: `${strengthPercentage}%` }"></div>
        </div>
      </div>

      <p v-if="showWarning" class="mt-2 text-red-600 text-sm">Warning: Your master password is {{ strengthInfo.label }}.</p>
    </div>

    <button @click="unlockApp" class="max-w-md mx-auto mt-6 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2" :disabled="passwordInput.length === 0">UNLOCK</button>

    <p class="text-sm text-blue-800 text-center pt-3 max-w-xl mx-auto">Your master password is the primary encryption key for securing all of your data. The robot avatar above will be unique to your password - it helps you visually verify you're using the correct master password.</p>
  </div>

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
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

import RoboHashAvatar from "@/components/RoboHash.vue";
import AppNavbar from "@/components/NavBar.vue";
import PwaUpdate from "@/components/pwa-update.vue";

const isUnlocked = ref(false);
const passwordInput = ref("");
const passwordStrength = ref(0);
const router = useRouter();

const checkPasswordStrength = () => {
  const password = passwordInput.value;

  if (!password) {
    passwordStrength.value = 0;
    return;
  }

  let score = 0;

  const lengthScore = Math.min(password.length * 4, 40);
  score += lengthScore;

  if (/[A-Z]/.test(password)) score += 15; // Uppercase
  if (/[a-z]/.test(password)) score += 15; // Lowercase
  if (/[0-9]/.test(password)) score += 15; // Numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 15; // Special characters

  passwordStrength.value = Math.min(Math.max(score, 0), 100);
};

const strengthPercentage = computed(() => passwordStrength.value);

const strengthInfo = computed(() => {
  const strength = passwordStrength.value;

  if (strength === 0) {
    return {
      label: "",
      colorClass: "",
      textColorClass: "",
    };
  }

  const thresholds = [
    { max: 30, label: "Very Weak", color: "red" },
    { max: 50, label: "Weak", color: "orange" },
    { max: 70, label: "Moderate", color: "yellow" },
    { max: 90, label: "Strong", color: "blue" },
    { max: Infinity, label: "Very Strong", color: "green" },
  ];

  const info = thresholds.find((t) => strength < t.max) || thresholds[thresholds.length - 1];

  return {
    label: info.label,
    colorClass: `bg-${info.color}-500`,
    textColorClass: `text-${info.color}-500`,
  };
});

const showWarning = computed(() => {
  return passwordInput.value.length > 0 && passwordStrength.value < 50;
});

const unlockApp = () => {
  if (passwordStrength.value < 50 && passwordInput.value.length > 0) {
    const confirmUse = confirm("Your master password is weak. Are you sure you want to use this password?");
    if (!confirmUse) return;
  }

  const encryptionKey = passwordInput.value;
  sessionStorage.setItem("ENCRYPTION_KEY", encryptionKey);
  passwordInput.value = "";
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
