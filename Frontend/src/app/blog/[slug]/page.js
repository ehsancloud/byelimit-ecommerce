// src/app/blog/[slug]/page.js
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS, AUTHORS } from "../../../data/blogData";
import {
  ArticleSchema,
  BreadcrumbSchema,
  FaqSchema,
  PersonSchema,
} from "../../../components/blog/SeoSchemas";
import TableOfContents from "../../../components/blog/TableOfContents";
import AuthorBox from "../../../components/blog/AuthorBox";
import CommentSection from "../../../components/blog/CommentSection";
import BlogCard from "../../../components/blog/BlogCard";
import { Calendar, Clock, RefreshCw, ChevronLeft } from "lucide-react";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = BLOG_POSTS.find((p) => p.slug === resolvedParams.slug);
  if (!post) return {};

  return {
    title: `${post.metaTitle || post.title} | کافه هوش`,
    description: post.metaDescription || post.summary,
    alternates: {
      canonical: post.canonicalUrl || `https://yourdomain.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.summary,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.featuredImage, alt: post.featuredAlt }],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const post = BLOG_POSTS.find((p) => p.slug === resolvedParams.slug);

  if (!post) notFound();

  const author = AUTHORS[post.authorSlug] || AUTHORS["ehsan-kazemi"];
  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && p.category.slug === post.category.slug
  );

  // استخراج خودکار تیترها برای TOC
  const headings = [
    { id: "section-1", text: "مقدمه و بررسی اهمیت ChatGPT Plus", level: 2 },
    { id: "section-2", text: "قابلیت‌های کلیدی مدل GPT-4o", level: 2 },
    { id: "section-2-1", text: "تحلیل فایل و داده‌های سنگین", level: 3 },
    { id: "section-3", text: "نتیجه‌گیری و جمع‌بندی", level: 2 },
  ];

  const breadcrumbs = [
    { name: "خانه", url: "/" },
    { name: "وبلاگ", url: "/blog" },
    { name: post.category.title, url: `/blog/category/${post.category.slug}` },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  const isUpdated =
    post.updatedAt &&
    new Date(post.updatedAt).getTime() > new Date(post.publishedAt).getTime();

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black">
      {/* تزریق اسکیماها */}
      <ArticleSchema post={post} author={author} />
      <BreadcrumbSchema items={breadcrumbs} />
      <FaqSchema faqItems={post.faqItems} />
      <PersonSchema author={author} />

      <article className="max-w-4xl mx-auto bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-10 shadow-[-10px_10px_0_0_rgba(0,0,0,1)]">
        
        {/* نوار مسیریابی Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-6 overflow-x-auto pb-2">
          {breadcrumbs.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
              <Link href={item.url} className="hover:underline hover:text-black">
                {item.name}
              </Link>
              {idx < breadcrumbs.length - 1 && (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </div>
          ))}
        </nav>

        {/* هدر مقاله */}
        <header className="mb-8 border-b-[3px] border-black pb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-[#ccff00] border-[2px] border-black px-3 py-1 rounded-md text-xs font-black">
              {post.category.title}
            </span>
            
            <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTime} دقیقه مطالعه</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
              {isUpdated ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>آخرین به‌روزرسانی: {new Date(post.updatedAt).toLocaleDateString("fa-IR")}</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تاریخ انتشار: {new Date(post.publishedAt).toLocaleDateString("fa-IR")}</span>
                </>
              )}
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl font-black leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-gray-700 font-bold text-sm md:text-base leading-relaxed">
            {post.summary}
          </p>
        </header>

        {/* تصویر اصلی مقاله با Alt استاندارد */}
        <div className="relative w-full h-[280px] sm:h-[420px] border-[3.5px] border-black rounded-[20px] overflow-hidden shadow-[-6px_6px_0_0_rgba(0,0,0,1)] mb-8 bg-gray-100">
          <Image
            src={post.featuredImage}
            alt={post.featuredAlt}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* جدول محتوای هوشمند */}
        <TableOfContents headings={headings} />

        {/* بدنه محتوای مقاله */}
        <div
          className="prose max-w-none font-bold leading-loose text-gray-800 space-y-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* سوالات متداول (FAQ) انتهای مقاله */}
        {post.faqItems && post.faqItems.length > 0 && (
          <section className="mt-12 bg-[#f8f9fa] border-[3px] border-black rounded-[20px] p-6 shadow-[-6px_6px_0_0_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black mb-4 border-b-[2px] border-black pb-2">
              سوالات متداول (FAQ)
            </h3>
            <div className="flex flex-col gap-4">
              {post.faqItems.map((faq, idx) => (
                <div key={idx} className="bg-white border-[2px] border-black p-4 rounded-xl">
                  <h4 className="font-black text-sm mb-1">{faq.question}</h4>
                  <p className="text-xs font-bold text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* باکس اطلاعات نویسنده */}
        <AuthorBox author={author} />

        {/* سیستم دیدگاه‌ها */}
        <CommentSection />

      </article>

      {/* ماژول مقالات مرتبط (Related Posts) */}
      {relatedPosts.length > 0 && (
        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-black mb-6 border-b-[3px] border-black pb-2 inline-block">
            مقالات مرتبط
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedPosts.map((relPost) => (
              <BlogCard key={relPost.id} post={relPost} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}