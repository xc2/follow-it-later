import { Settings } from "@/backend/entities";
import { debounce, pick } from "lodash-es";

const StoragePrefix = "settings.";
const settings = (() => {
  const settingsRef = {} as Settings;

  let task: Promise<void> | null = null;
  const settings: PromiseLike<Settings> = {
    // biome-ignore lint/suspicious/noThenProperty: This is a PromiseLike object
    then: (a, b) =>
      ensureTask()
        .then(() => settingsRef)
        .then(a, b),
  };
  return settings;
  function ensureTask() {
    task =
      task ||
      chrome.storage.sync.get().then(
        (data) => {
          for (const [key, value] of Object.entries(data)) {
            const [isSettingsKey, settingsKey] = matchSettingsKey(key);
            if (isSettingsKey) {
              settingsRef[settingsKey] = value;
            }
          }
        },
        (e) => {
          task = null;
          throw e;
        }
      );
    return task;
  }
})();

const debouncedSync = debounce(async () => {
  const data: any = {};
  for (const [key, value] of Object.entries(await settings)) {
    data[StoragePrefix + key] = value;
  }
  return chrome.storage.sync.set(data);
}, 2000);

chrome.storage.sync.onChanged.addListener(async (changes) => {
  const settingsRef = await settings;
  for (const [key, { newValue }] of Object.entries(changes)) {
    const [isSettingsKey, settingsKey] = matchSettingsKey(key);
    if (isSettingsKey) {
      settingsRef[settingsKey] = newValue;
    }
  }
});

export function matchSettingsKey(key: string) {
  if (key.startsWith(StoragePrefix)) {
    return [true, key.slice(StoragePrefix.length) as keyof Settings] as const;
  } else {
    return [false, null] as const;
  }
}

export function onSettings<K extends keyof Settings>(
  keys: K[],
  callback: (newValue: Pick<Settings, K>) => void,
  initial = false
) {
  chrome.storage.sync.onChanged.addListener(async (changes) => {
    const res: Partial<Pick<Settings, K>> = Object.create(null);
    for (const [k, { newValue }] of Object.entries(changes)) {
      const [isSettingsKey, key] = matchSettingsKey(k);
      if (isSettingsKey && keys.includes(key as K)) {
        res[key as K] = newValue;
      }
    }
    for (const _ in res) {
      callback(res as any);
      break;
    }
  });
  if (initial) {
    settings.then((r) => pick(r, keys)).then(callback);
  }
}

export async function getSettings<K extends keyof Settings>(
  key?: K | K[]
): Promise<Pick<Settings, K>> {
  const settingsRef = await settings;
  if (key) {
    key = Array.isArray(key) ? key : [key];
    const settings = {} as Pick<Settings, K>;
    for (const k of key) {
      settings[k] = settingsRef[k];
    }
    return settings;
  }
  return { ...settingsRef };
}

export async function putSettings(data: Partial<Settings>) {
  Object.assign(await settings, data);
  void debouncedSync();
  return data;
}
