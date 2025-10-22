<template>
    <div class="w-full p-6 sm:p-12 text-center flex flex-col justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <!-- Lock Icon -->
        <div class="max-w-md mx-auto w-full">
            <div class="mb-8 flex justify-center">
                <div class="p-6 bg-white rounded-full shadow-lg">
                    <Lock class="w-16 h-16 text-blue-600" />
                </div>
            </div>

            <h1 class="text-4xl font-bold text-gray-900 mb-2">T3VO</h1>
            <p class="text-gray-600 mb-8">Your Secure Note Vault</p>

            <div class="w-full max-w-md mx-auto">
                <input 
                    v-model="passwordInput" 
                    type="password" 
                    placeholder="Enter Master Password"
                    class="w-full p-4 text-lg border-2 border-gray-300 rounded-xl bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition duration-200 shadow-sm"
                    @input="checkPasswordStrength"
                    @keyup.enter="unlockApp"
                />

                <div v-if="passwordInput" class="mt-3 w-full flex items-center">
                    <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full transition-all duration-300 ease-in-out" :class="strengthInfo.colorClass"
                            :style="{ width: `${strengthPercentage}%` }"></div>
                    </div>
                </div>

                <p v-if="showWarning" class="mt-2 text-red-600 text-sm font-medium">
                    ⚠️ Warning: Your master password is {{ strengthInfo.label }}.
                </p>
            </div>

            <button 
                @click="unlockApp"
                class="w-full max-w-md mx-auto mt-6 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="passwordInput.length === 0"
            >
                <span class="flex items-center justify-center">
                    <Unlock class="w-5 h-5 mr-2" />
                    UNLOCK
                </span>
            </button>

            <div class="mt-8 p-4 bg-white bg-opacity-60 rounded-xl backdrop-blur-sm">
                <p class="text-sm text-gray-700 text-center">
                    🔐 Your master password is the encryption key for all your data.<br>
                    Choose a strong password and remember it - it cannot be recovered.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Lock, Unlock } from "lucide-vue-next";

const passwordInput = ref("");
const passwordStrength = ref(0);

const emit = defineEmits(['unlock']);

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
    emit('unlock');
};
</script>