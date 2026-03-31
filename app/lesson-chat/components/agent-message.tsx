import { Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AgentMessageProps = {
  content: string;
};

export const AgentMessage = ({ content }: AgentMessageProps) => {
  if (!content) return null;

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy/10">
        <Bot className="h-4 w-4 text-brand-navy" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-neutral-700 shadow-sm border">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => (
              <strong className="font-bold text-brand-navy">{children}</strong>
            ),
            code: ({ children }) => (
              <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs font-mono">
                {children}
              </code>
            ),
            ul: ({ children }) => (
              <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>
            ),
          }}
        />
      </div>
    </div>
  );
};
