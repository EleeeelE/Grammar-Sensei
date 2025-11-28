




import React, { useState } from 'react';
import { ArrowLeft, Info, Dumbbell, Zap, BookOpen, X, Send } from 'lucide-react';
import { Lesson } from '../types';

interface KeigoTableProps {
  onBack: () => void;
  onStartLesson: (lesson: Lesson) => void;
}

export const KeigoTable: React.FC<KeigoTableProps> = ({ onBack, onStartLesson }) => {
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
        id: `practice-keigo-extreme-${Date.now()}`,
        title: `${activeForm}：极端语境`,
        subtitle: '敬语高频脱敏训练',
        category: 'Keigo Training',
        duration: '实战',
        initialPrompt: `Sensei，我想针对日语的【${activeForm}】进行「极端语境训练」。
请生成一个**只使用**或**极度频繁使用**该分类下敬语单词（尊敬语、谦让语等）的日语对话场景。
目的：通过高强度轰炸让我对这些敬语表达彻底“脱敏”，形成肌肉记忆。
请直接开始对话，不要解释规则。`
    };
    onStartLesson(lesson);
    closePracticeModal();
  };

  const startVerbNarrative = () => {
    if (!activeForm) return;
    const scenario = narrativeScenario.trim() || '职场的一天';
    const lesson: Lesson = {
        id: `practice-keigo-narrative-${Date.now()}`,
        title: `${activeForm}：敬语物语`,
        subtitle: '微型故事生成',
        category: 'Keigo Training',
        duration: '实战',
        initialPrompt: `Sensei，我想针对日语的【${activeForm}】进行「敬语物语」训练。
场景设定：${scenario}

特殊要求：
1. 请写一个微型日语故事。
2. 请将文中出现的**所有敬语表达**（尊敬语或谦让语）都**加粗**。
3. 请尽可能多地使用【${activeForm}】相关的词汇。

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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-blue-50/50 hide-scrollbar">
              <h3 className="text-center text-blue-950 font-black text-lg mb-6">请选择一种训练方式</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Option 1: Extreme Context */}
                <div 
                  className="bg-white border-[3px] border-blue-950 rounded-2xl p-5 shadow-sketchy cursor-pointer hover:-translate-y-1 hover:shadow-sketchy-lg transition-all group flex flex-col"
                  onClick={startExtremeContext}
                >
                  <div className="w-12 h-12 bg-blue-500 border-2 border-blue-950 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Zap size={24} className="text-white" strokeWidth={3} />
                  </div>
                  <h4 className="font-black text-xl text-blue-950 mb-2">极端语境训练</h4>
                  <p className="text-sm font-bold text-blue-400 mb-4 flex-1">
                    生成一个高频使用【{activeForm}】的商务/正式场景。强制脱敏，形成肌肉记忆。
                  </p>
                  <button className="w-full bg-blue-500 text-white font-black py-2 rounded-xl border-2 border-blue-950 shadow-sm group-hover:bg-blue-600">
                    开始轰炸 💥
                  </button>
                </div>

                {/* Option 2: Verb Narrative */}
                <div 
                  className="bg-white border-[3px] border-blue-950 rounded-2xl p-5 shadow-sketchy group flex flex-col"
                >
                  <div className="w-12 h-12 bg-blue-500 border-2 border-blue-950 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <BookOpen size={24} className="text-white" strokeWidth={3} />
                  </div>
                  <h4 className="font-black text-xl text-blue-950 mb-2">敬语物语</h4>
                  <p className="text-sm font-bold text-blue-400 mb-4">
                    输入一个场景，Sensei 将为你生成一个使用【{activeForm}】的微型故事。
                  </p>
                  
                  <div className="mt-auto">
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            value={narrativeScenario}
                            onChange={(e) => setNarrativeScenario(e.target.value)}
                            placeholder="输入场景 (如: 接待客户)"
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
          <h1 className="text-xl sm:text-2xl font-black font-hand tracking-wide truncate">日语敬语表</h1>
          <p className="text-xs font-bold text-blue-100 opacity-90 font-hand">一表搞定尊敬、谦让与丁宁</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 hide-scrollbar chat-bg-pattern">
        
        {/* Table Container - Optimized for Scrolling */}
        <div className="bg-white border-[3px] border-blue-950 rounded-2xl shadow-sketchy font-hand mb-6 relative z-0">
          <div className="overflow-x-auto w-full touch-pan-x rounded-[13px] pb-1">
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <thead>
                <tr className="bg-blue-100 border-b-[3px] border-blue-950 text-blue-950">
                  <th className="p-3 border-r-2 border-blue-950 w-32 sticky left-0 bg-blue-100 z-10">词汇 / 分类</th>
                  <th className="p-3 border-r-2 border-blue-950 w-1/3 text-orange-600">尊敬语 (抬高对方)</th>
                  <th className="p-3 border-r-2 border-blue-950 w-1/3 text-emerald-600">谦让语 (压低自己)</th>
                  <th className="p-3 w-1/4">丁宁语 (礼貌)</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                
                {/* Row 1 */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap z-10">
                    行く・来る・いる
                    <PracticeButton onClick={() => openPracticeModal('特殊敬语：行く・来る・いる')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-orange-600">いらっしゃる<br/>おいでになる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-emerald-600">参る (まいる)<br/>おる</td>
                  <td className="p-3">行きます<br/>来ます<br/>います</td>
                </tr>

                {/* Row 2 */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap z-10">
                    食べる・飲む
                    <PracticeButton onClick={() => openPracticeModal('特殊敬语：食べる・飲む')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-orange-600">召し上がる (めしあがる)</td>
                  <td className="p-3 border-r-2 border-blue-950 text-emerald-600">いただく</td>
                  <td className="p-3">食べます<br/>飲みます</td>
                </tr>

                {/* Row 3 */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap z-10">
                    する (做)
                    <PracticeButton onClick={() => openPracticeModal('特殊敬语：する')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-orange-600">なさる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-emerald-600">致す (いたす)</td>
                  <td className="p-3">します</td>
                </tr>

                {/* Row 4 */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap z-10">
                    言う (说)
                    <PracticeButton onClick={() => openPracticeModal('特殊敬语：言う')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-orange-600">おっしゃる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-emerald-600">申す (もうす)<br/>申し上げる</td>
                  <td className="p-3">言います</td>
                </tr>

                {/* Row 5 */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap z-10">
                    見る (看)
                    <PracticeButton onClick={() => openPracticeModal('特殊敬语：見る')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-orange-600">ご覧になる (ごらんになる)</td>
                  <td className="p-3 border-r-2 border-blue-950 text-emerald-600">拝见する (はいけんする)</td>
                  <td className="p-3">見ます</td>
                </tr>

                 {/* Row 6 */}
                 <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap z-10">
                    知る (知道)
                    <PracticeButton onClick={() => openPracticeModal('特殊敬语：知る')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-orange-600">ご存知だ (ごぞんじだ)</td>
                  <td className="p-3 border-r-2 border-blue-950 text-emerald-600">存じている (ぞんじている)<br/>存じ上げる</td>
                  <td className="p-3">知っています</td>
                </tr>

                {/* Row 7 */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap z-10">
                    会う (见面)
                    <PracticeButton onClick={() => openPracticeModal('特殊敬语：会う')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-orange-600">お会いになる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-emerald-600">お目にかかる</td>
                  <td className="p-3">会います</td>
                </tr>

                {/* Row 8 */}
                <tr className="border-b-2 border-blue-200 hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap z-10">
                    規則：一/二类动词
                    <PracticeButton onClick={() => openPracticeModal('规则敬语：一类/二类动词')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-orange-600">
                    <div>お + Vます形 + になる</div>
                    <div className="text-xs text-blue-400 mt-1">或者被动形 (れる/られる)</div>
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-emerald-600">お + Vます形 + する</td>
                  <td className="p-3">Vます</td>
                </tr>

                {/* Row 9 */}
                <tr className="hover:bg-blue-50">
                  <td className="p-3 border-r-2 border-blue-950 font-black sticky left-0 bg-white group whitespace-nowrap z-10">
                    規則：三类(汉字)
                    <PracticeButton onClick={() => openPracticeModal('规则敬语：三类动词')} />
                  </td>
                  <td className="p-3 border-r-2 border-blue-950 text-orange-600">ご + 汉字词 + になる</td>
                  <td className="p-3 border-r-2 border-blue-950 text-emerald-600">ご + 汉字词 + する</td>
                  <td className="p-3">汉字词 + します</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-yellow-50 border-2 border-blue-950 rounded-xl p-4 shadow-sketchy-sm font-hand">
          <h3 className="flex items-center gap-2 font-black text-blue-950 mb-3 text-lg">
            <Info size={20} /> 敬语小贴士：
          </h3>
          <div className="space-y-4 text-sm font-bold text-blue-900 leading-relaxed">
            <div>
              <span className="bg-orange-200 px-2 py-0.5 rounded text-orange-800 mr-2 font-black">尊敬语</span>
              用于抬高对方（长辈、上司、客户）的行为、状态或所有物。
              <br/>
              <span className="text-xs text-blue-500 ml-11">例：社长正在吃饭 &rarr; 社長が召し上がっています。</span>
            </div>
            
            <div className="border-t border-blue-200 pt-2">
              <span className="bg-emerald-200 px-2 py-0.5 rounded text-emerald-800 mr-2 font-black">谦让语</span>
              用于压低自己（或己方人员）的行为，以示对对方的尊重。
              <br/>
              <span className="text-xs text-blue-500 ml-11">例：我正在吃饭 &rarr; 私がいただいています。</span>
            </div>

            <div className="border-t border-blue-200 pt-2">
              <span className="bg-blue-200 px-2 py-0.5 rounded text-blue-800 mr-2 font-black">美化语</span>
              在名词前加「お」或「ご」使语言更文雅。
              <ul className="list-disc list-inside ml-11 mt-1 text-xs text-blue-500">
                  <li>和语词（固有词）多加「お」：お水、お花、お部屋</li>
                  <li>汉语词（音读词）多加「ご」：ご家族、ご案内、ご意見</li>
              </ul>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};