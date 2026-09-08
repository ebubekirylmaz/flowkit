import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(dirname, "src/index.js"),
      name: "Flow",
      fileName: (format) => (format === "es" ? "flow.js" : "flow.cjs"),
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "@mui/material", "@mui/material/styles", "styled-components"],
    },
  },
});
