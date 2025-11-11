import { v4wp } from "@kucrut/vite-for-wp";
import react from "@vitejs/plugin-react";
import path from "path"

export default {
  plugins: [
    v4wp({
      input: "src/frontend/profile-editor/main.tsx",
      outDir: "assets/profile-editor/dist",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    cors: true,
    origin: 'http://localhost:5177',
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
