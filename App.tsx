import React, { useState, useRef, useEffect } from 'react';
// FIX: Import SuggestedReply to handle structured suggestions.
import { ViewState, Message, Lesson, FontSize, SuggestedReply } from './types';
import { PREDEFINED_LESSONS, DEFAULT_SUGGESTIONS, LESSON_CATEGORIES, CATEGORY_META } from './constants';
import { startChat, sendMessageStream, parseContentWithOptions } from './services/geminiService';
import { LessonCard } from './components/LessonCard';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { LandingPage } from './components/LandingPage';
import { ApiKeyModal } from './components/ApiKeyModal';
import { X, BookOpen, ChevronRight, ArrowLeft, Book, Star, Trash2, CheckCircle2, Key, Search, Sparkles } from 'lucide-react';

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
  // FIX: Update suggestions state to hold objects with label and value for better UX.
  const [suggestions, setSuggestions] = useState<SuggestedReply[]>([]);
  
  // New State for Features
  const [customTopic, setCustomTopic] = useState('');
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Data Persistence
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const addBubblesSequentially = (bubbles: string[], finalSuggestions: SuggestedReply[], initialThinkingId: string) => {
    if (!bubbles || bubbles.length === 0) {
      setMessages(prev => prev.filter(msg => msg.id !== initialThinkingId));
      setSuggestions(finalSuggestions.length > 0 ? finalSuggestions : DEFAULT_SUGGESTIONS);
      setInputDisabled(false);
      return;
    }

    const processBubble = (index: number, thinkingId: string) => {
      const bubbleText = bubbles[index];
      const newBubble: Message = {
        id: `msg-${Date.now()}-${index}`,
        role: 'model',
        text: bubbleText,
        timestamp: Date.now(),
      };

      // Replace the current "thinking" bubble with the actual message content
      setMessages(prev => prev.map(msg => (msg.id === thinkingId ? newBubble : msg)));

      if (index + 1 < bubbles.length) {
        // More bubbles to show. Calculate delay based on current bubble length.
        const delay = Math.min(3500, Math.max(800, bubbleText.length * 75));
        
        setTimeout(() => {
          // Add the next "thinking" bubble
          const nextThinkingId = `thinking-${Date.now()}-${index + 1}`;
          const thinkingBubble: Message = {
            id: nextThinkingId,
            role: 'model',
            text: '',
            isStreaming: true,
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, thinkingBubble]);
          
          // Wait a moment so the user sees "..." before it's replaced
          setTimeout(() => {
            processBubble(index + 1, nextThinkingId);
          }, 600);

        }, delay);
      } else {
        // This was the last bubble, so finalize the turn.
        setInputDisabled(false);
        setSuggestions(finalSuggestions.length > 0 ? finalSuggestions : DEFAULT_SUGGESTIONS);
      }
    };

    // Start the process for the very first bubble after a short initial delay.
    setTimeout(() => {
      processBubble(0, initialThinkingId);
    }, 600);
  };
  
  // --- Initialization & Key Management ---
  useEffect(() => {
    const savedKey = localStorage.getItem('grammar_sensei_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
    
    const savedCompleted = localStorage.getItem('completed_lessons');
    if (savedCompleted) setCompletedLessons(JSON.parse(savedCompleted));
    
    const savedFavorites = localStorage.getItem('favorite_lessons');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Effect to handle lesson completion when a chat turn finishes
  useEffect(() => {
    if (
      !inputDisabled &&
      view === ViewState.CHAT &&
      messages.length > 2 &&
      currentLesson &&
      !completedLessons.includes(currentLesson.id)
    ) {
      setCompletedLessons(prev => {
        const newCompleted = [...new Set([...prev, currentLesson.id])];
        localStorage.setItem('completed_lessons', JSON.stringify(newCompleted));
        return newCompleted;
      });
    }
  }, [inputDisabled, view, messages, currentLesson, completedLessons]);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('grammar_sensei_key', key);
    setShowKeyModal(false);
  };

  const openKeyModal = () => {
    setShowKeyModal(true);
  };

  // --- Navigation Handlers ---
  const handleStart = () => {
    if (!apiKey) {
      setShowKeyModal(true);
    }
    setView(ViewState.HOME);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setView(ViewState.CATEGORY_DETAILS);
  };

  const handleBackToHome = () => {
    setSelectedCategory(null);
    setView(ViewState.HOME);
  };

  const handleBackToCategories = () => {
    // FIX: Navigate to the category details page, not the chat page again.
    setView(ViewState.CATEGORY_DETAILS);
    setCurrentLesson(null);
    setMessages([]);
  };
  
  const handleGoToFavorites = () => {
    setView(ViewState.FAVORITES);
  };

  // --- Custom Topic Logic ---
  const handleCustomTopicStart = async () => {
    if (!customTopic.trim()) return;
    if (!apiKey) {
        setShowKeyModal(true);
        return;
    }

    const newLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: customTopic,
      subtitle: '自由探索模式',
      category: 'Custom',
      duration: '∞',
      initialPrompt: `我想学习关于"${customTopic}"的日语知识。请作为老师教我。`
    };

    startLesson(newLesson);
    setCustomTopic('');
  };

  const handleToggleFavorite = (lessonId: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId];
      localStorage.setItem('favorite_lessons', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  // --- Chat Logic ---
  const startLesson = async (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setView(ViewState.CHAT);
    setMessages([]);
    setSuggestions([]);
    setInputDisabled(true);
    const tempMsgId = Date.now().toString();

    // Show loading indicator
    setMessages([{
        id: tempMsgId,
        role: 'model',
        text: '', // Empty text triggers the "three dots" animation
        timestamp: Date.now(),
        isStreaming: true,
    }]);

    try {
      startChat(lesson, apiKey);
      const responseStream = sendMessageStream(lesson.initialPrompt);
      
      let fullText = '';
      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
        }
      }

      const { cleanText, options } = parseContentWithOptions(fullText);
      const bubbles = splitContentIntoBubbles(cleanText);
      const suggestionObjects = options.map(opt => ({ label: opt, value: opt }));

      // Start sequential display, passing the thinking bubble's ID
      addBubblesSequentially(bubbles, suggestionObjects, tempMsgId);

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.filter(p => p.id !== tempMsgId));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "哎呀，网络好像有点问题，请检查一下你的 API Key 或网络连接 😵",
        timestamp: Date.now()
      }]);
      setInputDisabled(false);
      if (error instanceof Error && (error.message.includes('400') || error.message.includes('key'))) {
          openKeyModal();
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsgId = Date.now().toString();
    const newUserMsg: Message = { id: userMsgId, role: 'user', text, timestamp: Date.now() };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputDisabled(true);
    setSuggestions([]);

    // Natural delay before showing "thinking" bubble
    setTimeout(async () => {
        const tempMsgId = (Date.now() + 1).toString();
    
        // Show loading indicator
        setMessages(prev => [...prev, {
            id: tempMsgId,
            role: 'model',
            text: '',
            timestamp: Date.now(),
            isStreaming: true
        }]);
    
        try {
            const responseStream = sendMessageStream(text);
            let fullText = '';
            
            for await (const chunk of responseStream) {
                const text = chunk.text;
                if (text) {
                    fullText += text;
                }
            }
    
            const { cleanText, options } = parseContentWithOptions(fullText);
            const bubbles = splitContentIntoBubbles(cleanText);
            const suggestionObjects = options.map(opt => ({ label: opt, value: opt }));
    
            // Start sequential display, passing the thinking bubble's ID
            addBubblesSequentially(bubbles, suggestionObjects, tempMsgId);
    
        } catch (error) {
            setMessages(prev => prev.filter(p => p.id !== tempMsgId));
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "老师有点累了（连接错误），请稍后再试或检查 Key 😷",
                timestamp: Date.now()
            }]);
            setInputDisabled(false);
        }
    }, 800);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, suggestions]);

  // --- RENDER HELPERS ---
  
  const renderHeader = (title: string, subtitle?: string, onBack?: () => void) => (
    <div className="bg-blue-500 text-white p-4 flex items-center gap-3 border-b-[3px] border-blue-950 shadow-sketchy z-30 relative flex-shrink-0">
       {onBack ? (
           <button onClick={onBack} className="p-2 bg-blue-400 border-2 border-blue-950 rounded-lg hover:bg-blue-300 transition-colors active:translate-y-1 shadow-sketchy-sm">
               <ArrowLeft size={20} strokeWidth={3} />
           </button>
       ) : (
           <div className="p-2 bg-white text-blue-950 border-2 border-blue-950 rounded-lg shadow-sketchy-sm transform -rotate-3">
               <BookOpen size={20} strokeWidth={3} />
           </div>
       )}
       
       <div className="flex-1">
           <h1 className="text-2xl font-black font-hand tracking-wide">{title}</h1>
           {subtitle && <p className="text-xs font-bold text-blue-100 opacity-90 font-hand">{subtitle}</p>}
       </div>
       
       {!onBack && (
         <div className="flex items-center gap-2">
            <button onClick={handleGoToFavorites} className="p-2 bg-yellow-300 border-2 border-blue-950 rounded-lg hover:bg-yellow-200 transition-colors shadow-sketchy-sm">
                 <Star size={20} strokeWidth={3} className="text-blue-950" />
             </button>
            <button onClick={openKeyModal} className="p-2 bg-blue-400 border-2 border-blue-950 rounded-lg hover:bg-blue-300 transition-colors shadow-sketchy-sm">
                <Key size={20} strokeWidth={3} />
            </button>
         </div>
       )}
    </div>
  );

  return (
    // Main Container: Fixed height 100dvh for mobile browsers
    <div className="h-[100dvh] w-full bg-blue-500 flex flex-col font-sans overflow-hidden relative text-blue-950">
      
      {/* Global API Key Modal */}
      {showKeyModal && (
        <ApiKeyModal 
          onSave={handleSaveKey} 
          initialKey={apiKey} 
          onCancel={() => setShowKeyModal(false)}
          canCancel={!!apiKey} // Can only cancel if we already have a key
        />
      )}

      {/* View: Landing */}
      {view === ViewState.LANDING && (
        <LandingPage onStart={handleStart} />
      )}

      {/* View: Home (Categories + Custom Input) */}
      {view === ViewState.HOME && (
        <>
          {renderHeader("Grammar Sensei", "选择你的冒险")}
          
          <main className="flex-1 overflow-y-auto p-4 pb-8 min-h-0 scroll-smooth hide-scrollbar chat-bg-pattern">
            
            {/* Custom Topic Input Section */}
            <div className="mb-8 bg-white p-4 rounded-2xl border-[3px] border-blue-950 shadow-sketchy animate-pop-in">
               <div className="flex items-center gap-2 mb-3">
                  <div className="bg-yellow-400 border-2 border-blue-950 p-1.5 rounded-lg shadow-sm transform -rotate-6">
                     <Sparkles size={18} className="text-blue-950" strokeWidth={3}/>
                  </div>
                  <h2 className="font-black text-lg">自由探索</h2>
               </div>
               <p className="text-xs font-bold text-blue-500 mb-3">不想按部就班？直接告诉我想学什么！</p>
               
               <div className="flex gap-2">
                  <input 
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="输入语法点 (例如: 被动语态)..."
                    className="flex-1 bg-blue-50 border-2 border-blue-950 rounded-xl px-3 py-2 font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-300 font-hand placeholder-blue-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomTopicStart()}
                  />
                  <button 
                    onClick={handleCustomTopicStart}
                    disabled={!customTopic.trim()}
                    className="bg-blue-500 text-white border-2 border-blue-950 rounded-xl px-4 font-black shadow-sketchy-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    GO
                  </button>
               </div>
            </div>

            {/* Category Grid */}
            <h2 className="font-black text-blue-950 text-xl mb-4 ml-1 font-hand">课程地图</h2>
            <div className="grid grid-cols-1 gap-4">
              {LESSON_CATEGORIES.map((category, index) => {
                const meta = CATEGORY_META[category];
                const lessonsCount = PREDEFINED_LESSONS.filter(l => l.category === category).length;
                const finishedCount = PREDEFINED_LESSONS.filter(l => l.category === category && completedLessons.includes(l.id)).length;
                const progress = Math.round((finishedCount / lessonsCount) * 100) || 0;

                return (
                  <div 
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`relative bg-white border-[3px] border-blue-950 rounded-2xl p-0 overflow-hidden shadow-sketchy cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-[2px] active:shadow-none animate-slide-up`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-stretch min-h-[80px]">
                       {/* Icon Area */}
                       <div className={`${meta.iconBg} w-24 flex flex-col items-center justify-center border-r-[3px] border-blue-950 p-2`}>
                           <span className={`text-2xl font-black ${meta.color}`}>{meta.level}</span>
                           <span className="text-[10px] font-bold bg-white/30 px-2 py-0.5 rounded-full mt-1 text-blue-950 backdrop-blur-sm">
                              {progress}%
                           </span>
                       </div>
                       
                       {/* Info Area */}
                       <div className="flex-1 p-4 flex flex-col justify-center">
                           <h3 className="text-xl font-black text-blue-950 font-hand">{category}</h3>
                           <p className="text-xs text-blue-500 font-bold leading-tight mt-1">{meta.description}</p>
                       </div>

                       {/* Arrow */}
                       <div className="pr-4 flex items-center justify-center text-blue-300">
                          <ChevronRight size={24} strokeWidth={3} />
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </>
      )}

      {/* View: Favorites List */}
      {view === ViewState.FAVORITES && (
        <>
          {renderHeader("我的收藏", "你最喜欢的课程都在这里", handleBackToHome)}
          <main className="flex-1 overflow-y-auto p-4 min-h-0 hide-scrollbar chat-bg-pattern">
            {favorites.length > 0 ? (
              <div className="space-y-4 pb-6">
                {PREDEFINED_LESSONS
                  .filter(lesson => favorites.includes(lesson.id))
                  .map((lesson, idx) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      index={idx}
                      onClick={() => startLesson(lesson)}
                      isCompleted={completedLessons.includes(lesson.id)}
                      isFavorite={true}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))
                }
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-white animate-pop-in">
                <Star size={48} className="mb-4 opacity-30" strokeWidth={2}/>
                <h2 className="text-2xl font-black font-hand">空空如也</h2>
                <p className="text-sm font-bold opacity-80 mt-2">
                  在课程列表里点击星星 ✨<br/>就可以把课程收藏到这里啦！
                </p>
              </div>
            )}
          </main>
        </>
      )}

      {/* View: Category Details (Lesson List) */}
      {view === ViewState.CATEGORY_DETAILS && selectedCategory && (
        <>
          {renderHeader(selectedCategory, CATEGORY_META[selectedCategory].description, handleBackToHome)}
          
          <main className="flex-1 overflow-y-auto p-4 min-h-0 hide-scrollbar chat-bg-pattern">
            <div className="space-y-4 pb-6">
                {PREDEFINED_LESSONS.filter(l => l.category === selectedCategory).map((lesson, idx) => (
                  <LessonCard 
                    key={lesson.id}
                    lesson={lesson}
                    index={idx}
                    onClick={() => startLesson(lesson)}
                    isCompleted={completedLessons.includes(lesson.id)}
                    isFavorite={favorites.includes(lesson.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
            </div>
          </main>
        </>
      )}

      {/* View: Chat Interface */}
      {view === ViewState.CHAT && currentLesson && (
        <>
           {/* Compact Header for Chat */}
           <div className="bg-blue-500 text-white px-4 py-3 flex items-center gap-3 border-b-[3px] border-blue-950 shadow-sm z-30 flex-shrink-0">
               <button onClick={currentLesson.category === 'Custom' ? handleBackToHome : handleBackToCategories} className="p-1.5 bg-blue-400 border-2 border-blue-950 rounded-lg hover:bg-blue-300 active:translate-y-0.5 shadow-sketchy-sm">
                   <ArrowLeft size={18} strokeWidth={3} />
               </button>
               <div className="flex-1 min-w-0">
                   <h1 className="text-lg font-black truncate font-hand leading-none">{currentLesson.title}</h1>
                   <p className="text-[10px] font-bold text-blue-200 truncate">{currentLesson.subtitle}</p>
               </div>
               <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold border border-white/30">
                   {currentLesson.category}
               </div>
           </div>

           {/* Chat Area */}
           <div className="flex-1 overflow-y-auto p-4 scroll-smooth min-h-0 hide-scrollbar chat-bg-pattern">
              {messages.map((msg, idx) => (
                <ChatBubble 
                  key={msg.id} 
                  message={msg} 
                  showAvatar={msg.role === 'model' && (!messages[idx-1] || messages[idx-1].role !== 'model')} 
                  fontSize={'normal'} 
                />
              ))}
              <div ref={chatEndRef} />
           </div>

           {/* Input Area */}
           <ChatInput 
             onSend={handleSendMessage} 
             suggestions={suggestions}
             disabled={inputDisabled}
           />
        </>
      )}

    </div>
  );
};

export default App;