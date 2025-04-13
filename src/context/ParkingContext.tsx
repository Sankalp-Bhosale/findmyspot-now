
import React, { createContext, useState, useContext } from 'react';
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

  const fetchNearbyLocations = async (lat: number, lng: number) => {
    try {
      // Fetch parking locations from Supabase
      const { data, error } = await supabase
        .from('parking_locations')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Calculate distance from user's location
        const locationsWithDistance = data.map(location => {
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
      }
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      toast.error('Failed to load parking locations');
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
