import { FakeWorkerEvent } from "@/lib/fake-worker-event";
import {
  FetchMessageType,
  type SerializedRequest,
  deserializeRequest,
  serializeResponse,
} from "@/lib/message-fetch/helpers";

class MessageFetchEvent extends FakeWorkerEvent implements FetchEvent {
  request: Request;
  readonly clientId;
  readonly handled;
  readonly resultingClientId;
  readonly preloadResponse;
  private _handled?: (v: undefined) => any;
  private readonly _respondWith: (r: Response | PromiseLike<Response>) => void;

  constructor(
    type: "fetch",
    options: FetchEventInit & { respondWith: (r: Response | PromiseLike<Response>) => void }
  ) {
    super(type);
    this.request = options.request;
    this.clientId = options.clientId || "";
    this.handled =
      options.handled ||
      new Promise<undefined>((resolve) => {
        this._handled = resolve;
      });
    this.resultingClientId = options.resultingClientId || "";
    this.preloadResponse = options.preloadResponse || Promise.resolve(undefined);
    this._respondWith = options.respondWith;
  }
  respondWith(r: Response | PromiseLike<Response>): void {
    this._handled?.(undefined);
    this._respondWith(r);
  }
}

export function createMessageFetchEvent(
  message: any,
  sender: chrome.runtime.MessageSender,
  respond: (response: any) => void
) {
  const request = message?.[FetchMessageType] as SerializedRequest | undefined;
  if (request) {
    return new MessageFetchEvent("fetch", {
      request: deserializeRequest(request),
      respondWith: (r) =>
        Promise.resolve(r)
          .then((res) => serializeResponse(res))
          .then(respond),
    });
  }
}
