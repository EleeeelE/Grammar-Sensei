
import React from 'react';
import Markdown from 'react-markdown';
import { InteractiveSentence } from './InteractiveSentence';

interface MarkdownRendererProps {
  markdownText: string;
  collectedSentences?: string[];
  onToggleCollect?: (text: string) => void;
  ttsSpeed: number;
  onExplain?: (text: string) => void;
  onCollectAnim?: (startX: number, startY: number) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownText, collectedSentences = [], onToggleCollect, ttsSpeed, onExplain, onCollectAnim }) => {
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

            if (isEffectivelyInline && onToggleCollect) {
              const isCollected = collectedSentences.includes(text);
              return (
                <InteractiveSentence 
                    text={text} 
                    isCollected={isCollected}
                    onToggleCollect={onToggleCollect}
                    ttsSpeed={ttsSpeed}
                    onExplain={onExplain}
                    onCollectAnim={onCollectAnim}
                >
                  {text}
                </InteractiveSentence>
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
