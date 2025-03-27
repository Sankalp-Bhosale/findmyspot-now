
import React from 'react';
import { cn } from '@/lib/utils';

type ParkingSpotStatus = 'available' | 'occupied' | 'selected' | 'disabled';

interface ParkingSpotProps {
  id: string;
  status: ParkingSpotStatus;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ParkingSpot: React.FC<ParkingSpotProps> = ({
  id,
  status,
  onClick,
  size = 'md',
  className,
}) => {
  const statusColors = {
    available: 'bg-parking-success border-parking-success text-white hover:bg-parking-success/90',
    occupied: 'bg-parking-error border-parking-error text-white cursor-not-allowed',
    selected: 'bg-parking-yellow border-parking-yellow text-parking-dark',
    disabled: 'bg-parking-lightgray border-parking-lightgray text-parking-gray cursor-not-allowed'
  };
  
  const sizes = {
    sm: 'w-10 h-16',
    md: 'w-12 h-20',
    lg: 'w-16 h-24'
  };

  return (
    <button
      disabled={status === 'occupied' || status === 'disabled'}
      onClick={onClick}
      className={cn(
        "relative border-2 rounded-md transition-all duration-200 flex items-center justify-center",
        "transform hover:scale-105 active:scale-100",
        statusColors[status],
        sizes[size],
        className
      )}
    >
      <span className="font-medium text-sm">{id}</span>
      
      {status === 'available' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white border border-parking-success"></div>
      )}
      
      {status === 'selected' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white border border-parking-yellow">
          <div className="w-1.5 h-1.5 bg-parking-yellow rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      )}
    </button>
  );
};

export default ParkingSpot;
