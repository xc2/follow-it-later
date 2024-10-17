import {
  FetchMessageType,
  deserializeResponse,
  serializeRequest,
} from "@/lib/message-fetch/helpers";

export async function messageFetch(request: Request) {
  const message = {
    [FetchMessageType]: await serializeRequest(request),
  };
  return new Promise<Response>((resolve, reject) => {
    if (request.signal) {
      request.signal.addEventListener("abort", reject);
    }
    const p = chrome.runtime.sendMessage(message).then(deserializeResponse).then(resolve, reject);
    p.then(null, () => {
      if (request.signal) {
        request.signal.removeEventListener("abort", reject);
      }
    });
  });
}
