import path from "node:path";
import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** @typedef {import('vite').ConfigEnv} ConfigEnv */
/** @typedef {import('@crxjs/vite-plugin').ManifestV3} ManifestV3 */

/** */
const getManifest = defineManifest(async function getManifest(env) {
  const isDev = env.mode === "development";
  const VERSION = process.env.EXTENSION_VERSION;
  if (!isDev && !VERSION) {
    throw new Error("EXTENSION_VERSION is required in production mode.");
  }
  return {
    manifest_version: 3,
    name: isDev ? "[Dev] Follow it later" : "Follow it later",
    version: isDev ? "0.0.0" : VERSION,
    description: "Send a page to the inbox of Follow to read and subscribe later.",
    permissions: ["activeTab", "scripting", "storage"],
    background: {
      service_worker: "src/background.ts",
    },
    icons: {
      16: "icons/icon-16.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    },
    action: {
      default_popup: "src/popup.html",
    },
  };
});

/** */
export default defineConfig({
  plugins: [react(), crx({ manifest: getManifest })],
  build: {
    modulePreload: {
      polyfill: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
