// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// On Vercel we use the standard TanStack Start server entry + nitro `vercel`
// preset. On Lovable/Cloudflare we keep the custom src/server.ts wrapper
// (Cloudflare-style fetch handler with SSR error normalization).
const isVercel = !!process.env.VERCEL;

export default defineConfig({
  tanstackStart: isVercel
    ? undefined
    : {
        // Redirect TanStack Start's bundled server entry to src/server.ts.
        server: { entry: "server" },
      },
  nitro: isVercel ? { preset: "vercel" } : undefined,
});
