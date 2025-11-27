
import React from 'react';
import Markdown from 'react-markdown';
import { TtsHighlight } from './TtsHighlight';

interface MarkdownRendererProps {
  markdownText: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownText }) => {
  return (
    <div className="markdown-body font-hand">
      <Markdown
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            // Aggressively trim content to detect single words/phrases
            const rawContent = String(children);
            const text = rawContent.replace(/\n$/, '').trim();
            
            // If markdown says it's inline OR if it doesn't contain newlines (it's a short phrase)
            // we treat it as TTS highlightable text.
            const isEffectivelyInline = inline || !rawContent.includes('\n');

            if (isEffectivelyInline) {
              return (
                <TtsHighlight text={text}>
                  {text}
                </TtsHighlight>
              );
            }
            
            // Only use block style for actual multi-line code blocks
            return (
              <pre className="bg-blue-50 p-2 rounded-md border border-blue-200 text-sm my-2 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {markdownText}
      </Markdown>
    </div>
  );
};
