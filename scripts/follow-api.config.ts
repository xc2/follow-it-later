export const FollowApiConfig = {
  root: "https://api.follow.is",
  spec: "https://api.follow.is/openapi.json",
  paths: [["/inboxes/list", "get"], "/inboxes/webhook"] as (string | string[])[],
  generatedPath: "src/gen/follow.ts",
};
