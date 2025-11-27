import React, { useState } from 'react';
import { NotebookEntry } from '../types';
import { generateSpeech } from '../services/geminiService';
import { Volume2, Trash2, X, Star, Loader2, Search } from 'lucide-react';
import { playClick } from '../services/audioService';

interface SessionNotesProps {
  isOpen: boolean;
  onClose: () => void;
  entries: NotebookEntry[];
  onRemoveEntry: (id: string) => void;
  ttsSpeed: number;
  onExplain?: (text: string) => void;
}

export const SessionNotes: React.FC<SessionNotesProps> = ({ 
  isOpen, 
  onClose, 
  entries, 
  onRemoveEntry,
  ttsSpeed,
  onExplain
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = async (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    if (playingId) return;
    
    playClick();
    setPlayingId(id);
    try {
      await generateSpeech(text, ttsSpeed);
    } catch (error) {
      console.error(error);
    } finally {
      setPlayingId(null);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playClick();
    onRemoveEntry(id);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-blue-950/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={onClose}
        ></div>
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white border-l-[3px] border-blue-950 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out font-hand ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="bg-blue-500 p-4 border-b-[3px] border-blue-950 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
                <Star size={20} strokeWidth={3} fill="currentColor" className="text-yellow-300" />
                <h2 className="text-xl font-black">当堂笔记</h2>
            </div>
            <button 
                onClick={onClose}
                className="bg-blue-400 p-1 rounded-lg border-2 border-blue-950 text-white hover:bg-red-400 transition-colors shadow-sketchy-sm active:translate-y-0.5 active:shadow-none"
            >
                <X size={20} strokeWidth={3} />
            </button>
        </div>

        {/* Content */}
        <div className="p-4 h-[calc(100%-68px)] overflow-y-auto hide-scrollbar bg-blue-50">
            {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-2">
                    <Star size={40} className="text-blue-300" strokeWidth={2} />
                    <p className="text-blue-950 font-bold">还没有收藏句子哦</p>
                    <p className="text-xs text-blue-400">点击气泡里的 ⭐ 收藏</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {entries.map((entry, index) => (
                        <div key={entry.id} className="bg-white border-2 border-blue-950 rounded-xl p-3 shadow-sketchy-sm animate-[popIn_0.3s_ease-out]" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex justify-between items-start gap-2">
                                <span className="font-bold text-blue-950 text-lg leading-relaxed flex-1">
                                    {entry.text}
                                </span>
                                <button 
                                    onClick={(e) => handleDelete(e, entry.id)}
                                    className="text-red-300 hover:text-red-500 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t border-dashed border-blue-100 flex justify-end gap-2">
                                {onExplain && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playClick();
                                            onExplain(entry.text);
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-500 border-2 border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
                                    >
                                        <Search size={14} />
                                        详解
                                    </button>
                                )}
                                <button 
                                    onClick={(e) => handlePlay(e, entry.text, entry.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors"
                                    disabled={playingId === entry.id}
                                >
                                    {playingId === entry.id ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                                    朗读
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </>
  );
};