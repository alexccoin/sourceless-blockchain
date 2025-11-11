import { defineConfig } from 'vite';

// Configure Vite to serve the existing app from the public directory
// so http://localhost:5173/ serves index.html instead of a 404.
export default defineConfig({
  root: 'public',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: false,
  },
  // Ensure relative asset paths work when served from non-root contexts
  base: './',
  build: {
    // Suppress warnings about external dependencies
    rollupOptions: {
      external: ['electron']
    }
  }
});
