
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressDotsProps {
  total: number;
  active: number;
  className?: string;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ 
  total, 
  active, 
  className 
}) => {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "transition-all duration-300 ease-in-out rounded-full",
            active === index 
              ? "w-3 h-3 bg-parking-yellow" 
              : "w-2 h-2 bg-parking-lightgray"
          )}
        />
      ))}
    </div>
  );
};

export default ProgressDots;
