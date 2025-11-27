
import React, { useState } from 'react';
import { generateSpeech } from '../services/geminiService';
import { Loader2, AlertTriangle, Star, Search } from 'lucide-react';
import { playClick } from '../services/audioService';

interface InteractiveSentenceProps {
  text: string;
  isCollected: boolean;
  onToggleCollect: (text: string) => void;
  children: React.ReactNode;
  ttsSpeed: number;
  onExplain?: (text: string) => void;
  onCollectAnim?: (startX: number, startY: number) => void;
}

export const InteractiveSentence: React.FC<InteractiveSentenceProps> = ({ text, isCollected, onToggleCollect, children, ttsSpeed, onExplain, onCollectAnim }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'loading') return;
    
    setStatus('loading');
    try {
      await generateSpeech(text, ttsSpeed);
      setStatus('idle');
    } catch (err) {
      console.error("TTS Error:", err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const handleCollect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playClick();
    onToggleCollect(text);
    
    // Trigger animation if we are collecting (not removing)
    if (!isCollected && onCollectAnim) {
        const rect = e.currentTarget.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        onCollectAnim(startX, startY);
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'loading':
        return <Loader2 size={12} className="inline animate-spin ml-1 text-blue-400 align-middle" />;
      case 'error':
        return <AlertTriangle size={12} className="inline text-red-500 ml-1 align-middle" />;
      default:
        return null;
    }
  }

  return (
    <span className="group inline-block mx-1 relative">
      <span
        onClick={handlePlayAudio}
        role="button"
        tabIndex={0}
        className={`
          cursor-pointer 
          border-b-[3px] border-dotted border-blue-300 
          hover:border-solid hover:border-blue-500 hover:bg-blue-50
          rounded-md px-1
          transition-all duration-200
          font-bold text-blue-800 font-hand text-[1.05em]
          ${status === 'loading' ? 'opacity-70 cursor-wait' : ''}
        `}
        title="点击发音"
      >
        {children}
      </span>
      
      {/* Action Icons Container (Appears next to text) */}
      <span className="inline-flex align-middle ml-0.5 gap-0.5">
          {getStatusIcon()}
          
          {/* Explain Button */}
          {onExplain && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                playClick();
                onExplain(text);
              }}
              className="p-0.5 rounded-full hover:bg-blue-100 text-blue-300 hover:text-blue-500 transition-all opacity-60 group-hover:opacity-100"
              title="详解"
            >
               <Search size={14} strokeWidth={3} />
            </button>
          )}

          {/* Collect Star Button */}
          <button
            onClick={handleCollect}
            className={`p-0.5 rounded-full hover:bg-yellow-100 transition-all active:scale-90 opacity-60 group-hover:opacity-100 ${isCollected ? 'text-yellow-400 opacity-100' : 'text-blue-200 hover:text-yellow-400'}`}
            title={isCollected ? "取消收藏" : "收藏句子"}
          >
             <Star size={14} fill={isCollected ? "currentColor" : "none"} strokeWidth={3} />
          </button>
      </span>
    </span>
  );
};
