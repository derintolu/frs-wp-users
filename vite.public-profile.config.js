import { v4wp } from "@kucrut/vite-for-wp";
import react from "@vitejs/plugin-react";
import path from "path"

export default {
  plugins: [
    v4wp({
      input: {
        'public-profile': "src/frontend/public-profile/main.tsx",
      },
      outDir: "assets/public-profile/dist",
    }),
    react(),
  ],
  server: {
    host: 'hub21.local',
    port: 5178,
    cors: true,
    strictPort: true,
    hmr: {
      host: 'hub21.local',
      port: 5178,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/frontend": path.resolve(__dirname, "./src/frontend"),
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
