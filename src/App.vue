<template>
  <div v-if="!isUnlocked" class="w-full p-6 sm:p-12 text-center flex flex-col justify-center min-h-screen">
    <div class="mb-8 flex justify-center">
      <div class="relative w-[300px] h-[300px] sm:w-[500px] sm:h-[500px]">
        <div class="relative group">
          <img :src="roboHashUrl" alt="Profile Avatar" class="w-full h-full transition-all duration-300" />
        </div>
      </div>
    </div>

    <div class="w-full max-w-md mx-auto">
      <input v-model="passwordInput" type="password" placeholder="Enter Master Password" class="w-full p-4 text-lg border-0 rounded-lg bg-yellow-100 bg-opacity-50 focus:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200" @input="checkPasswordStrength" />

      <div v-if="passwordInput" class="mt-3 w-full flex items-center">
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full transition-all duration-300 ease-in-out" :class="strengthColorClass" :style="{ width: `${strengthPercentage}%` }"></div>
        </div>
        <span class="ml-3 text-sm font-medium" :class="strengthTextColorClass">
          {{ strengthLabel }}
        </span>
      </div>

      <p v-if="showWarning" class="mt-2 text-red-600 text-sm">Warning: Your master password is weak. Consider using a stronger password with a mix of uppercase, lowercase, numbers, and special characters.</p>
    </div>

    <button @click="unlockApp" class="max-w-md mx-auto mt-6 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2" :disabled="passwordInput.length === 0">UNLOCK</button>

    <p class="text-sm text-blue-800 text-center pt-6 max-w-2xl mx-auto">Your master password is the primary encryption key for securing all of your data. The robot avatar above will be unique to your password - it helps you visually verify you're using the correct master password.</p>
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
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { Home, Bookmark, Key, FileText, RefreshCw, Import, Archive, Scaling } from "lucide-vue-next";
import CryptoJS from "crypto-js";

const isUnlocked = ref(false);
const passwordInput = ref("");
const passwordStrength = ref(0);
const router = useRouter();

// Generate SHA-256 hash of the password
const getPasswordHash = (password) => {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};

// Generate Robohash URL based on password length
const roboHashUrl = computed(() => {
  const hash = getPasswordHash(passwordInput.value);
  return `https://robohash.org/${hash}?set=set2&size=400x400`;
});

const checkPasswordStrength = () => {
  const password = passwordInput.value;

  if (!password) {
    passwordStrength.value = 0;
    return;
  }

  // Start with a base score
  let score = 0;

  // Length check (up to 40 points)
  const lengthScore = Math.min(password.length * 4, 40);
  score += lengthScore;

  // Character variety checks
  if (/[A-Z]/.test(password)) score += 15; // Uppercase
  if (/[a-z]/.test(password)) score += 15; // Lowercase
  if (/[0-9]/.test(password)) score += 15; // Numbers
  if (/[^A-Za-z0-9]/.test(password)) score += 15; // Special characters

  passwordStrength.value = Math.min(Math.max(score, 0), 100);
};

const strengthPercentage = computed(() => passwordStrength.value);

const strengthLabel = computed(() => {
  const strength = passwordStrength.value;
  if (strength === 0) return "";
  if (strength < 30) return "Very Weak";
  if (strength < 50) return "Weak";
  if (strength < 70) return "Moderate";
  if (strength < 90) return "Strong";
  return "Very Strong";
});

const strengthColorClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength < 30) return "bg-red-500";
  if (strength < 50) return "bg-orange-500";
  if (strength < 70) return "bg-yellow-500";
  if (strength < 90) return "bg-blue-500";
  return "bg-green-500";
});

const strengthTextColorClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength < 30) return "text-red-500";
  if (strength < 50) return "text-orange-500";
  if (strength < 70) return "text-yellow-500";
  if (strength < 90) return "text-blue-500";
  return "text-green-500";
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
