
import React, { createContext, useState, useContext, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance: string;
  availableSpots: number;
  totalSpots: number;
  pricePerHour: number;
  floors: number;
}

interface ParkingSpot {
  id: string;
  floor: number;
  status: 'available' | 'occupied' | 'selected' | 'disabled';
}

interface Booking {
  id: string;
  locationId: string;
  locationName: string;
  spotId: string;
  floor: number;
  startTime: Date;
  endTime: Date;
  vehicleDetails: {
    model: string;
    licensePlate: string;
  };
  price: number;
  status: 'active' | 'completed' | 'cancelled';
}

interface ParkingContextType {
  selectedLocation: ParkingLocation | null;
  setSelectedLocation: (location: ParkingLocation | null) => void;
  parkingLocations: ParkingLocation[];
  fetchNearbyLocations: (lat: number, lng: number) => Promise<void>;
  selectedSpot: ParkingSpot | null;
  setSelectedSpot: (spot: ParkingSpot | null) => void;
  availableSpots: ParkingSpot[];
  getAvailableSpots: (locationId: string, floor: number) => Promise<void>;
  bookings: Booking[];
  createBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<string>;
  activeBooking: Booking | null;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

// Fallback parking locations in case API fails
const FALLBACK_LOCATIONS = [
  {
    id: "3401bc9f-7fa0-42c1-a4e2-2d30c8531b49",
    name: "Central Parking",
    address: "123 Main St, Mumbai",
    lat: 19.076,
    lng: 72.877,
    price_per_hour: 50,
    total_spots: 100,
    available_spots: 75
  },
  {
    id: "2f975c24-d5e5-4550-8dd0-9c28b8cc3b30",
    name: "City Square Parking",
    address: "456 Park Ave, Delhi",
    lat: 28.613,
    lng: 77.209,
    price_per_hour: 40,
    total_spots: 150,
    available_spots: 120
  },
  {
    id: "a1c2547d-5d8a-4a0f-96e9-e49043f3502c",
    name: "Metro Parking Complex",
    address: "789 Station Rd, Bangalore",
    lat: 12.972,
    lng: 77.594,
    price_per_hour: 30,
    total_spots: 200,
    available_spots: 150
  },
  {
    id: "ed51369b-9f30-4cfe-bc41-7ebce0a2865f",
    name: "Riverside Parking",
    address: "101 River View, Kolkata",
    lat: 22.572,
    lng: 88.363,
    price_per_hour: 35,
    total_spots: 80,
    available_spots: 65
  },
  {
    id: "cf0f17d2-be97-47f6-ac18-5d5ad9f9ce3f",
    name: "Tech Hub Parking",
    address: "202 Cyber City, Hyderabad",
    lat: 17.385,
    lng: 78.486,
    price_per_hour: 45,
    total_spots: 120,
    available_spots: 90
  }
];

// Generate mock parking spots for now
// In a real app, this would be fetched from the backend
const generateMockSpots = (floor: number): ParkingSpot[] => {
  const spots: ParkingSpot[] = [];
  const totalSpots = 20;
  
  for (let i = 1; i <= totalSpots; i++) {
    // Make some spots occupied randomly
    const random = Math.random();
    const status = random < 0.3 ? 'occupied' : 
                  random < 0.05 ? 'disabled' : 'available';
    
    spots.push({
      id: `F${floor}-${i < 10 ? '0' + i : i}`,
      floor,
      status
    });
  }
  
  return spots;
};

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [parkingLocations, setParkingLocations] = useState<ParkingLocation[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [availableSpots, setAvailableSpots] = useState<ParkingSpot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1); // Default to 1 hour
  
  // Add a ref to track whether locations were already loaded
  const locationsLoadedRef = useRef(false);

  const fetchNearbyLocations = async (lat: number, lng: number) => {
    try {
      // Fetch parking locations from Supabase
      const { data, error } = await supabase
        .from('parking_locations')
        .select('*');
      
      if (error) throw error;
      
      let locationsData;
      
      if (data && data.length > 0) {
        // Use API data if available
        locationsData = data;
        console.log('Successfully loaded parking locations from API:', locationsData.length);
      } else {
        // Use fallback data if API returns empty array
        locationsData = FALLBACK_LOCATIONS;
        console.log('Using fallback parking locations data');
      }
      
      // Calculate distance from user's location
      const locationsWithDistance = locationsData.map(location => {
        const distance = calculateDistance(lat, lng, location.lat, location.lng);
        
        return {
          id: location.id,
          name: location.name,
          address: location.address,
          coordinates: {
            lat: location.lat,
            lng: location.lng
          },
          distance: `${distance.toFixed(1)} km`,
          availableSpots: location.available_spots,
          totalSpots: location.total_spots,
          pricePerHour: location.price_per_hour,
          floors: 3 // Assuming 3 floors for now
        };
      });
      
      setParkingLocations(locationsWithDistance);
      
      // Only show the success toast the first time locations are loaded
      if (!locationsLoadedRef.current) {
        toast.success('Parking locations loaded successfully');
        locationsLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      
      // Only show the error toast if locations haven't been loaded yet
      if (!locationsLoadedRef.current) {
        toast.error('Failed to load parking locations from API, using fallback data');
      }
      
      // Use fallback data in case of any error
      const locationsWithDistance = FALLBACK_LOCATIONS.map(location => {
        const distance = calculateDistance(lat, lng, location.lat, location.lng);
        
        return {
          id: location.id,
          name: location.name,
          address: location.address,
          coordinates: {
            lat: location.lat,
            lng: location.lng
          },
          distance: `${distance.toFixed(1)} km`,
          availableSpots: location.available_spots,
          totalSpots: location.total_spots,
          pricePerHour: location.price_per_hour,
          floors: 3 // Assuming 3 floors for now
        };
      });
      
      setParkingLocations(locationsWithDistance);
      
      // Mark as loaded even if we're using fallback data
      locationsLoadedRef.current = true;
    }
  };

  // Haversine formula to calculate distance
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

  const getAvailableSpots = async (locationId: string, floor: number) => {
    // In a real app, this would be an API call to get real-time spot availability
    // For demo purposes, we generate mock data
    try {
      // For now we're using mock data, but in a real app this would fetch from Supabase
      setAvailableSpots(generateMockSpots(floor));
    } catch (error) {
      console.error('Error getting available spots:', error);
      toast.error('Failed to load parking spots');
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'status'>): Promise<string> => {
    try {
      // In a real app, you would save this booking to Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          parking_location_id: bookingData.locationId,
          start_time: bookingData.startTime.toISOString(),
          end_time: bookingData.endTime.toISOString(),
          status: 'active',
          payment_status: 'pending',
          amount: bookingData.price
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newBooking: Booking = {
          ...bookingData,
          id: data.id,
          status: 'active'
        };
        
        setBookings(prev => [...prev, newBooking]);
        setActiveBooking(newBooking);
        
        return data.id;
      }
      
      throw new Error('Failed to create booking');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
      throw error;
    }
  };

  return (
    <ParkingContext.Provider value={{
      selectedLocation,
      setSelectedLocation,
      parkingLocations,
      fetchNearbyLocations,
      selectedSpot,
      setSelectedSpot,
      availableSpots,
      getAvailableSpots,
      bookings,
      createBooking,
      activeBooking,
      selectedDuration,
      setSelectedDuration
    }}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
}
