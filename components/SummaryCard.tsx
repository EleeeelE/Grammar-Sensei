
import React from 'react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface SummaryCardProps {
  message: Message;
  ttsSpeed: number;
  collectedSentences?: string[];
  onToggleCollect?: (text: string) => void;
  onExplain?: (text: string) => void;
  onCollectAnim?: (startX: number, startY: number) => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  message, 
  ttsSpeed, 
  collectedSentences, 
  onToggleCollect, 
  onExplain, 
  onCollectAnim 
}) => {
  return (
    <div className="my-6 animate-pop-in flex w-full justify-start">
        <style>
            {`
            /* Container Bubble Style */
            .summary-bubble {
                background-color: #F0F9FF; /* sky-50: Pale Blue Background */
                background-image: radial-gradient(#bae6fd 1px, transparent 1px);
                background-size: 16px 16px;
                border: 3px solid #3B82F6; /* blue-500 */
                border-radius: 2px 15px 15px 15px; /* Bubble shape matching AI messages */
                box-shadow: 4px 4px 0px 0px #172554; /* shadow-sketchy */
            }

            /* Main Title H2 */
            .summary-bubble .markdown-body h2 {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.25rem;
                font-weight: 900;
                color: #172554; /* blue-950 */
                background-color: #FFFFFF;
                border: 2px solid #3B82F6;
                padding: 0.5rem 1rem;
                border-radius: 10px;
                margin-top: 0;
                margin-bottom: 1.5rem;
                box-shadow: 2px 2px 0px rgba(59, 130, 246, 0.2);
            }

            /* Subtitles H3 - Highlighter Effect */
            .summary-bubble .markdown-body h3 {
                display: inline-block;
                width: fit-content;
                font-size: 1.1rem;
                font-weight: 800;
                color: #1e3a8a; /* blue-900 */
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                padding: 0 4px;
                /* Light Blue Highlighter */
                background: linear-gradient(transparent 60%, #BAE6FD 60%); 
            }

            /* Content Styles */
            .summary-bubble .markdown-body strong {
                 color: #0369A1; /* sky-700 */
                 font-weight: 900;
            }
            .summary-bubble .markdown-body blockquote {
                 border-left: 4px solid #60A5FA; /* blue-400 */
                 background-color: #FFFFFF;
                 color: #1E3A8A;
                 font-style: italic;
                 padding: 0.75rem 1rem;
                 margin: 0.5rem 0;
                 border-radius: 0 8px 8px 0;
            }
            .summary-bubble .markdown-body ul {
                list-style-type: none;
                padding-left: 0.5rem;
            }
            .summary-bubble .markdown-body li {
                position: relative;
                padding-left: 1.25rem;
                margin-bottom: 0.5rem;
                line-height: 1.6;
            }
            .summary-bubble .markdown-body li::before {
                content: '•';
                position: absolute;
                left: 0;
                color: #3B82F6;
                font-weight: bold;
                font-size: 1.2em;
                line-height: 1;
                top: 0.1em;
            }
            `}
        </style>
      
      {/* Decorative Icon Column */}
      <div className="flex-shrink-0 mr-2 flex flex-col justify-start z-10 w-10">
         <div className="w-10 h-10 bg-white border-[3px] border-blue-500 flex items-center justify-center text-blue-500 shadow-sketchy-sm" style={{ borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%' }}>
            <span className="text-lg">📝</span>
         </div>
      </div>

      <div className="summary-bubble relative max-w-[90%] px-5 py-4 leading-relaxed text-blue-950">
        <MarkdownRenderer 
            markdownText={message.text} 
            ttsSpeed={ttsSpeed} 
            collectedSentences={collectedSentences}
            onToggleCollect={onToggleCollect}
            onExplain={onExplain}
            onCollectAnim={onCollectAnim}
        />
      </div>
    </div>
  );
};