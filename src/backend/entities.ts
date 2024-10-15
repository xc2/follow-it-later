import { z } from "@hono/zod-openapi";

export const SettingsSchema = z
  .object({
    DefaultInbox: z.string().optional().nullable(),
    LastUsedInbox: z.string().optional().nullable(),
  })
  .openapi("Settings");

export type Settings = z.infer<typeof SettingsSchema>;

export const InboxItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    secret: z.string(),
  })
  .openapi("InboxItem");
export type InboxItem = z.infer<typeof InboxItemSchema>;

export const ErrorSchema = z.object({
  ok: z.literal(false),
  message: z.string(),
  name: z.string().optional(),
});
