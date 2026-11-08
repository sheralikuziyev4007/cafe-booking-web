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
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          return /node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|@tanstack\/(react-)?query[^/]*)\//.test(id)
            ? "vendor"
            : undefined;
        },
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
