// src/app/blog/page.js
import Link from "next/link";
import { BLOG_POSTS } from "../../data/blogData";
import BlogHero from "../../components/blog/BlogHero";
import BlogCard from "../../components/blog/BlogCard";
import { BookOpen, Sparkles, SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "مجله تخصصی و وبلاگ هوش مصنوعی | کافه هوش",
  description:
    "جدیدترین مقالات آموزشی، راهنمای خرید اکانت‌های پرمیوم، بررسی مدل‌های GPT-4o، Midjourney v6، راهنمای پرامپت‌نویسی و اخبار روز AI.",
  alternates: {
    canonical: "https://yourdomain.com/blog",
  },
  openGraph: {
    title: "مجله تخصصی و وبلاگ هوش مصنوعی | کافه هوش",
    description:
      "جدیدترین مقالات آموزشی، راهنمای خرید اکانت‌های پرمیوم و بررسی تخصصی مدل‌های جدید AI.",
    url: "https://yourdomain.com/blog",
    type: "website",
  },
};

export default function BlogListPage() {
  // ۳ مقاله اول برای بخش هیرو سکشن شبکه‌ای
  const heroPosts = BLOG_POSTS.slice(0, 3);
  // مابقی مقالات برای لیست اصلی
  const regularPosts = BLOG_POSTS.slice(3);

  // استخراج دسته‌بندی‌های یکتا برای منوی فیلتر سریع
  const categories = Array.from(
    new Set(BLOG_POSTS.map((post) => post.category?.title))
  ).filter(Boolean);

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black">
      <div className="max-w-7xl mx-auto">
        {/* هدر اصلی وبلاگ */}
        <header className="mb-10 text-center md:text-right border-b-[3.5px] border-black pb-6">
          <div className="inline-flex items-center gap-2 bg-[#ccff00] border-[2.5px] border-black px-3 py-1 rounded-lg text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)] mb-3">
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
            <span>مجله تخصصی کافه هوش</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            وبلاگ و مقالات آموزشی هوش مصنوعی
          </h1>
          <p className="text-gray-700 font-bold text-sm md:text-base max-w-2xl">
            بررسی تخصصی ابزارهای مولد متن، تصویر، کد و صوت، راهنمای کاربردی
            پرامپت‌نویسی و آموزش‌های گام به گام جهت افزایش بهره‌وری.
          </p>
        </header>

        {/* ۱. هیرو سکشن شبکه‌ای نئوبروتالیسم (مقالات منتخب) */}
        <BlogHero posts={heroPosts} />

        {/* ۲. نوار فیلتر سریع دسته‌بندی‌ها */}
        <section className="mb-8 bg-white border-[3px] border-black rounded-[20px] p-4 shadow-[-6px_6px_0_0_rgba(0,0,0,1)] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 font-black text-sm md:text-base">
            <SlidersHorizontal className="w-5 h-5 stroke-[2.5]" />
            <span>دسته‌بندی مقالات:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <Link
              href="/blog"
              className="bg-[#12e2a3] border-[2px] border-black px-3 py-1.5 rounded-xl text-xs font-black shadow-[-2px_2px_0_0_rgba(0,0,0,1)] whitespace-nowrap"
            >
              همه مقالات
            </Link>
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className="bg-gray-100 hover:bg-[#ccff00] border-[2px] border-black px-3 py-1.5 rounded-xl text-xs font-black transition-colors whitespace-nowrap"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>

        {/* ۳. شبکه کلی مقالات وبلاگ */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b-[3px] border-black pb-2">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
            <h2 className="text-2xl font-black">آخرین مقالات منتشر شده</h2>
          </div>

          {BLOG_POSTS.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {BLOG_POSTS.map((post) => (
                <BlogCard key={post.id || post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white border-[3px] border-black rounded-[16px] p-12 text-center font-black text-lg shadow-[-6px_6px_0_0_rgba(0,0,0,1)]">
              هنوز مقاله‌ای در این بخش منتشر نشده است.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}