import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizeMarkdown } from '../../lib/markdown';

export function ProductDescription({ content }) {
  if (!content) return null;

  const normalizedContent = normalizeMarkdown(content);
  if (!normalizedContent) return null;

  return (
    <div className="w-full text-right text-gray-800 leading-relaxed dir-rtl" dir="rtl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-black text-gray-950 mt-6 mb-4 block" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3 block" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold text-gray-900 mt-5 mb-2 block" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-semibold text-gray-900 mt-4 mb-2 block" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-8 text-gray-700 block" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pr-6 space-y-2 mb-4 block" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pr-6 space-y-2 mb-4 block" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-7 text-gray-800" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-950" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-r-4 border-[#12e2a3] pr-4 my-4 py-2 text-gray-700 bg-gray-50/70 rounded-l block" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-gray-200" {...props} />
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}

export default ProductDescription;
