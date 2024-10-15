import type { InboxEntryInput } from "@/types";
import { Readability } from "@mozilla/readability";
import DOMPurify from "dompurify";

export interface ReaderInfo extends NonNullable<ReturnType<Readability["parse"]>> {
  pured: string;
}

export function getReaderInfo(): ReaderInfo | false {
  const p = new Readability(document.cloneNode(true) as Document).parse();
  if (!p) return false;

  const pured = DOMPurify.sanitize(p?.content || "");
  return { ...p, pured };
}

export function getInboxData(info?: ReaderInfo | false): InboxEntryInput {
  const p = info || getReaderInfo() || null;

  return {
    author: p?.byline || p?.siteName || null,
    title: p?.title || document.title,
    description: p?.excerpt || null,
    content: p?.pured || p?.content || "",
    url: location.href,
    publishedAt: new Date().toISOString(),
    guid: crypto.randomUUID(),
  };
}

export type Export = { getReaderInfo: typeof getReaderInfo; getInboxData: typeof getInboxData };
