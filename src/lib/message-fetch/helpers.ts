export const FetchMessageType = `${chrome.runtime.dynamicId || chrome.runtime.id}-${fetch}`;

export function serializeHeaders(headers: Headers): [string, string][] {
  if ("entries" in headers) {
    return [...(headers as any).entries()];
  } else {
    const entries: [string, string][] = [];
    headers.forEach((value, name) => {
      entries.push([name, value]);
    });
    return entries;
  }
}
export type SerializedRequest = Awaited<ReturnType<typeof serializeRequest>>;
export async function serializeRequest(request: Request) {
  return {
    url: request.url,
    method: request.method,
    credentials: request.credentials,
    headers: serializeHeaders(request.headers),
    body: request.body && (await request.text()),
  };
}
export function deserializeRequest(request: Awaited<ReturnType<typeof serializeRequest>>) {
  const { url, ...rest } = request;
  const req = new Request(url, rest);
  return req;
}
export type SerializedResponse = Awaited<ReturnType<typeof serializeResponse>>;
export async function serializeResponse(response: Response) {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: serializeHeaders(response.headers),
    body: response.body && (await response.text()),
  };
}
export function deserializeResponse(response: Awaited<ReturnType<typeof serializeResponse>>) {
  const { body, ...rest } = response;
  const res = new Response(body, rest);
  return res;
}
