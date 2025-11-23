import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Message, Lesson, FontSize } from './types';
import { PREDEFINED_LESSONS, DEFAULT_SUGGESTIONS, LESSON_CATEGORIES, CATEGORY_META } from './constants';
import { startChat, sendMessageStream, parseContentWithOptions } from './services/geminiService';
import { LessonCard } from './components/LessonCard';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { LandingPage } from './components/LandingPage';
import { PromoScene } from './components/PromoScene';
import { ApiKeyModal } from './components/ApiKeyModal';
import { X, BookOpen, ChevronRight, ArrowLeft, Book, Star, Trash2, CheckCircle2, Settings, Type, Bookmark, Camera, Key, LogOut, Search, ArrowRight, Sparkles } from 'lucide-react';

// Helper to manage local storage
const STORAGE_KEYS = {
  API_KEY: 'grammar_sensei_api_key',
  COMPLETED_LESSONS: 'grammar_sensei_completed',
  FAVORITES: 'grammar_sensei_favorites'
};

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  // Load persisted data
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (storedKey) setApiKey(storedKey);

    const storedCompleted = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS) || '[]');
    setCompletedLessons(storedCompleted);

    const storedFavorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
    setFavorites(storedFavorites);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // --- Handlers ---

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    setShowKeyModal(false);
    // If we were on landing page, move to home
    if (view === ViewState.LANDING) {
      setView(ViewState.HOME);
    }
  };

  const handleRemoveKey = () => {
    setApiKey('');
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    setShowSettings(false);
    setView(ViewState.LANDING);
  };

  const handleStartAdventure = () => {
    if (apiKey) {
      setView(ViewState.HOME);
    } else {
      setShowKeyModal(true);
    }
  };

  const toggleFavorite = (lessonId: string) => {
    const newFavorites = favorites.includes(lessonId)
      ? favorites.filter(id => id !== lessonId)
      : [...favorites, lessonId];
    
    setFavorites(newFavorites);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setMessages([]);
    setSuggestions([]);
    setView(ViewState.CHAT);
    
    // Start the chat session
    initiateChat(lesson);
  };

  const handleStartCustomLesson = () => {
    if (!customTopic.trim()) return;
    
    const newLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: customTopic,
      subtitle: '自由探索',
      duration: '自选',
      initialPrompt: `我想学习关于“${customTopic}”的日语知识。请用生动有趣的方式教我，像一位耐心的老师。`,
      category: '自定义'
    };
    
    handleLessonSelect(newLesson);
    setCustomTopic('');
  };

  const initiateChat = async (lesson: Lesson) => {
    try {
      setIsTyping(true);
      setInputDisabled(true);
      
      // Initialize Gemini Chat
      startChat(lesson, apiKey);

      // Add initial system message (invisible to user usually, but here we simulate the first turn)
      // Actually, in this design, the AI speaks first based on the prompt.
      
      const initialMsgId = Date.now().toString();
      let fullResponse = "";
      
      // We send a hidden trigger message to get the AI to start the lesson
      const stream = sendMessageStream("开始上课。请按照System Instruction的要求，简短地开始第一句讲解。");
      
      setMessages([{
        id: initialMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now(),
        isStreaming: true
      }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        setMessages(prev => prev.map(m => 
          m.id === initialMsgId ? { ...m, text: fullResponse } : m
        ));
      }

      // Post-processing
      const { cleanText, options } = parseContentWithOptions(fullResponse);
      
      setMessages(prev => prev.map(m => 
        m.id === initialMsgId ? { ...m, text: cleanText, isStreaming: false } : m
      ));

      setSuggestions(options.length > 0 ? options : DEFAULT_SUGGESTIONS.map(s => s.value));
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: '😵 哎呀，网络好像有点卡，或者 API Key 额度用完了。请检查网络或在设置里更换 Key。',
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
      setInputDisabled(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // User Message
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      text: text,
      timestamp: Date.now()
    }]);

    setSuggestions([]); // Clear suggestions
    setInputDisabled(true);
    setIsTyping(true);

    try {
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now(),
        isStreaming: true
      }]);

      let fullResponse = "";
      const stream = sendMessageStream(text);

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, text: fullResponse } : m
        ));
      }

      const { cleanText, options } = parseContentWithOptions(fullResponse);

      setMessages(prev => prev.map(m => 
        m.id === aiMsgId ? { ...m, text: cleanText, isStreaming: false } : m
      ));

      setSuggestions(options.length > 0 ? options : DEFAULT_SUGGESTIONS.map(s => s.value));
      
      // Mark lesson as completed if conversation gets long enough (simple heuristic)
      if (currentLesson && messages.length > 6 && !completedLessons.includes(currentLesson.id) && !currentLesson.id.startsWith('custom')) {
        const newCompleted = [...completedLessons, currentLesson.id];
        setCompletedLessons(newCompleted);
        localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(newCompleted));
      }

    } catch (error) {
      console.error(error);
       setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: '😵 遇到了一点小问题，请重试。',
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
      setInputDisabled(false);
    }
  };

  // --- Render Helpers ---

  const getFilteredLessons = () => {
    let list = PREDEFINED_LESSONS;
    if (selectedCategory) {
      list = list.filter(l => l.category === selectedCategory);
    }
    if (view === ViewState.FAVORITES) {
      list = PREDEFINED_LESSONS.filter(l => favorites.includes(l.id));
    }
    return list;
  };

  // --- Render Views ---

  if (view === ViewState.LANDING) {
    return (
      <>
        <LandingPage onStart={handleStartAdventure} />
        {showKeyModal && (
          <ApiKeyModal 
            onSave={handleSaveKey} 
            onCancel={() => setShowKeyModal(false)} 
            canCancel={!!apiKey} 
            initialKey={apiKey}
          />
        )}
      </>
    );
  }

  if (view === ViewState.PROMO) {
    return <PromoScene onBack={() => setView(ViewState.HOME)} />;
  }

  return (
    // Changed h-screen to h-[100dvh] for mobile browser address bar support
    <div className="flex flex-col h-[100dvh] bg-blue-500 max-w-md mx-auto shadow-2xl overflow-hidden relative">
       {/* Global Background Pattern */}
       <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
      
      {/* --- Header --- */}
      <header className="flex-none bg-blue-500 p-4 flex items-center justify-between z-30 relative shadow-sm">
        <div className="flex items-center">
          {view === ViewState.CHAT || view === ViewState.CATEGORY_DETAILS || view === ViewState.FAVORITES ? (
            <button 
              onClick={() => {
                if (view === ViewState.CHAT) {
                   if (currentLesson?.category === '自定义') setView(ViewState.HOME);
                   else setView(ViewState.CATEGORY_DETAILS);
                }
                else if (view === ViewState.CATEGORY_DETAILS) setView(ViewState.HOME);
                else setView(ViewState.HOME);
              }}
              className="p-2 mr-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
            >
              <ArrowLeft size={20} strokeWidth={3} />
            </button>
          ) : (
            <div className="p-2 mr-2 bg-white text-blue-500 rounded-lg border-2 border-blue-950 shadow-[2px_2px_0px_0px_#172554] transform -rotate-2">
              <BookOpen size={20} strokeWidth={3} />
            </div>
          )}
          
          <div>
            <h1 className="font-black text-xl text-white tracking-wide font-hand leading-none shadow-sm">
              {view === ViewState.CHAT && currentLesson ? currentLesson.title : 
               view === ViewState.FAVORITES ? '收藏夹' :
               view === ViewState.CATEGORY_DETAILS ? selectedCategory : 'Grammar Sensei'}
            </h1>
            {view === ViewState.CHAT && currentLesson && (
               <p className="text-blue-100 text-[10px] font-bold leading-none mt-1">
                 {currentLesson.subtitle}
               </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {view !== ViewState.CHAT && (
             <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
             >
               <Settings size={24} strokeWidth={2.5} />
             </button>
          )}
          {view === ViewState.CHAT && (
             <button 
                onClick={() => {
                  const sizes: FontSize[] = ['small', 'normal', 'large', 'xl'];
                  const nextIndex = (sizes.indexOf(fontSize) + 1) % sizes.length;
                  setFontSize(sizes[nextIndex]);
                }}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
             >
               <Type size={24} strokeWidth={2.5} />
             </button>
          )}
        </div>
      </header>

      {/* --- Main Content --- */}
      {/* Added min-h-0 to ensure flex child scrolls correctly on all browsers */}
      <main className="flex-1 min-h-0 overflow-hidden relative bg-blue-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-20 flex flex-col">
        
        {/* Settings Overlay */}
        {showSettings && (
          <div className="absolute inset-0 z-50 bg-blue-950/90 backdrop-blur-sm flex flex-col animate-pop-in p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
              <h2 className="text-2xl text-white font-black font-hand">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-white/70 hover:text-white">
                <X size={32} />
              </button>
            </div>
            
            <div className="space-y-4 flex-1">
               <button 
                  onClick={() => { setShowSettings(false); setView(ViewState.FAVORITES); }}
                  className="w-full bg-white p-4 rounded-xl flex items-center gap-4 font-bold text-blue-950 border-[3px] border-transparent hover:border-blue-400 active:scale-95 transition-all"
               >
                 <div className="p-2 bg-yellow-100 rounded-lg text-yellow-500"><Star size={24} fill="currentColor"/></div>
                 我的收藏
               </button>

               <button 
                  onClick={() => { setShowSettings(false); setView(ViewState.PROMO); }}
                  className="w-full bg-white p-4 rounded-xl flex items-center gap-4 font-bold text-blue-950 border-[3px] border-transparent hover:border-blue-400 active:scale-95 transition-all"
               >
                 <div className="p-2 bg-purple-100 rounded-lg text-purple-500"><Camera size={24} /></div>
                 宣传图模式
               </button>

               <button 
                  onClick={() => { setShowSettings(false); setShowKeyModal(true); }}
                  className="w-full bg-white p-4 rounded-xl flex items-center gap-4 font-bold text-blue-950 border-[3px] border-transparent hover:border-blue-400 active:scale-95 transition-all"
               >
                 <div className="p-2 bg-blue-100 rounded-lg text-blue-500"><Key size={24} /></div>
                 更换 API Key
               </button>

               <button 
                  onClick={handleRemoveKey}
                  className="w-full bg-red-50 p-4 rounded-xl flex items-center gap-4 font-bold text-red-500 border-[3px] border-transparent hover:border-red-200 active:scale-95 transition-all mt-8"
               >
                 <div className="p-2 bg-red-100 rounded-lg"><LogOut size={24} /></div>
                 退出 / 清除 Key
               </button>
            </div>
            
            <div className="mt-auto text-center text-white/30 text-xs font-mono pt-8 flex-shrink-0">
              v1.1.0 • Grammar Sensei
            </div>
          </div>
        )}

        {/* View: HOME */}
        {view === ViewState.HOME && (
          <div className="h-full overflow-y-auto p-6 pb-20 overscroll-contain">
             <div className="mb-6">
                <h2 className="text-2xl font-black text-blue-950 mb-2 font-hand flex items-center gap-2">
                  <span className="text-3xl">👋</span> 欢迎回来!
                </h2>
                <p className="text-blue-500 font-bold text-sm">今天想攻克哪个难关？</p>
             </div>
             
             {/* Custom Topic Input - Added feature */}
             <div className="mb-8">
                <label className="block text-xs font-black text-blue-950 uppercase mb-2 ml-1 flex items-center gap-1">
                  <Sparkles size={12} className="text-blue-500"/> 自由探索 (Free Style)
                </label>
                <div className="relative group">
                   <input 
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleStartCustomLesson()}
                      placeholder="输入你想学的语法 (例如: 被动态)"
                      className="w-full bg-white border-[3px] border-blue-950 rounded-2xl py-4 pl-12 pr-14 text-blue-950 font-bold shadow-sketchy transition-all focus:shadow-sketchy-lg focus:-translate-y-1 placeholder-blue-300 outline-none"
                   />
                   <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-500 transition-colors">
                      <Search size={24} strokeWidth={3} />
                   </div>
                   <button 
                      onClick={handleStartCustomLesson}
                      disabled={!customTopic.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-xl border-2 border-blue-950 shadow-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                   >
                      <ArrowRight size={20} strokeWidth={3} />
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {LESSON_CATEGORIES.map((cat, idx) => {
                   const meta = CATEGORY_META[cat];
                   return (
                     <div 
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setView(ViewState.CATEGORY_DETAILS); }}
                        className={`group relative bg-white border-[3px] ${meta.borderColor} rounded-2xl p-5 shadow-sketchy hover:-translate-y-1 hover:shadow-sketchy-lg transition-all cursor-pointer active:translate-y-1 active:shadow-none overflow-hidden`}
                     >
                        <div className="flex justify-between items-start mb-3 relative z-10">
                           <div className={`w-12 h-12 ${meta.iconBg} ${meta.color} rounded-full flex items-center justify-center font-black text-lg border-2 border-blue-950 shadow-sm transform group-hover:rotate-6 transition-transform`}>
                              {meta.level}
                           </div>
                           <div className="bg-blue-50 text-blue-950 text-xs font-bold px-2 py-1 rounded-lg border border-blue-200">
                              {PREDEFINED_LESSONS.filter(l => l.category === cat).length} 课
                           </div>
                        </div>
                        <h3 className="text-xl font-black text-blue-950 mb-1 relative z-10">{cat}</h3>
                        <p className="text-sm text-blue-400 font-bold leading-tight relative z-10">{meta.description}</p>
                        
                        {/* Decor */}
                        <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${meta.iconBg} opacity-20 rounded-full group-hover:scale-125 transition-transform`}></div>
                     </div>
                   );
                })}
             </div>
          </div>
        )}

        {/* View: CATEGORY DETAILS & FAVORITES */}
        {(view === ViewState.CATEGORY_DETAILS || view === ViewState.FAVORITES) && (
          <div className="h-full overflow-y-auto p-4 pb-20 overscroll-contain">
             {getFilteredLessons().length === 0 ? (
               <div className="text-center mt-20 text-blue-300">
                 <Bookmark size={48} className="mx-auto mb-4 opacity-50" />
                 <p className="font-bold">这里空空如也</p>
               </div>
             ) : (
               getFilteredLessons().map((lesson, index) => (
                  <LessonCard 
                    key={lesson.id} 
                    lesson={lesson} 
                    index={index}
                    isCompleted={completedLessons.includes(lesson.id)}
                    isFavorite={favorites.includes(lesson.id)}
                    onClick={handleLessonSelect}
                    onToggleFavorite={toggleFavorite}
                  />
               ))
             )}
          </div>
        )}

        {/* View: CHAT */}
        {view === ViewState.CHAT && currentLesson && (
          <div className="flex flex-col h-full">
             {/* Chat Area */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
                {/* Lesson Header Info */}
                <div className="flex justify-center mb-4">
                   <div className="bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                      {currentLesson.category} • {currentLesson.duration}
                   </div>
                </div>

                {messages.map((msg) => (
                  <ChatBubble 
                    key={msg.id} 
                    message={msg} 
                    showAvatar={msg.role === 'model'} 
                    fontSize={fontSize}
                  />
                ))}
                
                {isTyping && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white border-2 border-blue-200 px-4 py-2 rounded-2xl rounded-tl-none text-blue-300 text-sm font-bold">
                       Sensei 正在思考...
                    </div>
                  </div>
                )}
                
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
             </div>

             {/* Input Area */}
             <ChatInput 
                onSend={handleSendMessage} 
                suggestions={suggestions}
                disabled={inputDisabled}
             />
          </div>
        )}
      </main>
      
      {/* API Key Modal (Global) */}
      {showKeyModal && (
        <ApiKeyModal 
          onSave={handleSaveKey} 
          onCancel={() => setShowKeyModal(false)} 
          canCancel={!!apiKey} // Can cancel if we already have a key (accessed from settings)
          initialKey={apiKey}
        />
      )}

    </div>
  );
};

export default App;