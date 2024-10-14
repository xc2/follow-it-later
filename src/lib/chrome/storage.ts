import { atom } from "jotai/index";
import { debounce } from "lodash-es";

export function atomWithChromeStorage() {
  const keysToDelete = new Set<string>();
  const syncBack = debounce((get) => {
    return chrome.storage.sync.set(get());
  }, 2000);
  const removeKeys = debounce(() => {
    const keys = Array.from(keysToDelete);
    keysToDelete.clear();
    if (keys.length) {
      chrome.storage.sync.remove(keys).then(null, () => {
        for (const key of keys) {
          keysToDelete.add(key);
        }
      });
    }
  }, 2000);
  const baseAtom = atom(undefined as Record<string, any> | undefined, (get, set, update: any) => {
    const old = get(baseAtom);
    const isInitial = old === undefined;
    const full = { ...old };
    let hasChange = false;
    for (const [key, newValue] of Object.entries(update)) {
      if (full[key] !== newValue) {
        if (newValue === undefined || newValue === null) {
          delete full[key];
          keysToDelete.add(key);
        } else {
          full[key] = newValue;
          keysToDelete.delete(key);
        }
        hasChange = true;
      }
    }
    if (hasChange) {
      set(baseAtom, full);
      if (!isInitial) {
        syncBack(() => get(baseAtom));
        removeKeys();
      }
    }
  });
  baseAtom.onMount = (setAtom) => {
    chrome.storage.sync.get().then(setAtom);
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      const update: Record<string, any> = {};
      for (const [key, { newValue }] of Object.entries(changes)) {
        update[key] = newValue;
      }
      setAtom(update);
    };
    chrome.storage.sync.onChanged.addListener(listener);
    return () => {
      chrome.storage.sync.onChanged.removeListener(listener);
    };
  };
  return baseAtom;
}
