
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useParking } from '@/context/ParkingContext';
import { CheckCircle, Navigation, Car, Calendar, Clock, X } from 'lucide-react';

const ConfirmationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { activeBooking, selectedLocation } = useParking();
  
  if (!activeBooking || !selectedLocation) {
    navigate('/home');
    return null;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleClose = () => {
    navigate('/home');
  };
  
  const handleNavigate = () => {
    // In a real app, this would initiate navigation to the parking location
    // For demo purposes, we'll just navigate back to the home screen
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-parking-yellow flex flex-col relative">
      {/* Close button */}
      <button 
        onClick={handleClose}
        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full"
      >
        <X size={24} className="text-parking-dark" />
      </button>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Success animation */}
        <div className="mb-4 animate-scale-in">
          <CheckCircle size={60} className="text-parking-dark" />
        </div>
        
        <h2 className="text-2xl font-bold text-parking-dark mb-1 animate-fade-in">
          Reservation Successful!
        </h2>
        <p className="text-sm text-parking-dark/70 text-center mb-8 animate-fade-in">
          Hooray! You've successfully reserved a parking spot at {selectedLocation.name}.
        </p>
        
        {/* Booking details card */}
        <div className="w-full max-w-md bg-white rounded-xl overflow-hidden shadow-lg animate-scale-in">
          {/* Car illustration */}
          <div className="bg-parking-yellow/20 p-4 flex justify-center">
            <div className="relative">
              <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="30" width="100" height="20" rx="5" fill="#212121" />
                <rect x="20" y="15" width="80" height="20" rx="4" fill="#424242" />
                <rect x="30" y="20" width="60" height="10" rx="2" fill="#78909C" />
                <circle cx="30" cy="50" r="10" fill="#212121" />
                <circle cx="30" cy="50" r="5" fill="#757575" />
                <circle cx="90" cy="50" r="10" fill="#212121" />
                <circle cx="90" cy="50" r="5" fill="#757575" />
                <rect x="25" y="12" width="70" height="3" rx="1.5" fill="#FFC107" />
              </svg>
            </div>
          </div>
          
          {/* Booking details */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-medium text-parking-gray">Spot</h3>
                <p className="text-lg font-bold">{activeBooking.spotId}</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-medium text-parking-gray">Price Paid</h3>
                <p className="text-lg font-bold">₹{activeBooking.price}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <DetailItem 
                icon={<Car size={18} />}
                label="Vehicle"
                value={`${activeBooking.vehicleDetails.model} · ${activeBooking.vehicleDetails.licensePlate}`}
              />
              
              <DetailItem 
                icon={<Calendar size={18} />}
                label="Date"
                value={formatDate(new Date(activeBooking.startTime))}
              />
              
              <DetailItem 
                icon={<Clock size={18} />}
                label="Time"
                value={`${formatTime(new Date(activeBooking.startTime))} - ${formatTime(new Date(activeBooking.endTime))}`}
              />
            </div>
            
            {/* QR Code */}
            <div className="mt-8 flex flex-col items-center">
              <div className="bg-parking-lightgray/30 p-4 rounded-lg">
                {/* Simple QR code placeholder */}
                <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="150" height="150" fill="white"/>
                  <rect x="20" y="20" width="30" height="30" fill="black"/>
                  <rect x="25" y="25" width="20" height="20" fill="white"/>
                  <rect x="30" y="30" width="10" height="10" fill="black"/>
                  
                  <rect x="100" y="20" width="30" height="30" fill="black"/>
                  <rect x="105" y="25" width="20" height="20" fill="white"/>
                  <rect x="110" y="30" width="10" height="10" fill="black"/>
                  
                  <rect x="20" y="100" width="30" height="30" fill="black"/>
                  <rect x="25" y="105" width="20" height="20" fill="white"/>
                  <rect x="30" y="110" width="10" height="10" fill="black"/>
                  
                  <rect x="60" y="20" width="10" height="10" fill="black"/>
                  <rect x="80" y="20" width="10" height="10" fill="black"/>
                  <rect x="20" y="60" width="10" height="10" fill="black"/>
                  <rect x="40" y="60" width="10" height="10" fill="black"/>
                  <rect x="60" y="60" width="30" height="10" fill="black"/>
                  <rect x="100" y="60" width="30" height="10" fill="black"/>
                  <rect x="60" y="80" width="10" height="10" fill="black"/>
                  <rect x="80" y="80" width="30" height="10" fill="black"/>
                  <rect x="120" y="80" width="10" height="10" fill="black"/>
                  <rect x="60" y="100" width="10" height="30" fill="black"/>
                  <rect x="80" y="100" width="10" height="10" fill="black"/>
                  <rect x="100" y="100" width="30" height="10" fill="black"/>
                  <rect x="80" y="120" width="50" height="10" fill="black"/>
                </svg>
              </div>
              
              <p className="text-xs text-parking-gray mt-2">
                Show this QR code at the parking entrance
              </p>
            </div>
            
            {/* Location details */}
            <div className="mt-6 pt-6 border-t border-parking-lightgray/60">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-parking-yellow/20 rounded-full flex items-center justify-center">
                  <MapPin size={20} className="text-parking-yellow" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">{selectedLocation.name}</h3>
                  <p className="text-xs text-parking-gray">{selectedLocation.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Button */}
      <div className="p-6">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleNavigate}
          icon={<Navigation size={20} />}
          className="bg-parking-dark text-white"
        >
          Navigate to Parking
        </Button>
      </div>
    </div>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="flex items-center">
    <div className="w-8 h-8 bg-parking-lightgray/40 rounded-full flex items-center justify-center">
      <div className="text-parking-gray">{icon}</div>
    </div>
    <div className="ml-3">
      <p className="text-xs text-parking-gray">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

// Map pin icon component
const MapPin = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default ConfirmationScreen;
