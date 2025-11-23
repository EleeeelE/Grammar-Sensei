
import React, { useState } from 'react';
import { Key, ArrowRight, ExternalLink, Lock } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
  initialKey?: string;
  onCancel?: () => void; // Optional cancel for when accessing from settings
  canCancel?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, initialKey = '', onCancel, canCancel = false }) => {
  const [inputKey, setInputKey] = useState(initialKey);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setError('请输入有效的 API Key');
      return;
    }
    if (!inputKey.startsWith('AIza')) {
      setError('Key 格式似乎不对 (通常以 AIza 开头)');
      return;
    }
    onSave(inputKey.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/90 backdrop-blur-sm p-4 font-hand animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white w-full max-w-md border-[3px] border-blue-950 shadow-sketchy-lg rounded-2xl p-6 relative overflow-hidden animate-pop-in">
         {/* Decorative Tape */}
         <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 w-32 h-6 bg-blue-200/50 rotate-1 border-b-2 border-white/20"></div>

         <div className="text-center mb-6">
             <div className="w-16 h-16 bg-blue-100 border-[3px] border-blue-950 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sketchy-sm">
                 <Key size={32} className="text-blue-500" strokeWidth={2.5} />
             </div>
             <h2 className="text-2xl font-black text-blue-950 mb-1">只需一步...</h2>
             <p className="text-sm font-bold text-blue-500">输入你的 Google Gemini API Key 即可开始</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                 <label className="block text-xs font-black text-blue-950 uppercase mb-1 ml-1">API Key</label>
                 <div className="relative">
                     <input 
                        type="password" 
                        value={inputKey}
                        onChange={(e) => { setInputKey(e.target.value); setError(''); }}
                        placeholder="AIzaSy..."
                        className="w-full bg-blue-50 border-2 border-blue-950 rounded-xl py-3 pl-10 pr-4 text-blue-950 font-bold focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all placeholder-blue-300"
                     />
                     <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                 </div>
                 {error && <p className="text-red-500 text-xs font-bold mt-1 ml-1 animate-pulse">{error}</p>}
             </div>

             <button 
                type="submit"
                className="w-full bg-blue-500 text-white font-black text-lg py-3 rounded-xl border-[3px] border-blue-950 shadow-sketchy active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 hover:bg-blue-600"
             >
                 开始学习 <ArrowRight size={20} strokeWidth={3} />
             </button>
             
             {canCancel && (
                <button 
                    type="button"
                    onClick={onCancel}
                    className="w-full text-blue-400 font-bold text-sm py-2 hover:text-blue-600"
                >
                    取消
                </button>
             )}
         </form>

         <div className="mt-6 pt-4 border-t-2 border-blue-100 text-center">
             <p className="text-xs text-blue-400 font-bold mb-2">还没有 Key?</p>
             <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-black text-blue-950 bg-white border-2 border-blue-950 px-3 py-1.5 rounded-lg shadow-sketchy-sm hover:-translate-y-0.5 transition-transform"
             >
                 <ExternalLink size={12} /> 免费获取 (Google AI Studio)
             </a>
             <p className="text-[10px] text-blue-300 mt-3 max-w-xs mx-auto leading-tight">
                 * Key 仅存储在您的浏览器本地，直接与 Google 服务器通信，不会经过任何第三方服务器。
             </p>
         </div>
      </div>
    </div>
  );
};
