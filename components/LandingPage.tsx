
import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-green-50 via-white to-white p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-10%] w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center text-center animate-[fadeInUp_0.8s_ease-out]">
        
        {/* Logo / Icon */}
        <div className="mb-8 relative group cursor-pointer" onClick={onStart}>
          <div className="absolute inset-0 bg-green-400 rounded-[2rem] rotate-6 opacity-20 group-hover:rotate-12 transition-transform duration-500"></div>
          <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-green-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-green-200 relative z-10 transform transition-transform duration-300 group-hover:scale-105">
            <span className="text-5xl font-bold font-serif">あ</span>
            <div className="absolute -top-2 -right-2 bg-white text-green-600 rounded-full p-1.5 shadow-sm">
              <Sparkles size={20} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          日语语法 <span className="text-green-600">Sensei</span>
        </h1>

        {/* Slogan */}
        <p className="text-gray-500 mb-12 max-w-[260px] leading-relaxed text-sm font-medium">
          告别枯燥的教科书。<br />
          像聊天一样，轻松掌握地道日语。
        </p>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="group relative overflow-hidden rounded-full bg-gray-900 px-8 py-4 text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl active:scale-95"
        >
          <div className="relative z-10 flex items-center gap-2 text-sm font-semibold tracking-wide">
            开始学习之旅
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        </button>
        
        {/* Footer Info */}
        <p className="absolute bottom-8 text-[10px] text-gray-300 uppercase tracking-widest">
          Interactive Grammar Tutor
        </p>
      </div>
    </div>
  );
};
