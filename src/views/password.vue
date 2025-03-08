<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import { fetchPasswords, addPasswordEntry, softDeleteEntry } from "@/db";
import { Search, ChevronLeft, ChevronRight, Eye, EyeOff, Copy, Check, Trash, Plus, Lock, Key, Mail, Globe, AlertCircle } from "lucide-vue-next";
import { TOTP, Secret } from "otpauth";

const newPassword = ref({
  title: "",
  username: "",
  email: "",
  password: "",
  totpSecret: "",
  urls: "",
});
const passwords = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const totalPasswords = ref(0);
const showAddForm = ref(false);
const copiedField = ref(null);
const isLoading = ref(false);
let totpInterval;

// TOTP Generation
const generateTOTP = (secret, period) => {
  if (!secret) return "";

  try {
    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      algorithm: "SHA1",
      digits: 6,
      period,
    });
    return totp.generate();
  } catch (error) {
    return "Invalid Secret";
  }
};

const loadPasswords = async () => {
  try {
    isLoading.value = true;
    const fetchedPasswords = await fetchPasswords(currentPage.value, searchQuery.value);
    passwords.value = fetchedPasswords.map((password) => ({
      id: password.id,
      title: password.data.title,
      username: password.data.username,
      email: password.data.email,
      password: password.data.password,
      totpSecret: password.data.totpSecret,
      urls: password.data.urls,
      updated_at: password.updatedAt,
      totp30: password.data.totpSecret ? generateTOTP(password.data.totpSecret, 30) : "",
      totp60: password.data.totpSecret ? generateTOTP(password.data.totpSecret, 60) : "",
      visible: false,
    }));

    // Get total count of non-deleted passwords
    const allPasswords = await fetchPasswords(1, "");
    totalPasswords.value = allPasswords.length;
  } catch (error) {
    console.error("Error loading passwords:", error);
  } finally {
    isLoading.value = false;
  }
};

// Add new password using the new database function
const addPassword = async () => {
  if (!newPassword.value.title || !newPassword.value.password) return;

  try {
    await addPasswordEntry({
      title: newPassword.value.title,
      username: newPassword.value.username,
      email: newPassword.value.email,
      password: newPassword.value.password,
      totpSecret: newPassword.value.totpSecret,
      urls: newPassword.value.urls,
    });

    // Reset form and reload first page
    newPassword.value = { title: "", username: "", email: "", password: "", totpSecret: "", urls: "" };
    showAddForm.value = false;
    currentPage.value = 1;
    await loadPasswords();
  } catch (error) {
    console.error("Error adding password:", error);
  }
};

// Soft delete password
const removePassword = async (id) => {
  if (!confirm("Are you sure you want to delete this password?")) return;

  try {
    await softDeleteEntry(id);
    await loadPasswords();
  } catch (error) {
    console.error("Error removing password:", error);
  }
};

// UI Helper Functions
const toggleVisibility = (password) => {
  password.visible = !password.visible;
};

const copyToClipboard = async (text, field) => {
  try {
    await navigator.clipboard.writeText(text);
    copiedField.value = field;
    setTimeout(() => {
      copiedField.value = null;
    }, 2000);
  } catch (error) {
    console.error("Error copying to clipboard:", error);
  }
};

// Navigation
const totalPages = computed(() => Math.ceil(totalPasswords.value / 10)); // Using the itemsPerPage constant from db.js

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    await loadPasswords();
  }
};

const prevPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await loadPasswords();
  }
};

// URL Watcher
watch(
  () => newPassword.value.urls,
  (newVal) => {
    if (newVal && !newPassword.value.title) {
      try {
        newPassword.value.title = new URL(newVal).hostname.replace("www.", "");
      } catch (e) {}
    }
  }
);

// Search Watcher
watch(searchQuery, async () => {
  currentPage.value = 1;
  await loadPasswords();
});

// TOTP Update Interval
onMounted(() => {
  loadPasswords();
  totpInterval = setInterval(() => {
    passwords.value = passwords.value.map((password) => ({
      ...password,
      totp30: password.totpSecret ? generateTOTP(password.totpSecret, 30) : "",
      totp60: password.totpSecret ? generateTOTP(password.totpSecret, 60) : "",
    }));
  }, 1000);
});

onUnmounted(() => {
  if (totpInterval) clearInterval(totpInterval);
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="m-auto">
      <h1 class="text-4xl font-bold mb-8 text-gray-800 flex items-center">
        <Lock class="mr-4" size="36" />
        Password Manager
      </h1>

      <div class="mb-8 flex items-center justify-between">
        <div class="relative flex-grow mr-4">
          <input v-model="searchQuery" placeholder="Search passwords..." class="w-full pl-10 pr-4 py-2 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors" />
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
        </div>
        <button @click="showAddForm = !showAddForm" class="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors flex items-center">
          <Plus size="20"  />
        </button>
      </div>

      <div v-if="showAddForm" class="mb-8 p-6 bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out">
        <h2 class="text-2xl font-bold mb-4">Add New Password</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="relative">
            <input v-model="newPassword.title" placeholder="Title" class="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <Key class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
          </div>
          <div class="relative">
            <input v-model="newPassword.urls" placeholder="Website URLs" class="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <Globe class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
          </div>
          <div class="relative">
            <input v-model="newPassword.username" placeholder="Username" class="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
          </div>
          <div class="relative">
            <input v-model="newPassword.email" placeholder="Email" class="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
          </div>
          <div class="relative">
            <input v-model="newPassword.password" type="password" placeholder="Password" class="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
          </div>
          <div class="relative">
            <input v-model="newPassword.totpSecret" placeholder="TOTP Secret (Optional)" class="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <Key class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size="20" />
          </div>
        </div>

        <div class="flex space-x-4 mt-4" v-if="newPassword.totpSecret">
          <span class="bg-gray-100 px-4 py-2 rounded-lg text-lg font-mono">
            {{ generateTOTP(newPassword.totpSecret, 30) }}
          </span>
          <span class="bg-gray-100 px-4 py-2 rounded-lg text-lg font-mono">
            {{ generateTOTP(newPassword.totpSecret, 60) }}
          </span>
        </div>

        <button @click="addPassword" class="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-600 transition-colors flex items-center justify-center">
          <Plus class="mr-2" size="20" />
          Add Password
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>

      <!-- Passwords List -->
      <div v-else class="space-y-6 mb-8">
        <div v-for="password in passwords" :key="password.id" class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-2xl font-semibold text-gray-800">{{ password.title }}</h3>
              <button @click="removePassword(password.id)" class="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors">
                <Trash size="20" />
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="flex items-center space-x-2">
                <Mail size="20" class="text-gray-400" />
                <span class="text-gray-600">{{ password.username || password.email }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Globe size="20" class="text-gray-400" />
                <a :href="password.urls" target="_blank" class="text-blue-600 hover:underline">
                  {{ password.urls }}
                </a>
              </div>
            </div>

            <div class="flex items-center space-x-2 mb-4">
              <div class="relative flex-grow">
                <input :type="password.visible ? 'text' : 'password'" :value="password.password" class="w-full p-2 pr-20 border rounded-lg bg-gray-50" readonly />
                <div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button @click="toggleVisibility(password)" class="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200 transition-colors">
                    <Eye v-if="!password.visible" size="18" />
                    <EyeOff v-else size="18" />
                  </button>
                  <button @click="copyToClipboard(password.password, 'password-' + password.id)" class="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors">
                    <Copy v-if="copiedField !== 'password-' + password.id" size="18" />
                    <Check v-else size="18" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="password.totpSecret" class="bg-gray-100 p-4 rounded-lg">
              <h4 class="text-lg font-semibold mb-2">TOTP Codes</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-gray-600 mb-1">30-second code:</div>
                  <div class="flex items-center space-x-2">
                    <span class="bg-white px-3 py-1 rounded-lg text-lg font-mono flex-grow text-center">
                      {{ password.totp30 }}
                    </span>
                    <button @click="copyToClipboard(password.totp30, 'totp30-' + password.id)" class="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors">
                      <Copy v-if="copiedField !== 'totp30-' + password.id" size="18" />
                      <Check v-else size="18" />
                    </button>
                  </div>
                </div>
                <div>
                  <div class="text-sm text-gray-600 mb-1">60-second code:</div>
                  <div class="flex items-center space-x-2">
                    <span class="bg-white px-3 py-1 rounded-lg text-lg font-mono flex-grow text-center">
                      {{ password.totp60 }}
                    </span>
                    <button @click="copyToClipboard(password.totp60, 'totp60-' + password.id)" class="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors">
                      <Copy v-if="copiedField !== 'totp60-' + password.id" size="18" />
                      <Check v-else size="18" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <p v-if="passwords.length === 0 && !isLoading" class="text-center text-gray-500 mt-8 text-lg flex items-center justify-center">
        <AlertCircle size="24" class="mr-2" />
        No passwords found matching your search.
      </p>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-4">
        <button @click="prevPage" :disabled="currentPage === 1 || isLoading" class="p-2 rounded-full bg-white shadow disabled:opacity-50 hover:bg-gray-100 transition-colors">
          <ChevronLeft size="24" />
        </button>
        <span class="text-lg font-medium">Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages || isLoading" class="p-2 rounded-full bg-white shadow disabled:opacity-50 hover:bg-gray-100 transition-colors">
          <ChevronRight size="24" />
        </button>
      </div>
    </div>
  </div>
</template>