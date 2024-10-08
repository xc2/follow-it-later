export async function queryActiveTab() {
  const conditions: chrome.tabs.QueryInfo[] = [
    { active: true, lastFocusedWindow: true },
    { active: true, currentWindow: true },
    { active: true },
  ];
  for (const c of conditions) {
    const tabs = await chrome.tabs.query(c);
    if (tabs.length) {
      return tabs[0];
    }
  }
  return null;
}
