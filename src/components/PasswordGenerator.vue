<script setup>
import { ref, onMounted } from "vue";
import {
  LockIcon,
  SettingsIcon,
  XIcon,
  ClipboardCopyIcon,
  CheckIcon,
  RefreshCwIcon,
  MinusIcon,
  PlusIcon,
  HashIcon,
  Hash
} from "lucide-vue-next";

const suggestedPassword = ref("");
const passwordCopied = ref(false);
const showPasswordOptions = ref(false);
const passwordLength = ref(16);
const includeSymbols = ref(true);
const includeNumbers = ref(true);

const togglePasswordOptions = () => {
  showPasswordOptions.value = !showPasswordOptions.value;
};

const increaseLength = () => {
  if (passwordLength.value < 32) {
    passwordLength.value++;
    generatePassword();
  }
};

const decreaseLength = () => {
  if (passwordLength.value > 8) {
    passwordLength.value--;
    generatePassword();
  }
};

const generatePassword = () => {
  let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if (includeNumbers.value) {
    charset += "0123456789";
  }

  if (includeSymbols.value) {
    charset += "!@#$%^&*()_+{}[]|:;<>,.?~";
  }

  const charsetLength = charset.length;
  const randomValues = new Uint32Array(passwordLength.value);
  crypto.getRandomValues(randomValues);

  let password = "";

  for (let i = 0; i < randomValues.length; i++) {
    let randomValue = randomValues[i];

    // Reject values that would cause modulo bias
    while (randomValue >= 2 ** 32 - (2 ** 32 % charsetLength)) {
      randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
    }

    password += charset[randomValue % charsetLength];
  }

  suggestedPassword.value = password;
  passwordCopied.value = false;
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(suggestedPassword.value);
    passwordCopied.value = true;
    setTimeout(() => {
      passwordCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy password: ", err);
  }
};

// Generate password on component mount
onMounted(() => {
  generatePassword();
});
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
    <div class="p-5 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
          <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
            <LockIcon class="w-4 h-4 text-indigo-600" />
          </div>
          Password Generator
        </h2>
        <button @click="togglePasswordOptions"
          class="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-indigo-50"
          aria-label="Toggle password options">
          <component :is="showPasswordOptions ? XIcon : SettingsIcon" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="p-5">
      <div
        class="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200 group hover:border-indigo-300 transition-all duration-200">
        <div class="flex items-center justify-between">
          <p class="text-lg font-mono text-gray-800 truncate group-hover:text-indigo-700 transition-colors">
            {{ suggestedPassword }}
          </p>
          <button @click="copyToClipboard"
            class="text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors ml-2 p-1.5 rounded-full hover:bg-indigo-100"
            :class="{ 'text-emerald-500 bg-emerald-50': passwordCopied }"
            :aria-label="passwordCopied ? 'Password copied' : 'Copy password'">
            <component :is="passwordCopied ? CheckIcon : ClipboardCopyIcon" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <button @click="generatePassword"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
        aria-label="Generate new password">
        <RefreshCwIcon class="w-4 h-4 mr-2" />
        Generate New Password
      </button>
    </div>

    <!-- Password Options Panel -->
    <div v-if="showPasswordOptions" class="px-5 py-4 border-t border-gray-100 bg-gray-50 animate-fadeIn">
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <label class="text-sm font-medium text-gray-700">Password Length</label>
          <div class="flex items-center">
            <button @click="decreaseLength"
              class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              aria-label="Decrease password length">
              <MinusIcon class="w-4 h-4" />
            </button>
            <span class="mx-3 text-sm font-medium w-6 text-center">{{ passwordLength }}</span>
            <button @click="increaseLength"
              class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              aria-label="Increase password length">
              <PlusIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <label class="text-sm font-medium text-gray-700 flex items-center">
            <HashIcon class="w-4 h-4 mr-2 text-gray-500" />
            Include Symbols
          </label>
          <button class="w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200"
            :class="includeSymbols ? 'bg-indigo-600' : 'bg-gray-300'"
            @click="includeSymbols = !includeSymbols; generatePassword()" :aria-checked="includeSymbols"
            role="switch" aria-label="Include symbols">
            <div
              class="absolute w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 top-0.5"
              :class="includeSymbols ? 'translate-x-6' : 'translate-x-0.5'"></div>
          </button>
        </div>

        <div class="flex justify-between items-center">
          <label class="text-sm font-medium text-gray-700 flex items-center">
            <Hash class="w-4 h-4 mr-2 text-gray-500" />
            Include Numbers
          </label>
          <button class="w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200"
            :class="includeNumbers ? 'bg-indigo-600' : 'bg-gray-300'"
            @click="includeNumbers = !includeNumbers; generatePassword()" :aria-checked="includeNumbers"
            role="switch" aria-label="Include numbers">
            <div
              class="absolute w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 top-0.5"
              :class="includeNumbers ? 'translate-x-6' : 'translate-x-0.5'"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>