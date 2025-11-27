
import React from 'react';
import { X, Type, Volume2 } from 'lucide-react';
import { FontSize } from '../types';
import { playClick } from '../services/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  soundEnabled,
  setSoundEnabled
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
      <div className="bg-white w-full max-w-sm rounded-3xl border-[3px] border-blue-950 shadow-sketchy-lg relative overflow-hidden animate-pop-in z-50 font-hand">
        
        {/* Header */}
        <div className="bg-blue-500 p-4 border-b-[3px] border-blue-950 flex justify-between items-center">
            <h2 className="text-xl font-black text-white tracking-wide">设置 / Settings</h2>
            <button 
                onClick={handleClose}
                className="bg-blue-400 p-1 rounded-lg border-2 border-blue-950 text-white hover:bg-red-400 transition-colors shadow-sketchy-sm active:translate-y-0.5 active:shadow-none"
            >
                <X size={20} strokeWidth={3} />
            </button>
        </div>

        <div className="p-6 space-y-6">
            
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

            {/* Audio Settings - Simplified to just Click Sound */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-950">
                    <Volume2 size={20} strokeWidth={2.5} />
                    <span className="font-black text-lg">点击音效</span>
                </div>
                <button 
                    onClick={handleToggleSound}
                    className={`w-14 h-8 rounded-full border-[3px] border-blue-950 relative transition-colors shadow-sketchy-sm ${soundEnabled ? 'bg-blue-500' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-blue-950 rounded-full transition-all duration-300 ${soundEnabled ? 'left-[calc(100%-24px)]' : 'left-1'}`}></div>
                </button>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-blue-50 p-4 border-t-[3px] border-blue-950 text-center">
            <p className="text-xs font-bold text-blue-300">Grammar Sensei v1.5 • Clean Mode ✨</p>
        </div>

      </div>
    </div>
  );
};
