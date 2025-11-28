import React from 'react';
import { X, ClipboardList } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { playClick } from '../services/audioService';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string | null;
  ttsSpeed: number;
  collectedSentences?: string[];
  onToggleCollect?: (text: string) => void;
  onExplain?: (text: string) => void;
  onCollectAnim?: (startX: number, startY: number) => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ 
  isOpen, 
  onClose, 
  content,
  ttsSpeed,
  collectedSentences,
  onToggleCollect,
  onExplain,
  onCollectAnim
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-hand">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white w-full max-w-lg rounded-3xl border-[3px] border-blue-950 shadow-sketchy-lg relative overflow-hidden animate-pop-in z-50 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-blue-500 p-4 border-b-[3px] border-blue-950 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-white">
            <ClipboardList size={20} strokeWidth={3} />
            <h2 className="text-xl font-black tracking-wide">本课小结</h2>
          </div>
          <button 
            onClick={handleClose}
            className="bg-blue-400 p-1 rounded-lg border-2 border-blue-950 text-white hover:bg-red-400 transition-colors shadow-sketchy-sm active:translate-y-0.5 active:shadow-none"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        
        {/* Summary Body */}
        <div className="summary-body-styles p-6 overflow-y-auto hide-scrollbar">
            <style>
            {`
            /* Main Title H2 */
            .summary-body-styles .markdown-body h2 {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.25rem;
                font-weight: 900;
                color: #172554; /* blue-950 */
                background-color: #EFF6FF; /* blue-50 */
                border: 2px solid #BFDBFE; /* blue-200 */
                padding: 0.5rem 1rem;
                border-radius: 10px;
                margin-top: 0;
                margin-bottom: 1.5rem;
            }

            /* Subtitles H3 - Highlighter Effect */
            .summary-body-styles .markdown-body h3 {
                display: inline-block;
                width: fit-content;
                font-size: 1.1rem;
                font-weight: 800;
                color: #1e3a8a; /* blue-900 */
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                padding: 0 4px;
                background: linear-gradient(transparent 60%, #BAE6FD 60%); 
            }

            /* Content Styles */
            .summary-body-styles .markdown-body strong {
                 color: #0369A1; /* sky-700 */
                 font-weight: 900;
            }
            .summary-body-styles .markdown-body blockquote {
                 border-left: 4px solid #60A5FA; /* blue-400 */
                 background-color: #F0F9FF; /* sky-50 */
                 color: #1E3A8A;
                 font-style: italic;
                 padding: 0.75rem 1rem;
                 margin: 0.5rem 0;
                 border-radius: 0 8px 8px 0;
            }
            .summary-body-styles .markdown-body ul {
                list-style-type: none;
                padding-left: 0.5rem;
            }
            .summary-body-styles .markdown-body li {
                position: relative;
                padding-left: 1.25rem;
                margin-bottom: 0.5rem;
                line-height: 1.6;
            }
            .summary-body-styles .markdown-body li::before {
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
          {content ? (
             <MarkdownRenderer 
                markdownText={content}
                ttsSpeed={ttsSpeed}
                collectedSentences={collectedSentences}
                onToggleCollect={onToggleCollect}
                onExplain={onExplain}
                onCollectAnim={onCollectAnim}
             />
          ) : (
            <div className="text-center text-blue-400 py-10 font-bold">
                没有小结内容
            </div>
          )}
        </div>
      </div>
    </div>
  );
};