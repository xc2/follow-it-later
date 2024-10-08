import { queryActiveTab } from "@/lib/chrome";
import { readScriptUrl } from "@/lib/urls";
import { InboxEntryInput } from "@/types";

export async function currentTabToInboxData(): Promise<InboxEntryInput> {
  const tab = await queryActiveTab();

  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab?.id! },
    func: async (readScriptUrl) => {
      function __vite__injectQuery(a: any) {
        return a;
      }
      try {
        const { getInboxData } = await import(/* @vite-ignore */ readScriptUrl);
        return await getInboxData();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    args: [readScriptUrl],
  });
  return result.result;
}
