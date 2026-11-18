import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // The same "@/..." imports as in the app (tsconfig paths)
      "@": src,
      // "server-only" throws outside Next.js on purpose. In tests we are on
      // the server anyway, so it becomes an empty file.
      "server-only": fileURLToPath(new URL("./tests/unit/empty.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    // Each test sets its own env vars; they are reset after every test.
    unstubEnvs: true,
  },
});
