import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/ui/NavBar';
import { Button } from '@/components/ui/Button';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { useParking } from '@/context/ParkingContext';
import { Search, MapPin, Navigation, Loader, Compass } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import LocationMarker from '@/components/ui/LocationMarker';

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

const GOOGLE_MAPS_API_KEY = 'AIzaSyBJHvvAp9JbmJz1upsIrh9AyWxY5NnEOJ8';

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
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google?.maps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Maps script loaded');
        setMapLoaded(true);
      };
      
      script.onerror = (error) => {
        console.error('Error loading Google Maps script:', error);
        toast.error('Failed to load map. Please try again later.');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
    
    // Cleanup
    return () => {
      // Remove event listeners if needed
      markersRef.current.forEach(marker => {
        // Google maps handles cleanup of listeners when markers are removed
      });
    };
  }, []);

  // Initialize map with user location
  useEffect(() => {
    if (!mapLoaded) return;
    
    console.log('Map loaded, getting user location');
    
    // We'll initialize the InfoWindow only after the Google Maps script is loaded
    // This ensures the google.maps namespace is fully available
    try {
      if (window.google?.maps?.InfoWindow) {
        infoWindowRef.current = new window.google.maps.InfoWindow();
      } else {
        console.error('InfoWindow is not available');
      }
    } catch (error) {
      console.error('Error creating InfoWindow:', error);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('User position obtained:', userPos);
        setUserLocation(userPos);
        initializeMap(userPos);
        fetchNearbyLocations(userPos.lat, userPos.lng);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Could not get your location. Using default.');
        
        // Default to Mumbai, India if location access is denied
        const defaultPos = { lat: 19.076, lng: 72.877 };
        setUserLocation(defaultPos);
        initializeMap(defaultPos);
        fetchNearbyLocations(defaultPos.lat, defaultPos.lng);
      },
      { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, [mapLoaded, fetchNearbyLocations]);

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
      
      if (mapRef.current) {
        updateMapMarkers(mappedLocations);
      }
    }
  }, [parkingLocations]);

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

  // Filter search results based on query
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
    
    console.log('Search results:', filtered);
    setSearchResults(filtered);
  }, [searchQuery, localParkingLocations]);

  // Initialize map with center point
  const initializeMap = (center: { lat: number, lng: number }) => {
    if (!mapLoaded || !document.getElementById('map')) {
      console.error('Map cannot be initialized: map not loaded or element not found');
      return;
    }

    console.log('Initializing map with center:', center);

    const mapOptions: google.maps.MapOptions = {
      center,
      zoom: 14,
      disableDefaultUI: false,
      zoomControl: true,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      rotateControl: false,
      scrollwheel: true,
      gestureHandling: 'greedy',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    try {
      mapRef.current = new google.maps.Map(
        document.getElementById('map') as HTMLElement, 
        mapOptions
      );
      
      console.log('Map initialized');
      
      // Add user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      
      userMarkerRef.current = new google.maps.Marker({
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
      
      // Add click listener to map
      mapRef.current.addListener('click', () => {
        // Close info windows when clicking on the map
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
      });
      
      // Add user location marker click listener
      if (userMarkerRef.current && infoWindowRef.current && mapRef.current) {
        userMarkerRef.current.addListener('click', () => {
          infoWindowRef.current?.setContent('<div class="p-2"><strong>Your Location</strong></div>');
          infoWindowRef.current?.open({
            map: mapRef.current,
            anchor: userMarkerRef.current
          });
        });
      }
      
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please refresh the page.');
    }
  };

  // Update markers on the map
  const updateMapMarkers = useCallback((locations: ParkingLocation[]) => {
    if (!mapRef.current) {
      console.error('Map not initialized');
      return;
    }
    
    console.log('Updating map markers');
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add new markers
    locations.forEach(location => {
      try {
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
        
        // Add click listener to marker
        marker.addListener('click', () => {
          handleLocationSelect(location.id);
          
          // Show info window only if it's available
          if (infoWindowRef.current && mapRef.current) {
            const contentString = `
              <div class="p-3">
                <div class="font-bold">${location.name}</div>
                <div class="text-sm">${location.address}</div>
                <div class="mt-1 text-sm">
                  <span class="${location.available_spots > 0 ? 'text-green-600' : 'text-red-600'}">
                    ${location.available_spots} spots available
                  </span>
                </div>
                <div class="mt-1 text-sm">₹${location.price_per_hour}/hour</div>
              </div>
            `;
            
            infoWindowRef.current.setContent(contentString);
            infoWindowRef.current.open({
              map: mapRef.current,
              anchor: marker
            });
          }
        });
        
        markersRef.current.push(marker);
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    });
  }, [selectedLocationId]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c;
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    
    const location = localParkingLocations.find(loc => loc.id === locationId);
    
    if (location && mapRef.current) {
      console.log('Selected location:', location);
      
      // Animate map pan to the selected location
      mapRef.current.panTo({ lat: location.lat, lng: location.lng });
      
      // Update markers to highlight the selected one
      updateMapMarkers(localParkingLocations);
      
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
  };

  const handleViewDetails = () => {
    if (selectedLocationId) {
      navigate('/parking-details');
    } else {
      toast.error('Please select a parking location first');
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

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
      toast.success('Centered on your location');
    } else {
      toast.error('Unable to determine your location');
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex items-center border-b border-parking-lightgray">
        <NavigationDrawer />
        <h1 className="text-lg font-medium ml-4">Find Parking</h1>
      </div>
      
      <div className="w-full h-screen pt-12 relative">
        {!mapLoaded || isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader className="animate-spin h-8 w-8 text-parking-yellow" />
            <span className="ml-2">Loading map...</span>
          </div>
        ) : (
          <div id="map" className="w-full h-full"></div>
        )}
        
        {/* Search Input */}
        <div className="absolute top-16 left-0 right-0 px-4 z-20">
          <div 
            className="bg-white rounded-full shadow-lg flex items-center px-4 py-2 cursor-pointer"
            onClick={handleSearchClick}
          >
            <Search size={20} className="text-parking-gray mr-2" />
            <span className="text-sm text-parking-gray">Where do you want to park?</span>
          </div>
        </div>
        
        {/* Map Controls */}
        <div className="absolute top-28 right-4 z-20 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white shadow-md"
            onClick={handleCenterOnUser}
          >
            <Compass size={20} className="text-parking-dark" />
          </Button>
        </div>
        
        {/* Search Results */}
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
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent h-32 z-10"></div>
        
        {/* Selected Location Card */}
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
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (userLocation && mapRef.current) {
                      const location = localParkingLocations.find(loc => loc.id === selectedLocationId);
                      if (location) {
                        // Open in Google Maps for navigation
                        window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${location.lat},${location.lng}&travelmode=driving`, '_blank');
                      }
                    }
                  }}
                >
                  <Navigation size={16} className="mr-2" />
                  Navigate
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleViewDetails}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <NavBar type="bottom" />
    </div>
  );
};

export default MapScreen;
