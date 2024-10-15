import logoUrl from "../../icons/icon-128.png?url";
import _ from "../content/placeholder?script";
import _readModuleUrl from "../content/read.ts?script&module";
import _toastModuleUrl from "../content/toast.tsx?script&module";
if (import.meta.env.DEV) {
  console.log(_);
}

export const readModuleUrl = chrome.runtime.getURL(_readModuleUrl);
export const toastModuleUrl = chrome.runtime.getURL(_toastModuleUrl);

export const actionPage = chrome.runtime.getURL("src/popup.html");

export const preambleCodeUrl = chrome.runtime.getURL("vendor/crx-client-preamble.js");
export const viteClientUrl = chrome.runtime.getURL("vendor/vite-client.js");

export { logoUrl };
