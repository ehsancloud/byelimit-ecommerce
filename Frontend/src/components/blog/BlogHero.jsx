// src/components/blog/BlogHero.jsx
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Calendar, Clock, ArrowLeft } from "lucide-react";

export default function BlogHero({ posts }) {
  if (!posts || posts.length === 0) return null;

  const mainPost = posts[0];
  const sidePosts = posts.slice(1, 3);

  return (
    <section className="mb-12 font-[family-name:var(--font-farsi)] dir-rtl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* مقاله اصلی هیرو (بزرگ) */}
        <div className="lg:col-span-7 bg-[#ccff00] border-[3.5px] border-black rounded-[24px] p-6 shadow-[-10px_10px_0_0_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="relative w-full h-[260px] sm:h-[340px] border-[3px] border-black rounded-[18px] overflow-hidden bg-white mb-5 shadow-[-4px_4px_0_0_rgba(0,0,0,1)]">
              <Image
                src={mainPost.featuredImage}
                alt={mainPost.featuredAlt}
                fill
                priority
                className="object-cover"
              />
              <span className="absolute top-3 right-3 bg-[#12e2a3] border-[2px] border-black px-3 py-1 rounded-md text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
                {mainPost.category.title}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-black text-black/80 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(mainPost.publishedAt).toLocaleDateString("fa-IR")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {mainPost.readingTime} دقیقه مطالعه
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-3 text-black">
              <Link href={`/blog/${mainPost.slug}`} className="hover:underline">
                {mainPost.title}
              </Link>
            </h2>

            <p className="text-sm font-bold text-gray-800 leading-relaxed line-clamp-3 mb-6">
              {mainPost.summary}
            </p>
          </div>

          <Link
            href={`/blog/${mainPost.slug}`}
            className="w-full bg-white hover:bg-gray-100 text-black border-[3px] border-black rounded-xl py-3 px-5 flex items-center justify-between font-black text-base shadow-[-4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <span>مطالعه مقاله منتخب</span>
            <ArrowLeft className="w-5 h-5 stroke-[3]" />
          </Link>
        </div>

        {/* مقالات فرعی شبکه */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
          {sidePosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border-[3.5px] border-black rounded-[20px] p-5 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex flex-col justify-between flex-1"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#ff8f1f] border-[2px] border-black px-2.5 py-0.5 rounded-md text-[11px] font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)]">
                    {post.category.title}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    {post.readingTime} دقیقه
                  </span>
                </div>

                <h3 className="text-lg font-black leading-snug mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>

                <p className="text-xs font-bold text-gray-600 line-clamp-2 mb-4">
                  {post.summary}
                </p>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-black text-black hover:underline self-start"
              >
                <span>مشاهده مقاله</span>
                <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
              </Link>
            </div>
          ))}

          {/* باکس دعوتی ویژه */}
          <div className="bg-[#12e2a3] border-[3.5px] border-black rounded-[20px] p-5 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-black text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                <span>به‌روزرسانی‌های هوش مصنوعی</span>
              </div>
              <p className="text-xs font-bold text-gray-800">
                جدیدترین ابزارهای AI را در وبلاگ ما دنبال کنید.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
