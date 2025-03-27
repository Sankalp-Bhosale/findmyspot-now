
import React, { createContext, useState, useContext } from 'react';

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
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

// Mock data for parking locations
const mockParkingLocations: ParkingLocation[] = [
  {
    id: 'p1',
    name: 'D-Mart Mall',
    address: 'Sanjivini Rd, Parvati Nagar, Nashik, Maharashtra 422005',
    coordinates: { lat: 19.9975, lng: 73.7898 },
    distance: '1.2 km',
    availableSpots: 45,
    totalSpots: 100,
    pricePerHour: 50,
    floors: 3
  },
  {
    id: 'p2',
    name: 'Central Plaza',
    address: '123 Main St, Downtown',
    coordinates: { lat: 19.9915, lng: 73.7828 },
    distance: '2.5 km',
    availableSpots: 12,
    totalSpots: 80,
    pricePerHour: 60,
    floors: 2
  },
  {
    id: 'p3',
    name: 'City Center',
    address: '456 Park Ave, Uptown',
    coordinates: { lat: 19.9875, lng: 73.7968 },
    distance: '3.7 km',
    availableSpots: 30,
    totalSpots: 120,
    pricePerHour: 40,
    floors: 4
  }
];

// Generate mock parking spots
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

  const fetchNearbyLocations = async (lat: number, lng: number) => {
    // In a real app, this would be an API call
    // For demo purposes, we use mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setParkingLocations(mockParkingLocations);
  };

  const getAvailableSpots = async (locationId: string, floor: number) => {
    // In a real app, this would be an API call
    // For demo purposes, we generate mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    setAvailableSpots(generateMockSpots(floor));
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'status'>): Promise<string> => {
    // In a real app, this would be an API call
    // For demo purposes, we create a local booking
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}`,
      status: 'active'
    };
    
    setBookings(prev => [...prev, newBooking]);
    setActiveBooking(newBooking);
    
    return newBooking.id;
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
      activeBooking
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
