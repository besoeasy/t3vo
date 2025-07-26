<script setup>
import { version } from "../../package.json";
import { GithubIcon, Key } from "lucide-vue-next";
</script>

<template>
  <section class="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12 font-sans antialiased">
    <div class="max-w-4xl text-center">
      <!-- Badge -->
      <div class="mb-8 animate-fade-in">
        <span class="inline-block bg-blue-100 text-blue-800 rounded-full px-6 py-2 text-sm font-semibold mb-4">
          Open Source ✨
        </span>
        <div class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-6 py-2 text-sm font-bold ml-2">
          v{{ version }}
        </div>
      </div>

      <!-- Main Title -->
      <h1 class="text-6xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight tracking-tight animate-fade-in" style="animation-delay: 200ms">
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          T3VO
        </span>
      </h1>

      <!-- Subtitle -->
      <p class="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto animate-fade-in" style="animation-delay: 400ms">
        A modern, <span class="text-blue-600 font-semibold">zero-knowledge</span> password manager
      </p>

      <!-- Feature highlights -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto animate-fade-in" style="animation-delay: 600ms">
        <div class="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
          <div class="text-green-600 font-semibold text-sm">🔒 Military-Grade</div>
          <div class="text-gray-700 text-sm">AES-256 Encryption</div>
        </div>
        <div class="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
          <div class="text-purple-600 font-semibold text-sm">👁️ Open Source</div>
          <div class="text-gray-700 text-sm">Full Transparency</div>
        </div>
        <div class="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
          <div class="text-amber-600 font-semibold text-sm">💰 Free Forever</div>
          <div class="text-gray-700 text-sm">No Subscriptions</div>
        </div>
        <div class="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
          <div class="text-blue-600 font-semibold text-sm">🚀 Fast & Local</div>
          <div class="text-gray-700 text-sm">Browser-Based</div>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style="animation-delay: 800ms">
        <router-link
          to="/dashboard"
          class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Key class="w-5 h-5 mr-2" />
          Get Started
        </router-link>
        <a
          href="https://github.com/besoeasy/telearia/t3vo"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md"
        >
          <GithubIcon class="w-5 h-5 mr-2" />
          View on GitHub
        </a>
      </div>

      <!-- Additional Info -->
      <div class="mt-16 text-center animate-fade-in" style="animation-delay: 1000ms">
        <p class="text-gray-500 text-sm mb-4">
          Trusted by developers and security professionals worldwide
        </p>
        <div class="flex justify-center items-center space-x-8 text-gray-400">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-xs">Local Storage</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-xs">Zero Knowledge</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span class="text-xs">Open Source</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
  opacity: 0;
}

.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

@supports not (backdrop-filter: blur(4px)) {
  .backdrop-blur-sm {
    background-color: rgba(255, 255, 255, 0.8);
  }
}
</style>
