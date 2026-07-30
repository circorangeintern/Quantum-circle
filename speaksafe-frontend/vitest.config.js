import { defineConfig } from "vitest/config";
import { transformWithOxc } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite 8 uses OXC by default which does not parse JSX in .js files.
// This pre-transform plugin forces OXC to treat every .js file as JSX.
const transformJsxInJs = () => ({
  name: "transform-jsx-in-js",
  enforce: "pre",
  async transform(code, id) {
    if (!id.match(/\.js$/)) {
      return null;
    }
    return await transformWithOxc(code, id, { lang: "jsx" });
  },
});

export default defineConfig({
  plugins: [react(), transformJsxInJs()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["__tests__/setup.js"],
    include: ["__tests__/**/*.test.{js,jsx,ts,tsx}"],
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:3001",
    },
    coverage: {
      reporter: ["text", "lcov"],
      include: ["app/**/*.{js,jsx}", "lib/**/*.{js,jsx}"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
