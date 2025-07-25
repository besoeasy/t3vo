<script setup>
import { onMounted } from "vue";
import { version } from "../../package.json";
import {
  GithubIcon, AlertCircleIcon, UsersRound, ShieldIcon
} from "lucide-vue-next";

import PasswordGenerator from "@/components/PasswordGenerator.vue";

// Lifecycle hooks
onMounted(() => {
  // Future data loading can be implemented here
});
</script>

<template>
  <div class="space-y-6">
    <PasswordGenerator />

    <!-- Open Source and App Info Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Open Source Card -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
        <div class="p-5 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
              <UsersRound class="w-4 h-4 text-emerald-600" />
            </div>
            Open Source
          </h2>
        </div>

        <div class="p-5">
          <p class="text-gray-600 text-sm mb-4">
            We believe in the power of community-driven development. That's why T3VO is open source and available
            for anyone to contribute.
          </p>
          <div class="flex flex-col space-y-3">
            <a href="https://github.com/besoeasy/t3vo" target="_blank"
              class="inline-flex items-center px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
              <GithubIcon class="h-4 w-4 mr-2 text-gray-700" />
              View on GitHub
            </a>
            <a href="https://github.com/besoeasy/t3vo/issues" target="_blank"
              class="inline-flex items-center px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
              <AlertCircleIcon class="h-4 w-4 mr-2 text-gray-700" />
              Report Issue
            </a>
          </div>
        </div>
      </div>

      <!-- App Version Card -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
        <div class="p-5 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <div class="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
              <ShieldIcon class="w-4 h-4 text-purple-600" />
            </div>
            App Information
          </h2>
        </div>

        <div class="p-5">
          <div class="flex items-center justify-between py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">Version</span>
            <span class="text-sm font-medium text-gray-900">{{ version }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>