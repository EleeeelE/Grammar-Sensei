
import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  suggestions: string[];
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, suggestions, disabled }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
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

  const handleMicClick = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("您的浏览器不支持语音输入功能。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN'; // Default to Chinese for questions
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setText((prev) => prev + finalTranscript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="w-full bg-blue-500 border-t-[3px] border-white px-4 pb-6 pt-4 z-20 flex-shrink-0 transition-all duration-300 ease-in-out">
      {/* Suggestions Area */}
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2 w-full mb-4 animate-[fadeInUp_0.3s_ease-out]">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => !disabled && onSend(sug)}
              disabled={disabled}
              className={`w-full bg-white border-[3px] border-blue-950 hover:bg-blue-50 text-blue-950 px-4 py-3 text-sm font-bold shadow-sketchy-sm transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-left flex items-center font-hand rounded-lg transform ${idx % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
               <span className="mr-2 text-lg">👉</span> {sug}
            </button>
          ))}
        </div>
      )}

      <div className={`flex items-end gap-2 bg-white p-2 border-[3px] border-blue-950 shadow-sketchy transition-all focus-within:shadow-sketchy-lg rounded-xl ${isListening ? 'ring-4 ring-blue-200' : ''}`}>
        
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "正在听..." : (disabled ? "..." : "输入您的问题...")}
          disabled={disabled}
          className="flex-1 max-h-[120px] py-3 px-2 bg-transparent border-none focus:ring-0 resize-none text-[16px] placeholder-blue-300 font-bold text-blue-950 font-hand leading-tight"
          rows={1}
        />

        {text.trim() ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="p-2 bg-blue-500 text-white border-2 border-blue-950 hover:bg-blue-600 transition-all shadow-sketchy-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none mb-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex-shrink-0"
          >
            <Send size={20} strokeWidth={3} />
          </button>
        ) : (
             <button 
                onClick={handleMicClick}
                disabled={disabled}
                className={`p-2 transition-all rounded-lg mb-1 flex-shrink-0 border-2 
                  ${isListening 
                    ? 'bg-red-500 text-white border-blue-950 animate-pulse shadow-sketchy-sm' 
                    : 'text-blue-950 border-transparent hover:bg-blue-100'}`}
             >
                {isListening ? <Loader2 size={24} strokeWidth={3} className="animate-spin" /> : <Mic size={24} strokeWidth={3} />}
            </button>
        )}
      </div>
    </div>
  );
};
