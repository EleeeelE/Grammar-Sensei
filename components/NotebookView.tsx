
import React, { useState } from 'react';
import { NotebookEntry } from '../types';
import { generateSpeech } from '../services/geminiService';
import { Volume2, Trash2, Calendar, Book, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { playClick } from '../services/audioService';

interface NotebookViewProps {
  entries: NotebookEntry[];
  onRemoveEntry: (id: string) => void;
  ttsSpeed: number;
}

export const NotebookView: React.FC<NotebookViewProps> = ({ entries, onRemoveEntry, ttsSpeed }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    playClick();
    setExpandedId(expandedId === id ? null : id);
  };

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

  if (entries.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-white animate-pop-in p-8">
            <Book size={48} className="mb-4 opacity-30" strokeWidth={2}/>
            <h2 className="text-2xl font-black font-hand">笔记本是空的</h2>
            <p className="text-sm font-bold opacity-80 mt-2">
                在聊天中点击句子旁边的星星 ✨<br/>即可将句子收藏到这里！
            </p>
        </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Notebook Cover Decoration */}
      <div className="bg-yellow-100 border-[3px] border-blue-950 p-4 rounded-xl shadow-sketchy mb-6 transform rotate-1">
          <h2 className="text-blue-950 font-black text-xl flex items-center gap-2">
              <Book size={24} /> 我的生词本
          </h2>
          <p className="text-blue-500 font-bold text-xs mt-1">共收藏 {entries.length} 个句子</p>
      </div>

      {entries.map((entry, index) => {
        const isExpanded = expandedId === entry.id;
        const dateStr = new Date(entry.timestamp).toLocaleDateString();

        return (
          <div 
            key={entry.id}
            onClick={() => toggleExpand(entry.id)}
            className={`
                bg-white border-[3px] border-blue-950 shadow-sketchy rounded-xl overflow-hidden cursor-pointer transition-all
                ${isExpanded ? 'scale-[1.02] z-10' : 'hover:-translate-y-1 hover:shadow-sketchy-lg'}
            `}
          >
            <div className="p-4 flex items-start gap-3">
               <div className="mt-1 font-black text-blue-300 text-xs">
                   #{entries.length - index}
               </div>
               
               <div className="flex-1">
                   <h3 className={`font-bold font-hand text-lg text-blue-950 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                       {entry.text}
                   </h3>
                   {entry.lessonTitle && (
                       <p className="text-[10px] text-blue-400 font-bold mt-2 flex items-center gap-1">
                           <Book size={10} /> 来自: {entry.lessonTitle}
                       </p>
                   )}
               </div>

               <div className="flex flex-col items-center gap-2">
                   {isExpanded ? <ChevronUp size={20} className="text-blue-300"/> : <ChevronDown size={20} className="text-blue-300"/>}
               </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="bg-blue-50 p-4 border-t-2 border-dashed border-blue-200 animate-[slideUp_0.2s_ease-out]">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                            <Calendar size={10} /> {dateStr}
                        </span>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={(e) => handlePlay(e, entry.text, entry.id)}
                                className="p-2 bg-blue-500 text-white rounded-lg border-2 border-blue-950 shadow-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 font-bold text-xs"
                                disabled={playingId === entry.id}
                            >
                                {playingId === entry.id ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
                                发音
                            </button>
                            <button 
                                onClick={(e) => handleDelete(e, entry.id)}
                                className="p-2 bg-white text-red-500 rounded-lg border-2 border-blue-950 shadow-sm active:translate-y-0.5 active:shadow-none transition-all"
                            >
                                <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
