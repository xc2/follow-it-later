import path from "node:path";
import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** @typedef {import('vite').ConfigEnv} ConfigEnv */
/** @typedef {import('@crxjs/vite-plugin').ManifestV3} ManifestV3 */

/** */
const getManifest = defineManifest(async function getManifest(env) {
  const isDev = env.mode === "development";
  return {
    manifest_version: 3,
    name: isDev ? "[Dev] Follow it later" : "Follow it later",
    version: isDev ? "0.0.0" : "0.0.1",
    description: "Follow it later",
    permissions: ["activeTab", "scripting", "storage"],
    background: {
      service_worker: "src/background.ts",
    },
    content_scripts: [],
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
