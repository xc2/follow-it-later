import { inboxesAsyncAtom, inboxesAtom, settingsAtom } from "@/backend/atoms";
import { authStateAsyncAtom, authStateAtom } from "@/backend/atoms/follow-client";
import { container } from "@/backend/container";
import { sendToInbox } from "@/backend/inbox";
import { baseUrl } from "@/gen/internal";
import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import * as r from "./routes";

export const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ ok: false, message: result.error.message, name: "VALIDATE_ERROR" }, 422);
    }
  },
}).basePath(baseUrl);
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json({ ok: false, message: err.message }, 500);
});

app.openapi(r.GetSettings, async (c) => {
  return c.json(container.get(settingsAtom), 200);
});

app.openapi(r.PutSettings, async (c) => {
  container.set(settingsAtom, await c.req.json());
  return c.json(container.get(settingsAtom), 200);
});

app.openapi(r.SendPage, async (c) => {
  const { inboxId, tabId } = c.req.param();
  const { mute: _mute } = c.req.query();
  const mute = _mute === "1";
  const { inbox, payload } = await sendToInbox({ inboxId, tabId: Number(tabId), mute });
  container.set(settingsAtom, { LastUsedInbox: inboxId });
  return c.json({ inbox, payload }, 200);
});

app.openapi(r.GetInboxes, async (c) => {
  return c.json(container.get(inboxesAtom), 200);
});

app.openapi(r.RefreshInboxes, async (c) => {
  container.set(inboxesAsyncAtom);
  return c.json(await container.get(inboxesAsyncAtom), 200);
});

app.openapi(r.GetAuthState, async (c) => {
  let authState = container.get(authStateAtom);
  let needRefresh = false;
  if (authState === false) {
    container.set(inboxesAsyncAtom);
    authState = await container.get(authStateAsyncAtom);
    needRefresh = authState === true;
  } else if (authState === undefined) {
    authState = await container.get(authStateAsyncAtom);
  }
  return c.json({ logged: authState, changed: needRefresh }, 200);
});
