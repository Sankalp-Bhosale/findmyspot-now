
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/ui/NavBar';
import { Button } from '@/components/ui/Button';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { useParking } from '@/context/ParkingContext';
import { Search, MapPin, Navigation, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const MapScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedLocation } = useParking();
  const [isLoading, setIsLoading] = useState(true);
  const [parkingLocations, setParkingLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
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
        loadParkingLocations(userPos);
      },
      (error) => {
        console.error('Error getting location:', error);
        // Default location (Mumbai)
        const defaultPos = { lat: 19.076, lng: 72.877 };
        setUserLocation(defaultPos);
        initializeMap(defaultPos);
        loadParkingLocations(defaultPos);
      }
    );
  }, [mapLoaded]);

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

  // Load parking locations from Supabase
  const loadParkingLocations = async (userPos: { lat: number, lng: number }) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('parking_locations')
        .select('*');
        
      if (error) throw error;
      
      if (data) {
        // Calculate distance from user
        const locationsWithDistance = data.map(location => {
          const distance = calculateDistance(
            userPos.lat, 
            userPos.lng, 
            location.lat, 
            location.lng
          );
          
          return {
            ...location,
            distance: `${distance.toFixed(1)} km`
          };
        });
        
        setParkingLocations(locationsWithDistance);
        
        // Add markers to map
        if (mapRef.current) {
          // Clear existing markers
          markersRef.current.forEach(marker => marker.setMap(null));
          markersRef.current = [];
          
          // Add new markers
          locationsWithDistance.forEach(location => {
            const marker = new google.maps.Marker({
              position: { lat: location.lat, lng: location.lng },
              map: mapRef.current,
              title: location.name,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }
            });
            
            marker.addListener('click', () => {
              handleLocationSelect(location.id);
            });
            
            markersRef.current.push(marker);
          });
        }
      }
    } catch (error) {
      console.error('Error loading parking locations:', error);
      toast.error("Failed to load parking locations");
    } finally {
      setIsLoading(false);
    }
  };

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
    const location = parkingLocations.find(loc => loc.id === locationId);
    
    if (location && mapRef.current) {
      // Pan to the selected location
      mapRef.current.panTo({ lat: location.lat, lng: location.lng });
      
      // Update markers to highlight the selected one
      markersRef.current.forEach(marker => {
        if (marker.getTitle() === location.name) {
          marker.setIcon({
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });
        } else {
          marker.setIcon({
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          });
        }
      });
      
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

  const filteredLocations = searchQuery 
    ? parkingLocations.filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : parkingLocations;

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
                      {parkingLocations.find(loc => loc.id === selectedLocationId)?.available_spots} spots available
                    </span>
                  </div>
                </div>
                <div className="bg-parking-lightgray rounded-lg px-3 py-1">
                  <p className="text-xs font-medium text-parking-dark">₹{parkingLocations.find(loc => loc.id === selectedLocationId)?.price_per_hour}/hr</p>
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
