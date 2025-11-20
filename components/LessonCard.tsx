import React from 'react';
import { Lesson } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  onClick: (lesson: Lesson) => void;
  index: number;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick, index }) => {
  return (
    <div 
      onClick={() => onClick(lesson)}
      className="flex items-center p-4 bg-transparent active:bg-gray-100 transition-colors cursor-pointer group border-b border-gray-100 last:border-0"
    >
      <div className="mr-4 text-gray-400 text-xs font-medium w-8">
        第{index + 1}课
      </div>
      
      <div className="flex-1">
        <h3 className="text-[16px] font-medium text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
          {lesson.title}
        </h3>
        <p className="text-xs text-gray-500 font-light">
          {lesson.subtitle}
        </p>
      </div>

      <div className="text-right">
         <div className="flex items-center text-[10px] text-gray-400 mb-1">
            <span className="mr-1">时长</span>
         </div>
         <div className="text-xs font-medium text-gray-800">
            {lesson.duration}
         </div>
      </div>
    </div>
  );
};