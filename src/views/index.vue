<script setup>
import { version } from "../../package.json";
import { GithubIcon, Key } from "lucide-vue-next";
</script>

<template>
  <section
    class="min-h-screen bg-white flex items-center justify-center px-4 py-8 font-sans antialiased"
  >
    <div class="max-w-3xl text-center">
      <span
        class="inline-block bg-gray-100 text-gray-900 rounded-full px-5 py-1.5 text-sm font-medium mb-4 animate-fade-in-up"
      >
        Open Source <span class="ml-1">✨</span>
      </span>

      <div
        class="inline-block version-badge px-6 py-2 text-sm font-bold mb-6 animate-fade-in-up animate-pulse-glow"
        style="animation-delay: 100ms"
      >
        <span class="version-text">v{{ version }}</span>
      </div>

      <h1
        class="text-5xl md:text-6xl font-semibold mb-6 text-gray-900 leading-tight tracking-tight animate-fade-in-up"
        style="animation-delay: 200ms"
      >
        T3VO
      </h1>

      <p
        class="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto animate-fade-in-up"
        style="animation-delay: 400ms"
      >
        A modern, <span class="text-blue-600 font-semibold">zero-knowledge</span> password manager built for privacy-conscious users and teams. 
        Store, generate, and sync your credentials with <span class="text-green-600 font-semibold">military-grade encryption</span>, 
        <span class="text-purple-600 font-semibold">open-source transparency</span>, and 
        <span class="text-amber-600 font-semibold">no subscription fees</span> — ever.
      </p>

      <div
        class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
        style="animation-delay: 600ms"
      >
        <router-link
          to="/dashboard"
          class="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Key class="w-5 h-5 mr-2" />
          Get Started
        </router-link>
        <a
          href="https://github.com/besoeasy/t3vo"
          target="_blank"
          class="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <GithubIcon class="w-5 h-5 mr-2" />
          View on GitHub
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Fade in up animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Beautiful version badge */
.version-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 25px;
  box-shadow: 
    0 4px 15px rgba(102, 126, 234, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.version-badge:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.version-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.version-badge:hover::before {
  left: 100%;
}

.version-text {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  letter-spacing: 0.5px;
}

/* Subtle glow animation */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 
      0 4px 15px rgba(102, 126, 234, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }
  50% {
    box-shadow: 
      0 4px 20px rgba(102, 126, 234, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
}

.animate-pulse-glow {
  animation: pulseGlow 3s ease-in-out infinite;
}
</style>
