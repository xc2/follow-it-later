import { FakeWorkerEvent } from "@/lib/fake-worker-event";
import { pick } from "lodash-es";
import { CacheFirst, NetworkFirst, NetworkOnly, type Strategy } from "workbox-strategies";
type Plugin = Strategy["plugins"][number];

export const WorkerFetchCache = `${chrome.runtime.id}-fetch-cache`;
export const strategies = {
  cacheFirst: new CacheFirst({
    cacheName: WorkerFetchCache,
    plugins: [_createObservePlugin("cacheFirst", ["requestWillFetch"])],
  }),
  networkFirst: new NetworkFirst({ cacheName: WorkerFetchCache }),
  networkOnly: new NetworkOnly({}),
} as const;

export const fetchers = Object.fromEntries(
  Object.entries(strategies).map(([key, strategy]) => [key, _createFetcher(strategy)])
) as Record<keyof typeof strategies, ReturnType<typeof _createFetcher>>;

export async function dropCache(reqOrRes: Request | Response) {
  const req = "status" in reqOrRes ? new URL(reqOrRes.url) : reqOrRes;
  const cache = await caches.open(WorkerFetchCache);
  return cache.delete(req);
}

export async function purgeOutdatedCaches() {
  const keys = await caches.keys();
  for (const key of keys) {
    if (key !== WorkerFetchCache) {
      await caches.delete(key);
    }
  }
}
function _createFetcher(strategy: Strategy) {
  return (request: Request) => {
    return strategy.handle({ event: new FakeWorkerEvent("fetch"), request });
  };
}

function _createObservePlugin(name: string, events: (keyof Plugin)[]): Plugin {
  if (import.meta.env.DEV) {
    const log = console.log.bind(console, `[strategy ${name}]`);
    const plugin: Plugin = {
      requestWillFetch: async (params) => {
        log("will fetch", params.request.url);
        return params.request;
      },
    };
    return pick(plugin, events);
  }
  return {};
}
