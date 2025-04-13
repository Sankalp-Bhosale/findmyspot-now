
import React from 'react';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface MapControlsProps {
  onCenterUser: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onCenterUser }) => {
  return (
    <div className="absolute top-28 right-4 z-20 flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full bg-white shadow-md"
        onClick={onCenterUser}
      >
        <Compass size={20} className="text-parking-dark" />
      </Button>
    </div>
  );
};

export default MapControls;
