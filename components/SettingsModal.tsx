


import React from 'react';
import { X, Type, Volume2, Music, RefreshCw, Gauge, Smile } from 'lucide-react';
import { FontSize, TeacherPersona } from '../types';
import { TEACHER_PERSONAS } from '../constants';
import { playClick, shuffleBgm } from '../services/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  bgmEnabled: boolean;
  setBgmEnabled: (enabled: boolean) => void;
  bgmVolume: number;
  setBgmVolume: (vol: number) => void;
  ttsSpeed: number;
  setTtsSpeed: (speed: number) => void;
  persona: TeacherPersona;
  setPersona: (persona: TeacherPersona) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  soundEnabled,
  setSoundEnabled,
  bgmEnabled,
  setBgmEnabled,
  bgmVolume,
  setBgmVolume,
  ttsSpeed,
  setTtsSpeed,
  persona,
  setPersona
}) => {
  if (!isOpen) return null;

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'small', label: '小' },
    { value: 'normal', label: '中' },
    { value: 'large', label: '大' },
    { value: 'xl', label: '特大' },
  ];

  const handleToggleSound = () => {
      playClick();
      setSoundEnabled(!soundEnabled);
  }

  const handleToggleBgm = () => {
      playClick();
      setBgmEnabled(!bgmEnabled);
  }

  const handleShuffleBgm = (e: React.MouseEvent) => {
      e.stopPropagation();
      playClick();
      shuffleBgm();
  }

  const handleClose = () => {
      playClick();
      onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white w-full max-w-sm rounded-3xl border-[3px] border-blue-950 shadow-sketchy-lg relative overflow-hidden animate-pop-in z-50 font-hand max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-blue-500 p-4 border-b-[3px] border-blue-950 flex justify-between items-center shrink-0">
            <h2 className="text-xl font-black text-white tracking-wide">设置 / Settings</h2>
            <button 
                onClick={handleClose}
                className="bg-blue-400 p-1 rounded-lg border-2 border-blue-950 text-white hover:bg-red-400 transition-colors shadow-sketchy-sm active:translate-y-0.5 active:shadow-none"
            >
                <X size={20} strokeWidth={3} />
            </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto hide-scrollbar">
            
            {/* Persona Section (New) */}
            <div>
                <div className="flex items-center gap-2 mb-3 text-blue-950">
                    <Smile size={20} strokeWidth={2.5} />
                    <span className="font-black text-lg">老师风格 (Persona)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(TEACHER_PERSONAS).map(([key, config]) => {
                        const isSelected = persona === key;
                        return (
                            <button
                                key={key}
                                onClick={() => { playClick(); setPersona(key as TeacherPersona); }}
                                className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center text-center
                                    ${isSelected
                                        ? 'bg-blue-100 border-blue-500 shadow-sketchy-sm'
                                        : 'bg-white border-blue-100 hover:border-blue-300'
                                    }
                                `}
                            >
                                <span className="text-2xl mb-1">{config.emoji}</span>
                                <span className={`text-sm font-black ${isSelected ? 'text-blue-600' : 'text-blue-950'}`}>
                                    {config.label}
                                </span>
                                <span className="text-[10px] text-blue-400 font-bold leading-tight mt-1 opacity-80">
                                    {config.description}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-blue-100"></div>

            {/* Font Size Section */}
            <div>
                <div className="flex items-center gap-2 mb-3 text-blue-950">
                    <Type size={20} strokeWidth={2.5} />
                    <span className="font-black text-lg">对话框字体大小</span>
                </div>
                <div className="flex gap-2">
                    {fontSizes.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { playClick(); setFontSize(opt.value); }}
                            className={`flex-1 py-2 rounded-xl border-2 font-bold text-sm transition-all
                                ${fontSize === opt.value 
                                    ? 'bg-blue-500 border-blue-950 text-white shadow-sketchy-sm transform -translate-y-1' 
                                    : 'bg-white border-blue-200 text-blue-300 hover:border-blue-400'
                                }
                            `}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-blue-100"></div>

            {/* TTS Speed Section */}
            <div>
                 <div className="flex items-center gap-2 mb-3 text-blue-950">
                    <Gauge size={20} strokeWidth={2.5} />
                    <span className="font-black text-lg">语音朗读速度: {ttsSpeed}x</span>
                 </div>
                 <div className="bg-blue-50 rounded-lg border-2 border-blue-100 p-4">
                    <input 
                        type="range" 
                        min="0.5" 
                        max="1.5" 
                        step="0.1" 
                        value={ttsSpeed}
                        onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between mt-2 text-xs font-bold text-blue-400">
                        <span>🐢 慢 (0.5)</span>
                        <span>正常</span>
                        <span>快 (1.5) 🐇</span>
                    </div>
                 </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-blue-100"></div>

            {/* BGM Settings */}
            <div>
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-blue-950">
                        <Music size={20} strokeWidth={2.5} />
                        <span className="font-black text-lg">背景音乐</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                             onClick={handleShuffleBgm}
                             className="p-1.5 bg-blue-100 text-blue-500 rounded-lg border-2 border-blue-200 hover:bg-blue-200 active:scale-95 transition-all"
                             title="换一首"
                        >
                            <RefreshCw size={16} strokeWidth={2.5} />
                        </button>
                        <button 
                            onClick={handleToggleBgm}
                            className={`w-12 h-7 rounded-full border-[3px] border-blue-950 relative transition-colors shadow-sketchy-sm ${bgmEnabled ? 'bg-blue-500' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-950 rounded-full transition-all duration-300 ${bgmEnabled ? 'left-[calc(100%-20px)]' : 'left-1'}`}></div>
                        </button>
                    </div>
                 </div>
                 
                 {/* Volume Slider */}
                 <div className={`transition-all duration-300 ${bgmEnabled ? 'opacity-100 max-h-12' : 'opacity-40 max-h-12 pointer-events-none grayscale'}`}>
                     <div className="bg-blue-50 rounded-lg border-2 border-blue-100 p-2 flex items-center gap-3">
                        <Volume2 size={16} className="text-blue-300" />
                        <input 
                            type="range" 
                            min="0" 
                            max="0.4" 
                            step="0.01" 
                            value={bgmVolume}
                            onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                     </div>
                 </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-dashed border-blue-100"></div>

            {/* SFX Settings */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-950">
                    <Volume2 size={20} strokeWidth={2.5} />
                    <span className="font-black text-lg">点击音效</span>
                </div>
                <button 
                    onClick={handleToggleSound}
                    className={`w-12 h-7 rounded-full border-[3px] border-blue-950 relative transition-colors shadow-sketchy-sm ${soundEnabled ? 'bg-blue-500' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-950 rounded-full transition-all duration-300 ${soundEnabled ? 'left-[calc(100%-20px)]' : 'left-1'}`}></div>
                </button>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-blue-50 p-4 border-t-[3px] border-blue-950 text-center shrink-0">
            <p className="text-xs font-bold text-blue-300">Grammar Sensei v1.7 • Chill Beats 🎵</p>
        </div>

      </div>
    </div>
  );
};
