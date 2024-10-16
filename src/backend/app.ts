import { authStateAtom, inboxesAtom, settingsAtom } from "@/backend/atoms";
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
  return c.json(await container.get(inboxesAtom), 200);
});

app.openapi(r.RefreshInboxes, async (c) => {
  container.set(inboxesAtom);
  return c.json(await container.get(inboxesAtom), 200);
});

app.openapi(r.GetAuthState, async (c) => {
  const authState = await container.get(authStateAtom);

  if (!authState) {
    container.set(inboxesAtom);
    const newAuthState = await container.get(authStateAtom);
    return c.json({ logged: newAuthState, changed: newAuthState !== authState }, 200);
  }
  return c.json({ logged: authState }, 200);
});
