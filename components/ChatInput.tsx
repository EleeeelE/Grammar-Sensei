import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Plus } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  suggestions: string[];
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, suggestions, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-50/90 backdrop-blur-md border-t border-gray-100 px-4 pb-6 pt-2 z-20">
      {/* Suggestions Area - Vertical Stack for Full Width */}
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2 w-full mb-3 animate-fade-in-up">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => !disabled && onSend(sug)}
              disabled={disabled}
              className={`w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium shadow-sm transition-all active:scale-[0.99] text-left flex items-center
                ${idx === 0 ? 'border-l-4 border-l-blue-400' : ''}
                ${idx === 1 ? 'border-l-4 border-l-yellow-400' : ''}
                ${idx === 2 ? 'border-l-4 border-l-red-400' : ''}
              `}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 bg-white p-2 rounded-3xl shadow-sm border border-gray-200">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
            <Plus size={24} />
        </button>
        
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "..." : "输入消息..."}
          disabled={disabled}
          className="flex-1 max-h-[120px] py-3 bg-transparent border-none focus:ring-0 resize-none text-[16px] placeholder-gray-400"
          rows={1}
        />

        {text.trim() ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        ) : (
             <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 mb-1">
                <Mic size={24} />
            </button>
        )}
      </div>
    </div>
  );
};