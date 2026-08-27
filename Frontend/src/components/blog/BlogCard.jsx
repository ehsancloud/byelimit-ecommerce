// src/components/blog/BlogCard.jsx
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

export default function BlogCard({ post }) {
  if (!post) return null;

  // پشتیبانی همزمان از featuredImage و image و جلوگیری از مقدار خالی ""
  const imageSrc = post.featuredImage || post.image || "/images/gpt2.jpeg";
  const categoryTitle = post.category?.title || post.category || "مقاله";

  return (
    <article className="bg-white border-[3.5px] border-black rounded-[20px] overflow-hidden shadow-[-8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[-12px_12px_0_0_rgba(0,0,0,1)] transition-all duration-300 flex flex-col justify-between dir-rtl font-[family-name:var(--font-farsi)]">
      <div>
        {/* کاور مقاله با چک کردن معتبر بودن تصویر */}
        <div className="relative w-full h-[200px] border-b-[3.5px] border-black bg-gray-100 overflow-hidden">
          {imageSrc && (
            <Image
              src={imageSrc}
              alt={post.featuredAlt || post.title || "کاور مقاله"}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          )}
          <span className="absolute top-3 right-3 bg-[#ccff00] border-[2px] border-black px-3 py-1 rounded-md text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)] z-10">
            {categoryTitle}
          </span>
        </div>

        {/* محتوای کارت */}
        <div className="p-5">
          <div className="flex items-center gap-4 text-xs font-bold text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("fa-IR")
                : post.date || "تاریخ ثبت نشده"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
              {post.readingTime
                ? `${post.readingTime} دقیقه`
                : post.readTime || "۵ دقیقه"}
            </span>
          </div>

          <h2 className="text-xl font-black leading-snug mb-2 hover:text-gray-700 transition-colors">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>

          <p className="text-xs font-bold text-gray-600 leading-relaxed line-clamp-2 mb-4">
            {post.summary || post.excerpt}
          </p>
        </div>
      </div>

      {/* دکمه مطالعه کامل */}
      <div className="p-5 pt-0">
        <Link
          href={`/blog/${post.slug}`}
          className="w-full bg-[#12e2a3] hover:bg-[#0fd196] border-[2.5px] border-black rounded-xl py-2.5 px-4 flex items-center justify-between font-black text-sm shadow-[-3px_3px_0_0_rgba(0,0,0,1)] active:translate-x-[-1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <span>مطالعه مقاله</span>
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
        </Link>
      </div>
    </article>
  );
}
