
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  distance?: string;
  available_spots: number;
  price_per_hour: number;
  lat: number;
  lng: number;
}

interface LocationCardProps {
  location: ParkingLocation;
  userLocation: { lat: number, lng: number } | null;
  onViewDetails: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, userLocation, onViewDetails }) => {
  const handleNavigate = () => {
    if (userLocation) {
      // Open in Google Maps for navigation
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${location.lat},${location.lng}&travelmode=driving`, 
        '_blank'
      );
    }
  };

  return (
    <div className="absolute bottom-20 left-0 right-0 px-4 z-20 animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">
              {location.name}
            </h3>
            <p className="text-xs text-parking-gray mt-1 line-clamp-1">
              {location.address}
            </p>
            <div className="flex items-center mt-2">
              <MapPin size={14} className="text-parking-yellow" />
              <span className="text-xs ml-1">
                {location.distance} away
              </span>
              <span className="mx-2 text-parking-gray">•</span>
              <span className="text-xs text-parking-success">
                {location.available_spots} spots available
              </span>
            </div>
          </div>
          <div className="bg-parking-lightgray rounded-lg px-3 py-1">
            <p className="text-xs font-medium text-parking-dark">₹{location.price_per_hour}/hr</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleNavigate}
          >
            <Navigation size={16} className="mr-2" />
            Navigate
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onViewDetails}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
