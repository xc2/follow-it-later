import {
  type FoundRSSLink,
  discoverRSSLinks,
  findRSSLinks,
  findTwitterLink,
} from "@/content/read/utils";
import { skipNil } from "@/lib/lang";
import type { InboxEntryInput } from "@/types";
import { Readability } from "@mozilla/readability";
import DOMPurify from "dompurify";

export interface ReaderInfo extends NonNullable<ReturnType<Readability["parse"]>> {}

export function getReaderInfo(): ReaderInfo | false {
  const doc = document.cloneNode(true) as Document;
  const p = new Readability(doc).parse();
  if (!p) return false;
  return p;
}

function getSourceAnchor(url: string) {
  const u = new URL(url);
  return `<a href="${u.toString()}">View Source Content</a>`;
}
function getFeedAnchor(feed: FoundRSSLink, fallback?: string) {
  const u = new URL("https://app.follow.is/add");
  u.searchParams.set("url", feed.href);
  const channelName = feed.title || fallback || feed.hrefLang;
  return `<a href="${u.toString()}">${channelName || "Channel"}</a>`;
}
function getFeedsAnchor(feeds: FoundRSSLink[], fallback?: string) {
  const links = feeds.map((feed) => getFeedAnchor(feed, fallback));
  if (links.length === 0) return null;
  return `<span><strong>Follow: </strong>${links.join(" | ")}</span>`;
}

export async function getInboxData(info?: ReaderInfo | false): Promise<InboxEntryInput> {
  const p = info || getReaderInfo() || null;
  const url = location.href;
  const siteName = p?.siteName;
  let foundRssLinks = findRSSLinks();
  if (foundRssLinks.length === 0) {
    const r = await discoverRSSLinks(url);
    if (r.length) {
      foundRssLinks = r.slice(0, 3);
    }
  }
  foundRssLinks = foundRssLinks.concat(findTwitterLink());
  const header = [getFeedsAnchor(foundRssLinks, siteName)]
    .filter(skipNil)
    .map((v) => `<div>${v}</div>`)
    .join("");
  const footer = [getSourceAnchor(url)]
    .filter(skipNil)
    .map((v) => `<div>${v}</div>`)
    .join("");
  const main = [header, p?.content, footer].filter(skipNil).join("<hr>");

  const content = main ? `<div>${main}</div>` : "";

  const pured = content && DOMPurify.sanitize(content);

  return {
    author: p?.byline || siteName || null,
    title: p?.title || document.title,
    description: p?.excerpt || null,
    content: pured,
    url,
    publishedAt: new Date().toISOString(),
    guid: crypto.randomUUID(),
  };
}

export type Export = { getReaderInfo: typeof getReaderInfo; getInboxData: typeof getInboxData };
