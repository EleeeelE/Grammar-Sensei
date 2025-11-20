
import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Message, Lesson, Note } from './types';
import { PREDEFINED_LESSONS, DEFAULT_SUGGESTIONS, LESSON_CATEGORIES, CATEGORY_META } from './constants';
import { startChat, sendMessageStream, parseContentWithOptions } from './services/geminiService';
import { LessonCard } from './components/LessonCard';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { LandingPage } from './components/LandingPage';
import { X, BookOpen, ChevronRight, ArrowLeft, Book, NotebookPen, Notebook, Trash2, CheckCircle2 } from 'lucide-react';
import Markdown from 'react-markdown';

const App: React.FC = () => {
  // Initialize view to LANDING
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false); // Visual indicator for "Teacher is typing..."
  const [showToast, setShowToast] = useState(false); // Toast notification state
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Queue to hold messages that are waiting to be displayed
  const messageQueueRef = useRef<Message[]>([]);
  const processingQueueRef = useRef(false);
  // Store suggestions temporarily until all messages are played
  const pendingSuggestionsRef = useRef<string[]>([]);

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Scroll when messages, typing status, OR suggestions change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, suggestions]);

  const handleStartApp = () => {
    setView(ViewState.HOME);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setView(ViewState.CATEGORY_DETAILS);
  };

  const handleLessonSelect = async (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setView(ViewState.CHAT);
    setMessages([]);
    setInputDisabled(true);
    setSuggestions([]);
    setIsTyping(true);

    startChat(lesson.initialPrompt);
    
    // Send hidden prompt to kick off the conversation
    await processAIResponse(lesson.initialPrompt);
  };

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true); // Show typing immediately after user sends
    setSuggestions([]); // Clear suggestions immediately
    await processAIResponse(text);
  };

  // Core logic for sequential message playback
  const playNextMessageInQueue = async () => {
    if (messageQueueRef.current.length === 0) {
      // Queue finished
      processingQueueRef.current = false;
      setIsTyping(false);
      
      // REVEAL SUGGESTIONS NOW: Only after all messages are shown
      if (pendingSuggestionsRef.current.length > 0) {
        setSuggestions(pendingSuggestionsRef.current);
        pendingSuggestionsRef.current = [];
      }
      
      setInputDisabled(false);
      return;
    }

    processingQueueRef.current = true;
    const nextMsg = messageQueueRef.current.shift();

    if (nextMsg) {
        // 1. Show "Typing..." for a bit (simulating thinking/typing)
        setIsTyping(true);
        
        // Calculate a "thinking" delay based on randomness to feel natural
        // Short delay for consecutive bubbles, longer for the first one
        const typingDelay = 600 + Math.random() * 500; 
        await new Promise(resolve => setTimeout(resolve, typingDelay));

        // 2. Show the message
        setIsTyping(false);
        setMessages(prev => [...prev, nextMsg]);
        
        // 3. Wait for "Reading Time" before showing the next one
        // Rule of thumb: 50ms per character, minimum 1s, max 3s
        // This prevents the next bubble from appearing before user reads the current one
        if (messageQueueRef.current.length > 0) {
            const readingDelay = Math.min(Math.max(nextMsg.text.length * 60, 1000), 2500);
            await new Promise(resolve => setTimeout(resolve, readingDelay));
            playNextMessageInQueue();
        } else {
            // If it was the last message, call recursively to hit the empty block and trigger cleanup
            playNextMessageInQueue();
        }
    }
  };

  const processAIResponse = async (prompt: string) => {
    setInputDisabled(true);
    // Do NOT clear suggestions here; they were cleared in handleSendMessage.
    // We want the UI to be clean while thinking.
    pendingSuggestionsRef.current = [];

    const baseMsgId = Date.now().toString();
    let rawFullText = "";

    try {
      const stream = sendMessageStream(prompt);

      // 1. Accumulate the FULL response first. 
      // We deliberately avoid streaming directly to UI to control the pacing.
      for await (const chunk of stream) {
        rawFullText += chunk.text || '';
      }

      // 2. Process the full text
      const parts = rawFullText.split('===');
      const finalBubbles: Message[] = [];
      let extractedSuggestions: string[] = [];

      parts.forEach((part, index) => {
          const { cleanText, options } = parseContentWithOptions(part);
          if (options.length > 0) extractedSuggestions = options;
          
          if (cleanText.trim()) {
            finalBubbles.push({
                id: `${baseMsgId}-${index}`,
                role: 'model',
                text: cleanText,
                timestamp: Date.now() + index,
            });
          }
      });

      // 3. Store suggestions to be shown LATER (after queue finishes)
      if (extractedSuggestions.length > 0) {
          pendingSuggestionsRef.current = extractedSuggestions;
      } else {
          pendingSuggestionsRef.current = DEFAULT_SUGGESTIONS.map(s => s.value);
      }

      // 4. Add to queue and start playback
      messageQueueRef.current.push(...finalBubbles);
      
      if (!processingQueueRef.current) {
          playNextMessageInQueue();
      }

    } catch (error) {
      console.error("Error generating response:", error);
      setIsTyping(false);
      setMessages((prev) => [
          ...prev, 
          { id: `${baseMsgId}-error`, role: 'model', text: "哎呀，网线好像被猫咬断了... 😵‍💫 再试一次？", timestamp: Date.now() }
      ]);
      setInputDisabled(false);
      // Restore default suggestions if error
      setSuggestions(DEFAULT_SUGGESTIONS.map(s => s.value));
    }
  };

  const handleExitChat = () => {
    setView(ViewState.CATEGORY_DETAILS);
    setCurrentLesson(null);
    setIsTyping(false);
    processingQueueRef.current = false;
    messageQueueRef.current = [];
    pendingSuggestionsRef.current = [];
  };

  const handleBackToHome = () => {
    setSelectedCategory(null);
    setView(ViewState.HOME);
  };

  // Save the last AI message to notes
  const handleSaveNote = () => {
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model');
    
    if (lastModelMessage && currentLesson) {
        const newNote: Note = {
            id: Date.now().toString(),
            lessonTitle: currentLesson.title,
            content: lastModelMessage.text,
            timestamp: Date.now()
        };
        setNotes(prev => [newNote, ...prev]);
        
        // Show Toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleDeleteNote = (noteId: string) => {
      setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  // --- RENDER: LANDING VIEW ---
  if (view === ViewState.LANDING) {
    return <LandingPage onStart={handleStartApp} />;
  }

  // --- RENDER: HOME VIEW (CATEGORY LIST) ---
  if (view === ViewState.HOME) {
    return (
      <div className="max-w-md mx-auto h-full flex flex-col bg-gray-50 relative animate-[fadeIn_0.6s_ease-in-out]">
        {/* Header */}
        <div className="pt-6 pb-4 px-4 bg-gray-50 sticky top-0 z-20">
            <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => setView(ViewState.LANDING)}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
                <div className="bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    课程大纲
                </div>
                <button 
                  onClick={() => setView(ViewState.NOTES)}
                  className="p-2 -mr-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors relative"
                >
                    <Notebook size={24} />
                    {notes.length > 0 && (
                        <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-50"></span>
                    )}
                </button>
            </div>
            <div className="mb-1">
                 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">选择阶段</h2>
                 <p className="text-sm text-gray-500 mt-1">循序渐进，从入门到精通</p>
            </div>
        </div>

        {/* Category Grid/List */}
        <div className="flex-1 overflow-y-auto px-4 pb-10 pt-2 space-y-4">
            {LESSON_CATEGORIES.map((category, idx) => {
                const meta = CATEGORY_META[category] || { description: '', color: 'text-gray-600', iconBg: 'bg-gray-100', level: '?' };
                const count = PREDEFINED_LESSONS.filter(l => l.category === category).length;

                return (
                    <div 
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="group relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-md hover:border-green-200 active:scale-[0.99]"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide mb-3 ${meta.iconBg} ${meta.color}`}>
                                  {meta.level}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                                    {category}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed mb-3">
                                    {meta.description}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-full text-gray-300 group-hover:text-green-500 group-hover:bg-green-50 transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </div>
                        <div className="flex items-center text-[11px] text-gray-400 font-medium">
                            <Book size={12} className="mr-1.5" />
                            {count} 节课程
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    );
  }

  // --- RENDER: CATEGORY DETAILS VIEW ---
  if (view === ViewState.CATEGORY_DETAILS) {
      const categoryLessons = PREDEFINED_LESSONS.filter(l => l.category === selectedCategory);
      const meta = selectedCategory ? CATEGORY_META[selectedCategory] : null;

      return (
        <div className="max-w-md mx-auto h-full flex flex-col bg-white relative animate-[fadeInLeft_0.3s_ease-out]">
             <style>{`
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
             `}</style>
             
             {/* Header */}
            <div className="pt-6 pb-2 px-4 bg-white sticky top-0 z-20 border-b border-gray-50">
                <div className="flex items-center mb-4">
                    <button 
                        onClick={handleBackToHome}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors mr-2"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900">{selectedCategory}</h2>
                </div>
                {meta && (
                    <div className={`mx-1 mb-4 p-4 rounded-xl ${meta.iconBg} bg-opacity-50 flex items-start gap-3`}>
                        <div className={`p-1.5 rounded-full bg-white/60 ${meta.color}`}>
                            <BookOpen size={16} />
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase mb-0.5 ${meta.color}`}>{meta.level}</p>
                            <p className="text-sm text-gray-700 leading-snug">{meta.description}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Lesson List */}
            <div className="flex-1 overflow-y-auto px-4 pb-10 pt-2">
                {categoryLessons.length > 0 ? (
                    <div className="space-y-2">
                         {categoryLessons.map((lesson, idx) => (
                            <div key={lesson.id} className="rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                              <LessonCard 
                                  lesson={lesson} 
                                  index={idx} 
                                  onClick={handleLessonSelect} 
                              />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
                        <Book size={48} className="mb-4 text-gray-200" />
                        <p>该分类下暂无课程</p>
                        <p className="text-xs mt-1">敬请期待...</p>
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- RENDER: NOTES VIEW ---
  if (view === ViewState.NOTES) {
    return (
        <div className="max-w-md mx-auto h-full flex flex-col bg-gray-50 relative animate-[fadeInLeft_0.3s_ease-out]">
            {/* Header */}
            <div className="pt-6 pb-4 px-4 bg-white sticky top-0 z-20 border-b border-gray-100 shadow-sm">
                <div className="flex items-center">
                    <button 
                        onClick={handleBackToHome}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors mr-2"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">我的笔记</h2>
                </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {notes.length > 0 ? (
                    notes.map((note) => (
                        <div key={note.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="inline-block bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md mb-1">
                                    {note.lessonTitle}
                                </div>
                                <button 
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1 -mr-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="text-sm text-gray-800 leading-relaxed markdown-body">
                                 <Markdown>{note.content}</Markdown>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-3 text-right">
                                {new Date(note.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <NotebookPen size={48} className="mb-4 text-gray-200" />
                        <p className="text-sm">还没有笔记哦</p>
                        <p className="text-xs mt-1 text-center px-10">在课程中点击右上角的笔记图标，即可保存老师的讲解。</p>
                    </div>
                )}
            </div>
        </div>
    );
  }

  // --- RENDER: CHAT VIEW ---
  return (
    <div className="max-w-md mx-auto h-full flex flex-col bg-gray-50 relative animate-[fadeIn_0.3s_ease-out]">
      
      {/* Toast Notification */}
      <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-10px] pointer-events-none'}`}>
        <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-400" />
            笔记已保存
        </div>
      </div>

      {/* Chat Header */}
      <div className="bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <button onClick={handleExitChat} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors">
            <X size={24} />
        </button>
        <div className="text-center">
            <h2 className="font-bold text-gray-800 text-[16px]">{currentLesson?.title}</h2>
            <p className="text-[11px] text-gray-400">{currentLesson?.subtitle}</p>
        </div>
        <button 
            onClick={handleSaveNote}
            className="p-2 -mr-2 hover:bg-green-50 hover:text-green-600 rounded-full text-gray-700 transition-all active:scale-90"
            title="保存当前讲解到笔记"
        >
            <NotebookPen size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-64 bg-white scroll-smooth">
         {messages.map((msg, idx) => {
             const isFirst = idx === 0;
             const prevMsg = isFirst ? null : messages[idx - 1];
             const effectiveShowAvatar = msg.role === 'model' && (isFirst || prevMsg?.role !== 'model');

             return (
                <ChatBubble 
                    key={msg.id} 
                    message={msg} 
                    showAvatar={effectiveShowAvatar}
                />
             );
         })}
         
         {/* Typing Indicator */}
         {isTyping && (
            <div className="flex w-full justify-start mb-2 animate-[fadeInUp_0.3s_ease-out]">
                <div className="flex-shrink-0 mr-3 w-8 flex flex-col justify-start">
                   {(messages.length === 0 || messages[messages.length-1].role === 'user') && (
                       <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white shadow-sm mt-1">
                          <span className="text-xs">...</span>
                       </div>
                   )}
                   {(messages.length > 0 && messages[messages.length-1].role === 'model') && (
                       <div className="w-8" />
                   )}
                </div>
                <div className="bg-[#F2F4F5] rounded-2xl rounded-tl-sm px-4 py-4 flex items-center h-[46px]">
                    <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
         )}

         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput 
        onSend={handleSendMessage} 
        suggestions={suggestions}
        disabled={inputDisabled}
      />
    </div>
  );
};

export default App;
