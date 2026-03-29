"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type GuidebookContentProps = {
  content: string;
};

export const GuidebookContent = ({ content }: GuidebookContentProps) => {
  return (
    <article className="guidebook-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="mb-4 mt-10 text-2xl font-extrabold text-neutral-800 lg:text-3xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-8 border-b-2 border-neutral-200 pb-2 text-xl font-extrabold text-neutral-800 lg:text-2xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 text-lg font-bold text-neutral-700 lg:text-xl">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-2 mt-4 text-base font-bold text-neutral-700">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 text-[15px] leading-relaxed text-neutral-600 lg:text-base">
              {children}
            </p>
          ),

          // Bold & emphasis
          strong: ({ children }) => (
            <strong className="font-bold text-neutral-800">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-neutral-500">{children}</em>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-1.5 text-[15px] text-neutral-600 lg:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-1.5 text-[15px] text-neutral-600 lg:text-base">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),

          // Tables — the most important part
          table: ({ children }) => (
            <div className="-mx-4 mb-6 overflow-x-auto px-4 lg:mx-0 lg:px-0">
              <table className="w-full min-w-[400px] border-collapse rounded-lg border border-neutral-200 text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#1a237e] text-white">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-neutral-100">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-neutral-50">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide lg:px-4">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2.5 text-[13px] text-neutral-700 lg:px-4 lg:text-sm">
              {children}
            </td>
          ),

          // Blockquotes — used for callouts / "watch out" sections
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-4 border-[#1a237e] bg-blue-50/50 py-3 pl-4 pr-3 text-[15px] italic text-neutral-600">
              {children}
            </blockquote>
          ),

          // Code
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px] text-[#1a237e]">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>{children}</code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-100">
              {children}
            </pre>
          ),

          // Horizontal rules
          hr: () => (
            <hr className="my-8 border-t-2 border-neutral-200" />
          ),

          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#1a237e] underline decoration-[#1a237e]/30 underline-offset-2 transition-colors hover:text-[#0d1657] hover:decoration-[#1a237e]/60"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};
