import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/server/**/*.test.ts", "src/app/api/**/*.test.ts"],
    setupFiles: ["src/server/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/server": path.resolve(__dirname, "./src/server"),
    },
  },
});
