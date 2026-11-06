/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // React, router and the query library in a separate long-cached chunk
        manualChunks: { vendor: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"] },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "supabase/functions/**/*.test.ts"],
    css: false,
    // Integration tests render the whole app; give slow machines and CI room
    testTimeout: 15_000,
    // Tests always use the demo storage, even if a developer has Supabase keys in .env.local
    env: { VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "" },
  },
});
