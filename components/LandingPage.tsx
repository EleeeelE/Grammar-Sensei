import React, { useState } from 'react';
import { Sparkles, ArrowRight, Star, MessageCircle, Search, Mic } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleStartClick = () => {
    setIsLaunching(true);
    // Slightly faster transition for a snappier feel (500ms)
    setTimeout(() => {
      onStart();
    }, 500);
  };

  return (
    <div className="h-full w-full flex flex-col bg-blue-500 relative overflow-hidden font-sans">
      {/* Background pattern */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#60A5FA 2px, transparent 2px)', backgroundSize: '24px 24px', opacity: 0.4 }}></div>

      {/* --- Flash Overlay for Transition --- */}
      {isLaunching && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-white animate-[pulse_0.5s_ease-out] opacity-0" style={{ animationFillMode: 'forwards' }}></div>
      )}

      {/* --- Main Content Wrapper (Smooth Zoom & Fade) --- */}
      {/* Changed from scale-[10] to scale-110 for smoothness. Added opacity fade. */}
      <div className={`flex-1 flex flex-col w-full h-full transition-all duration-500 ease-in-out ${isLaunching ? 'scale-110 opacity-0 filter blur-sm' : 'scale-100 opacity-100'}`}>
        
        {/* Header */}
        <div className="flex-none relative z-20 w-full p-6 flex justify-between items-center">
           <div className="flex items-center gap-2">
               <div className="bg-white p-1.5 border-2 border-blue-950 rounded-lg shadow-[2px_2px_0px_0px_#172554] transform -rotate-3">
                   <span className="text-xl font-black">あ</span>
               </div>
               <span className="text-white font-black text-xl tracking-tight font-hand shadow-sm">Grammar Sensei</span>
           </div>
           <div className="bg-blue-600 bg-opacity-50 text-white px-3 py-1 rounded-full text-xs font-bold border border-blue-400">
              @猫小白不白
           </div>
        </div>

        {/* Main Showcase Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center w-full max-w-md mx-auto perspective-[1000px] min-h-0">
          
          {/* --- Floating Phones Container --- */}
          <div className="flex-shrink-0 relative w-full h-[300px] sm:h-[360px] flex items-center justify-center scale-75 sm:scale-90 md:scale-100 transition-transform origin-center my-2 sm:my-6">
              
              {/* Left Screen: List View */}
              <div className="absolute left-4 top-10 w-40 bg-white border-[3px] border-blue-950 rounded-2xl p-3 shadow-sketchy z-10 transform -rotate-6 animate-float origin-bottom-left">
                  <div className="h-3 w-12 bg-blue-100 rounded-full mb-3"></div>
                  <div className="space-y-2">
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 flex items-center gap-2">
                          <div className="w-6 h-6 bg-white border border-blue-500 rounded-full text-[10px] flex items-center justify-center font-bold">1</div>
                          <div className="h-2 w-16 bg-blue-200 rounded-full"></div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border-2 border-blue-950 flex items-center gap-2 shadow-sm transform scale-105">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">2</div>
                          <div className="h-2 w-12 bg-blue-950 rounded-full"></div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 flex items-center gap-2">
                          <div className="w-6 h-6 bg-white border border-blue-500 rounded-full text-[10px] flex items-center justify-center font-bold">3</div>
                          <div className="h-2 w-14 bg-blue-200 rounded-full"></div>
                      </div>
                  </div>
                  <div className="absolute -top-8 -left-4 bg-white border-2 border-blue-950 px-3 py-1 rounded-xl shadow-sketchy-sm transform -rotate-3 z-30 animate-pop-in">
                      <div className="text-xs font-black text-blue-950 flex items-center gap-1">
                          <Search size={12} /> 选课程
                      </div>
                      <div className="absolute bottom-[-6px] left-6 w-3 h-3 bg-white border-b-2 border-r-2 border-blue-950 transform rotate-45"></div>
                  </div>
              </div>

              {/* Right Screen: Flashcard */}
              <div className="absolute right-4 top-4 w-36 bg-blue-100 border-[3px] border-blue-950 rounded-2xl p-3 shadow-sketchy z-0 transform rotate-12 animate-float-slow origin-bottom-right">
                   <div className="bg-white border-2 border-blue-950 rounded-xl aspect-square flex flex-col items-center justify-center mb-2 relative overflow-hidden">
                        <div className="text-4xl font-black text-blue-950 mb-1">形</div>
                        <div className="text-[10px] text-blue-400 font-bold">Keiyoushi</div>
                        <div className="absolute top-1 right-1 text-yellow-400">
                            <Star size={12} fill="currentColor" />
                        </div>
                   </div>
                   <div className="flex justify-center gap-2">
                       <div className="w-8 h-8 bg-white border-2 border-blue-950 rounded-full flex items-center justify-center">
                          <ArrowRight size={14} className="text-blue-950" />
                       </div>
                   </div>
                   <div className="absolute -bottom-6 -right-2 bg-white border-2 border-blue-950 px-3 py-1 rounded-xl shadow-sketchy-sm transform rotate-3 z-30 animate-pop-in" style={{ animationDelay: '0.2s' }}>
                      <div className="text-xs font-black text-blue-950 flex items-center gap-1">
                          <Star size={12} /> 收藏它
                      </div>
                      <div className="absolute top-[-6px] left-4 w-3 h-3 bg-white border-t-2 border-l-2 border-blue-950 transform rotate-45"></div>
                  </div>
              </div>

              {/* Center Screen: Chat */}
              <div className="absolute bottom-0 w-44 bg-white border-[3px] border-blue-950 rounded-[2rem] p-3 shadow-sketchy-lg z-20 animate-float-delayed transform rotate-0">
                  <div className="mx-auto w-12 h-3 bg-blue-50 rounded-b-lg mb-3"></div>
                  <div className="space-y-3 mb-3">
                      {/* Bubble 1: User asking (Right) - Corrected Logic */}
                      <div className="flex justify-end">
                          <div className="bg-blue-500 border border-blue-950 p-2 rounded-lg rounded-tr-none text-[10px] leading-tight text-white shadow-sm">
                              教我日语动词变形...
                          </div>
                      </div>
                      
                      {/* Bubble 2: AI answering (Left) - Corrected Logic */}
                      <div className="flex gap-1">
                          <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-950 flex-shrink-0 flex items-center justify-center">
                               <Sparkles size={12} className="text-blue-500" />
                          </div>
                          <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg rounded-tl-none text-[10px] leading-tight text-blue-900">
                              很简单！只要记住这个口诀... 
                          </div>
                      </div>
                  </div>
                  <div className="border-t-2 border-blue-100 pt-2 flex gap-1">
                      <div className="w-6 h-6 rounded-full bg-red-50 border border-blue-200 flex items-center justify-center">
                          <Mic size={12} className="text-red-400" />
                      </div>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full"></div>
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <ArrowRight size={12} className="text-white" />
                      </div>
                  </div>
                   <div className="absolute top-16 -right-14 bg-white border-2 border-blue-950 px-3 py-1.5 rounded-xl shadow-sketchy-sm transform -rotate-2 z-30 animate-pop-in" style={{ animationDelay: '0.4s' }}>
                      <div className="text-sm font-black text-blue-950 flex items-center gap-1">
                          <MessageCircle size={14} className="fill-blue-200" /> AI 私教
                      </div>
                      <div className="absolute top-2 left-[-6px] w-3 h-3 bg-white border-b-2 border-l-2 border-blue-950 transform rotate-45"></div>
                  </div>
              </div>
          </div>

          {/* Text Content & Button */}
          <div className="flex-none relative z-30 px-6 pb-8 text-center w-full">
               <h1 className="text-4xl font-black text-white drop-shadow-md font-hand mb-2 animate-slide-up">
                  像聊天一样<br/>学地道日语
               </h1>
               <p className="text-blue-100 font-bold mb-6 text-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
                   拒绝枯燥 · AI 互动 · 0 基础通关
               </p>

              <button
                onClick={handleStartClick}
                className="w-full max-w-[240px] mx-auto group relative bg-white text-blue-950 font-black text-xl py-4 px-8 border-[3px] border-blue-950 shadow-[4px_4px_0px_0px_#172554] active-press rounded-2xl font-hand flex items-center justify-center gap-2 animate-slide-up hover:bg-blue-50"
                style={{ animationDelay: '0.2s' }}
              >
                <span>开始大冒险</span>
                <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};