
import React from 'react';
import { cn } from '@/lib/utils';

interface LocationMarkerProps {
  name: string;
  distance?: string;
  available?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({
  name,
  distance,
  available,
  selected = false,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group animate-scale-in",
        className
      )}
    >
      <div className={cn(
        "absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-md min-w-[120px]",
        "transition-opacity duration-200",
        "border border-parking-lightgray",
        selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <div className="text-sm font-medium truncate max-w-[150px]">{name}</div>
        {distance && <div className="text-xs text-parking-gray">{distance} away</div>}
        {available !== undefined && (
          <div className="text-xs mt-1">
            <span className={available > 0 ? "text-parking-success" : "text-parking-error"}>
              {available > 0 ? `${available} spots available` : "No spots available"}
            </span>
          </div>
        )}
        <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 rotate-45 w-4 h-4 bg-white border-r border-b border-parking-lightgray"></div>
      </div>

      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center border-2 transform transition-transform duration-200",
        selected ? "scale-110 border-parking-yellow bg-parking-yellow" : "border-parking-yellow bg-white group-hover:scale-110"
      )}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={selected ? "black" : "#FFC107"} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
    </button>
  );
};

export default LocationMarker;
