


import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Message, Lesson, SuggestedReply, FontSize, NotebookEntry, TeacherPersona } from './types';
import { PREDEFINED_LESSONS, DEFAULT_SUGGESTIONS, LESSON_CATEGORIES, CATEGORY_META, TEACHER_PERSONAS } from './constants';
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
import { VerbConjugationTable } from './components/VerbConjugationTable';
import { KeigoTable } from './components/KeigoTable';
import { BookOpen, ChevronRight, ArrowLeft, Star, Sparkles, Settings as SettingsIcon, Book, Search, X, Hash, ArrowRight as ArrowIcon, Table, Crown } from 'lucide-react';

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

export const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedReply[]>([]);
  
  const [customTopic, setCustomTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // New State for Search
  const [jumpNum, setJumpNum] = useState(''); // State for separate number jump input
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
  const [persona, setPersona] = useState<TeacherPersona>('default'); // Default Persona
  
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
                // Slower delay calculation for comfortable reading
                // Base delay: 1500ms (1.5s)
                // Per char: 80ms (approx 12 chars per second)
                // Max delay: 5000ms (5s)
                const delay = Math.min(5000, Math.max(1500, bubbleText.length * 80));
                
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
                
                // Thinking animation duration (1s)
                setTimeout(() => {
                    processBubble(index + 1, nextThinkingId);
                }, 1000);

                }, delay);
            } else {
                resolve();
            }
        };

        // Initial delay before the first bubble converts from thinking state
        setTimeout(() => {
            processBubble(0, initialThinkingId);
        }, 1000);
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

    const savedPersona = localStorage.getItem('teacherPersona');
    if (savedPersona && TEACHER_PERSONAS[savedPersona as TeacherPersona]) {
        setPersona(savedPersona as TeacherPersona);
    }

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
    localStorage.setItem('teacherPersona', persona);
  }, [persona]);

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
    setSearchQuery(''); // Reset search when entering category
    setJumpNum(''); // Reset jump num
    setView(ViewState.CATEGORY_DETAILS);
  };

  const handleBackToHome = () => {
    playClick();
    setSelectedCategory(null);
    setSearchQuery(''); // Reset search when going home
    setView(ViewState.HOME);
  };

  const handleBackToCategories = () => {
    playClick();
    setView(ViewState.CATEGORY_DETAILS);
    setCurrentLesson(null);
    setMessages([]);
  };

  const handleChatBack = () => {
    if (currentLesson?.category === 'Verb Conjugation') {
        playClick();
        setView(ViewState.VERB_TABLE);
        setCurrentLesson(null);
        setMessages([]);
    } else if (currentLesson?.category === 'Keigo Training') {
        playClick();
        setView(ViewState.KEIGO_TABLE);
        setCurrentLesson(null);
        setMessages([]);
    } else if (currentLesson?.category === 'Custom' || currentLesson?.mode === 'roleplay') {
        handleBackToHome();
    } else {
        handleBackToCategories();
    }
  };
  
  const handleGoToFavorites = () => {
    playClick();
    setView(ViewState.FAVORITES);
  };
  
  const handleGoToNotebook = () => {
      playClick();
      setView(ViewState.NOTEBOOK);
  }

  const handleGoToVerbTable = () => {
      playClick();
      setView(ViewState.VERB_TABLE);
  }

  const handleGoToKeigoTable = () => {
      playClick();
      setView(ViewState.KEIGO_TABLE);
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
      // Pass the selected persona prompt to the chat start
      const currentPersonaPrompt = TEACHER_PERSONAS[persona].prompt;
      startChat(lesson, currentPersonaPrompt);
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
      // GUARANTEE: Slice options to max 3 to prevent UI overflow
      const suggestionObjects = options.slice(0, 3).map(opt => ({ label: opt, value: opt }));

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
            // GUARANTEE: Slice options to max 3 to prevent UI overflow
            const suggestionObjects = options.slice(0, 3).map(opt => ({ label: opt, value: opt }));

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

  // Search Filter Helpers
  const renderSearchBar = (placeholder: string) => (
      <div className="bg-blue-500 px-4 pb-5 pt-3 border-b-[3px] border-blue-950 flex-shrink-0 z-20">
          <div className="bg-white rounded-xl border-2 border-blue-950 flex items-center px-3 py-3 shadow-sketchy-sm focus-within:shadow-sketchy transition-all">
              <Search size={22} className="text-blue-300 mr-2" />
              <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent border-none outline-none font-bold text-blue-950 placeholder-blue-300 font-hand text-lg"
              />
              {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 text-blue-300 hover:text-blue-500">
                      <X size={20} />
                  </button>
              )}
          </div>
      </div>
  );
  
  const handleJumpToLesson = () => {
    if (!jumpNum) return;
    playClick();
    setSearchQuery(jumpNum);
  }

  // Helper to get consistent index
  const getLessonIndexByCategory = (lesson: Lesson) => {
     const catLessons = PREDEFINED_LESSONS.filter(l => l.category === lesson.category);
     return catLessons.findIndex(l => l.id === lesson.id);
  };

  const getFilteredLessons = (category?: string) => {
      const query = searchQuery.toLowerCase().trim();
      
      // If filtering by specific category, enable searching by serial number
      if (category) {
          const categoryLessons = PREDEFINED_LESSONS.filter(l => l.category === category);
          
          if (!query) return categoryLessons;

          return categoryLessons.filter((l, index) => {
              const serial = (index + 1).toString();
              return (
                  l.title.toLowerCase().includes(query) || 
                  l.subtitle.toLowerCase().includes(query) ||
                  serial === query // Strict equality for exact number search if jumped
                  || serial.includes(query) // Partial match for typing
              );
          });
      }

      // Global Search
      return PREDEFINED_LESSONS.filter(l => {
          return l.title.toLowerCase().includes(query) || 
                 l.subtitle.toLowerCase().includes(query) ||
                 l.category.toLowerCase().includes(query);
      });
  };

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
        persona={persona}
        setPersona={setPersona}
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
          
          {/* Global Search Bar */}
          {renderSearchBar("搜索知识点...")}
          
          <main className="flex-1 overflow-y-auto p-4 pb-8 min-h-0 scroll-smooth hide-scrollbar chat-bg-pattern">
            
            {/* Show search results if searching, otherwise show standard home content */}
            {searchQuery ? (
                <div className="space-y-4 pb-6">
                    {getFilteredLessons().length > 0 ? (
                        getFilteredLessons().map((lesson) => (
                            <LessonCard
                                key={lesson.id}
                                lesson={lesson}
                                index={getLessonIndexByCategory(lesson)} // Show static index (Lesson 1 is 1)
                                onClick={() => startLesson(lesson)}
                                isCompleted={completedLessons.includes(lesson.id)}
                                isFavorite={favorites.includes(lesson.id)}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 opacity-50">
                            <Search size={48} className="mx-auto mb-2" strokeWidth={2}/>
                            <p className="font-bold">没有找到相关课程</p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* --- Free Exploration (Full Width) --- */}
                    <div className="mb-4 bg-white p-4 rounded-2xl border-[3px] border-blue-950 shadow-sketchy animate-pop-in">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-blue-100 border-2 border-blue-950 p-1.5 rounded-lg shadow-sm transform -rotate-6">
                                <Sparkles size={18} className="text-blue-600" strokeWidth={3}/>
                            </div>
                            <h2 className="font-black text-lg">自由探索</h2>
                        </div>
                        <p className="text-xs font-bold text-blue-500 mb-3">想学什么你说了算！</p>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={customTopic}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                placeholder="输入话题..."
                                className="flex-1 bg-blue-50 border-2 border-blue-950 rounded-xl px-3 py-2 font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-300 font-hand placeholder-blue-300 min-w-0"
                                onKeyDown={(e) => e.key === 'Enter' && handleCustomTopicStart()}
                            />
                            <button 
                                onClick={handleCustomTopicStart}
                                disabled={!customTopic.trim()}
                                className="bg-blue-500 text-white border-2 border-blue-950 rounded-xl px-3 font-black shadow-sketchy-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                GO
                            </button>
                        </div>
                    </div>

                    {/* --- Tables Grid (Side by Side) --- */}
                    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pop-in" style={{ animationDelay: '100ms' }}>
                        
                        {/* Verb Table Card */}
                        <div 
                            onClick={handleGoToVerbTable}
                            className="bg-white p-4 rounded-2xl border-[3px] border-blue-950 shadow-sketchy cursor-pointer active:scale-95 transition-transform flex flex-col justify-between"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-blue-200 border-2 border-blue-950 p-1.5 rounded-lg shadow-sm transform rotate-3">
                                    <Table size={18} className="text-blue-700" strokeWidth={3}/>
                                </div>
                                <h2 className="font-black text-lg">动词变形表</h2>
                            </div>
                            <p className="text-xs font-bold text-blue-500 mb-2">一表通关！包含五段、一段、不规则动词的所有常用变形。</p>
                            <div className="flex justify-end">
                                <span className="text-[10px] font-black bg-blue-50 text-blue-400 px-2 py-1 rounded-lg border border-blue-100">Cheat Sheet</span>
                            </div>
                        </div>

                        {/* Keigo Table Card (Updated to Sky Blue) */}
                        <div 
                             onClick={handleGoToKeigoTable}
                             className="bg-white p-4 rounded-2xl border-[3px] border-blue-950 shadow-sketchy cursor-pointer active:scale-95 transition-transform flex flex-col justify-between"
                         >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-sky-200 border-2 border-blue-950 p-1.5 rounded-lg shadow-sm transform -rotate-2">
                                    <Crown size={18} className="text-sky-700" strokeWidth={3}/>
                                </div>
                                <h2 className="font-black text-lg">日语敬语表</h2>
                            </div>
                            <p className="text-xs font-bold text-blue-500 mb-2">一表搞定！尊敬语、谦让语、丁宁语的规则与特殊变化。</p>
                            <div className="flex justify-end">
                                <span className="text-[10px] font-black bg-sky-50 text-sky-500 px-2 py-1 rounded-lg border border-sky-100">Cheat Sheet</span>
                            </div>
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
                </>
            )}
          </main>
        </div>
      )}

      {view === ViewState.VERB_TABLE && (
         <VerbConjugationTable onBack={handleBackToHome} onStartLesson={startLesson} />
      )}
      
      {view === ViewState.KEIGO_TABLE && (
         <KeigoTable onBack={handleBackToHome} onStartLesson={startLesson} />
      )}

      {view === ViewState.FAVORITES && (
        <div key="favorites" className="flex-1 flex flex-col h-full animate-enter-app">
          {renderHeader("我的收藏", "你最喜欢的课程都在这里", handleBackToHome)}
          <main className="flex-1 overflow-y-auto p-4 min-h-0 hide-scrollbar chat-bg-pattern">
            {favorites.length > 0 ? (
              <div className="space-y-4 pb-6">
                {PREDEFINED_LESSONS
                  .filter(lesson => favorites.includes(lesson.id))
                  .map((lesson) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      index={getLessonIndexByCategory(lesson)}
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
          
          {/* Custom Search Toolbar for Category View */}
          <div className="bg-blue-500 px-4 pb-5 pt-3 border-b-[3px] border-blue-950 flex-shrink-0 z-20 flex gap-2">
              {/* Keyword Search */}
              <div className="bg-white rounded-xl border-2 border-blue-950 flex items-center px-3 py-3 shadow-sketchy-sm focus-within:shadow-sketchy transition-all flex-1 min-w-0">
                  <Search size={22} className="text-blue-300 mr-2 flex-shrink-0" />
                  <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索标题..."
                      className="flex-1 bg-transparent border-none outline-none font-bold text-blue-950 placeholder-blue-300 font-hand text-lg min-w-0"
                  />
                  {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="p-1 text-blue-300 hover:text-blue-500 flex-shrink-0">
                          <X size={20} />
                      </button>
                  )}
              </div>

              {/* Number Jump Input - Separate Component */}
              <div className="bg-white rounded-xl border-2 border-blue-950 flex items-center px-2 py-3 shadow-sketchy-sm w-28 flex-shrink-0">
                    <Hash size={16} className="text-blue-300 mr-1 flex-shrink-0" />
                    <input 
                        type="number"
                        value={jumpNum}
                        onChange={(e) => setJumpNum(e.target.value)}
                        placeholder="序号"
                        className="w-full bg-transparent border-none outline-none font-black text-blue-950 placeholder-blue-300 font-hand text-lg text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleJumpToLesson()}
                    />
                    <button 
                        onClick={handleJumpToLesson}
                        className="bg-blue-500 text-white p-1 rounded-md ml-1 hover:bg-blue-600 active:scale-95"
                    >
                        <ArrowIcon size={14} strokeWidth={4} />
                    </button>
              </div>
          </div>
          
          <main className="flex-1 overflow-y-auto p-4 min-h-0 hide-scrollbar chat-bg-pattern">
            <div className="space-y-4 pb-6">
                {getFilteredLessons(selectedCategory).length > 0 ? (
                    getFilteredLessons(selectedCategory).map((lesson) => (
                        <LessonCard 
                            key={lesson.id}
                            lesson={lesson}
                            index={getLessonIndexByCategory(lesson)} // Use global category index
                            onClick={() => startLesson(lesson)}
                            isCompleted={completedLessons.includes(lesson.id)}
                            isFavorite={favorites.includes(lesson.id)}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 opacity-50">
                        <Search size={48} className="mx-auto mb-2" strokeWidth={2}/>
                        <p className="font-bold text-blue-950">没有找到相关课程</p>
                    </div>
                )}
            </div>
          </main>
        </div>
      )}

      {view === ViewState.CHAT && currentLesson && (
        <div key="chat" className="flex-1 flex flex-col h-full animate-enter-app">
           <div className="bg-blue-500 text-white px-4 py-3 flex items-center gap-3 border-b-[3px] border-blue-950 shadow-sm z-30 flex-shrink-0">
               <button onClick={handleChatBack} className="p-1.5 bg-blue-400 border-2 border-blue-950 rounded-lg hover:bg-blue-300 active:translate-y-0.5 shadow-sketchy-sm">
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
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </button>
               </div>
           </div>
           
           <main className="flex-1 overflow-y-auto p-4 min-h-0 hide-scrollbar chat-bg-pattern flex flex-col">
                <div className="flex-1">
                    {messages.map((msg, index) => (
                        msg.type === 'summary' ? (
                            <SummaryCard 
                                key={msg.id} 
                                message={msg} 
                                ttsSpeed={ttsSpeed} 
                            />
                        ) : (
                            <ChatBubble 
                                key={msg.id} 
                                message={msg} 
                                showAvatar={msg.role === 'model'}
                                fontSize={fontSize}
                                collectedSentences={notebook.map(n => n.text)}
                                onToggleCollect={handleToggleNotebookEntry}
                                ttsSpeed={ttsSpeed}
                                onExplain={handleExplain}
                                onCollectAnim={handleCollectAnimation}
                            />
                        )
                    ))}
                    <div ref={chatEndRef} />
                </div>
           </main>

           <ChatInput 
                onSend={handleSendMessage} 
                suggestions={suggestions}
                disabled={inputDisabled} 
           />

           <SummaryFab 
                onClick={handleGenerateSummary} 
                loading={isSummarizing}
                disabled={inputDisabled || messages.length < 2}
           />
        </div>
      )}
    </div>
  );
};
