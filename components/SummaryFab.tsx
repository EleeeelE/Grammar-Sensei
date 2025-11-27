
import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';

interface SummaryFabProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

export const SummaryFab: React.FC<SummaryFabProps> = ({ onClick, loading, disabled }) => {
  const fabRef = useRef<HTMLButtonElement>(null);
  // Initial position
  const [position, setPosition] = useState({ right: 24, bottom: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, right: 0, bottom: 0 });
  const movedDistanceRef = useRef(0);

  const isDisabled = loading || disabled;

  const handleDragStart = (clientX: number, clientY: number) => {
    if (isDisabled) return;
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
    movedDistanceRef.current = 0;
    
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      right: position.right,
      bottom: position.bottom,
    };
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    movedDistanceRef.current = Math.sqrt(deltaX**2 + deltaY**2);
    
    let newRight = dragStartRef.current.right - deltaX;
    let newBottom = dragStartRef.current.bottom - deltaY;
    
    if (fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect();
      const margin = 10;
      newRight = Math.max(margin, Math.min(newRight, window.innerWidth - rect.width - margin));
      newBottom = Math.max(margin, Math.min(newBottom, window.innerHeight - rect.height - margin));
    }

    setPosition({ right: newRight, bottom: newBottom });
  };
  
  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.style.cursor = 'default';

    if (movedDistanceRef.current < 5 && !isDisabled) { 
      onClick();
    }
  };

  const onMouseDown = (e: ReactMouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };
  
  const onTouchStart = (e: ReactTouchEvent) => {
    e.preventDefault();
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  }

  useEffect(() => {
    const moveHandler = (e: MouseEvent | TouchEvent) => handleDragMove(e);
    const endHandler = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', endHandler);
      window.addEventListener('touchmove', moveHandler, { passive: false });
      window.addEventListener('touchend', endHandler);
    }
    
    return () => {
      document.body.style.cursor = 'default';
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', endHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('touchend', endHandler);
    };
  }, [isDragging]);

  return (
    <button
      ref={fabRef}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        right: `${position.right}px`,
        bottom: `${position.bottom}px`,
        touchAction: 'none',
      }}
      className={`fixed z-40 w-[64px] h-[64px] rounded-xl flex flex-col items-center justify-center
        transition-all duration-200 ease-in-out
        ${isDragging ? 'cursor-grabbing scale-105 shadow-sketchy-lg' : isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:scale-95 hover:-translate-y-1'}
        bg-white border-[3px] border-blue-950 shadow-sketchy`}
      title="生成本课小结"
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin text-blue-500 mb-1" strokeWidth={3} />
      ) : (
        <ClipboardList size={20} className="text-blue-950 mb-1" strokeWidth={2.5} />
      )}
      <span className="text-[9px] font-black text-blue-950 leading-none">
        本课小结
      </span>
    </button>
  );
};
