import { getInboxById, sendToInbox } from "@/backend/inbox";
import { getSettings, putSettings } from "@/backend/settings";
import { baseUrl } from "@/gen/internal";
import { OpenAPIHono } from "@hono/zod-openapi";
import * as r from "./routes";

export const app = new OpenAPIHono({}).basePath(baseUrl);

app.openapi(r.GetSettings, async (c) => {
  return c.json(await getSettings());
});

app.openapi(r.PutSettings, async (c) => {
  await putSettings(await c.req.json());
  return c.json(await getSettings());
});

app.openapi(r.SendPage, async (c) => {
  const { inboxId, tabId } = c.req.param();
  const inbox = (await getInboxById(inboxId))!;
  const { result, payload } = await sendToInbox({ inbox, tabId: Number(tabId) });
  return c.json({ result: result.data, payload }, result.response.status as any);
});
