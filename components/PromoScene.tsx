
import React from 'react';
import { ArrowLeft, Sparkles, Send, Star, Check } from 'lucide-react';

interface PromoSceneProps {
  onBack: () => void;
}

export const PromoScene: React.FC<PromoSceneProps> = ({ onBack }) => {
  return (
    <div className="w-full h-full bg-blue-500 relative overflow-hidden flex flex-col items-center justify-center font-hand">
      {/* Background Decor */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
      
      {/* Floating Blobs/Shapes */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>

      <div className="absolute top-4 left-4 z-50">
          <button onClick={onBack} className="bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 backdrop-blur-sm">
            <ArrowLeft />
          </button>
      </div>

      {/* Main Title Overlay */}
      <div className="absolute top-10 z-40 text-center">
          <div className="bg-blue-950 text-white px-6 py-2 rounded-full inline-block transform -rotate-2 mb-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              <span className="font-black tracking-widest text-sm">90+ Lessons</span>
          </div>
          <h1 className="text-6xl font-black text-white drop-shadow-[4px_4px_0px_rgba(23,37,84,0.5)]">
              Grammar<br/>Sensei
          </h1>
      </div>

      {/* --- PHONE MOCKUPS CONTAINER --- */}
      {/* Using scale to fit everything on screen */}
      <div className="relative w-full max-w-5xl h-[600px] flex items-center justify-center scale-[0.6] sm:scale-[0.8] md:scale-90 lg:scale-100 origin-center">
        
        {/* PHONE 1: LEFT (List View) */}
        <div className="absolute left-0 sm:left-10 w-[300px] h-[600px] bg-white border-[12px] border-blue-950 rounded-[3rem] shadow-[20px_20px_0px_0px_rgba(23,37,84,0.3)] transform -rotate-12 translate-y-12 z-10 overflow-hidden flex flex-col animate-float-reverse">
             {/* Notch */}
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-blue-950 rounded-b-xl z-20"></div>
             
             {/* Screen Content */}
             <div className="flex-1 bg-blue-500 pt-12 px-4 overflow-hidden">
                <div className="bg-white p-4 rounded-xl border-[3px] border-blue-950 shadow-sketchy mb-4 transform rotate-1">
                    <h3 className="font-black text-2xl text-blue-950">N5语法</h3>
                    <div className="w-full h-3 bg-blue-100 mt-2 rounded-full border border-blue-950 overflow-hidden">
                        <div className="w-2/3 h-full bg-blue-500"></div>
                    </div>
                </div>
                {/* Lesson Cards Mockup */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-3 mb-3 bg-white border-[3px] border-blue-950 shadow-sketchy rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3 border-2 border-blue-950">{i}</div>
                        <div className="h-4 bg-blue-100 w-24 rounded"></div>
                        <div className="ml-auto">
                           {i === 1 ? <Check className="text-blue-500" /> : <div className="w-4 h-4 rounded-full border-2 border-blue-200"></div>}
                        </div>
                    </div>
                ))}
             </div>
        </div>

        {/* PHONE 2: RIGHT (Card View) */}
        <div className="absolute right-0 sm:right-10 w-[300px] h-[600px] bg-white border-[12px] border-blue-950 rounded-[3rem] shadow-[20px_20px_0px_0px_rgba(23,37,84,0.3)] transform rotate-12 translate-y-8 z-10 overflow-hidden flex flex-col animate-float-delayed">
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-blue-950 rounded-b-xl z-20"></div>
             <div className="flex-1 bg-blue-50 pt-12 px-4 flex flex-col items-center">
                  <div className="w-full bg-white border-[3px] border-blue-950 rounded-2xl p-6 aspect-square flex flex-col items-center justify-center shadow-sketchy mb-6 relative">
                      <div className="text-6xl font-black text-blue-950 mb-2">何</div>
                      <div className="bg-blue-200 text-blue-950 px-2 py-1 rounded text-xs font-bold">Pronoun</div>
                      <Star className="absolute top-4 right-4 text-yellow-400 fill-yellow-400" size={24} />
                  </div>
                  <div className="w-full bg-blue-500 text-white py-4 rounded-xl border-[3px] border-blue-950 shadow-sketchy text-center font-black text-xl">
                      Flip Card
                  </div>
             </div>
        </div>

        {/* PHONE 3: CENTER (Chat View) - HERO */}
        <div className="absolute w-[320px] h-[640px] bg-white border-[12px] border-blue-950 rounded-[3.5rem] shadow-[30px_30px_0px_0px_rgba(23,37,84,0.4)] transform rotate-0 z-20 overflow-hidden flex flex-col animate-float">
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-7 bg-blue-950 rounded-b-2xl z-20"></div>
             
             <div className="flex-1 bg-blue-50 flex flex-col pt-14 pb-8">
                 {/* Chat Header */}
                 <div className="px-4 pb-2 flex justify-center border-b-2 border-blue-100 mx-4 mb-4">
                     <span className="font-black text-blue-950 uppercase">Lesson 1: Introduction</span>
                 </div>

                 {/* Chat Bubbles */}
                 <div className="flex-1 px-4 space-y-4">
                     <div className="flex justify-end">
                         <div className="bg-blue-500 text-white px-4 py-3 rounded-2xl rounded-tr-none border-[3px] border-blue-950 shadow-sketchy max-w-[85%] text-sm font-bold">
                             日语里"我"怎么说？
                         </div>
                     </div>

                     <div className="flex justify-start">
                         <div className="bg-white text-blue-950 px-4 py-3 rounded-2xl rounded-tl-none border-[3px] border-blue-950 shadow-sketchy max-w-[85%] text-sm font-bold relative">
                             <div className="absolute -left-3 -top-3">
                                 <div className="bg-white border-2 border-blue-950 rounded-full p-1"><Sparkles size={16} className="text-blue-500"/></div>
                             </div>
                             最常见的是 <span className="text-blue-500">私 (watashi)</span>。男孩子也可以用 <span className="text-blue-500">僕 (boku)</span> 哦！✨
                         </div>
                     </div>
                     
                     <div className="flex justify-end">
                         <div className="bg-blue-500 text-white px-4 py-3 rounded-2xl rounded-tr-none border-[3px] border-blue-950 shadow-sketchy max-w-[85%] text-sm font-bold">
                             原来如此！😲
                         </div>
                     </div>
                 </div>

                 {/* Input Mockup */}
                 <div className="px-4 mt-auto">
                     <div className="bg-white border-[3px] border-blue-950 rounded-xl p-2 flex items-center shadow-sketchy">
                         <div className="flex-1 text-gray-300 font-bold ml-2">Type a message...</div>
                         <div className="bg-blue-500 p-2 rounded-lg border-2 border-blue-950 text-white">
                             <Send size={18} />
                         </div>
                     </div>
                 </div>
             </div>
        </div>

      </div>

      {/* Decorative Bottom Elements */}
      <div className="absolute bottom-6 flex gap-4">
          <div className="bg-white border-[3px] border-blue-950 px-4 py-2 rounded-lg shadow-sketchy transform -rotate-3">
              <span className="font-black text-blue-950">Easy to use</span>
          </div>
          <div className="bg-yellow-300 border-[3px] border-blue-950 px-4 py-2 rounded-lg shadow-sketchy transform rotate-2">
              <span className="font-black text-blue-950">So Fun!</span>
          </div>
      </div>
    </div>
  );
};
