import { z } from "@hono/zod-openapi";

export const SettingsSchema = z
  .object({
    DefaultInbox: z.string().optional(),
  })
  .openapi("Settings");

export type Settings = z.infer<typeof SettingsSchema>;
