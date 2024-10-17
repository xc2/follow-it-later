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

export const ErrorSchema = z
  .object({
    ok: z.literal(false),
    message: z.string(),
    name: z.string().optional(),
  })
  .openapi("GeneralException");

export const UserSchema = z
  .object({
    id: z.string(),
    name: z.string().optional().nullable(),
    emailVerified: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    handle: z.string().optional().nullable(),
    createdAt: z.string(),
  })
  .openapi("User");

export const FeedSchema = z
  .object({
    id: z.string(),
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    ownerUserId: z.string().optional().nullable(),
    owner: z
      .object({
        id: z.string(),
        name: z.string().optional().nullable(),
        emailVerified: z.string().optional().nullable(),
        image: z.string().optional().nullable(),
        handle: z.string().optional().nullable(),
        createdAt: z.string(),
      })
      .optional()
      .nullable(),
    type: z.literal("feed"),
    url: z.string(),
    siteUrl: z.string().optional().nullable(),
    errorMessage: z.string().optional().nullable(),
    errorAt: z.string().optional().nullable(),
    tipUsers: z.array(UserSchema).optional().nullable(),
  })
  .openapi("Feed");
