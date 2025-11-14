import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-ink mb-4 mt-6 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-ink mb-3 mt-5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-ink mb-2 mt-4">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="ml-2">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-bt3Red pl-4 italic text-gray-600 my-3">
              {children}
            </blockquote>
          ),
          code: ({ inline, children }: any) =>
            inline ? (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-bt3Red">
                {children}
              </code>
            ) : (
              <code className="block bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto my-3">
                {children}
              </code>
            ),
          table: ({ children }) => (
            <table className="min-w-full border-collapse border border-gray-300 my-3">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left text-sm font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-3 py-2 text-sm">
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="border-gray-200 my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
