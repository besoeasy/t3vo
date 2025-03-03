import './assets/main.css' // Import main CSS file

import { createApp } from 'vue' // Import Vue.js library

import { createPinia } from 'pinia' // Import Pinia for state management

import App from './App.vue' // Import main App component

import router from './router' // Import router configuration

const app = createApp(App) // Create Vue app instance

app.use(createPinia()) // Use Pinia for state management

app.use(router) // Use router for navigation

app.mount('#app') // Mount app to DOM element with id 'app'
