import { Readability, isProbablyReaderable } from "@mozilla/readability";
import DOMPurify from "dompurify";

isProbablyReaderable(document);
const p = new Readability(document.cloneNode(true)).parse();
const pured = DOMPurify.sanitize(p?.content || "");
console.log({ ...p, pured });

// const res = await fetch("https://api.follow.is/inboxes/webhook", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     author: p?.byline || p?.siteName || null,
//     title: p?.title || document.title,
//     description: p?.excerpt || null,
//     content: `<a href="${location.href}">Subscribe</a>)
//
// ${pured || p?.content || ""}`,
//     url: location.href,
//     publishedAt: new Date().toISOString(),
//     guid: crypto.randomUUID(),
//   }),
// });
//
// console.log(await res.text());
