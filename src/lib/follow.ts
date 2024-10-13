import { destructPromise } from "@/lib/lang";
import { FetchResponse } from "openapi-fetch";

export interface FollowError extends Error {
  response: Response;
  name: "HttpError" | "AuthError" | "BadRequestError" | "FollowError" | "JSONError";
  json: unknown;
}

export function makeHttpError(
  response: Response,
  { name, message, json }: { name?: FollowError["name"]; message?: string; json?: unknown } = {}
) {
  const err = new Error(message || (json as any)?.message);
  Object.defineProperties(err, {
    response: { value: response, enumerable: false },
    name: { value: name || "HttpError", enumerable: false },
    json: { value: json, enumerable: true },
  });
  return err;
}
export function isFollowError(err: unknown): err is FollowError {
  return err ? "response" in (err as any) : false;
}
export function handleFollowData<T>(json: { code: number; data: T }, res: Response): T {
  if (res.status === 401) {
    throw makeHttpError(res, { name: "AuthError", json });
  } else if (res.status === 400) {
    throw makeHttpError(res, { name: "BadRequestError", json });
  } else if (res.status >= 400 && res.status < 500) {
    throw makeHttpError(res, { name: "HttpError", json });
  } else if (res.status >= 500) {
    throw makeHttpError(res, { name: "FollowError", json });
  } else if (json?.code > 0) {
    throw makeHttpError(res, { name: "FollowError", json });
  }
  return json?.data;
}
export async function handleFollowResponse<T>(res: Response | PromiseLike<Response>): Promise<T> {
  res = await res;
  const [ok, dataOrErr] = await destructPromise(res.json());
  const json = ok ? dataOrErr : undefined;
  const data = handleFollowData<T>(json, res);
  if (!ok) {
    throw makeHttpError(res, { name: "JSONError", message: "Cannot decode the response message." });
  }
  return data;
}
