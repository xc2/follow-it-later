import { baseUrl, paths } from "@/gen/internal";
import createClient, { FetchResponse } from "openapi-fetch";
import { FollowApiConfig } from "../../scripts/follow-api.config";

export const internal = createClient<paths>({
  baseUrl: new URL(baseUrl, /* actually not used */ FollowApiConfig.root).href,
  headers: {},
});

export async function handleInternalResult<T extends FetchResponse<any, any, any>>(
  res: T | PromiseLike<T>
): Promise<T["data"]> {
  res = await res;
  if (res.error) {
    throw res.error;
  }
  return res.data;
}
