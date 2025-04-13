
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/ui/NavBar';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, Car, MapPin, Receipt, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Reservation {
  id: string;
  parkingName: string;
  location: string;
  startTime: Date;
  duration: number; // in hours
  vehicleNumber: string;
  amount: number;
  status: 'active' | 'completed' | 'cancelled';
}

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  
  useEffect(() => {
    // Simulate API call to fetch reservations
    const fetchReservations = async () => {
      // Mocked data
      const mockReservations: Reservation[] = [
        {
          id: '1',
          parkingName: 'Central City Parking',
          location: '123 Main Street, Downtown',
          startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          duration: 2,
          vehicleNumber: 'MH 12 AB 1234',
          amount: 80,
          status: 'active'
        },
        {
          id: '2',
          parkingName: 'Market Square Garage',
          location: '45 Market Lane, Uptown',
          startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          duration: 1,
          vehicleNumber: 'MH 12 CD 5678',
          amount: 40,
          status: 'active'
        },
        {
          id: '3',
          parkingName: 'Tech Park Lot',
          location: '789 Innovation Drive, Tech District',
          startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          duration: 3,
          vehicleNumber: 'MH 12 EF 9012',
          amount: 120,
          status: 'completed'
        },
        {
          id: '4',
          parkingName: 'Harbor View Garage',
          location: '234 Waterfront Avenue, East End',
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          duration: 2,
          vehicleNumber: 'MH 12 GH 3456',
          amount: 75,
          status: 'cancelled'
        }
      ];
      
      setReservations(mockReservations);
    };
    
    fetchReservations();
  }, []);
  
  const activeReservations = reservations.filter(r => r.status === 'active');
  const historyReservations = reservations.filter(r => r.status !== 'active');
  
  const handleCancelReservation = (id: string) => {
    setReservations(reservations.map(r => 
      r.id === id ? { ...r, status: 'cancelled' as const } : r
    ));
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex items-center border-b border-parking-lightgray">
        <NavigationDrawer />
        <h1 className="text-lg font-medium ml-4">My Reservations</h1>
      </div>
      
      <div className="flex-1 pt-16 px-4">
        {/* Tabs */}
        <div className="flex border-b border-parking-lightgray mt-2">
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'active' 
                ? 'text-parking-dark border-b-2 border-parking-yellow' 
                : 'text-parking-gray'
            }`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === 'history' 
                ? 'text-parking-dark border-b-2 border-parking-yellow' 
                : 'text-parking-gray'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
        
        {/* Reservations List */}
        <div className="py-4">
          {activeTab === 'active' && (
            <>
              {activeReservations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-parking-gray">No active reservations</p>
                  <Button variant="primary" className="mt-4" onClick={() => window.location.href = '/home'}>
                    Find Parking
                  </Button>
                </div>
              ) : (
                activeReservations.map(reservation => (
                  <div key={reservation.id} className="mb-4 bg-white rounded-lg border border-parking-lightgray p-4 animate-scale-in">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold">{reservation.parkingName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(reservation.status)}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center">
                        <MapPin size={16} className="text-parking-gray mr-2" />
                        <span className="text-sm">{reservation.location}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar size={16} className="text-parking-gray mr-2" />
                        <span className="text-sm">
                          {`${formatDistanceToNow(reservation.startTime, { addSuffix: true })}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock size={16} className="text-parking-gray mr-2" />
                        <span className="text-sm">
                          {`${reservation.duration} ${reservation.duration === 1 ? 'hour' : 'hours'}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Car size={16} className="text-parking-gray mr-2" />
                        <span className="text-sm">{reservation.vehicleNumber}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Receipt size={16} className="text-parking-gray mr-2" />
                        <span className="text-sm">₹{reservation.amount}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-red-500 border-red-500 hover:bg-red-50"
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        <X size={16} className="mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
          
          {activeTab === 'history' && (
            <>
              {historyReservations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-parking-gray">No reservation history</p>
                </div>
              ) : (
                historyReservations.map(reservation => (
                  <div key={reservation.id} className="mb-4 bg-white rounded-lg border border-parking-lightgray p-4 animate-scale-in">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold">{reservation.parkingName}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(reservation.status)}`}>
                        {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center">
                        <MapPin size={16} className="text-parking-gray mr-2" />
                        <span className="text-sm">{reservation.location}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar size={16} className="text-parking-gray mr-2" />
                        <span className="text-sm">
                          {`${formatDistanceToNow(reservation.startTime, { addSuffix: true })}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock size={16} className="text-parking-gray mr-2" />
                        <span className="text-sm">
                          {`${reservation.duration} ${reservation.duration === 1 ? 'hour' : 'hours'}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Car size={16} className="text-parking-gray mr-2" />
                        <span className="text-sm">{reservation.vehicleNumber}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Receipt size={16} className="text-parking-gray mr-2" />
                        <span className="text-sm">₹{reservation.amount}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        View Receipt
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <NavBar type="bottom" />
    </div>
  );
};

export default ReservationsPage;
