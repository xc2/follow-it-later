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
