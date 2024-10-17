export const FollowApiConfig = {
  root: "https://api.follow.is",
  spec: "https://api.follow.is/openapi.json",
  paths: [
    /**
     * @purpose Retrieve the list of Follow inboxes
     */
    ["/inboxes/list", "get"],
    /**
     * @purpose Send data to a Follow inbox
     */
    "/inboxes/webhook",
    /**
     * @purpose Discover RSS links to follow later
     */
    "/discover",
  ] as (string | string[])[],
  generatedPath: "src/gen/follow.ts",
};
