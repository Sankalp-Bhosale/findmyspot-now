import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Menu, Search, MapPin, Navigation2, MoreVertical, RefreshCcw } from 'lucide-react';
import { useParking } from '@/context/ParkingContext';
import { supabase } from '@/integrations/supabase/client';

// Custom hook and components
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import GoogleMap from '@/components/map/GoogleMap';
import MapSearchBar from '@/components/map/MapSearchBar';
import MapControls from '@/components/map/MapControls';
import LocationCard from '@/components/map/LocationCard';

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  price_per_hour: number;
  total_spots: number;
  available_spots: number;
  distance?: string;
}

const MapScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedLocation, fetchNearbyLocations, parkingLocations } = useParking();
  const [isLoading, setIsLoading] = useState(true);
  const [localParkingLocations, setLocalParkingLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Initialize Google Maps with useGoogleMaps hook
  const { 
    mapLoaded, 
    userLocation, 
    initializeMap, 
    updateMapMarkers, 
    centerMapOnLocation,
    loadError,
    isLoading 
  } = useGoogleMaps({
    onUserLocationFound: (location) => {
      console.log('User location updated:', location);
      fetchNearbyLocations(location.lat, location.lng);
    }
  });

  // Initialize map when user location is found
  useEffect(() => {
    if (mapLoaded && userLocation) {
      const map = initializeMap(userLocation);
      if (map) {
        console.log("Map successfully initialized");
      }
    }
  }, [mapLoaded, userLocation, initializeMap]);

  // Update local parking locations when data changes
  useEffect(() => {
    if (parkingLocations.length > 0) {
      console.log('Parking locations updated:', parkingLocations);
      
      const mappedLocations = parkingLocations.map(loc => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        lat: loc.coordinates.lat,
        lng: loc.coordinates.lng,
        price_per_hour: loc.pricePerHour,
        total_spots: loc.totalSpots,
        available_spots: loc.availableSpots,
        distance: loc.distance
      }));
      
      setLocalParkingLocations(mappedLocations);
      setIsLoading(false);
      
      // Update markers on the map
      updateMapMarkers(mappedLocations, selectedLocationId, handleLocationSelect);
    }
  }, [parkingLocations, selectedLocationId, updateMapMarkers]);

  // Listen for real-time updates on parking locations
  useEffect(() => {
    const channel = supabase
      .channel('public:parking_locations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'parking_locations' }, 
        (payload) => {
          console.log('Real-time update:', payload);
          if (userLocation) {
            fetchNearbyLocations(userLocation.lat, userLocation.lng);
          }
        }
      )
      .subscribe((status) => {
        console.log('Supabase realtime subscription status:', status);
      });

    console.log('Supabase realtime channel subscribed');
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLocation, fetchNearbyLocations]);

  const handleLocationSelect = useCallback((locationId: string) => {
    setSelectedLocationId(locationId);
    
    const location = localParkingLocations.find(loc => loc.id === locationId);
    
    if (location) {
      console.log('Selected location:', location);
      
      // Center map on the selected location
      centerMapOnLocation({ lat: location.lat, lng: location.lng });
      
      // Update markers to highlight the selected one
      updateMapMarkers(localParkingLocations, locationId, handleLocationSelect);
      
      // Create formatted location object for the ParkingContext
      const formattedLocation = {
        id: location.id,
        name: location.name,
        address: location.address,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        distance: location.distance || "Unknown",
        availableSpots: location.available_spots,
        totalSpots: location.total_spots,
        pricePerHour: location.price_per_hour,
        floors: 3
      };
      
      setSelectedLocation(formattedLocation);
    }
  }, [localParkingLocations, centerMapOnLocation, updateMapMarkers, setSelectedLocation]);

  const handleViewDetails = () => {
    if (selectedLocationId) {
      navigate('/parking-details');
    } else {
      toast.error('Please select a parking location first');
    }
  };

  const handleCenterOnUser = useCallback(() => {
    if (userLocation) {
      centerMapOnLocation(userLocation);
      toast.success('Centered on your location');
    } else {
      toast.error('Unable to determine your location');
    }
  }, [userLocation, centerMapOnLocation]);

  const handleRefreshMap = () => {
    if (userLocation) {
      setIsLoading(true);
      fetchNearbyLocations(userLocation.lat, userLocation.lng);
      toast.success('Refreshing parking locations');
    }
  };

  // Get the selected location for displaying in the card
  const selectedLocation = selectedLocationId 
    ? localParkingLocations.find(loc => loc.id === selectedLocationId) || null
    : null;

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed top-0 left-0 right-0 bg-yellow-400 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2"
          >
            <Menu size={24} color="#000" />
          </button>
          <h1 className="text-xl font-bold ml-4 uppercase">Park My Car</h1>
        </div>
        <button className="p-2">
          <MoreVertical size={24} color="#000" />
        </button>
      </div>
      
      <div className="w-full h-screen pt-14 relative">
        <GoogleMap 
          isLoading={isLoading} 
          mapLoaded={mapLoaded} 
          loadError={loadError}
        >
          <MapSearchBar 
            locations={localParkingLocations} 
            onLocationSelect={handleLocationSelect} 
          />
          
          <div className="absolute bottom-20 right-4 z-20 flex flex-col space-y-3">
            <button 
              onClick={handleCenterOnUser}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Center on my location"
            >
              <Navigation2 size={24} className="text-gray-700" />
            </button>
            <button 
              onClick={handleRefreshMap}
              className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              aria-label="Refresh parking locations"
            >
              <RefreshCcw size={24} className="text-gray-700" />
            </button>
          </div>
          
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{selectedLocation.name}</h3>
                    <p className="text-sm text-gray-500">{selectedLocation.address}</p>
                    <div className="mt-1">
                      <span className={`text-sm ${selectedLocation.available_spots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedLocation.available_spots} spots available
                      </span>
                    </div>
                    <p className="text-sm mt-1">₹{selectedLocation.price_per_hour}/hour</p>
                  </div>
                  <button 
                    onClick={handleViewDetails}
                    className="bg-yellow-400 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          )}
        </GoogleMap>
      </div>
      
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsDrawerOpen(false)}>
          <div 
            className="absolute top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-yellow-400">
              <h2 className="text-xl font-bold">Menu</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => {
                      navigate('/home');
                      setIsDrawerOpen(false);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <MapPin size={20} />
                    <span>Find Parking</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      navigate('/reservations');
                      setIsDrawerOpen(false);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <MapPin size={20} />
                    <span>My Reservations</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setIsDrawerOpen(false);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <MapPin size={20} />
                    <span>My Profile</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      navigate('/settings');
                      setIsDrawerOpen(false);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <MapPin size={20} />
                    <span>Settings</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapScreen;
