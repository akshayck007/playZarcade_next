'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
