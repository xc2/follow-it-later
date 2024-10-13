// @ts-ignore
import _readScriptLoaderUrl from "../content/read.ts?script";

export const readScriptUrl = chrome.runtime.getURL(_readScriptLoaderUrl.replace(/-loader/, ""));

export const readScriptLoaderUrl = chrome.runtime.getURL(_readScriptLoaderUrl);

export const actionPage = chrome.runtime.getURL("src/popup.html");
