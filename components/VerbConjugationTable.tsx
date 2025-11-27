
import React, { useState } from 'react';
import { ArrowLeft, Info, Dumbbell, Zap, BookOpen, X, Send } from 'lucide-react';
import { Lesson } from '../types';

interface VerbConjugationTableProps {
  onBack: () => void;
  onStartLesson: (lesson: Lesson) => void;
}

export const VerbConjugationTable: React.FC<VerbConjugationTableProps> = ({ onBack, onStartLesson }) => {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [narrativeScenario, setNarrativeScenario] = useState('');

  const openPracticeModal = (name: string) => {
    setActiveForm(name);
    setNarrativeScenario('');
  };

  const closePracticeModal = () => {
    setActiveForm(null);
  };

  const startExtremeContext = () => {
    if (!activeForm) return;
    const lesson: Lesson = {
        id: `practice-extreme-${Date.now()}`,
        title: `${activeForm}：极端语境`,
        subtitle: '高频脱敏训练',
        category: 'Verb Conjugation',
        duration: '实战',
        initialPrompt: `Sensei，我想针对日语动词的【${activeForm}】进行「极端语境训练」。
请生成一个**只使用**或**极度频繁使用**【${activeForm}】的日语对话场景。
目的：通过高强度轰炸让我对这个变形彻底“脱敏”，形成肌肉记忆。
请直接开始对话，不要解释规则。`
    };
    onStartLesson(lesson);
    closePracticeModal();
  };

  const startVerbNarrative = () => {
    if (!activeForm) return;
    const scenario = narrativeScenario.trim() || '日常的一天';
    const lesson: Lesson = {
        id: `practice-narrative-${Date.now()}`,
        title: `${activeForm}：动词物语`,
        subtitle: '微型故事生成',
        category: 'Verb Conjugation',
        duration: '实战',
        initialPrompt: `Sensei，我想针对日语动词的【${activeForm}】进行「动词物语」训练。
场景设定：${scenario}

特殊要求：
1. 请写一个微型日语故事。
2. 请将文中**所有动词**都**加粗** (例如 **走る**)。
3. 请尽可能使用【${activeForm}】来连接句子（表示中顿或动作连续）。如果该变形不适合连接（如命令形），请在故事中高频使用它。

请直接根据场景生成故事。`
    };
    onStartLesson(lesson);
    closePracticeModal();
  };

  const PracticeButton = ({ onClick }: { onClick: () => void }) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="ml-2 bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white p-1 rounded-md border border-blue-200 shadow-sm align-middle inline-flex items-center justify-center hover:scale-110 transition-all active:scale-95 group"
        title="进入特训"
    >
        <Dumbbell size={14} strokeWidth={2.5} className="group-hover:animate-pulse" />
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-blue-500 text-blue-950 animate-enter-app relative">
      
      {/* Practice Selection Modal */}
      {activeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
          <div 
            className="absolute inset-0" 
            onClick={closePracticeModal}
          ></div>
          <div className="bg-white w-full max-w-2xl rounded-3xl border-[3px] border-blue-950 shadow-sketchy-lg relative overflow-hidden animate-pop-in z-50 font-hand flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-blue-500 p-4 border-b-[3px] border-blue-950 flex justify-between items-center text-white shrink-0">
               <div className="flex items-center gap-2">
                 <Dumbbell size={24} strokeWidth={3} />
                 <h2 className="text-xl font-black">{activeForm} 特训模式</h2>
               </div>
               <button onClick={closePracticeModal} className="hover:bg-blue-600 p-1 rounded transition-colors">
                 <X size={24} strokeWidth={3} />
               </button>
            </div>

            {/* Modal Body - Scrollbar hidden via class 'hide-scrollbar' */}
            <div className="p-6 overflow-y-auto bg-blue-50/50 hide-scrollbar">
              <h3 className="text-center text-blue-950 font-black text-lg mb-6">请选择一种训练方式</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Option 1: Extreme Context */}
                <div 
                  className="bg-white border-[3px] border-blue-950 rounded-2xl p-5 shadow-sketchy cursor-pointer hover:-translate-y-1 hover:shadow-sketchy-lg transition-all group flex flex-col"
                  onClick={startExtremeContext}
                >
                  <div className="w-12 h-12 bg-blue-200 border-2 border-blue-950 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Zap size={24} className="text-blue-950" strokeWidth={3} />
                  </div>
                  <h4 className="font-black text-xl text-blue-950 mb-2">极端语境训练</h4>
                  <p className="text-sm font-bold text-blue-400 mb-4 flex-1">
                    生成一个只使用或极度频繁使用【{activeForm}】的场景。强制脱敏，形成肌肉记忆。
                  </p>
                  <button className="w-full bg-blue-500 text-white font-black py-2 rounded-xl border-2 border-blue-950 shadow-sm group-hover:bg-blue-600">
                    开始轰炸 💥
                  </button>
                </div>

                {/* Option 2: Verb Narrative */}
                <div 
                  className="bg-white border-[3px] border-blue-950 rounded-2xl p-5 shadow-sketchy group flex flex-col"
                >
                  <div className="w-12 h-12 bg-blue-200 border-2 border-blue-950 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <BookOpen size={24} className="text-blue-950" strokeWidth={3} />
                  </div>
                  <h4 className="font-black text-xl text-blue-950 mb-2">动词物语</h4>
                  <p className="text-sm font-bold text-blue-400 mb-4">
                    输入一个场景，Sensei 将为你生成一个仅使用【{activeForm}】连接句子的微型故事。
                  </p>
                  
                  <div className="mt-auto">
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            value={narrativeScenario}
                            onChange={(e) => setNarrativeScenario(e.target.value)}
                            placeholder="输入场景 (如: 早上迟到)"
                            className="w-full bg-blue-50 border-2 border-blue-950 rounded-xl py-2 pl-3 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all placeholder-blue-300"
                            onKeyDown={(e) => e.key === 'Enter' && startVerbNarrative()}
                        />
                         <button 
                            onClick={startVerbNarrative}
                            className="absolute right-1 p-1.5 bg-blue-500 text-white rounded-lg border border-blue-950 hover:bg-blue-600 active:scale-95"
                         >
                             <Send size={14} strokeWidth={3} />
                         </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex items-center gap-3 border-b-[3px] border-blue-950 shadow-sketchy z-30 flex-shrink-0">
        <button 
          onClick={onBack} 
          className="p-2 bg-blue-400 border-2 border-blue-950 rounded-lg hover:bg-blue-300 transition-colors active:translate-y-1 shadow-sketchy-sm"
        >
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black font-hand tracking-wide truncate">动词变形表</h1>
          <p className="text-xs font-bold text-blue-100 opacity-90 font-hand">一表通关所有变形</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 hide-scrollbar chat-bg-pattern">
        
        {/* Table Container */}
        <div className="bg-white border-[3px] border-blue-950 rounded-2xl shadow-sketchy overflow-hidden font-hand mb-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <thead>
                <tr className="bg-blue-100 border-b-[3px] border-blue-950 text-blue-950">
                  <th className="p-3 border-r-2 border-blue-950 w-28 sticky left-0 bg-blue-100 z-10">变形</th>
                  <th className="p-3 border-r-2 border-blue-950 w-1/4">五段动词</th>
                  <th className="p-3 border-r-2 border-blue-950 w-20">举例</th>
                  <th className="p-3 border-r-2 border-blue-950 w-1/4">一段动词</th>
                  <th className="p-3 border-r-2 border-blue-950 w-20">举例</th>
                  <th className="p-3 border-r-2 border-blue-950 w-24">カ変</th>
                  <th className="p-3 w-24">サ変</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                
                {/* Basic Form */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    基本形
                    <PracticeButton onClick={() => openPracticeModal('基本形')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">词尾在う段假名上</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">買う</td>
                  <td className="p-3 border-r-2 border-blue-950">
                    词尾以る结尾，前一个假名在い段(上一段)或え段(下一段)
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">来(く)る</td>
                  <td className="p-3 text-blue-600">する</td>
                </tr>

                {/* Masu Form */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    ます形
                    <PracticeButton onClick={() => openPracticeModal('ます形')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">词尾う段假名变为该行的い段假名，加ます</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">買います</td>
                  <td className="p-3 border-r-2 border-blue-950">去词尾的る+ます</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べます</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">来(き)ます</td>
                  <td className="p-3 text-blue-600">します</td>
                </tr>

                {/* Te Form - Complex */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    て形
                    <PracticeButton onClick={() => openPracticeModal('て形')} />
                  </td>
                  <td className="p-0 border-r-2 border-blue-950" colSpan={2}>
                    <div className="flex border-b border-blue-200">
                      <div className="p-2 w-16 border-r border-blue-200 bg-blue-50/50 text-xs flex items-center justify-center">い音变</div>
                      <div className="p-2 flex-1 border-r border-blue-200">词尾以く、ぐ结尾，变いて、いで</div>
                      <div className="p-2 w-20 text-blue-600">書いて</div>
                    </div>
                    <div className="flex border-b border-blue-200">
                      <div className="p-2 w-16 border-r border-blue-200 bg-blue-50/50 text-xs flex items-center justify-center">促音变</div>
                      <div className="p-2 flex-1 border-r border-blue-200">词尾以う、つ、る结尾，变って</div>
                      <div className="p-2 w-20 text-blue-600">買って</div>
                    </div>
                    <div className="flex border-b border-blue-200">
                      <div className="p-2 w-16 border-r border-blue-200 bg-blue-50/50 text-xs flex items-center justify-center">拨音变</div>
                      <div className="p-2 flex-1 border-r border-blue-200">词尾以ぬ、ぶ、む结尾，变んで</div>
                      <div className="p-2 w-20 text-blue-600">死んで</div>
                    </div>
                    <div className="flex">
                      <div className="p-2 w-16 border-r border-blue-200 bg-blue-50/50 text-xs flex items-center justify-center">特殊</div>
                      <div className="p-2 flex-1 border-r border-blue-200">只有“行(い)く”变形特殊</div>
                      <div className="p-2 w-20 text-blue-600">行って</div>
                    </div>
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">去词尾的る+て</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べて</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">きて</td>
                  <td className="p-3 text-blue-600">して</td>
                </tr>

                {/* Nai Form */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    ない形
                    <PracticeButton onClick={() => openPracticeModal('ない形')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">
                    <div>词尾う段改为あ段假名，加ない</div>
                    <div className="text-xs text-red-400 mt-1">*以「う」结尾的动词，其「あ」段假名为「わ」</div>
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">買わない</td>
                  <td className="p-3 border-r-2 border-blue-950">去词尾的る+ない</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べない</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">こない</td>
                  <td className="p-3 text-blue-600">しない</td>
                </tr>

                {/* Ta Form - Complex */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    た形
                    <PracticeButton onClick={() => openPracticeModal('た形')} />
                  </td>
                   <td className="p-0 border-r-2 border-blue-950" colSpan={2}>
                    <div className="flex border-b border-blue-200">
                      <div className="p-2 w-16 border-r border-blue-200 bg-blue-50/50 text-xs flex items-center justify-center">い音变</div>
                      <div className="p-2 flex-1 border-r border-blue-200">词尾以く、ぐ结尾，变いた、いだ</div>
                      <div className="p-2 w-20 text-blue-600">書いた</div>
                    </div>
                    <div className="flex border-b border-blue-200">
                      <div className="p-2 w-16 border-r border-blue-200 bg-blue-50/50 text-xs flex items-center justify-center">促音变</div>
                      <div className="p-2 flex-1 border-r border-blue-200">词尾以う、つ、る结尾，变った</div>
                      <div className="p-2 w-20 text-blue-600">買った</div>
                    </div>
                    <div className="flex border-b border-blue-200">
                      <div className="p-2 w-16 border-r border-blue-200 bg-blue-50/50 text-xs flex items-center justify-center">拨音变</div>
                      <div className="p-2 flex-1 border-r border-blue-200">词尾以ぬ、ぶ、む结尾，变んだ</div>
                      <div className="p-2 w-20 text-blue-600">死んだ</div>
                    </div>
                    <div className="flex">
                      <div className="p-2 w-16 border-r border-blue-200 bg-blue-50/50 text-xs flex items-center justify-center">特殊</div>
                      <div className="p-2 flex-1 border-r border-blue-200">只有“行(い)く”变形特殊</div>
                      <div className="p-2 w-20 text-blue-600">行った</div>
                    </div>
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">去词尾的る+た</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べた</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">きた</td>
                  <td className="p-3 text-blue-600">した</td>
                </tr>

                {/* Imperative Form */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    命令形
                    <PracticeButton onClick={() => openPracticeModal('命令形')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">词尾う段改为え段假名</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">買え</td>
                  <td className="p-3 border-r-2 border-blue-950">去词尾的る+ろ</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べろ</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">こい</td>
                  <td className="p-3 text-blue-600">しろ</td>
                </tr>

                 {/* Volitional Form */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    意志形
                    <PracticeButton onClick={() => openPracticeModal('意志形')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">词尾う段改为お段假名的长音</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">買おう</td>
                  <td className="p-3 border-r-2 border-blue-950">去词尾的る+よう</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べよう</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">こよう</td>
                  <td className="p-3 text-blue-600">しよう</td>
                </tr>

                {/* Ba Form */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    ば形
                    <PracticeButton onClick={() => openPracticeModal('ば形')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">词尾う段改为え段假名，加ば</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">買えば</td>
                  <td className="p-3 border-r-2 border-blue-950">去词尾的る+れば</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べれば</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">くれば</td>
                  <td className="p-3 text-blue-600">すれば</td>
                </tr>

                {/* Potential Form */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    可能形
                    <PracticeButton onClick={() => openPracticeModal('可能形')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">词尾う段改为え段假名，加る</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">買える</td>
                  <td className="p-3 border-r-2 border-blue-950">去词尾的る+られる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べられる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">こられる</td>
                  <td className="p-3 text-red-500 font-bold">できる</td>
                </tr>

                {/* Passive Form */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    被动形
                    <PracticeButton onClick={() => openPracticeModal('被动形')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">词尾う段改为あ段假名，加れる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">買われる</td>
                  <td className="p-3 border-r-2 border-blue-950">去词尾的る+られる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べられる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">こられる</td>
                  <td className="p-3 text-blue-600">される</td>
                </tr>

                 {/* Causative Form */}
                 <tr className="hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap">
                    使役形
                    <PracticeButton onClick={() => openPracticeModal('使役形')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950">词尾う段改为あ段假名，加せる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">買わせる</td>
                  <td className="p-3 border-r-2 border-blue-950">去词尾的る+させる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">食べさせる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-blue-600">こさせる</td>
                  <td className="p-3 text-blue-600">させる</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-yellow-50 border-2 border-blue-950 rounded-xl p-4 shadow-sketchy-sm font-hand">
          <h3 className="flex items-center gap-2 font-black text-blue-950 mb-3 text-lg">
            <Info size={20} /> 附注：
          </h3>
          <div className="space-y-4 text-sm font-bold text-blue-900 leading-relaxed">
            <div>
              <span className="bg-blue-200 px-2 py-0.5 rounded text-blue-950 mr-2">①</span>
              <span className="font-black text-blue-950">体言</span>：分为名词和代名词。如：【名词】—月・花・感情；【代名词】—これ・それ・私・あなた
              <br/>
              <span className="font-black text-blue-950 ml-6">用言</span>：分为动词和形容词。形容词中包含形容动词。如：【动词】—踊る・歌う；【形容词】—若い・涼しい；【形容动词】—静かだ・さわやかだ・愉快だ
            </div>
            
            <div className="border-t border-blue-200 pt-2">
              <span className="bg-blue-200 px-2 py-0.5 rounded text-blue-950 mr-2">②</span>
              别名对照：
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-blue-700">
                <li>【基本形】又称为「辞书形」、「终止形」及「连体形」</li>
                <li>【ない形】和【意志形】也可称为「未然形」</li>
                <li>【ます形】、【て形】和【た形】也称为「连用形」</li>
                <li>【ば形】可称为「假定形」</li>
              </ul>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
