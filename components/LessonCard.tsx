
import React from 'react';
import { Lesson } from '../types';
import { Check, Star } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
  onClick: (lesson: Lesson) => void;
  index: number;
  isCompleted?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (lessonId: string) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick, index, isCompleted, isFavorite, onToggleFavorite }) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(lesson.id);
    }
  };

  return (
    <div 
      onClick={() => onClick(lesson)}
      className={`flex items-center p-4 mb-4 bg-white border-[3px] border-blue-950 shadow-sketchy transition-all cursor-pointer hover:-translate-y-1 hover:translate-x-[-1px] hover:shadow-sketchy-lg active:translate-y-[2px] active:translate-x-[2px] active:shadow-none relative overflow-hidden
        ${isCompleted ? 'bg-blue-50' : ''}`}
      style={{
          borderRadius: '5px 20px 5px 25px' // Subtle irregular shape
      }}
    >
      {/* Decorative tape at top */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-4 bg-blue-200 opacity-50 rotate-2"></div>

      <div className="mr-4 flex justify-center">
        {isCompleted ? (
             <div className="w-8 h-8 bg-blue-500 border-2 border-blue-950 flex items-center justify-center text-white rounded-full">
                <Check size={20} strokeWidth={4} />
             </div>
        ) : (
             <div className="w-8 h-8 bg-white border-2 border-blue-500 flex items-center justify-center text-blue-500 font-black text-sm rounded-full transform -rotate-6 shadow-sm">
                {index + 1}
             </div>
        )}
      </div>
      
      <div className="flex-1 z-10">
        <h3 className={`text-lg font-black mb-1 leading-tight font-hand ${isCompleted ? 'text-blue-400 line-through' : 'text-blue-950'}`}>
          {lesson.title}
        </h3>
        <p className="text-xs text-blue-500 font-bold font-hand tracking-wide">
          {lesson.subtitle}
        </p>
      </div>

      <div className="text-right pl-2 z-10 flex flex-col items-end gap-2">
        {onToggleFavorite && (
          <button 
            onClick={handleFavoriteClick}
            className={`p-1 rounded-full transition-all hover:scale-110 active:scale-90 ${isFavorite ? 'text-yellow-400' : 'text-blue-200 hover:text-blue-400'}`}
          >
            <Star size={22} strokeWidth={3} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}

        <div className="flex flex-col items-end">
          <div className="inline-block bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 mb-1 border border-blue-950 transform rotate-3 rounded-sm font-hand">
              TIME
          </div>
          <div className="text-xs font-black text-blue-950 text-center font-hand">
              {lesson.duration}
          </div>
        </div>
      </div>
    </div>
  );
};
