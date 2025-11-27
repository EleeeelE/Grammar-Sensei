
import React from 'react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CheckSquare } from 'lucide-react';

interface SummaryCardProps {
  message: Message;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ message }) => {
  return (
    <div className="my-6 animate-pop-in">
        <style>
            {`
            .summary-card-bg {
                background-color: #FEFCE8; /* yellow-50 */
                background-image:
                    linear-gradient(to right, #FEE2E2 1px, transparent 1px), /* red-100 lines */
                    linear-gradient(to bottom, #E0E7FF 1px, transparent 1px); /* indigo-100 lines */
                background-size: 2px 24px;
                border-left: 3px solid #F87171; /* red-400 */
            }
            .summary-card-bg .markdown-body h2 {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.25rem;
                color: #1E3A8A; /* blue-800 */
            }
            .summary-card-bg .markdown-body strong {
                 color: #1E40AF; /* blue-700 */
            }
            .summary-card-bg .markdown-body blockquote {
                 border-left-color: #93C5FD; /* blue-300 */
                 background-color: #EFF6FF; /* blue-50 */
                 color: #1E40AF; /* blue-700 */
            }
            `}
        </style>
      <div className="bg-yellow-50 border-[3px] border-blue-950 shadow-sketchy rounded-xl overflow-hidden">
        <div className="p-4 sm:p-5 summary-card-bg">
            <MarkdownRenderer markdownText={message.text} />
        </div>
      </div>
    </div>
  );
};
