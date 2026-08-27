// src/components/blog/AuthorBox.jsx
import Link from "next/link";
import Image from "next/image";
import { UserCheck } from "lucide-react";

export default function AuthorBox({ author }) {
  if (!author) return null;

  return (
    <div className="bg-[#12e2a3]/10 border-[3.5px] border-black rounded-[20px] p-5 md:p-6 shadow-[-8px_8px_0_0_rgba(0,0,0,1)] dir-rtl my-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 font-[family-name:var(--font-farsi)]">
      {/* آواتار نویسنده */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-[2.5px] border-black overflow-hidden bg-white shadow-[-3px_3px_0_0_rgba(0,0,0,1)] flex-shrink-0">
        <Image
          src={author.avatarUrl}
          alt={author.name}
          fill
          className="object-cover"
        />
      </div>

      {/* اطلاعات و شبکه‌های اجتماعی */}
      <div className="flex-1 text-center sm:text-right">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <UserCheck className="w-5 h-5 text-black" />
          <Link
            href={`/author/${author.slug}`}
            className="font-black text-lg md:text-xl hover:underline text-black"
          >
            {author.name}
          </Link>
        </div>

        <p className="text-xs font-black text-gray-700 mb-2">
          {author.jobTitle}
        </p>
        <p className="text-xs md:text-sm font-bold text-gray-800 leading-relaxed mb-4">
          {author.bio}
        </p>

        {/* لینک‌های شبکه‌های اجتماعی با SVG مستقیم */}
        {author.socialLinks && (
          <div className="flex items-center justify-center sm:justify-start gap-3">
            {author.socialLinks.linkedin && (
              <a
                href={author.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border-[2px] border-black rounded-lg shadow-[-2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors"
                aria-label="Linkedin"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
                </svg>
              </a>
            )}
            {author.socialLinks.github && (
              <a
                href={author.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border-[2px] border-black rounded-lg shadow-[-2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors"
                aria-label="Github"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                </svg>
              </a>
            )}
            {author.socialLinks.twitter && (
              <a
                href={author.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border-[2px] border-black rounded-lg shadow-[-2px_2px_0_0_rgba(0,0,0,1)] hover:bg-[#ccff00] transition-colors"
                aria-label="Twitter / X"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
