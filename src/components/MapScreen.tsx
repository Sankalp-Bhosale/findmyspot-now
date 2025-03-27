
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/ui/NavBar';
import { Button } from '@/components/ui/Button';
import LocationMarker from '@/components/ui/LocationMarker';
import { useParking } from '@/context/ParkingContext';
import { Search, MapPin, Navigation } from 'lucide-react';

const MapScreen: React.FC = () => {
  const navigate = useNavigate();
  const { parkingLocations, fetchNearbyLocations, setSelectedLocation } = useParking();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mock user location
  const userLocation = { lat: 19.9975, lng: 73.7898 };

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoading(true);
        await fetchNearbyLocations(userLocation.lat, userLocation.lng);
      } catch (error) {
        toast.error("Failed to load parking locations");
      } finally {
        setIsLoading(false);
      }
    };

    loadLocations();
  }, []);

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    const location = parkingLocations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
    }
  };

  const handleViewDetails = () => {
    if (selectedLocationId) {
      navigate('/parking-details');
    }
  };

  const filteredLocations = searchQuery 
    ? parkingLocations.filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : parkingLocations;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Map Container */}
      <div className="w-full h-screen bg-gray-200 relative">
        {/* Simple Map Placeholder */}
        <div className="absolute inset-0 bg-[#e5e3df] z-0">
          {/* Grid lines for map */}
          <div className="w-full h-full" style={{ 
            backgroundImage: 'linear-gradient(#d1d1d1 1px, transparent 1px), linear-gradient(90deg, #d1d1d1 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
          
          {/* Roads */}
          <div className="absolute top-1/2 left-0 right-0 h-6 bg-gray-400 transform -translate-y-1/2"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-6 bg-gray-400"></div>
          <div className="absolute top-3/4 left-1/4 right-0 h-4 bg-gray-400"></div>
          
          {/* Location Markers */}
          {!isLoading && filteredLocations.map(location => (
            <div
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                top: `${30 + Math.random() * 40}%`, 
                left: `${30 + Math.random() * 40}%` 
              }}
            >
              <LocationMarker
                name={location.name}
                distance={location.distance}
                available={location.availableSpots}
                selected={selectedLocationId === location.id}
                onClick={() => handleLocationSelect(location.id)}
              />
            </div>
          ))}
          
          {/* User Location */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                <Navigation size={14} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-blue-500 animate-ping"></div>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="absolute top-6 left-0 right-0 px-4 z-20">
          <div className="bg-white rounded-full shadow-lg flex items-center px-4 py-2">
            <Search size={20} className="text-parking-gray mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Where do you want to park?"
              className="flex-1 bg-transparent border-none outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-parking-gray p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Bottom Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent h-32 z-10"></div>
        
        {/* Location Details Card */}
        {selectedLocationId && (
          <div className="absolute bottom-20 left-0 right-0 px-4 z-20 animate-fade-in">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">
                    {parkingLocations.find(loc => loc.id === selectedLocationId)?.name}
                  </h3>
                  <p className="text-xs text-parking-gray mt-1 line-clamp-1">
                    {parkingLocations.find(loc => loc.id === selectedLocationId)?.address}
                  </p>
                  <div className="flex items-center mt-2">
                    <MapPin size={14} className="text-parking-yellow" />
                    <span className="text-xs ml-1">
                      {parkingLocations.find(loc => loc.id === selectedLocationId)?.distance} away
                    </span>
                    <span className="mx-2 text-parking-gray">•</span>
                    <span className="text-xs text-parking-success">
                      {parkingLocations.find(loc => loc.id === selectedLocationId)?.availableSpots} spots available
                    </span>
                  </div>
                </div>
                <div className="bg-parking-lightgray rounded-lg px-3 py-1">
                  <p className="text-xs font-medium text-parking-dark">₹{parkingLocations.find(loc => loc.id === selectedLocationId)?.pricePerHour}/hr</p>
                </div>
              </div>
              <Button
                variant="primary"
                fullWidth
                className="mt-4"
                onClick={handleViewDetails}
              >
                View Details
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Bar */}
      <NavBar type="bottom" />
    </div>
  );
};

export default MapScreen;
