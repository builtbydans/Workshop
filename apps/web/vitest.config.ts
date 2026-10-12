import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/server/**/*.test.ts"],
    setupFiles: ["src/server/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@/server": path.resolve(__dirname, "./src/server"),
    },
  },
});
