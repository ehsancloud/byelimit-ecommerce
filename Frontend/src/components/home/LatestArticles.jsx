// src/components/home/LatestArticles.jsx
"use client";

import Link from "next/link";
import BlogCard from "../blog/BlogCard";
import { BLOG_POSTS } from "../../data/blogData";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function LatestArticles() {
  const posts = BLOG_POSTS.slice(0, 3);

  return (
    <section>
      <div className="flex items-center justify-between mb-6 border-b-[3.5px] border-black pb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 stroke-[2.5]" />
          <h2 className="text-2xl font-black">آخرین مقالات مجله هوش مصنوعی</h2>
        </div>
        
        <Link href="/blog" className="hidden sm:flex items-center gap-1 text-sm font-black text-black hover:text-gray-700 transition-colors">
          مشاهده همه <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id || post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}