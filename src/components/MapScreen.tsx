
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/ui/NavBar';
import { Button } from '@/components/ui/Button';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { useParking } from '@/context/ParkingContext';
import { Search, MapPin, Navigation, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

// Define an interface for parking locations from Supabase
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

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your actual API key

const MapScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedLocation, fetchNearbyLocations, parkingLocations } = useParking();
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localParkingLocations, setLocalParkingLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ParkingLocation[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google?.maps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  // Initialize map after script loads
  useEffect(() => {
    if (!mapLoaded) return;

    // Try to get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userPos);
        initializeMap(userPos);
        fetchNearbyLocations(userPos.lat, userPos.lng);
      },
      (error) => {
        console.error('Error getting location:', error);
        // Default location (Mumbai)
        const defaultPos = { lat: 19.076, lng: 72.877 };
        setUserLocation(defaultPos);
        initializeMap(defaultPos);
        fetchNearbyLocations(defaultPos.lat, defaultPos.lng);
      }
    );
  }, [mapLoaded, fetchNearbyLocations]);

  // Update local state when parking locations change
  useEffect(() => {
    if (parkingLocations.length > 0) {
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
      
      // Add markers to map
      if (mapRef.current) {
        updateMapMarkers(mappedLocations);
      }
    }
  }, [parkingLocations]);

  // Set up real-time subscription to parking_locations table
  useEffect(() => {
    // Subscribe to changes in parking_locations table
    const channel = supabase
      .channel('public:parking_locations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'parking_locations' }, 
        (payload) => {
          console.log('Real-time update:', payload);
          // Refresh the locations when data changes
          if (userLocation) {
            fetchNearbyLocations(userLocation.lat, userLocation.lng);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLocation, fetchNearbyLocations]);

  // Update search results when query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = localParkingLocations.filter(location => 
      location.name.toLowerCase().includes(query) ||
      location.address.toLowerCase().includes(query)
    );
    
    setSearchResults(filtered);
  }, [searchQuery, localParkingLocations]);

  const initializeMap = (center: { lat: number, lng: number }) => {
    if (!mapLoaded || !document.getElementById('map')) return;

    const mapOptions: google.maps.MapOptions = {
      center,
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    mapRef.current = new google.maps.Map(
      document.getElementById('map') as HTMLElement, 
      mapOptions
    );

    // Add user marker
    new google.maps.Marker({
      position: center,
      map: mapRef.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: 'Your Location'
    });
  };

  // Update map markers when locations change
  const updateMapMarkers = useCallback((locations: ParkingLocation[]) => {
    if (!mapRef.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add new markers
    locations.forEach(location => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapRef.current,
        title: location.name,
        icon: {
          url: selectedLocationId === location.id 
            ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });
      
      marker.addListener('click', () => {
        handleLocationSelect(location.id);
      });
      
      markersRef.current.push(marker);
    });
  }, [selectedLocationId]);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    
    // Find the selected location
    const location = localParkingLocations.find(loc => loc.id === locationId);
    
    if (location && mapRef.current) {
      // Pan to the selected location
      mapRef.current.panTo({ lat: location.lat, lng: location.lng });
      
      // Update markers to highlight the selected one
      updateMapMarkers(localParkingLocations);
      
      // Convert to the format expected by ParkingContext
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
        floors: 3  // Assuming all locations have 3 floors for now
      };
      
      setSelectedLocation(formattedLocation);
    }
  };

  const handleViewDetails = () => {
    if (selectedLocationId) {
      navigate('/parking-details');
    }
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleSearchSelect = (locationId: string) => {
    handleLocationSelect(locationId);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header with Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex items-center border-b border-parking-lightgray">
        <NavigationDrawer />
        <h1 className="text-lg font-medium ml-4">Find Parking</h1>
      </div>
      
      {/* Map Container */}
      <div className="w-full h-screen pt-12 relative">
        {!mapLoaded || isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader className="animate-spin h-8 w-8 text-parking-yellow" />
            <span className="ml-2">Loading map...</span>
          </div>
        ) : (
          <div id="map" className="w-full h-full"></div>
        )}
        
        {/* Search Bar */}
        <div className="absolute top-16 left-0 right-0 px-4 z-20">
          <div 
            className="bg-white rounded-full shadow-lg flex items-center px-4 py-2 cursor-pointer"
            onClick={handleSearchClick}
          >
            <Search size={20} className="text-parking-gray mr-2" />
            <span className="text-sm text-parking-gray">Where do you want to park?</span>
          </div>
        </div>
        
        {/* Search Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-28 left-0 right-0 px-4 z-30">
            <div className="bg-white rounded-lg shadow-lg">
              <Command>
                <CommandInput
                  ref={searchInputRef}
                  placeholder="Search by location name or address..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="h-12"
                />
                <CommandList>
                  <CommandEmpty>No locations found.</CommandEmpty>
                  <CommandGroup>
                    {searchResults.map(location => (
                      <CommandItem
                        key={location.id}
                        onSelect={() => handleSearchSelect(location.id)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{location.name}</span>
                          <span className="text-xs text-parking-gray">{location.address}</span>
                          <div className="flex items-center mt-1">
                            <MapPin size={12} className="text-parking-yellow" />
                            <span className="text-xs ml-1">{location.distance} away</span>
                            <span className="mx-2 text-parking-gray">•</span>
                            <span className={`text-xs ${location.available_spots > 0 ? 'text-parking-success' : 'text-parking-error'}`}>
                              {location.available_spots > 0 ? `${location.available_spots} spots available` : 'No spots available'}
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              <div className="p-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent h-32 z-10"></div>
        
        {/* Location Details Card */}
        {selectedLocationId && (
          <div className="absolute bottom-20 left-0 right-0 px-4 z-20 animate-fade-in">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">
                    {localParkingLocations.find(loc => loc.id === selectedLocationId)?.name}
                  </h3>
                  <p className="text-xs text-parking-gray mt-1 line-clamp-1">
                    {localParkingLocations.find(loc => loc.id === selectedLocationId)?.address}
                  </p>
                  <div className="flex items-center mt-2">
                    <MapPin size={14} className="text-parking-yellow" />
                    <span className="text-xs ml-1">
                      {localParkingLocations.find(loc => loc.id === selectedLocationId)?.distance} away
                    </span>
                    <span className="mx-2 text-parking-gray">•</span>
                    <span className="text-xs text-parking-success">
                      {localParkingLocations.find(loc => loc.id === selectedLocationId)?.available_spots} spots available
                    </span>
                  </div>
                </div>
                <div className="bg-parking-lightgray rounded-lg px-3 py-1">
                  <p className="text-xs font-medium text-parking-dark">₹{localParkingLocations.find(loc => loc.id === selectedLocationId)?.price_per_hour}/hr</p>
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
