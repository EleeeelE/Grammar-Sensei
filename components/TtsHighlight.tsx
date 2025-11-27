
import React, { useState } from 'react';
import { generateSpeech } from '../services/geminiService';
import { Volume2, Loader2, AlertTriangle } from 'lucide-react';

interface TtsHighlightProps {
  text: string;
  children: React.ReactNode;
}

export const TtsHighlight: React.FC<TtsHighlightProps> = ({ text, children }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'loading') return;
    
    setStatus('loading');
    try {
      await generateSpeech(text);
      setStatus('idle');
    } catch (err) {
      console.error("TTS Error:", err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const getIcon = () => {
    switch(status) {
      case 'loading':
        return <Loader2 size={10} className="inline animate-spin ml-0.5 text-blue-400 align-middle" />;
      case 'error':
        return <AlertTriangle size={10} className="inline text-red-500 ml-0.5 align-middle" />;
      default:
        // Initial state: hidden, shown on group hover
        return (
            <span className="hidden group-hover:inline-flex ml-0.5 align-middle text-blue-400">
                <Volume2 size={12} />
            </span>
        ); 
    }
  }

  return (
    <span
      onClick={handlePlayAudio}
      role="button"
      tabIndex={0}
      className={`
        group cursor-pointer 
        border-b-2 border-dotted border-blue-400 
        hover:border-solid hover:border-blue-600 hover:bg-transparent
        transition-all duration-200
        font-bold text-blue-700 font-hand
        ${status === 'loading' ? 'opacity-70 cursor-wait' : ''}
      `}
      style={{ lineHeight: '1.5', display: 'inline' }} // Enforce inline display
      title="点击发音"
    >
      {children}
      {getIcon()}
    </span>
  );
};
