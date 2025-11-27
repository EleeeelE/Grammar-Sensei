
import React from 'react';
import { Message, FontSize } from '../types';
import { Sparkles, User } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatBubbleProps {
  message: Message;
  showAvatar: boolean;
  fontSize: FontSize;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, showAvatar, fontSize }) => {
  const isUser = message.role === 'user';

  // Handle the initial "Thinking" state with a three-dots animation
  if (message.isStreaming && !message.text) {
    return (
      <div className={`flex w-full justify-start mb-3 animate-pop-in`}>
        <style>
          {`
            @keyframes thinking-dot-bounce {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1.0); }
            }
          `}
        </style>
        <div className="flex-shrink-0 mr-2 flex flex-col justify-start z-10 w-10">
          {showAvatar ? (
            <div className="w-10 h-10 bg-white border-[3px] border-blue-500 flex items-center justify-center text-blue-500 shadow-sketchy-sm" style={{ borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%' }}>
              <Sparkles size={20} strokeWidth={3} />
            </div>
          ) : (
            <div className="w-10" />
          )}
        </div>
        <div
          className={`relative max-w-[85%] px-4 py-3 leading-relaxed border-[3px] border-blue-500 shadow-sketchy bg-white text-blue-950 rounded-2xl rounded-tl-none`}
          style={{ borderRadius: '2px 15px 15px 15px' }}
        >
          <div className="flex items-center justify-center gap-1.5 h-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full" style={{ animation: 'thinking-dot-bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }}></span>
            <span className="w-2 h-2 bg-blue-400 rounded-full" style={{ animation: 'thinking-dot-bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }}></span>
            <span className="w-2 h-2 bg-blue-400 rounded-full" style={{ animation: 'thinking-dot-bounce 1.4s infinite ease-in-out both' }}></span>
          </div>
        </div>
      </div>
    );
  }

  // Font size mapping - Scaled down
  const fontSizeClasses = {
    'small': 'text-xs',      // 12px
    'normal': 'text-sm',     // 14px
    'large': 'text-base',    // 16px
    'xl': 'text-lg'          // 18px
  };

  const currentFontClass = fontSizeClasses[fontSize] || 'text-sm';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end mb-5' : 'justify-start mb-3'} animate-[fadeInUp_0.3s_ease-out]`}>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      {/* AI Avatar Column */}
      {!isUser && (
        <div className="flex-shrink-0 mr-2 flex flex-col justify-start z-10 w-10">
          {showAvatar ? (
            <div className="w-10 h-10 bg-white border-[3px] border-blue-500 flex items-center justify-center text-blue-500 shadow-sketchy-sm" style={{ borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%' }}>
              <Sparkles size={20} strokeWidth={3} />
            </div>
          ) : (
             /* Placeholder */
             <div className="w-10" /> 
          )}
        </div>
      )}

      <div
        className={`relative max-w-[85%] px-4 py-3 leading-relaxed border-[3px] border-blue-500 shadow-sketchy ${currentFontClass}
          ${isUser 
            ? 'bg-blue-500 text-white rounded-2xl rounded-tr-none mr-1' // User: Blue Block (Softer 500)
            : 'bg-white text-blue-950 rounded-2xl rounded-tl-none' // AI: White Paper, Dark Text (950)
          }
        `}
        style={{
            // Slight organic radius variation
            borderRadius: isUser ? '15px 2px 15px 15px' : '2px 15px 15px 15px'
        }}
      >
        <div className="relative z-10 font-bold font-hand tracking-wide">
            {isUser ? (
            message.text
            ) : (
              <MarkdownRenderer markdownText={message.text} />
            )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 ml-2 flex flex-col justify-start z-10">
           <div className="w-9 h-9 bg-white border-[3px] border-blue-500 flex items-center justify-center text-blue-500 shadow-sketchy-sm" style={{ borderRadius: '50% 50% 40% 60% / 50% 50% 60% 40%' }}>
            <User size={20} strokeWidth={3} />
          </div>
        </div>
      )}
    </div>
  );
};
