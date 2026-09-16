"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";

// مپینگ استاندارد کامپوننت های مارکداون به استایل های تایپوگرافی فارسی و نئوبروتالیسم
const customComponents = {
  h1: ({ node, ...props }) => (
    <h2
      className="text-lg sm:text-xl font-black text-black mt-6 mb-3 pb-2 border-b-[2px] border-black/10"
      {...props}
    />
  ),
  h2: ({ node, ...props }) => (
    <h3
      className="text-base sm:text-lg font-black text-black mt-6 mb-3 flex items-center gap-2 before:content-[''] before:inline-block before:w-1.5 before:h-4.5 before:bg-[#12e2a3] before:rounded-xs"
      {...props}
    />
  ),
  h3: ({ node, ...props }) => (
    <h4
      className="text-sm sm:text-base font-black text-black mt-5 mb-2.5"
      {...props}
    />
  ),
  h4: ({ node, ...props }) => (
    <h5
      className="text-xs sm:text-sm font-black text-black mt-4 mb-2"
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
    <p
      className="mb-4 leading-8 text-gray-800 font-medium last:mb-0"
      {...props}
    />
  ),
  ul: ({ node, ...props }) => (
    <ul
      className="list-disc list-outside pr-6 mb-4 space-y-2 marker:text-black marker:text-xs"
      {...props}
    />
  ),
  ol: ({ node, ...props }) => (
    <ol
      className="list-decimal list-outside pr-6 mb-4 space-y-2 marker:font-black marker:text-black marker:text-xs"
      {...props}
    />
  ),
  li: ({ node, ...props }) => (
    <li className="leading-8 text-gray-800 font-medium pl-1" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-black text-black" {...props} />
  ),
  b: ({ node, ...props }) => (
    <b className="font-black text-black" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-r-4 border-[#12e2a3] bg-[#f8f9fa] border-y-0 border-l-0 pr-4 pl-3 py-3 my-4 rounded-l-xl text-gray-700 font-medium shadow-xs"
      {...props}
    />
  ),
  a: ({ node, ...props }) => (
    <a
      className="text-blue-600 hover:text-blue-800 underline underline-offset-4 font-bold transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  hr: ({ node, ...props }) => (
    <hr className="my-6 border-t-[2px] border-black/10" {...props} />
  ),
  table: ({ node, ...props }) => (
    <div className="w-full my-5 overflow-x-auto rounded-xl border-[2.5px] border-black shadow-[-3px_3px_0_0_rgba(0,0,0,1)]">
      <table className="w-full border-collapse text-xs sm:text-sm bg-white" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead className="bg-[#12e2a3] border-b-[2px] border-black font-black text-black" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th className="p-3 text-right font-black border-l border-black/20 last:border-l-0" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="p-3 text-right font-medium border-t border-gray-200 border-l border-gray-200 last:border-l-0" {...props} />
  ),
  tr: ({ node, ...props }) => (
    <tr className="even:bg-gray-50/80 hover:bg-emerald-50/30 transition-colors" {...props} />
  ),
  code: ({ node, className, children, ...props }) => {
    return (
      <code
        className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 text-[11px] sm:text-xs font-mono text-purple-700 dir-ltr inline-block"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ node, ...props }) => (
    <pre
      className="bg-[#1e1e1e] text-emerald-400 p-4 rounded-xl my-4 overflow-x-auto text-xs font-mono dir-ltr border-[2.5px] border-black shadow-[-3px_3px_0_0_rgba(0,0,0,1)]"
      {...props}
    />
  ),
};

export default function ProductMarkdownDescription({ content }) {
  if (!content || typeof content !== "string" || !content.trim()) {
    return (
      <p className="text-gray-500 font-bold text-xs sm:text-sm py-4">
        توضیحاتی برای این محصول ثبت نشده است.
      </p>
    );
  }

  return (
    <div className="product-markdown-container dir-rtl font-[family-name:var(--font-farsi)] text-xs sm:text-sm text-gray-800 leading-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeSanitize]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
