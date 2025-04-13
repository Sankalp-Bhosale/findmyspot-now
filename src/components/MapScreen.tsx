
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/ui/NavBar';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
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

  // Initialize Google Maps with useGoogleMaps hook
  const { 
    mapLoaded, 
    userLocation, 
    initializeMap, 
    updateMapMarkers, 
    centerMapOnLocation 
  } = useGoogleMaps({
    onUserLocationFound: (location) => {
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
      .subscribe();

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

  const handleCenterOnUser = () => {
    if (userLocation) {
      centerMapOnLocation(userLocation);
      toast.success('Centered on your location');
    } else {
      toast.error('Unable to determine your location');
    }
  };

  // Get the selected location for displaying in the card
  const selectedLocation = selectedLocationId 
    ? localParkingLocations.find(loc => loc.id === selectedLocationId) || null
    : null;

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex items-center border-b border-parking-lightgray">
        <NavigationDrawer />
        <h1 className="text-lg font-medium ml-4">Find Parking</h1>
      </div>
      
      <div className="w-full h-screen pt-12 relative">
        <GoogleMap isLoading={isLoading} mapLoaded={mapLoaded}>
          <MapSearchBar 
            locations={localParkingLocations} 
            onLocationSelect={handleLocationSelect} 
          />
          
          <MapControls onCenterUser={handleCenterOnUser} />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent h-32 z-10"></div>
          
          {selectedLocation && (
            <LocationCard 
              location={selectedLocation}
              userLocation={userLocation}
              onViewDetails={handleViewDetails}
            />
          )}
        </GoogleMap>
      </div>
      
      <NavBar type="bottom" />
    </div>
  );
};

export default MapScreen;
