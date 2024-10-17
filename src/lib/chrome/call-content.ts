import { queryActiveTab } from "@/lib/chrome";
import { preambleCodeUrl, viteClientUrl } from "@/lib/urls";
type PromisifyReturn<T extends {}> = {
  [key in keyof T]: T[key] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[key];
};

export function getContentClient<T extends {}>(scriptUrl: string) {
  return forTab(async () => (await queryActiveTab())?.id!);
  function forTab(
    tabId: number | (() => number) | (() => PromiseLike<number>)
  ): PromisifyReturn<T> & { for: typeof forTab } {
    const exp = { for: forTab } as any;
    return new Proxy(exp, {
      get(target: T, p: string | symbol, receiver: any): any {
        if (Reflect.has(target, p)) {
          return Reflect.get(target, p, receiver);
        }
        Reflect.set(target, p, execute, receiver);
        return execute;
        async function execute(...args: any[]): Promise<any> {
          const _tabId = typeof tabId === "function" ? await tabId() : tabId;
          let preflights: string[] = [];
          if (import.meta.env.DEV) {
            preflights = [preambleCodeUrl, viteClientUrl];
          }
          const [result] = await chrome.scripting.executeScript({
            target: { tabId: _tabId! },
            func: async (scriptUrl, method, args, preflights) => {
              function __vite__injectQuery(a: any) {
                return a;
              }
              for (const url of preflights) {
                try {
                  await import(/* @vite-ignore */ url);
                } catch (e) {
                  console.warn("Failed to load preflight script", url, e);
                }
              }
              try {
                const t = await import(/* @vite-ignore */ scriptUrl);
                return await t[method](...args);
              } catch (e) {
                console.error(e);
                throw e;
              }
            },
            args: [scriptUrl, p, args, preflights] as const,
          });
          return result.result;
        }
      },
    });
  }
}
