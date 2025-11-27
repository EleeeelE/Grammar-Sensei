
import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Message, Lesson, SuggestedReply, FontSize, NotebookEntry } from './types';
import { PREDEFINED_LESSONS, DEFAULT_SUGGESTIONS, LESSON_CATEGORIES, CATEGORY_META } from './constants';
import { startChat, sendMessageStream, parseContentWithOptions, generateSummary, setApiKey, explainText } from './services/geminiService';
import { setSoundEnabled as setAudioSoundEnabled, setBgmEnabled as setAudioBgmEnabled, setBgmVolume as setAudioBgmVolume, playClick } from './services/audioService';
import { LessonCard } from './components/LessonCard';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { LandingPage } from './components/LandingPage';
import { SummaryCard } from './components/SummaryCard';
import { SummaryFab } from './components/SummaryFab';
import { SettingsModal } from './components/SettingsModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { NotebookView } from './components/NotebookView';
import { SessionNotes } from './components/SessionNotes';
import { FlyingStar } from './components/FlyingStar';
import { ExplanationPanel } from './components/ExplanationPanel';
import { BookOpen, ChevronRight, ArrowLeft, Star, Sparkles, Settings as SettingsIcon, Book } from 'lucide-react';

// Helper function to split text into natural chat bubbles
const splitContentIntoBubbles = (text: string): string[] => {
  // STRICT SPLITTING: Only split by the explicit delimiter '==='
  // We no longer split by punctuation automatically to prevent "message spam".
  // The AI prompt is responsible for placing '===' where a pause is needed.
  let bubbles = text.split('===').map(b => b.trim()).filter(b => b.length > 0);
  
  // HARD LIMIT: Maximum 5 bubbles per turn to prevent overwhelming the user.
  if (bubbles.length > 5) {
      bubbles = bubbles.slice(0, 5);
  }

  return bubbles;
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedReply[]>([]);
  
  const [customTopic, setCustomTopic] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Notebook State
  const [notebook, setNotebook] = useState<NotebookEntry[]>([]);
  const [isSessionNotesOpen, setIsSessionNotesOpen] = useState(false);

  // Explanation Panel State
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [explanationQuery, setExplanationQuery] = useState('');
  const [explanationResult, setExplanationResult] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Animation State
  const [flyingStars, setFlyingStars] = useState<{id: string, startX: number, startY: number, endX: number, endY: number}[]>([]);
  const starJarRef = useRef<HTMLButtonElement>(null);
  const [isJarBouncing, setIsJarBouncing] = useState(false);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ttsSpeed, setTtsSpeed] = useState(0.8); // Default to slower speed
  
  // BGM State
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.08);

  // Auth State
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const addBubblesSequentially = (bubbles: string[], initialThinkingId: string): Promise<void> => {
    return new Promise(resolve => {
        if (!bubbles || bubbles.length === 0) {
            setMessages(prev => prev.filter(msg => msg.id !== initialThinkingId));
            resolve();
            return;
        }

        const processBubble = (index: number, thinkingId: string) => {
            const bubbleText = bubbles[index];
            const newBubble: Message = {
                id: `msg-${Date.now()}-${index}`,
                role: 'model',
                text: bubbleText,
                timestamp: Date.now(),
                type: 'chat',
            };

            setMessages(prev => prev.map(msg => (msg.id === thinkingId ? newBubble : msg)));

            if (index + 1 < bubbles.length) {
                // Faster delay calculation: base 600ms + 30ms per char, max 2000ms
                const delay = Math.min(2000, Math.max(600, bubbleText.length * 30));
                
                setTimeout(() => {
                const nextThinkingId = `thinking-${Date.now()}-${index + 1}`;
                const thinkingBubble: Message = {
                    id: nextThinkingId,
                    role: 'model',
                    text: '',
                    isStreaming: true,
                    timestamp: Date.now(),
                    type: 'chat',
                };
                setMessages(prev => [...prev, thinkingBubble]);
                
                setTimeout(() => {
                    processBubble(index + 1, nextThinkingId);
                }, 600);

                }, delay);
            } else {
                resolve();
            }
        };

        setTimeout(() => {
            processBubble(0, initialThinkingId);
        }, 600);
    });
};
  
  useEffect(() => {
    const savedCompleted = localStorage.getItem('completed_lessons');
    if (savedCompleted) setCompletedLessons(JSON.parse(savedCompleted));
    
    const savedFavorites = localStorage.getItem('favorite_lessons');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    
    const savedNotebook = localStorage.getItem('notebook_entries');
    if (savedNotebook) setNotebook(JSON.parse(savedNotebook));

    // Load settings
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) setFontSize(savedFontSize as FontSize);
    
    const savedSound = localStorage.getItem('soundEnabled');
    // Default to true if not set
    const initialSound = savedSound !== null ? savedSound === 'true' : true;
    setSoundEnabled(initialSound);
    setAudioSoundEnabled(initialSound);

    const savedBgm = localStorage.getItem('bgmEnabled');
    const initialBgm = savedBgm !== null ? savedBgm === 'true' : false; // Default off to be polite
    setBgmEnabled(initialBgm);
    setAudioBgmEnabled(initialBgm);

    const savedBgmVol = localStorage.getItem('bgmVolume');
    const initialBgmVol = savedBgmVol ? parseFloat(savedBgmVol) : 0.08;
    setBgmVolume(initialBgmVol);
    setAudioBgmVolume(initialBgmVol);

    const savedTtsSpeed = localStorage.getItem('ttsSpeed');
    if (savedTtsSpeed) setTtsSpeed(parseFloat(savedTtsSpeed));

    // Initialize API Key
    const envKey = process.env.API_KEY;
    if (envKey && envKey.startsWith('sk-')) {
        setApiKey(envKey);
    } else {
        const localKey = localStorage.getItem('siliconflow_api_key');
        if (localKey && localKey.startsWith('sk-')) {
            setApiKey(localKey);
        } else {
            // Delay slightly to let intro animation finish or avoid interference
            setTimeout(() => setShowApiKeyModal(true), 1000);
        }
    }

  }, []);

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('soundEnabled', String(soundEnabled));
    setAudioSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('bgmEnabled', String(bgmEnabled));
    setAudioBgmEnabled(bgmEnabled);
  }, [bgmEnabled]);

  useEffect(() => {
    localStorage.setItem('bgmVolume', String(bgmVolume));
    setAudioBgmVolume(bgmVolume);
  }, [bgmVolume]);

  useEffect(() => {
    localStorage.setItem('ttsSpeed', String(ttsSpeed));
  }, [ttsSpeed]);

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

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('siliconflow_api_key', key);
    setShowApiKeyModal(false);
    playClick();
  };

  const handleStart = () => {
    playClick();
    setView(ViewState.HOME);
  };

  const handleCategorySelect = (category: string) => {
    playClick();
    setSelectedCategory(category);
    setView(ViewState.CATEGORY_DETAILS);
  };

  const handleBackToHome = () => {
    playClick();
    setSelectedCategory(null);
    setView(ViewState.HOME);
  };

  const handleBackToCategories = () => {
    playClick();
    setView(ViewState.CATEGORY_DETAILS);
    setCurrentLesson(null);
    setMessages([]);
  };
  
  const handleGoToFavorites = () => {
    playClick();
    setView(ViewState.FAVORITES);
  };
  
  const handleGoToNotebook = () => {
      playClick();
      setView(ViewState.NOTEBOOK);
  }

  const handleCustomTopicStart = async () => {
    playClick();
    if (!customTopic.trim()) return;

    const newLesson: Lesson = {
      id: `custom-${Date.now()}`,
      title: customTopic,
      subtitle: '自由探索模式',
      category: 'Custom',
      duration: '∞',
      initialPrompt: `我想学习关于"${customTopic}"的日语知识。请作为老师教我。`
    };

    await startLesson(newLesson);
    setCustomTopic('');
  };

  const handleToggleFavorite = (lessonId: string) => {
    playClick(); 
    setFavorites(prev => {
      const newFavs = prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId];
      localStorage.setItem('favorite_lessons', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  // Notebook Collection Handler
  const handleToggleNotebookEntry = (text: string) => {
      setNotebook(prev => {
          const exists = prev.find(entry => entry.text === text);
          let newNotebook;
          if (exists) {
              newNotebook = prev.filter(entry => entry.text !== text);
          } else {
              newNotebook = [{
                  id: `note-${Date.now()}`,
                  text,
                  timestamp: Date.now(),
                  lessonTitle: currentLesson?.title || '自由对话'
              }, ...prev];
          }
          localStorage.setItem('notebook_entries', JSON.stringify(newNotebook));
          return newNotebook;
      });
  };

  const handleCollectAnimation = (startX: number, startY: number) => {
    if (!starJarRef.current) return;
    
    const jarRect = starJarRef.current.getBoundingClientRect();
    const endX = jarRect.left + jarRect.width / 2;
    const endY = jarRect.top + jarRect.height / 2;

    const id = `star-${Date.now()}`;
    setFlyingStars(prev => [...prev, { id, startX, startY, endX, endY }]);
  };

  const handleStarAnimationComplete = (id: string) => {
    setFlyingStars(prev => prev.filter(s => s.id !== id));
    setIsJarBouncing(true);
    setTimeout(() => setIsJarBouncing(false), 300);
  };

  const handleRemoveNotebookEntry = (id: string) => {
      setNotebook(prev => {
          const newNotebook = prev.filter(entry => entry.id !== id);
          localStorage.setItem('notebook_entries', JSON.stringify(newNotebook));
          return newNotebook;
      });
  }

  const startLesson = async (lesson: Lesson) => {
    playClick();
    setCurrentLesson(lesson);
    setView(ViewState.CHAT);
    setMessages([]);
    setSuggestions([]);
    setIsSessionNotesOpen(false); // Reset note drawer
    setInputDisabled(true);
    const tempMsgId = Date.now().toString();

    setMessages([{
        id: tempMsgId,
        role: 'model',
        text: '', 
        timestamp: Date.now(),
        isStreaming: true,
        type: 'chat',
    }]);

    try {
      startChat(lesson);
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

      await addBubblesSequentially(bubbles, tempMsgId);
      
      setSuggestions(suggestionObjects.length > 0 ? suggestionObjects : DEFAULT_SUGGESTIONS);
      setInputDisabled(false);

    } catch (error: any) {
      console.error("Chat Error:", error);
      // Handle Auth Errors gracefully
      if (error.message === 'INVALID_TOKEN' || error.message === 'MISSING_API_KEY') {
        setMessages(prev => prev.filter(p => p.id !== tempMsgId));
        setShowApiKeyModal(true);
        setInputDisabled(false);
        return;
      }

      setMessages(prev => prev.filter(p => p.id !== tempMsgId));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "哎呀，连接出了点问题，请重试 😵",
        timestamp: Date.now(),
        type: 'chat',
      }]);
      setInputDisabled(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsgId = Date.now().toString();
    const newUserMsg: Message = { id: userMsgId, role: 'user', text, timestamp: Date.now(), type: 'chat' };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputDisabled(true);
    setSuggestions([]);

    setTimeout(async () => {
        const tempMsgId = (Date.now() + 1).toString();
    
        setMessages(prev => [...prev, {
            id: tempMsgId,
            role: 'model',
            text: '',
            timestamp: Date.now(),
            isStreaming: true,
            type: 'chat',
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

            await addBubblesSequentially(bubbles, tempMsgId);
            
            setSuggestions(suggestionObjects.length > 0 ? suggestionObjects : DEFAULT_SUGGESTIONS);
            setInputDisabled(false);
    
        } catch (error: any) {
            console.error("Chat Error:", error);
            if (error.message === 'INVALID_TOKEN' || error.message === 'MISSING_API_KEY') {
                setMessages(prev => prev.filter(p => p.id !== tempMsgId));
                setShowApiKeyModal(true);
                setInputDisabled(false);
                return;
            }

            setMessages(prev => prev.filter(p => p.id !== tempMsgId));
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "老师有点累了（连接错误），请稍后再试 😷",
                timestamp: Date.now(),
                type: 'chat',
            }]);
            setInputDisabled(false);
        }
    }, 800);
  };

  const handleGenerateSummary = async () => {
    playClick();
    if (isSummarizing || messages.length < 2) return;
    setIsSummarizing(true);
    setInputDisabled(true);

    try {
        const summaryText = await generateSummary(messages);
        const summaryMessage: Message = {
            id: `summary-${Date.now()}`,
            role: 'model',
            text: summaryText,
            timestamp: Date.now(),
            type: 'summary',
        };
        setMessages(prev => [...prev, summaryMessage]);
    } catch (error: any) {
        console.error("Summary Generation Error:", error);
        if (error.message === 'INVALID_TOKEN' || error.message === 'MISSING_API_KEY') {
            setShowApiKeyModal(true);
        } else {
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'model',
                text: "抱歉，总结的时候好像出了一点小问题... 😵",
                timestamp: Date.now(),
                type: 'chat',
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    } finally {
        setIsSummarizing(false);
        setInputDisabled(false);
    }
  };

  // Explanation Handler - Updated for Dictionary Panel
  const handleExplain = async (text: string) => {
    if (inputDisabled || isSummarizing) return;
    
    // Close session notes if open
    if (isSessionNotesOpen) setIsSessionNotesOpen(false);
    
    // Open Explanation Panel
    setIsExplanationOpen(true);
    setExplanationQuery(text);
    setExplanationResult(null);
    setIsExplaining(true);

    try {
        const result = await explainText(text);
        setExplanationResult(result);
    } catch (error) {
        console.error("Explanation Error:", error);
        setExplanationResult("抱歉，解析服务暂时不可用，请检查网络或 Key。");
    } finally {
        setIsExplaining(false);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, suggestions]);

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
       
       <div className="flex-1 min-w-0">
           <h1 className="text-xl sm:text-2xl font-black font-hand tracking-wide text-blue-950 truncate">{title}</h1>
           {subtitle && <p className="text-xs font-bold text-blue-100 opacity-90 font-hand truncate">{subtitle}</p>}
       </div>
       
       <div className="flex items-center gap-2">
            {!onBack && (
              <>
                 <button onClick={handleGoToNotebook} className="p-2 bg-white border-2 border-blue-950 rounded-lg hover:bg-blue-50 transition-colors shadow-sketchy-sm text-blue-950">
                    <Book size={20} strokeWidth={3} />
                 </button>
                 <button onClick={handleGoToFavorites} className="p-2 bg-yellow-300 border-2 border-blue-950 rounded-lg hover:bg-yellow-200 transition-colors shadow-sketchy-sm">
                    <Star size={20} strokeWidth={3} className="text-blue-950" />
                </button>
             </>
            )}
            <button 
              onClick={() => { playClick(); setIsSettingsOpen(true); }}
              className="p-2 bg-blue-800 border-2 border-blue-950 rounded-lg hover:bg-blue-700 transition-colors shadow-sketchy-sm"
            >
              <SettingsIcon size={20} strokeWidth={2.5} className="text-white" />
            </button>
       </div>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full bg-blue-500 flex flex-col font-sans overflow-hidden relative text-blue-950">
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        bgmEnabled={bgmEnabled}
        setBgmEnabled={setBgmEnabled}
        bgmVolume={bgmVolume}
        setBgmVolume={setBgmVolume}
        ttsSpeed={ttsSpeed}
        setTtsSpeed={setTtsSpeed}
      />

      {/* API Key Modal */}
      {showApiKeyModal && (
        <ApiKeyModal onSave={handleSaveApiKey} />
      )}

      {/* Session Notes Drawer (Only in Chat View) */}
      {view === ViewState.CHAT && currentLesson && (
        <SessionNotes 
          isOpen={isSessionNotesOpen}
          onClose={() => setIsSessionNotesOpen(false)}
          entries={notebook.filter(n => n.lessonTitle === currentLesson.title)}
          onRemoveEntry={handleRemoveNotebookEntry}
          ttsSpeed={ttsSpeed}
          onExplain={handleExplain}
        />
      )}

      {/* Explanation Panel */}
      <ExplanationPanel 
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        loading={isExplaining}
        query={explanationQuery}
        result={explanationResult}
        ttsSpeed={ttsSpeed}
        onExplainNested={handleExplain} // Allows clicking "explain" inside the explanation panel
      />

      {/* Render Flying Stars */}
      {flyingStars.map(star => (
        <FlyingStar
          key={star.id}
          startX={star.startX}
          startY={star.startY}
          endX={star.endX}
          endY={star.endY}
          onComplete={() => handleStarAnimationComplete(star.id)}
        />
      ))}

      {view === ViewState.LANDING && (
        <LandingPage onStart={handleStart} />
      )}

      {view === ViewState.HOME && (
        <div key="home" className="flex-1 flex flex-col h-full animate-enter-app">
          {renderHeader("Grammar Sensei", "选择你的冒险")}
          
          <main className="flex-1 overflow-y-auto p-4 pb-8 min-h-0 scroll-smooth hide-scrollbar chat-bg-pattern">
            
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
                       <div className={`${meta.iconBg} w-24 flex flex-col items-center justify-center border-r-[3px] border-blue-950 p-2`}>
                           <span className={`text-2xl font-black ${meta.color}`}>{meta.level}</span>
                           <span className="text-[10px] font-bold bg-white/30 px-2 py-0.5 rounded-full mt-1 text-blue-950 backdrop-blur-sm">
                              {progress}%
                           </span>
                       </div>
                       
                       <div className="flex-1 p-4 flex flex-col justify-center">
                           <h3 className="text-xl font-black text-blue-950 font-hand">{category}</h3>
                           <p className="text-xs text-blue-500 font-bold leading-tight mt-1">{meta.description}</p>
                       </div>

                       <div className="pr-4 flex items-center justify-center text-blue-300">
                          <ChevronRight size={24} strokeWidth={3} />
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      )}

      {view === ViewState.FAVORITES && (
        <div key="favorites" className="flex-1 flex flex-col h-full animate-enter-app">
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
        </div>
      )}
      
      {view === ViewState.NOTEBOOK && (
        <div key="notebook" className="flex-1 flex flex-col h-full animate-enter-app">
          {renderHeader("我的笔记本", "收藏的金句和生词", handleBackToHome)}
          <main className="flex-1 overflow-y-auto p-4 min-h-0 hide-scrollbar chat-bg-pattern">
             <NotebookView 
                entries={notebook} 
                onRemoveEntry={handleRemoveNotebookEntry} 
                ttsSpeed={ttsSpeed}
             />
          </main>
        </div>
      )}

      {view === ViewState.CATEGORY_DETAILS && selectedCategory && (
        <div key="category" className="flex-1 flex flex-col h-full animate-enter-app">
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
        </div>
      )}

      {view === ViewState.CHAT && currentLesson && (
        <div key="chat" className="flex-1 flex flex-col h-full animate-enter-app">
           <div className="bg-blue-500 text-white px-4 py-3 flex items-center gap-3 border-b-[3px] border-blue-950 shadow-sm z-30 flex-shrink-0">
               <button onClick={currentLesson.category === 'Custom' ? handleBackToHome : handleBackToCategories} className="p-1.5 bg-blue-400 border-2 border-blue-950 rounded-lg hover:bg-blue-300 active:translate-y-0.5 shadow-sketchy-sm">
                   <ArrowLeft size={18} strokeWidth={3} />
               </button>
               <div className="flex-1 min-w-0">
                   <h1 className="text-lg font-black truncate font-hand leading-none">{currentLesson.title}</h1>
                   <p className="text-[10px] font-bold text-blue-200 truncate">{currentLesson.subtitle}</p>
               </div>
               
               <div className="flex items-center gap-2">
                    {/* Session Note Button (Star Jar) */}
                    <button 
                        ref={starJarRef}
                        onClick={() => { playClick(); setIsSessionNotesOpen(true); }}
                        className={`p-1.5 bg-white border-2 border-blue-950 rounded-lg hover:bg-blue-50 transition-all shadow-sketchy-sm relative ${isJarBouncing ? 'scale-110' : 'scale-100'}`}
                    >
                        {/* Custom SVG Jar Icon */}
                        <div className="relative w-5 h-5 flex items-center justify-center">
                            {/* Jar Body */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-950">
                                <path d="M6 4V2H18V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                                <path d="M7 4L5 7V21C5 21.5523 5.44772 22 6 22H18C18.5523 22 19 21.5523 19 21V7L17 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                {/* Fill Level */}
                                {notebook.some(n => n.lessonTitle === currentLesson.title) && (
                                   <rect x="7" y={20 - Math.min(12, Math.max(2, (notebook.filter(n => n.lessonTitle === currentLesson.title).length) * 2))} width="10" height={Math.min(12, Math.max(2, (notebook.filter(n => n.lessonTitle === currentLesson.title).length) * 2))} fill="#FACC15" rx="1" />
                                )}
                            </svg>
                        </div>
                    </button>

                    <button 
                        onClick={() => { playClick(); setIsSettingsOpen(true); }}
                        className="p-1.5 bg-blue-800 border-2 border-blue-950 rounded-lg hover:bg-blue-700 transition-colors shadow-sketchy-sm"
                    >
                        <SettingsIcon size={16} strokeWidth={2.5} className="text-white" />
                    </button>
               </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 scroll-smooth min-h-0 hide-scrollbar chat-bg-pattern relative">
              {messages.map((msg, idx) => {
                 if (msg.type === 'summary') {
                    return <SummaryCard key={msg.id} message={msg} ttsSpeed={ttsSpeed} />
                 }
                 return (
                    <ChatBubble 
                        key={msg.id} 
                        message={msg} 
                        showAvatar={msg.role === 'model' && (!messages[idx-1] || messages[idx-1].role !== 'model')} 
                        fontSize={fontSize}
                        collectedSentences={notebook.map(n => n.text)}
                        onToggleCollect={handleToggleNotebookEntry}
                        ttsSpeed={ttsSpeed}
                        onExplain={handleExplain}
                        onCollectAnim={handleCollectAnimation}
                    />
                 )
              })}
              <div ref={chatEndRef} />
              <SummaryFab 
                onClick={handleGenerateSummary}
                loading={isSummarizing}
                disabled={messages.length < 2}
              />
           </div>

           <ChatInput 
             onSend={handleSendMessage} 
             suggestions={suggestions}
             disabled={inputDisabled || isSummarizing}
           />
        </div>
      )}

    </div>
  );
};

export default App;
