import { v4wp } from "@kucrut/vite-for-wp";
import react from "@vitejs/plugin-react";
import path from "path"
import fs from "fs"

export default {
  plugins: [
    v4wp({
      input: {
        'portal': "src/frontend/portal/main.tsx",
        'public-profile': "src/frontend/portal/public-main.tsx"
      },
      outDir: "assets/portal/dist",
    }),
    react(),
  ],
  server: {
    host: 'hub21.local',
    port: 5176,
    cors: true,
    strictPort: true,
    hmr: {
      host: 'hub21.local',
      port: 5176,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split large vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('zod') || id.includes('react-hook-form')) {
              return 'forms';
            }
          }
        },
      },
    },
  },
};
