import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/ui/NavBar';
import { Button } from '@/components/ui/Button';
import { useParking } from '@/context/ParkingContext';
import { MapPin, Clock, Car, ChevronRight } from 'lucide-react';

const ParkingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLocation } = useParking();
  const [selectedDuration, setSelectedDuration] = useState(1); // Default 1 hour
  
  if (!selectedLocation) {
    navigate('/home');
    return null;
  }

  const durations = [1, 2, 3, 4, 5];
  
  const handlePickSpot = () => {
    navigate('/floor-selection');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Back Button */}
      <NavBar type="top" showBackButton title={selectedLocation.name} />
      
      {/* Image Header */}
      <div className="w-full h-48 bg-gray-200 relative mt-12">
        <img 
          src="/lovable-uploads/804ddc31-4576-4d81-be4f-f88a56454165.png" 
          alt="Parking Location" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Statistics Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center">
            <MapPin size={16} className="text-parking-yellow" />
            <span className="ml-1 text-sm font-medium">{selectedLocation.distance}</span>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center">
            <Car size={16} className="text-parking-success" />
            <span className="ml-1 text-sm font-medium">{selectedLocation.availableSpots} spots</span>
          </div>
        </div>
      </div>
      
      {/* Details Section */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg border border-parking-lightgray/60 p-4 animate-scale-in">
          <h3 className="text-lg font-bold">Details</h3>
          <div className="mt-4 space-y-3">
            <DetailItem title="ADDRESS" value={selectedLocation.address} />
            <DetailItem title="OPERATION" value={`Open Now · 10:00 AM - 11:30 PM`} />
          </div>
        </div>
        
        {/* Parking Duration Section */}
        <div className="mt-6 animate-scale-in">
          <h3 className="text-lg font-bold mb-4">Select Parking Duration</h3>
          <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2">
            {durations.map(duration => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`flex-shrink-0 rounded-lg border-2 px-6 py-3 transition-all ${
                  selectedDuration === duration 
                    ? 'border-parking-yellow bg-parking-yellow text-parking-dark' 
                    : 'border-parking-lightgray text-parking-dark'
                }`}
              >
                <span className="font-medium">{duration} hr</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Price Calculation */}
        <div className="mt-8 bg-parking-lightgray/30 rounded-lg p-4 flex justify-between items-center animate-scale-in">
          <div>
            <p className="text-sm text-parking-gray">Estimated Price</p>
            <p className="text-xl font-bold">₹{selectedLocation.pricePerHour * selectedDuration}</p>
          </div>
          <div className="flex items-center text-sm text-parking-dark">
            <Clock size={16} className="mr-1" />
            <span>{selectedDuration} {selectedDuration === 1 ? 'hour' : 'hours'}</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Action Button */}
      <div className="p-4 border-t border-parking-lightgray">
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={handlePickSpot}
          icon={<ChevronRight size={20} />}
          iconPosition="right"
        >
          Pick Spot
        </Button>
      </div>
    </div>
  );
};

interface DetailItemProps {
  title: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ title, value }) => (
  <div>
    <p className="text-xs text-parking-gray">{title}</p>
    <p className="text-sm font-medium mt-0.5">{value}</p>
  </div>
);

export default ParkingDetails;
