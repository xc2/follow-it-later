export function fixDiscoverUrl(url: string) {
  const u = new URL(url);
  if (["x.com", "twitter.com"].includes(u.hostname)) {
    const [_, username, match] = u.pathname.split("/");
    if (match === "status") {
      u.pathname = `/${username}`;
    }
    return u.href;
  }
  return url;
}
