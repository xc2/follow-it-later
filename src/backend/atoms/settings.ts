import type { Settings } from "@/backend/entities";
import { atom } from "jotai";
import { chromeStorageAtom } from "./chrome-storage";

const StoragePrefix = "settings.";

function matchSettingsKey(key: string) {
  if (key.startsWith(StoragePrefix)) {
    return [true, key.slice(StoragePrefix.length) as keyof Settings] as const;
  } else {
    return [false, null] as const;
  }
}
export const settingsAtom = atom(
  (get) => {
    const values = get(chromeStorageAtom) ?? {};
    const settings = {} as Settings;
    for (const [key, value] of Object.entries(values)) {
      const [isSettingsKey, settingsKey] = matchSettingsKey(key);
      if (isSettingsKey) {
        settings[settingsKey] = value;
      }
    }
    return settings;
  },
  (get, set, update: Partial<Settings>) => {
    const newValues: Record<string, any> = {};
    for (const [key, value] of Object.entries(update)) {
      newValues[`${StoragePrefix}${key}`] = value;
    }
    set(chromeStorageAtom, newValues);
  }
);
