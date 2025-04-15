
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

// Define Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyC-tRYeuLcSUFQMp6plLNxyR7jYW1Benw8';

interface UseGoogleMapsProps {
  onUserLocationFound?: (location: { lat: number, lng: number }) => void;
}

export function useGoogleMaps({ onUserLocationFound }: UseGoogleMapsProps = {}) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Use window.google to avoid TypeScript namespace errors
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const scriptLoadingRef = useRef(false);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // If already loading, don't try to load again
      if (scriptLoadingRef.current) return;
      
      // If already loaded, just initialize
      if (window.google?.maps) {
        console.log('Google Maps already loaded');
        setMapLoaded(true);
        
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

      // Set loading flag
      scriptLoadingRef.current = true;
      
      // Remove any existing Google Maps scripts to prevent conflicts
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => script.remove());
      
      // Create and append new script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      window.initGoogleMaps = () => {
        console.log('Google Maps script loaded via callback');
        scriptLoadingRef.current = false;
        setMapLoaded(true);
        setLoadError(null);
        
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
        scriptLoadingRef.current = false;
        setLoadError('Failed to load Google Maps');
        toast.error('Failed to load map. Please check your internet connection and try again.');
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
    
    return () => {
      if (window.initGoogleMaps) {
        window.initGoogleMaps = undefined;
      }
      
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded) return;
    
    console.log('Map loaded, getting user location');
    
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
        
        // Mumbai coordinates as default
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

  const initializeMap = useCallback((center: { lat: number, lng: number }) => {
    if (!mapLoaded || !document.getElementById('map')) {
      console.error('Map cannot be initialized: map not loaded or element not found');
      return null;
    }

    console.log('Initializing map with center:', center);

    try {
      // Use window.google to make sure TypeScript knows it's globally available
      const mapOptions: any = {
        center,
        zoom: 14,
        disableDefaultUI: false, // Enable default UI for better user experience
        zoomControl: true,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        rotateControl: false,
        scrollwheel: true,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#333333" }]
          },
          {
            featureType: "landscape",
            elementType: "all",
            stylers: [{ color: "#f2f2f2" }]
          },
          {
            featureType: "poi",
            elementType: "all",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "road",
            elementType: "all",
            stylers: [{ saturation: -100 }, { lightness: 45 }]
          },
          {
            featureType: "transit",
            elementType: "all",
            stylers: [{ visibility: "simplified" }]
          },
          {
            featureType: "water",
            elementType: "all",
            stylers: [{ color: "#b2e1ff" }, { visibility: "on" }]
          }
        ]
      };

      // Clear any existing map instance
      if (mapRef.current) {
        mapRef.current = null;
      }

      mapRef.current = new window.google.maps.Map(
        document.getElementById('map') as HTMLElement, 
        mapOptions
      );
      
      console.log('Map initialized');
      
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      
      userMarkerRef.current = new window.google.maps.Marker({
        position: center,
        map: mapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#FFCD00', // Yellow color for user marker
          fillOpacity: 1,
          strokeColor: '#000000',
          strokeWeight: 1,
        },
        title: 'Your Location'
      });
      
      if (!infoWindowRef.current) {
        try {
          infoWindowRef.current = new window.google.maps.InfoWindow();
          console.log('InfoWindow created during map initialization');
        } catch (error) {
          console.error('Failed to create InfoWindow during map initialization:', error);
        }
      }
      
      mapRef.current.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
      });
      
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
    
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
    
    locations.forEach(location => {
      try {
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: mapRef.current,
          title: location.name,
          icon: {
            url: selectedLocationId === location.id 
              ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          }
        });
        
        marker.addListener('click', () => {
          onLocationSelect(location.id);
          
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
    loadError,
    initializeMap,
    updateMapMarkers,
    centerMapOnLocation
  };
}
