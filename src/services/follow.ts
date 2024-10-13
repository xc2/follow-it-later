import { baseUrl, paths } from "@/gen/follow";
import { handleFollowData, makeHttpError } from "@/lib/follow";
import createClient, { FetchResponse } from "openapi-fetch";
const mani = chrome.runtime.getManifest();

export const follow = createClient<paths>({
  baseUrl,
  mode: "cors",
  credentials: "include",
  headers: {
    "X-User-Agent": `${mani.name.replace(/ +/g, "-")}/${mani.version} (+${mani.homepage_url})`,
  },
});
type ExtractData<T> = T extends { data: infer K } ? K : never;
export async function handleFollowResult<T extends FetchResponse<any, any, any>>(
  res: T | PromiseLike<T>
): Promise<ExtractData<T["data"]>> {
  res = await res;
  const data = handleFollowData<ExtractData<T["data"]>>(res.data, res.response);
  if (res.error) {
    throw makeHttpError(res.response, {
      name: "JSONError",
      message: "Cannot decode the response message.",
    });
  }
  return data;
}
