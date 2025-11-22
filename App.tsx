import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Message, Lesson, FontSize } from './types';
import { PREDEFINED_LESSONS, DEFAULT_SUGGESTIONS, LESSON_CATEGORIES, CATEGORY_META } from './constants';
import { startChat, sendMessageStream, parseContentWithOptions } from './services/geminiService';
import { LessonCard } from './components/LessonCard';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { LandingPage } from './components/LandingPage';
import { X, BookOpen, ChevronRight, ArrowLeft, Book, Star, Trash2, CheckCircle2, Settings, Type, Bookmark } from 'lucide-react';

// Helper function to split text into natural chat bubbles
const splitContentIntoBubbles = (text: string): string[] => {
  // 1. Split by explicit separator '==='
  const explicitBlocks = text.split('===');
  const finalBubbles: string[] = [];

  explicitBlocks.forEach(block => {
      if (!block.trim()) return;

      // 2. Split by sentence delimiters: 。 ？ ！ ? ! \n
      // We use capture group to keep the delimiter
      const segments = block.split(/([。？！?!\n]+)/);
      let currentBubble = "";

      for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          const isDelimiter = /^[。？！?!\n]+$/.test(segment);

          if (isDelimiter) {
              currentBubble += segment;
              
              // Look ahead logic:
              // Don't break bubble if the NEXT segment starts with closing punctuation, markdown formatting, OR EMOJIS
              const nextSegment = segments[i + 1];
              
              let isNextClosing = false;
              if (nextSegment !== undefined) {
                  // Closing chars: ” 」 ） ) " ' ’
                  // Markdown chars that might close a block: * ~ `
                  // Whitespace only (empty segments between multiple delimiters)
                  const isClosingChar = /^[”」）)\*~`"'’]|^\s*$/.test(nextSegment);
                  
                  // Emoji check: If the next segment starts with an emoji, keep it attached to this sentence.
                  // Using Unicode property escape for robust emoji detection
                  const isEmoji = /^\p{Extended_Pictographic}/u.test(nextSegment.trim());
                  
                  isNextClosing = isClosingChar || isEmoji;
              }

              if (!isNextClosing) {
                  if (currentBubble.trim()) {
                      finalBubbles.push(currentBubble.trim());
                      currentBubble = "";
                  }
              }
          } else {
              currentBubble += segment;
          }
      }

      if (currentBubble.trim()) {
          finalBubbles.push(currentBubble.trim());
      }
  });

  return finalBubbles;
};

const App: React.FC = () => {
  // Initialize view to LANDING
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false); 
  const [showToast, setShowToast] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [favoriteLessonIds, setFavoriteLessonIds] = useState<Set<string>>(new Set());
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('normal');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageQueueRef = useRef<Message[]>([]);
  const processingQueueRef = useRef(false);
  const pendingSuggestionsRef = useRef<string[]>([]);

  // Load completed and favorite lessons from local storage on mount
  useEffect(() => {
      const savedCompleted = localStorage.getItem('completedLessonIds');
      if (savedCompleted) {
          setCompletedLessonIds(new Set(JSON.parse(savedCompleted)));
      }
      const savedFavorites = localStorage.getItem('favoriteLessonIds');
      if (savedFavorites) {
          setFavoriteLessonIds(new Set(JSON.parse(savedFavorites)));
      }
  }, []);

  // Save to local storage whenever it changes
  useEffect(() => {
      localStorage.setItem('completedLessonIds', JSON.stringify(Array.from(completedLessonIds)));
  }, [completedLessonIds]);

  useEffect(() => {
      localStorage.setItem('favoriteLessonIds', JSON.stringify(Array.from(favoriteLessonIds)));
  }, [favoriteLessonIds]);

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

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

    startChat(lesson);
    
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
    setIsTyping(true); 
    setSuggestions([]); 
    await processAIResponse(text);
  };

  const playNextMessageInQueue = async () => {
    if (messageQueueRef.current.length === 0) {
      processingQueueRef.current = false;
      setIsTyping(false);
      
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
        setIsTyping(true);
        const typingDelay = 600 + Math.random() * 500; 
        await new Promise(resolve => setTimeout(resolve, typingDelay));

        setIsTyping(false);
        setMessages(prev => [...prev, nextMsg]);
        
        if (messageQueueRef.current.length > 0) {
            const readingDelay = Math.min(Math.max(nextMsg.text.length * 60, 1000), 2500);
            await new Promise(resolve => setTimeout(resolve, readingDelay));
            playNextMessageInQueue();
        } else {
            playNextMessageInQueue();
        }
    }
  };

  const processAIResponse = async (prompt: string) => {
    setInputDisabled(true);
    pendingSuggestionsRef.current = [];

    const baseMsgId = Date.now().toString();
    let rawFullText = "";

    try {
      const stream = sendMessageStream(prompt);

      for await (const chunk of stream) {
        rawFullText += chunk.text || '';
      }

      // 1. Parse Options from the full text first
      const { cleanText, options } = parseContentWithOptions(rawFullText);
      
      // 2. Split cleaned text into natural bubbles
      const bubblesText = splitContentIntoBubbles(cleanText);
      
      const finalBubbles: Message[] = [];

      bubblesText.forEach((text, index) => {
          if (text.trim()) {
            finalBubbles.push({
                id: `${baseMsgId}-${index}`,
                role: 'model',
                text: text,
                timestamp: Date.now() + index,
            });
          }
      });

      if (options.length > 0) {
          pendingSuggestionsRef.current = options;
      } else {
          pendingSuggestionsRef.current = DEFAULT_SUGGESTIONS.map(s => s.value);
      }

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
      setSuggestions(DEFAULT_SUGGESTIONS.map(s => s.value));
    }
  };

  const handleExitChat = () => {
    // If entered from Favorites view, go back there. Otherwise Category.
    if (selectedCategory) {
      setView(ViewState.CATEGORY_DETAILS);
    } else {
      setView(ViewState.FAVORITES);
    }
    
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

  const handleToggleFavorite = (lessonId: string) => {
    const newFavorites = new Set(favoriteLessonIds);
    if (newFavorites.has(lessonId)) {
      newFavorites.delete(lessonId);
    } else {
      newFavorites.add(lessonId);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
    setFavoriteLessonIds(newFavorites);
  };

  // --- RENDER: LANDING VIEW ---
  if (view === ViewState.LANDING) {
    return <LandingPage onStart={handleStartApp} />;
  }

  // --- RENDER: HOME VIEW ---
  if (view === ViewState.HOME) {
    return (
      // Replaced animate-zoom-in with a smoother animate-enter-app
      <div className="max-w-md mx-auto h-full flex flex-col bg-blue-500 relative animate-enter-app font-hand">
        <div className="pt-6 pb-4 px-4 sticky top-0 z-20 bg-blue-500 bg-opacity-95 border-b-[3px] border-blue-950 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => setView(ViewState.LANDING)}
                  className="p-2 -ml-2 rounded-lg text-white border-2 border-transparent hover:border-white hover:bg-blue-400 transition-all active:translate-y-[2px]"
                >
                    <X size={24} strokeWidth={3} />
                </button>
                <div className="bg-white text-blue-950 px-4 py-1.5 text-sm font-black shadow-sketchy transform -rotate-2 flex items-center gap-1.5 border-[3px] border-blue-950 rounded-md">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    课程大纲
                </div>
                <button 
                  onClick={() => setView(ViewState.FAVORITES)}
                  className="p-2 -mr-2 rounded-lg text-white border-2 border-transparent hover:border-white hover:bg-blue-400 transition-all relative active:translate-y-[2px]"
                >
                    <Bookmark size={24} strokeWidth={2.5} />
                    {favoriteLessonIds.size > 0 && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-yellow-400 rounded-full border border-blue-950"></span>
                    )}
                </button>
            </div>
            <div className="mb-1 pl-2 border-l-4 border-white">
                 <h2 className="text-3xl font-black text-white tracking-tight">选择阶段</h2>
                 <p className="text-sm text-blue-100 mt-1 font-bold">Level Up Your Japanese!</p>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4 space-y-5">
            {LESSON_CATEGORIES.map((category, idx) => {
                const meta = CATEGORY_META[category] || { description: '', color: 'text-blue-950', iconBg: 'bg-white', level: '?', borderColor: 'border-blue-950' };
                const categoryLessons = PREDEFINED_LESSONS.filter(l => l.category === category);
                const completedCount = categoryLessons.filter(l => completedLessonIds.has(l.id)).length;
                const progress = categoryLessons.length > 0 ? Math.round((completedCount / categoryLessons.length) * 100) : 0;

                return (
                    <div 
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`group relative overflow-hidden bg-white p-5 shadow-sketchy border-[3px] border-blue-950 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-sketchy-lg active:translate-y-[2px] active:shadow-none sketchy-box`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className={`inline-flex items-center justify-center px-3 py-1 border-2 border-blue-950 text-[12px] font-black uppercase tracking-wide mb-3 ${meta.iconBg} ${meta.color} shadow-sm transform -rotate-2 rounded-sm`}>
                                  {meta.level}
                                </div>
                                <h3 className="text-2xl font-black text-blue-950 mb-1 group-hover:text-blue-500 transition-colors font-hand">
                                    {category}
                                </h3>
                                <p className="text-xs text-blue-500 font-bold leading-relaxed mb-4 font-hand">
                                    {meta.description}
                                </p>
                            </div>
                            <div className="bg-blue-500 p-2 text-white transition-colors group-hover:bg-blue-400 border-[3px] border-transparent group-hover:border-blue-950 rounded-full">
                                <ChevronRight size={24} strokeWidth={3} />
                            </div>
                        </div>
                        
                        {/* Brutalist Progress Bar - Blue Core */}
                        <div className="w-full h-4 border-2 border-blue-950 bg-blue-100 relative mt-2 rounded-full overflow-hidden">
                             <div className={`h-full bg-blue-500 border-r-2 border-blue-950 transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                             <div className="absolute top-0 right-0 bottom-0 flex items-center pr-1">
                                 <span className="text-[9px] font-black bg-white px-1 border border-blue-950 leading-none text-blue-950 rounded-sm">{progress}%</span>
                             </div>
                        </div>
                        <div className="mt-1 text-[10px] font-bold text-blue-400 text-right uppercase tracking-widest">
                            {categoryLessons.length} Lessons
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
        <div className="max-w-md mx-auto h-full flex flex-col bg-blue-500 relative animate-[fadeInLeft_0.3s_ease-out] font-hand">
             <style>{`
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
             `}</style>
             
            <div className="pt-6 pb-4 px-4 bg-blue-500 sticky top-0 z-20 border-b-[3px] border-blue-950 shadow-lg mb-4">
                <div className="flex items-center mb-4">
                    <button 
                        onClick={handleBackToHome}
                        className="p-2 -ml-2 border-[3px] border-blue-950 bg-white hover:bg-blue-50 text-blue-950 transition-all active:shadow-none shadow-sketchy-sm mr-4 rounded-xl"
                    >
                        <ArrowLeft size={24} strokeWidth={3} />
                    </button>
                    <h2 className="text-2xl font-black text-white italic transform -skew-x-6">{selectedCategory}</h2>
                </div>
                {meta && (
                    <div className={`mx-1 p-4 bg-white border-[3px] border-blue-950 shadow-sketchy flex items-start gap-3 rounded-2xl transform rotate-1`}>
                        <div className={`p-2 bg-blue-100 border-2 border-blue-950 text-blue-950 rounded-lg`}>
                            <BookOpen size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className={`text-xs font-black uppercase mb-0.5 text-blue-950 bg-blue-200 inline-block px-1 border border-blue-950 rounded-sm`}>{meta.level}</p>
                            <p className="text-sm text-blue-950 font-bold leading-snug mt-1">{meta.description}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-10 pt-2">
                {categoryLessons.length > 0 ? (
                    <div className="space-y-2">
                         {categoryLessons.map((lesson, idx) => (
                            <div key={lesson.id} className="">
                              <LessonCard 
                                  lesson={lesson} 
                                  index={idx} 
                                  onClick={handleLessonSelect}
                                  isCompleted={completedLessonIds.has(lesson.id)}
                                  isFavorite={favoriteLessonIds.has(lesson.id)}
                                  onToggleFavorite={handleToggleFavorite}
                              />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-white font-bold opacity-50">
                        <Book size={48} className="mb-4" />
                        <p>NO CONTENT YET</p>
                    </div>
                )}
            </div>
        </div>
      );
  }

  // --- RENDER: FAVORITES VIEW ---
  if (view === ViewState.FAVORITES) {
    const favoriteLessons = PREDEFINED_LESSONS.filter(l => favoriteLessonIds.has(l.id));

    return (
        <div className="max-w-md mx-auto h-full flex flex-col bg-blue-500 relative animate-[fadeInLeft_0.3s_ease-out] font-hand">
            <div className="pt-6 pb-4 px-4 bg-blue-500 sticky top-0 z-20 border-b-[3px] border-blue-950 shadow-lg mb-4">
                <div className="flex items-center">
                    <button 
                        onClick={handleBackToHome}
                        className="p-2 -ml-2 border-[3px] border-blue-950 bg-white hover:bg-blue-50 text-blue-950 shadow-sketchy-sm mr-4 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] rounded-xl"
                    >
                        <ArrowLeft size={24} strokeWidth={3} />
                    </button>
                    <h2 className="text-2xl font-black text-white">收藏夹</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-10 pt-2">
                {favoriteLessons.length > 0 ? (
                     <div className="space-y-2">
                        {favoriteLessons.map((lesson, idx) => (
                            <div key={lesson.id} className="">
                                <LessonCard 
                                    lesson={lesson} 
                                    index={idx} 
                                    onClick={handleLessonSelect}
                                    isCompleted={completedLessonIds.has(lesson.id)}
                                    isFavorite={true}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-white opacity-50">
                        <Star size={64} className="mb-4" strokeWidth={1.5} />
                        <p className="text-lg font-black">NO FAVORITES YET</p>
                        <p className="text-sm">Click the star on a lesson to add it here!</p>
                    </div>
                )}
            </div>
        </div>
    );
  }

  // --- RENDER: CHAT VIEW ---
  return (
    <div className="max-w-md mx-auto h-full flex flex-col bg-blue-50 relative animate-[fadeIn_0.3s_ease-out]">
      {/* Background Pattern for Chat */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#bfdbfe 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Toast Notification */}
      <div className={`absolute top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-10px] pointer-events-none'}`}>
        <div className="bg-blue-950 text-white text-sm font-bold px-6 py-3 border-[3px] border-white shadow-sketchy flex items-center gap-2 transform -rotate-1 rounded-lg font-hand">
            <Star size={18} fill="white" className="text-white" />
            ADDED TO FAVORITES!
        </div>
      </div>

      {/* Settings Modal - Sketchy Style */}
      {showSettings && (
          <div className="absolute inset-0 z-50 flex items-start justify-end pt-16 px-4 pointer-events-none">
              <div className="bg-white border-[3px] border-blue-950 shadow-sketchy-lg p-4 w-48 pointer-events-auto animate-[fadeInUp_0.2s_ease-out] sketchy-box-sm">
                  <h3 className="text-xs font-black uppercase mb-3 border-b-2 border-blue-100 pb-1 text-blue-950 font-hand">Settings</h3>
                  <div className="mb-2">
                      <label className="text-xs font-bold mb-2 block flex items-center gap-1 text-blue-950 font-hand"><Type size={12}/> Font Size</label>
                      <div className="flex gap-1">
                          {(['small', 'normal', 'large', 'xl'] as FontSize[]).map((size) => (
                              <button
                                key={size}
                                onClick={() => setFontSize(size)}
                                className={`flex-1 py-1 text-[10px] font-bold border-2 border-blue-950 rounded-md font-hand ${fontSize === size ? 'bg-blue-500 text-white' : 'bg-white text-blue-950 hover:bg-blue-50'}`}
                              >
                                  {size === 'small' ? 'A' : size === 'normal' ? 'A+' : size === 'large' ? 'A++' : 'MAX'}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Chat Header */}
      <div className="bg-blue-500 px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b-[3px] border-blue-950 shadow-md flex-none relative">
        {/* Left Button Area */}
        <div className="z-20 relative">
            <button onClick={handleExitChat} className="p-2 -ml-2 hover:bg-blue-400 border-2 border-transparent hover:border-white rounded-lg text-white transition-all active:translate-y-1">
                <X size={24} strokeWidth={3} />
            </button>
        </div>
        
        {/* Centered Title Area (Absolute) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="px-4 py-1 border-[3px] border-blue-950 rounded-lg bg-white shadow-sm transform rotate-1 pointer-events-auto max-w-[60%]">
                <h2 className="font-black text-blue-950 text-[14px] uppercase truncate font-hand">{currentLesson?.title}</h2>
            </div>
        </div>

        {/* Right Button Area */}
        <div className="flex -mr-2 gap-1 z-20 relative">
             <button 
                onClick={() => currentLesson && handleToggleFavorite(currentLesson.id)}
                className={`p-2 hover:bg-blue-400 border-2 border-transparent hover:border-white transition-all active:translate-y-1 rounded-lg 
                  ${currentLesson && favoriteLessonIds.has(currentLesson.id) ? 'text-yellow-300' : 'text-white'}`}
            >
                <Star size={22} strokeWidth={3} fill={currentLesson && favoriteLessonIds.has(currentLesson.id) ? "currentColor" : "none"} />
            </button>

            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 hover:bg-blue-400 hover:text-white border-2 border-transparent hover:border-white transition-all active:translate-y-1 rounded-lg text-white ${showSettings ? 'bg-blue-400 border-white' : ''}`}
            >
                <Settings size={22} strokeWidth={2.5} />
            </button>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6 pb-4 bg-transparent scroll-smooth z-0" 
        onClick={() => setShowSettings(false)}
      >
         {messages.map((msg, idx) => {
             const isFirst = idx === 0;
             const prevMsg = isFirst ? null : messages[idx - 1];
             const effectiveShowAvatar = msg.role === 'model' && (isFirst || prevMsg?.role !== 'model');

             return (
                <ChatBubble 
                    key={msg.id} 
                    message={msg} 
                    showAvatar={effectiveShowAvatar}
                    fontSize={fontSize}
                />
             );
         })}
         
         {/* Typing Indicator */}
         {isTyping && (
            <div className="flex w-full justify-start mb-4 animate-[fadeInUp_0.3s_ease-out]">
                <div className="flex-shrink-0 mr-3 flex flex-col justify-start w-10">
                   {/* Alignment placeholder for typing bubble */}
                   {(messages.length === 0 || messages[messages.length-1].role === 'user') && (
                       <div className="w-10 h-10 bg-white border-[3px] border-blue-500 flex items-center justify-center text-blue-500 shadow-sketchy-sm" style={{ borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%' }}>
                          <span className="text-xs font-black">...</span>
                       </div>
                   )}
                </div>
                <div className="bg-white border-[3px] border-blue-500 shadow-sketchy px-4 py-4 flex items-center h-[48px] rounded-2xl rounded-tl-none">
                    <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
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