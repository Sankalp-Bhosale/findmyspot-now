
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBJHvvAp9JbmJz1upsIrh9AyWxY5NnEOJ8';

interface UseGoogleMapsProps {
  onUserLocationFound?: (location: { lat: number, lng: number }) => void;
}

export function useGoogleMaps({ onUserLocationFound }: UseGoogleMapsProps = {}) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if Google Maps is already loaded
      if (window.google?.maps) {
        console.log('Google Maps already loaded');
        setMapLoaded(true);
        
        // Initialize InfoWindow after confirming Maps is loaded
        if (!infoWindowRef.current && window.google.maps.InfoWindow) {
          try {
            infoWindowRef.current = new window.google.maps.InfoWindow();
            console.log('InfoWindow initialized successfully');
          } catch (error) {
            console.error('Error creating InfoWindow:', error);
          }
        }
        return;
      }

      // If not loaded, create and load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Create a global callback that will be called when the script loads
      window.initGoogleMaps = () => {
        console.log('Google Maps script loaded via callback');
        setMapLoaded(true);
        
        // Initialize InfoWindow after Maps is loaded via callback
        if (!infoWindowRef.current) {
          try {
            infoWindowRef.current = new window.google.maps.InfoWindow();
            console.log('InfoWindow initialized successfully via callback');
          } catch (error) {
            console.error('Error creating InfoWindow via callback:', error);
          }
        }
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
      // Remove the global callback when component unmounts
      if (window.initGoogleMaps) {
        // @ts-ignore
        window.initGoogleMaps = undefined;
      }
      
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
    
    // Get user's geolocation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('User position obtained:', userPos);
        setUserLocation(userPos);
        
        if (onUserLocationFound) {
          onUserLocationFound(userPos);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Could not get your location. Using default.');
        
        // Default to Mumbai, India if location access is denied
        const defaultPos = { lat: 19.076, lng: 72.877 };
        setUserLocation(defaultPos);
        
        if (onUserLocationFound) {
          onUserLocationFound(defaultPos);
        }
        
        setIsLoading(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, [mapLoaded, onUserLocationFound]);

  // Initialize map with center point
  const initializeMap = useCallback((center: { lat: number, lng: number }) => {
    if (!mapLoaded || !document.getElementById('map')) {
      console.error('Map cannot be initialized: map not loaded or element not found');
      return null;
    }

    console.log('Initializing map with center:', center);

    try {
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

      mapRef.current = new window.google.maps.Map(
        document.getElementById('map') as HTMLElement, 
        mapOptions
      );
      
      console.log('Map initialized');
      
      // Add user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      
      userMarkerRef.current = new window.google.maps.Marker({
        position: center,
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: 'Your Location'
      });
      
      // Always create a new InfoWindow after map initialization if it doesn't exist
      if (!infoWindowRef.current) {
        try {
          infoWindowRef.current = new window.google.maps.InfoWindow();
          console.log('InfoWindow created during map initialization');
        } catch (error) {
          console.error('Failed to create InfoWindow during map initialization:', error);
        }
      }
      
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
      
      return mapRef.current;
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map. Please refresh the page.');
      return null;
    }
  }, [mapLoaded]);

  // Update markers on the map
  const updateMapMarkers = useCallback((locations: Array<{
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    price_per_hour: number;
    total_spots: number;
    available_spots: number;
    distance?: string;
  }>, selectedLocationId: string | null, onLocationSelect: (id: string) => void) => {
    if (!mapRef.current || !window.google?.maps) {
      console.error('Map not initialized or Google Maps not loaded');
      return;
    }
    
    console.log('Updating map markers');
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add new markers
    locations.forEach(location => {
      try {
        const marker = new window.google.maps.Marker({
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
          onLocationSelect(location.id);
          
          // Show info window only if it's available and map is initialized
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
          } else {
            console.warn('InfoWindow or map not available for marker click');
          }
        });
        
        markersRef.current.push(marker);
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    });
  }, []);

  const centerMapOnLocation = useCallback((location: { lat: number, lng: number }) => {
    if (mapRef.current) {
      mapRef.current.panTo(location);
    }
  }, []);

  return {
    mapLoaded,
    isLoading,
    userLocation,
    mapRef,
    infoWindowRef,
    markersRef,
    initializeMap,
    updateMapMarkers,
    centerMapOnLocation
  };
}

