import { paths } from "@/gen/follow";

export type InboxEntryInput = NonNullable<
  paths["/inboxes/webhook"]["post"]["requestBody"]
>["content"]["application/json"];

export type InboxItem =
  paths["/inboxes/list"]["get"]["responses"]["200"]["content"]["application/json"]["data"][number];
