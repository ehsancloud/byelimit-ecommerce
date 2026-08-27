// src/app/feed.xml/route.js
import { BLOG_POSTS } from "../../data/blogData";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://byelimit.ir";

  const rssItems = BLOG_POSTS.map(
    (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <description><![CDATA[${post.summary}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <guid>${baseUrl}/blog/${post.slug}</guid>
    </item>
  `
  ).join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>وبلاگ کافه هوش</title>
        <link>${baseUrl}</link>
        <description>جدیدترین اخبار و آموزش‌های کاربردی ابزارهای هوش مصنوعی</description>
        <language>fa-ir</language>
        ${rssItems}
      </channel>
    </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}