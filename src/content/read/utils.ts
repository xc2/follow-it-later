import { messageFetch } from "@/lib/message-fetch/client";
import { handleInternalResult, internal } from "@/services/internal";

export interface FoundRSSLink {
  href: string;
  title?: string | null;
  hrefLang?: string;
}
export function findRSSLinks() {
  const links = Array.from(document.querySelectorAll('link[rel*="alternate"]')).filter((item) => {
    const type = item.getAttribute("type");
    const href = item.getAttribute("href");
    if (!href) return false;
    if (type && /(rss|atom)/i.test(type)) {
      return true;
    }
    if (/\.(rss|atom)/i.test(href) || /(rss|atom).*\.xml/i.test(href)) {
      return true;
    }
    return false;
  });
  return links.map((item) => {
    return {
      href: item.getAttribute("href")!,
      title: item.getAttribute("title"),
      hrefLang: item.getAttribute("hrefLang"),
    } as FoundRSSLink;
  });
}

export async function discoverRSSLinks(url: string): Promise<FoundRSSLink[]> {
  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort(), 3000);
  try {
    const r = await handleInternalResult(
      internal.GET("/discover/feeds", {
        params: { query: { url } },
        fetch: messageFetch,
        signal: abortController.signal,
      })
    );
    return (r || [])
      .map((item) => {
        return {
          href: item.feed?.url,
          title: item.feed?.title,
        } as any;
      })
      .filter((item): item is FoundRSSLink => !!item.href);
  } catch (e) {
    console.warn("Failed to discover feeds", e);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export function findTwitterLink() {
  return Array.from(
    new Set(
      Array.from(
        document.querySelectorAll(
          'meta[name="twitter:site"],meta[name="twitter:creator"],meta[property="twitter:site"],meta[property="twitter:creator"]'
        ),
        (item) => item.getAttribute("content")
      ).filter((link): link is string => {
        return !!link && !/ /.test(link);
      })
    ),
    (item) => {
      const username = item.replace(/^@?/, "");
      return { href: `rsshub://twitter/user/${item}`, title: `Twitter @${username}` };
    }
  );
}
