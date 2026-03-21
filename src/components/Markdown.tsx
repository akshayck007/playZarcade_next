'use client';

import ReactMarkdown from 'react-markdown';

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-black">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
