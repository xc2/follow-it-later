type CreateProperties<T> = Omit<chrome.contextMenus.CreateProperties, "id" | "onclick"> & {
  id?: string;
  data?: T;
  onclick?: OnClick<T>;
};
type OnClick<T> = (
  info: Omit<chrome.contextMenus.OnClickData, "menuItemId"> & { data: T | null },
  tab: chrome.tabs.Tab
) => any;
type UpdateProperties<T> = Omit<chrome.contextMenus.UpdateProperties, "onclick" | "id"> & {
  data?: T;
  onclick?: OnClick<T>;
};
export function createContextMenu<T>(options?: CreateProperties<T>) {
  const { data: _data, onclick: _onclick, ...rest } = options ?? {};
  let data: T | null = _data ?? null;
  let onclick = _onclick;
  let _untrustedInfo: chrome.contextMenus.CreateProperties = {
    contexts: ["page"],
    visible: false,
    enabled: false,
    title: "Not ready",
    ...rest,
  };
  const id = options?.id ?? Math.random().toString(36).slice(2);
  chrome.contextMenus.create({ ..._untrustedInfo, id });

  const listener = (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab | undefined) => {
    if (!tab) return;
    if (info.menuItemId !== id) return;
    if (typeof onclick !== "function") return;
    const { menuItemId, ...rest } = info;
    void onclick({ ...rest, data }, tab);
  };

  function update(options: UpdateProperties<T>) {
    const { data: _data, onclick: _onclick, ...rest } = options ?? {};
    chrome.contextMenus.update(id, rest);
    Object.assign(_untrustedInfo, rest);
    if (_data !== undefined) {
      data = _data ?? null;
    }
    if (typeof _onclick === "function") {
      onclick = _onclick;
    }
    if (rest.visible === true) {
      chrome.contextMenus.onClicked.addListener(listener);
    } else if (rest.visible === false) {
      chrome.contextMenus.onClicked.removeListener(listener);
    }
  }
  function show(options?: UpdateProperties<T>) {
    update({ visible: true, enabled: true, ...options });
  }
  function hide() {
    update({ visible: false, enabled: false });
  }

  return { update, show, hide };
}
