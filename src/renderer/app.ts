// This file serves as the main entry point for the renderer process. 
// It initializes the application UI and manages the rendering of components.

import { createApp } from 'vue';
import App from './App.vue'; // Assuming you have an App.vue file for the main component
import router from './router'; // Assuming you have a router setup for navigation

const app = createApp(App);

app.use(router);

app.mount('#app');