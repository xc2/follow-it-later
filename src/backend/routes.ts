import { ErrorSchema, FeedSchema, InboxItemSchema, SettingsSchema } from "@/backend/entities";
import { type RouteConfig, createRoute, z } from "@hono/zod-openapi";
import type { ZodType } from "zod";

export const GetSettings = createRoute({
  method: "get",
  path: "/settings",
  responses: res(SettingsSchema),
});

export const PutSettings = createRoute({
  method: "put",
  path: "/settings",
  request: { body: req(SettingsSchema.partial()) },
  responses: res(SettingsSchema),
});
export const SendPage = createRoute({
  method: "post",
  path: "/inbox/{inboxId}/tab/{tabId}",
  request: {
    params: z.object({ inboxId: z.string(), tabId: z.number().or(z.string()) }),
    query: z.object({ mute: z.enum(["1", "0"]).optional() }),
  },
  responses: res(z.object({})),
});
export const GetInboxes = createRoute({
  method: "get",
  path: "/inboxes",
  responses: res(z.array(InboxItemSchema)),
});
export const RefreshInboxes = createRoute({
  method: "put",
  path: "/inboxes",
  responses: res(z.array(InboxItemSchema)),
});
export const GetAuthState = createRoute({
  method: "get",
  path: "/auth-state",
  responses: res(z.object({ logged: z.boolean(), changed: z.boolean().optional() })),
});
export const DiscoverFeeds = createRoute({
  method: "get",
  path: "/discover/feeds",
  request: { query: z.object({ url: z.string() }) },
  responses: res(z.array(z.object({ feed: FeedSchema.optional(), docs: z.string().optional() }))),
});

function res<T extends ZodType<unknown>>(schema: T) {
  return {
    200: {
      content: {
        "application/json": { schema },
      },
      description: schema.description || "",
    },
    ...[400, 401, 403, 404, 422, 500].reduce(
      (acc, code) => {
        // @ts-expect-error
        acc[code] = {
          description: "",
          content: { "application/json": { schema: ErrorSchema } },
        };
        return acc;
      },
      {} as Record<400 | 401 | 403 | 404 | 422 | 500, RouteConfig["responses"][number]>
    ),
  } satisfies RouteConfig["responses"];
}
function req<T extends ZodType<unknown>>(schema: T) {
  return {
    content: {
      "application/json": { schema },
    },
  } satisfies NonNullable<RouteConfig["request"]>["body"];
}
