import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

// 명시적으로 .env 경로 설정
dotenv.config({ path: "../.env" });

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  define: {
    // Expose environment variables to client-side code
    "process.env.BACKEND_URL": JSON.stringify(process.env.BACKEND_URL),
    "process.env.USE_TEST_MODE": JSON.stringify(process.env.USE_TEST_MODE),
  },
});
