import { v4wp } from "@kucrut/vite-for-wp";
import react from "@vitejs/plugin-react";
import path from "path"

export default {
  plugins: [
    v4wp({
      input: {
        'directory': "src/frontend/directory/index.tsx",
      },
      outDir: "assets/directory/dist",
    }),
    react(),
  ],
  server: {
    host: 'hub21.local',
    port: 5177,
    cors: true,
    strictPort: true,
    hmr: {
      host: 'hub21.local',
      port: 5177,
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
        manualChunks: undefined,
      },
    },
  },
};
