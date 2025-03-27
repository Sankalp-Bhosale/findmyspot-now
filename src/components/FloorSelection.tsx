import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/ui/NavBar';
import { Button } from '@/components/ui/Button';
import ParkingSpot from '@/components/ui/ParkingSpot';
import { useParking } from '@/context/ParkingContext';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

const FloorSelection: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLocation, availableSpots, getAvailableSpots, setSelectedSpot } = useParking();
  
  const [currentFloor, setCurrentFloor] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  
  if (!selectedLocation) {
    navigate('/home');
    return null;
  }
  
  const maxFloors = selectedLocation.floors;

  useEffect(() => {
    const loadSpots = async () => {
      setIsLoading(true);
      try {
        await getAvailableSpots(selectedLocation.id, currentFloor);
      } catch (error) {
        toast.error("Failed to load parking spots");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSpots();
  }, [currentFloor, selectedLocation.id]);

  const handleFloorChange = (floor: number) => {
    if (floor >= 1 && floor <= maxFloors) {
      setCurrentFloor(floor);
      setSelectedSpotId(null);
    }
  };

  const handleSpotSelect = (spot: any) => {
    if (spot.status === 'available') {
      setSelectedSpotId(spot.id);
      setSelectedSpot(spot);
    }
  };

  const handleProceed = () => {
    if (!selectedSpotId) {
      toast.error("Please select a parking spot");
      return;
    }
    
    navigate('/booking-details');
  };

  // Group spots into rows for display
  const spotRows = [];
  const spotsPerRow = 4;
  
  for (let i = 0; i < availableSpots.length; i += spotsPerRow) {
    spotRows.push(availableSpots.slice(i, i + spotsPerRow));
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <NavBar type="top" showBackButton title="Pick your spot" />
      
      {/* Loading indicator or floor selector */}
      <div className="pt-12 pb-4 px-4 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 size={24} className="animate-spin text-parking-yellow" />
            <span className="ml-2 text-sm">Loading spots...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleFloorChange(currentFloor - 1)}
              disabled={currentFloor <= 1}
              className={`p-2 rounded-full ${
                currentFloor <= 1 ? 'text-parking-gray/50' : 'text-parking-dark bg-parking-lightgray/50'
              }`}
            >
              <ArrowDown size={20} />
            </button>
            
            <div className="text-center">
              <p className="text-xs text-parking-gray">Floor</p>
              <div className="flex space-x-1 mt-1">
                {Array.from({ length: maxFloors }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleFloorChange(index + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      currentFloor === index + 1
                        ? 'bg-parking-yellow text-parking-dark font-medium'
                        : 'bg-parking-lightgray/50 text-parking-dark/70'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => handleFloorChange(currentFloor + 1)}
              disabled={currentFloor >= maxFloors}
              className={`p-2 rounded-full ${
                currentFloor >= maxFloors ? 'text-parking-gray/50' : 'text-parking-dark bg-parking-lightgray/50'
              }`}
            >
              <ArrowUp size={20} />
            </button>
          </div>
        )}
      </div>
      
      {/* Parking Layout */}
      <div className="flex-1 p-4 bg-parking-lightgray/30">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-parking-yellow animate-spin-slow" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-4 text-sm font-medium text-parking-gray">Loading parking spots...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <h3 className="text-center text-sm font-medium mb-6">
              Select a parking spot (F{currentFloor})
            </h3>
            
            {/* Legend */}
            <div className="flex justify-center space-x-6 mb-8">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-parking-success rounded-full mr-2"></div>
                <span className="text-xs">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-parking-error rounded-full mr-2"></div>
                <span className="text-xs">Occupied</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-parking-yellow rounded-full mr-2"></div>
                <span className="text-xs">Selected</span>
              </div>
            </div>
            
            {/* Parking Layout */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {/* Entry/Exit marker */}
                <div className="flex justify-center mb-8">
                  <div className="bg-parking-lightgray px-4 py-1 rounded-full">
                    <span className="text-xs font-medium">Entry / Exit</span>
                  </div>
                </div>
                
                {/* Parking spots grid */}
                <div className="space-y-8">
                  {spotRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center space-x-3">
                      {row.map(spot => (
                        <ParkingSpot
                          key={spot.id}
                          id={spot.id}
                          status={selectedSpotId === spot.id ? 'selected' : spot.status}
                          onClick={() => handleSpotSelect(spot)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                
                {/* Driving lane */}
                <div className="my-8 border-b-4 border-dotted border-parking-gray/20"></div>
                
                {/* Exit arrow */}
                <div className="flex justify-center mt-4">
                  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 24L0 4L4 0L20 16L36 0L40 4L20 24Z" fill="#E0E0E0"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Action Button */}
      <div className="p-4 border-t border-parking-lightgray">
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={handleProceed}
          disabled={!selectedSpotId || isLoading}
        >
          {selectedSpotId ? `Proceed with spot ${selectedSpotId}` : 'Select a spot'}
        </Button>
      </div>
    </div>
  );
};

export default FloorSelection;
