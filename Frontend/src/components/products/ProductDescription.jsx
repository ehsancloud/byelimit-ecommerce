import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ProductDescription({ content }) {
  if (!content) return null;

  return (
    <div className="w-full text-right text-gray-800 leading-relaxed dir-rtl" dir="rtl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3 block" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2 block" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-8 text-gray-700 block" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pr-6 space-y-2 mb-4 block" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-7" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-950" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default ProductDescription;
