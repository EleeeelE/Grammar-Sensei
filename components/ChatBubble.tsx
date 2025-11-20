import React from 'react';
import { Message } from '../types';
import { Sparkles, User } from 'lucide-react';
import Markdown from 'react-markdown';

interface ChatBubbleProps {
  message: Message;
  showAvatar: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, showAvatar }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end mb-6' : 'justify-start mb-2'} animate-[fadeInUp_0.3s_ease-out]`}>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      {/* AI Avatar Column - Top Aligned */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3 w-8 flex flex-col justify-start">
          {showAvatar ? (
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white shadow-sm mt-1">
              <Sparkles size={16} />
            </div>
          ) : (
            <div className="w-8" /> // Spacer
          )}
        </div>
      )}

      <div
        className={`relative max-w-[85%] px-4 py-3 text-[15px] leading-relaxed shadow-sm transition-all duration-200 ${
          isUser
            ? 'bg-green-600 text-white rounded-2xl rounded-tr-sm'
            : `bg-[#F2F4F5] text-gray-800 rounded-2xl ${showAvatar ? 'rounded-tl-sm' : 'ml-0'}`
        }`}
      >
        {isUser ? (
          message.text
        ) : (
          <div className="markdown-body [&>p]:mb-0">
             <Markdown>{message.text}</Markdown>
          </div>
        )}
      </div>

      {/* User Avatar - Top Aligned */}
      {isUser && (
        <div className="flex-shrink-0 ml-3 flex flex-col justify-start">
           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-sm mt-1">
            <User size={16} />
          </div>
        </div>
      )}
    </div>
  );
};