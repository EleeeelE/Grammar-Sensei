
import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface FlyingStarProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  onComplete: () => void;
}

export const FlyingStar: React.FC<FlyingStarProps> = ({ startX, startY, endX, endY, onComplete }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: startX,
    top: startY,
    transform: 'translate(-50%, -50%) scale(1)',
    zIndex: 9999,
    opacity: 1,
    transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Bouncy easing
  });

  useEffect(() => {
    // Trigger animation in next frame
    requestAnimationFrame(() => {
      setStyle({
        position: 'fixed',
        left: endX,
        top: endY,
        transform: 'translate(-50%, -50%) scale(0.5)', // Shrink as it enters jar
        zIndex: 9999,
        opacity: 0, // Fade out at the very end
        transition: 'all 0.7s cubic-bezier(0.5, 0, 0, 1)' // Ease into the jar
      });
    });

    const timer = setTimeout(() => {
      onComplete();
    }, 700);

    return () => clearTimeout(timer);
  }, [endX, endY, onComplete]);

  return (
    <div style={style} className="pointer-events-none text-yellow-400 drop-shadow-md">
      <Star size={24} fill="currentColor" strokeWidth={2} />
    </div>
  );
};
