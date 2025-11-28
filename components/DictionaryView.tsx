import React from 'react';
import { ExplanationData, GrammarNode } from '../types';
import { generateSpeech } from '../services/geminiService';
import { X, Volume2, Loader2, FileText, GitCommit, List, BookOpen, StickyNote, Languages, ArrowRight, BrainCircuit } from 'lucide-react';
import { playClick } from '../services/audioService';

interface DictionaryViewProps {
  loading: boolean;
  data: ExplanationData | null;
  onClose: () => void;
  ttsSpeed: number;
}

// Recursive component to render the grammar tree
const GrammarNodeComponent: React.FC<{ node: GrammarNode, isLast: boolean }> = ({ node, isLast }) => {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="bg-white border-2 border-blue-950 rounded-lg px-3 py-1 shadow-sketchy-sm text-center">
          <p className="font-bold text-blue-800 text-lg whitespace-nowrap">{node.part}</p>
        </div>
        <div className="w-px h-2 bg-blue-950"></div>
        <div className="bg-blue-100 border border-blue-200 rounded-full px-2 py-0.5 text-[10px] font-black text-blue-500 whitespace-nowrap">
          {node.role}
        </div>
      </div>
      {!isLast && <ArrowRight size={20} className="text-blue-300 mx-2 flex-shrink-0" />}
      {node.children && (
        <div className="flex items-center ml-2">
          {node.children.map((child, index) => (
            <GrammarNodeComponent key={index} node={child} isLast={index === node.children!.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const DictionaryView: React.FC<DictionaryViewProps> = ({ loading, data, onClose, ttsSpeed }) => {

  const handlePlayAudio = async (text: string) => {
    playClick();
    try {
      await generateSpeech(text, ttsSpeed);
    } catch (err) {
      console.error("TTS Error:", err);
    }
  };
  
  const handleClose = () => {
    playClick();
    onClose();
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
          <h2 className="text-2xl font-black text-blue-950">正在解析...</h2>
          <p className="text-blue-400 font-bold">Sensei 正在查阅古籍</p>
        </div>
      );
    }
    
    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <FileText size={48} className="text-blue-300 mb-4" />
            <h2 className="text-2xl font-black text-blue-400">无法解析</h2>
            <p className="text-blue-400 font-bold">未能获取句子的详细信息。</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Target Sentence */}
          <div className="bg-white border-[3px] border-blue-950 rounded-2xl shadow-sketchy overflow-hidden">
            <div className="bg-blue-500 text-white text-xs font-black uppercase px-4 py-1 tracking-wider">目标句子</div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handlePlayAudio(data.targetSentence)} 
                  className="w-16 h-16 bg-blue-50 rounded-full border-2 border-blue-200 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors active:scale-95 shadow-sm"
                >
                  <Volume2 size={32} />
                </button>
                <div className="flex-1">
                  <p className="text-2xl font-black text-blue-950 mb-1">{data.targetSentence}</p>
                  <p className="text-gray-500 font-bold">{data.translation}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Grammar Structure */}
          <div className="bg-white border-[3px] border-blue-950 rounded-2xl shadow-sketchy flex-1">
            <div className="border-b-[3px] border-blue-950 px-4 py-2 flex items-center gap-2">
              <BrainCircuit size={16} className="text-blue-500" strokeWidth={2.5}/>
              <h3 className="text-sm font-black uppercase text-blue-950">语法结构树</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start overflow-x-auto pb-4 hide-scrollbar cursor-grab active:cursor-grabbing">
                {data.grammarTree.tree.map((node, index) => (
                  <GrammarNodeComponent key={index} node={node} isLast={index === data.grammarTree.tree.length - 1} />
                ))}
              </div>
              <p className="text-sm text-blue-800 font-bold mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <span className="font-black text-blue-950">总结:</span> {data.grammarTree.summary}
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="flex flex-col gap-6">
            {/* Context Note */}
            <div className="bg-yellow-100 border-2 border-yellow-300 p-6 rounded-lg shadow-sketchy transform -rotate-1 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-6 bg-white/50 backdrop-blur-sm rounded-t-sm border-t-2 border-l-2 border-r-2 border-white/30"></div>
                <h3 className="font-black text-yellow-900 text-lg flex items-center gap-2 mb-2">
                    <StickyNote size={20} /> 情景说明
                </h3>
                <p className="text-yellow-800 font-bold leading-relaxed">{data.context}</p>
            </div>

            {/* Vocabulary Breakdown */}
            <div className="bg-white border-[3px] border-blue-950 rounded-2xl shadow-sketchy flex-1">
                <div className="border-b-[3px] border-blue-950 px-4 py-2 flex items-center gap-2">
                    <List size={16} className="text-blue-500" strokeWidth={2.5}/>
                    <h3 className="text-sm font-black uppercase text-blue-950">词汇解析</h3>
                </div>
                <div className="p-4 space-y-2">
                    {data.vocabulary.map((item, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 items-start p-3 border-b border-blue-100 last:border-b-0">
                            <div className="col-span-2">
                                <p className="font-black text-blue-950 text-lg">{item.word}</p>
                                <p className="text-xs text-blue-400 font-bold">{item.reading}</p>
                            </div>
                            <div className="col-span-2 text-left">
                                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold border border-blue-200 inline-block">{item.type}</span>
                            </div>
                            <div className="col-span-1 font-bold text-blue-700 text-base text-right">{item.meaning}</div>
                        </div>
                    ))}
                </div>
            </div>

             {/* Synonyms */}
            {data.synonyms && data.synonyms.length > 0 && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 shadow-sketchy-sm">
                    <h3 className="font-black text-emerald-900 text-md flex items-center gap-2 mb-2">
                        <Languages size={18} /> 近义表达
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                        {data.synonyms.map((syn, index) => (
                            <li key={index} className="font-bold text-emerald-800">{syn}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 p-4 animate-[fadeIn_0.3s_ease-out] font-hand overflow-hidden flex items-center justify-center">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm"
            onClick={handleClose}
        ></div>
      <div className="relative z-10 bg-white w-full max-w-5xl rounded-2xl border-[3px] border-blue-950 shadow-sketchy-lg my-8 animate-pop-in flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="border-b-[3px] border-blue-950 p-4 flex justify-between items-center bg-blue-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 border-2 border-blue-950 rounded-lg flex items-center justify-center shadow-sm transform -rotate-3">
                <BookOpen size={24} className="text-blue-500" strokeWidth={2.5}/>
            </div>
            <div>
                <h2 className="text-xl font-black text-blue-950">句子解析</h2>
                {data && <p className="text-xs font-bold text-blue-400">频率: {data.frequency} &bull; 等级: {data.level}</p>}
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 bg-white border-2 border-blue-950 rounded-full flex items-center justify-center text-blue-950 hover:bg-red-100 hover:text-red-500 transition-colors shadow-sketchy-sm active:translate-y-0.5 active:shadow-none"
          >
            <X size={24} strokeWidth={3}/>
          </button>
        </div>
        
        {/* Content Body */}
        <div className="flex-1 overflow-y-auto hide-scrollbar chat-bg-pattern">
             {renderContent()}
        </div>
      </div>
    </div>
  );
};