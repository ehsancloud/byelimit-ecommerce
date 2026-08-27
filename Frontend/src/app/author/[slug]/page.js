// src/app/author/[slug]/page.js
import { notFound } from "next/navigation";
import Image from "next/image";
import { AUTHORS, BLOG_POSTS } from "../../../data/blogData";
import BlogCard from "../../../components/blog/BlogCard";
import { PersonSchema } from "../../../components/blog/SeoSchemas";
import { BookOpen } from "lucide-react";

export async function generateStaticParams() {
  return Object.keys(AUTHORS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const author = AUTHORS[resolvedParams.slug];
  if (!author) return {};

  return {
    title: `مقالات ${author.name} | نویسنده کافه هوش`,
    description: author.bio,
    alternates: {
      canonical: `https://yourdomain.com/author/${author.slug}`,
    },
  };
}

export default async function AuthorPage({ params }) {
  const resolvedParams = await params;
  const author = AUTHORS[resolvedParams.slug];

  if (!author) notFound();

  const authorPosts = BLOG_POSTS.filter(
    (post) => post.authorSlug === author.slug
  );

  return (
    <main className="min-h-screen bg-[#f3f3f3] p-4 sm:p-6 md:p-10 font-[family-name:var(--font-farsi)] dir-rtl text-black">
      <PersonSchema author={author} />

      <div className="max-w-4xl mx-auto">
        {/* کارت پروفایل نویسنده */}
        <section className="bg-white border-[3.5px] border-black rounded-[24px] p-6 md:p-8 shadow-[-10px_10px_0_0_rgba(0,0,0,1)] mb-12 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl border-[3px] border-black overflow-hidden bg-gray-100 shadow-[-4px_4px_0_0_rgba(0,0,0,1)] flex-shrink-0">
            <Image
              src={author.avatarUrl}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-right">
            <h1 className="text-2xl md:text-3xl font-black mb-1">{author.name}</h1>
            <p className="text-xs font-black text-gray-700 mb-3">{author.jobTitle}</p>
            <p className="text-sm font-bold text-gray-800 leading-relaxed mb-4">
              {author.bio}
            </p>

            {author.socialLinks && (
              <div className="flex items-center justify-center md:justify-start gap-3">
                {author.socialLinks.linkedin && (
                  <a
                    href={author.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#ccff00] border-[2px] border-black rounded-lg shadow-[-2px_2px_0_0_rgba(0,0,0,1)] font-bold text-xs flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
                    </svg>
                    <span>لینکدین</span>
                  </a>
                )}
                {author.socialLinks.github && (
                  <a
                    href={author.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white border-[2px] border-black rounded-lg shadow-[-2px_2px_0_0_rgba(0,0,0,1)] font-bold text-xs flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                    </svg>
                    <span>گیت‌هاب</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* لیست مقالات این نویسنده */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b-[3px] border-black pb-2">
            <BookOpen className="w-6 h-6" />
            <h2 className="text-2xl font-black">
              مقالات نوشته‌شده توسط {author.name} ({authorPosts.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {authorPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}