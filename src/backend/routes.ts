import { SettingsSchema } from "@/backend/entities";
import { RouteConfig, createRoute, z } from "@hono/zod-openapi";
import { ZodType } from "zod";

export const GetSettings = createRoute({
  method: "get",
  path: "/settings",
  responses: res(SettingsSchema),
});

export const PutSettings = createRoute({
  method: "put",
  path: "/settings",
  request: { body: req(SettingsSchema) },
  responses: res(SettingsSchema),
});
export const SendPage = createRoute({
  method: "post",
  path: "/inbox/{inboxId}/tab/{tabId}",
  request: {
    params: z.object({ inboxId: z.string(), tabId: z.number() }),
  },
  responses: res(z.object({})),
});

function res<T extends ZodType<unknown>>(schema: T) {
  return {
    200: {
      content: {
        "application/json": { schema },
      },
      description: schema.description || "",
    },
  } satisfies RouteConfig["responses"];
}
function req<T extends ZodType<unknown>>(schema: T) {
  return {
    content: {
      "application/json": { schema },
    },
  } satisfies NonNullable<RouteConfig["request"]>["body"];
}
