// Importing necessary modules from Node.js 'url' package to handle file URLs
import { fileURLToPath, URL } from "node:url";

// Importing 'defineConfig' from Vite to define the configuration
import { defineConfig } from "vite";

// Importing Vite plugins
import vue from "@vitejs/plugin-vue"; // Plugin to support Vue.js
import vueDevTools from "vite-plugin-vue-devtools"; // Plugin to support Vue DevTools
import tailwindcss from "@tailwindcss/vite"; // Plugin to support Tailwind CSS
import { VitePWA } from 'vite-plugin-pwa' // Plugin to support Progressive Web App features

// Exporting the Vite configuration
export default defineConfig({
  plugins: [
    vue(), // Using the Vue.js plugin
    vueDevTools(), // Using the Vue DevTools plugin
    tailwindcss(), // Using the Tailwind CSS plugin
    VitePWA({ registerType: "autoUpdate" }) // Using the PWA plugin with auto-update registration
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)), // Creating an alias for the 'src' directory
    },
  },
});
