import * as path from "node:path";
import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import rollupPluginLicense from "rollup-plugin-license";
import { defineConfig } from "vite";
import { FollowApiConfig } from "./scripts/follow-api.config";

const getManifest = defineManifest(async (env) => {
  const isDev = env.mode === "development";
  const VERSION = process.env.EXTENSION_VERSION;
  if (!isDev && !VERSION) {
    throw new Error("EXTENSION_VERSION is required in production mode.");
  }
  return {
    manifest_version: 3,
    name: isDev ? "[Dev] Follow it later" : "Follow it later",
    version: isDev ? "0.0.0" : VERSION!,
    description: "Send a page to the inbox of Follow to read and subscribe later.",
    permissions: ["activeTab", "scripting", "storage", "contextMenus"],
    /**
     * exact url like `https://example.com/foo/bar` will be changed into `https://example.com/*` by Chrome
     * If possible, we'd like add each exact url to `host_permissions` instead of `HOST/*`
     */
    host_permissions: [`${FollowApiConfig.root}/*`],
    homepage_url: "https://tldr.ws/followit",
    background: {
      service_worker: "src/background.ts",
    },
    icons: {
      16: "icons/icon-16.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },
    action: {
      default_title: "Follow it later",
      // default_popup: "src/popup.html",
    },
  };
});

export default defineConfig({
  plugins: [react({}), crx({ manifest: getManifest, contentScripts: { injectCss: true } })],
  clearScreen: false,

  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: "@/popup.html",
      },
      plugins: [
        rollupPluginLicense({
          thirdParty: {
            output: "dist/dependencies.txt",
          },
        }),
      ],
      output: {
        assetFileNames: "assets/[name][extname]",
        chunkFileNames: "assets/[name].js",
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
