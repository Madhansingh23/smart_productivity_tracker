import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5000
//   },
//   build: {
//     outDir: 'dist',   // Vercel expects dist inside client (client/dist)
//     emptyOutDir: true
//   }
// });

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
