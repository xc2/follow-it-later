import { baseUrl, type paths } from "@/gen/internal";
import createClient, { type FetchResponse } from "openapi-fetch";

export const internal = createClient<paths>({
  baseUrl: chrome.runtime.getURL(baseUrl),
  headers: {},
});

export async function handleInternalResult<T extends FetchResponse<any, any, any>>(
  res: T | PromiseLike<T>
): Promise<T["data"]> {
  res = await res;
  if (res.error) {
    if (typeof res.error === "string") {
      throw new Error(res.error);
    }
    throw res.error;
  }
  if (res.data?.ok === false) {
    const err = new Error(res.data.message);
    throw err;
  }
  return res.data;
}
