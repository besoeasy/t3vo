<template>
  <div class="w-full p-6 sm:p-12 text-center flex flex-col justify-center min-h-screen">
    <!-- Lock Icon -->
    <div class="max-w-md mx-auto w-full">
      <h1 class="text-4xl font-bold text-gray-900 mb-2 uppercase">Zero Note</h1>
      <p class="text-gray-600 mb-6">Your Secure Note Vault</p>

      <div class="w-full max-w-md mx-auto">
        <input
          v-model="passwordInput"
          type="password"
          placeholder="Enter Master Password"
          class="w-full p-4 text-lg border-2 border-gray-300 rounded-xl bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200 shadow-sm"
          @input="checkPasswordStrength"
          @keyup.enter="unlockApp"
        />

        <input
          v-model="pinInput"
          type="password"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="Enter PIN (Numeric)"
          class="w-full p-4 text-lg border-2 border-gray-300 rounded-xl bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200 shadow-sm mt-4"
          @input="validatePin"
          @keyup.enter="unlockApp"
          maxlength="16"
        />

        <div v-if="passwordInput" class="mt-3 w-full flex items-center">
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full transition-all duration-300 ease-in-out" :class="strengthInfo.colorClass" :style="{ width: `${strengthPercentage}%` }"></div>
          </div>
        </div>

        <p v-if="showWarning" class="mt-2 text-red-600 text-sm font-medium">⚠️ Warning: Your master password is {{ strengthInfo.label }}.</p>

        <div v-if="AccountIdentifier" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-xs text-gray-600 mb-1">Account Identifier:</p>
          <p class="text-sm font-mono text-blue-800">{{ AccountIdentifier }}</p>
        </div>
      </div>

      <button
        @click="unlockApp"
        class="w-full max-w-md mx-auto mt-6 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="passwordInput.length === 0"
      >
        <span class="flex items-center justify-center">
          <Unlock class="w-5 h-5 mr-2" />
          DECRYPT & UNLOCK
        </span>
      </button>

      <div class="mt-5 p-4 bg-white bg-opacity-60 rounded-xl backdrop-blur-sm">
        <p class="text-sm text-gray-700 text-center">
          🔐 Your master password is the encryption key for all your data.<br />
          Choose a strong password and remember it - it cannot be recovered.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Lock, Unlock } from "lucide-vue-next";

import sha512 from "crypto-js/sha512";

const passwordInput = ref("");
const pinInput = ref("");
const passwordStrength = ref(0);

const emit = defineEmits(["unlock"]);

// Word lists for generating Account identifier
const adjectives = [
  "happy",
  "bright",
  "calm",
  "swift",
  "brave",
  "gentle",
  "proud",
  "wise",
  "kind",
  "noble",
  "quiet",
  "bold",
  "clever",
  "eager",
  "fancy",
  "jolly",
  "keen",
  "lively",
  "mighty",
  "polite",
  "witty",
  "zealous",
  "careful",
  "daring",
];

const nouns = [
  "ocean",
  "mountain",
  "river",
  "forest",
  "meadow",
  "valley",
  "garden",
  "sunset",
  "morning",
  "eagle",
  "dolphin",
  "tiger",
  "phoenix",
  "dragon",
  "wolf",
  "falcon",
  "star",
  "moon",
  "cloud",
  "wind",
  "thunder",
  "rainbow",
  "crystal",
  "diamond",
];

const verbs = [
  "dances",
  "flows",
  "shines",
  "soars",
  "runs",
  "jumps",
  "sings",
  "flies",
  "glides",
  "whispers",
  "roars",
  "sparkles",
  "glows",
  "blooms",
  "rises",
  "falls",
  "dreams",
  "wonders",
  "creates",
  "explores",
  "discovers",
  "transforms",
  "illuminates",
  "unites",
];

const validatePin = () => {
  // Ensure only numeric values
  pinInput.value = pinInput.value.replace(/\D/g, "");
};

const AccountIdentifier = computed(() => {
  if (!passwordInput.value && !pinInput.value) return "";

  // Generate a hash from the current inputs
  const combined = passwordInput.value + pinInput.value;
  if (!combined) return "";

  const hash = sha512("besoeasy" + combined).toString();

  // Use hash to deterministically select words
  const hashNum = parseInt(hash.substring(0, 8), 16);
  const adjIndex = hashNum % adjectives.length;
  const nounIndex = Math.floor(hashNum / adjectives.length) % nouns.length;
  const verbIndex = Math.floor(hashNum / (adjectives.length * nouns.length)) % verbs.length;

  const adj = adjectives[adjIndex];
  const noun = nouns[nounIndex];
  const verb = verbs[verbIndex];

  return `The ${adj} ${noun} ${verb}`;
});

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

  // making the encryption key more complex by hashing with sha512 and adding a static salt, to prevent hackers from matching common passwords incase users use weak passwords
  const encryptionKey = sha512("besoeasy" + passwordInput.value + pinInput.value);

  sessionStorage.setItem("ENCRYPTION_KEY", encryptionKey);
  passwordInput.value = "";
  pinInput.value = "";
  emit("unlock");
};
</script>
