
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavBar from '@/components/ui/NavBar';
import { Button } from '@/components/ui/Button';
import { CustomInput } from '@/components/ui/CustomInput';
import { useParking } from '@/context/ParkingContext';
import { Car, Calendar, Clock, CreditCard, ArrowLeft, ArrowRight } from 'lucide-react';

interface BookingFormData {
  carModel: string;
  licensePlate: string;
}

interface BookingFormErrors {
  carModel?: string;
  licensePlate?: string;
}

const BookingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLocation, selectedSpot, createBooking } = useParking();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'google' | 'paytm'>('google');
  
  const [formData, setFormData] = useState<BookingFormData>({
    carModel: '',
    licensePlate: ''
  });
  
  const [errors, setErrors] = useState<BookingFormErrors>({});
  
  if (!selectedLocation || !selectedSpot) {
    navigate('/home');
    return null;
  }

  // Calculate arrival and leaving time
  const now = new Date();
  const arrivalTime = new Date(now.getTime());
  const leavingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Default: 2 hours later
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const validateForm = (): boolean => {
    const newErrors: BookingFormErrors = {};
    
    if (!formData.carModel.trim()) {
      newErrors.carModel = 'Car model is required';
    }
    
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    } else if (!/^[A-Z0-9 ]{5,10}$/i.test(formData.licensePlate.trim())) {
      newErrors.licensePlate = 'Enter a valid license plate';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method: 'google' | 'paytm') => {
    setPaymentMethod(method);
  };

  const handleReserve = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await createBooking({
        locationId: selectedLocation.id,
        locationName: selectedLocation.name,
        spotId: selectedSpot.id,
        floor: selectedSpot.floor,
        startTime: arrivalTime,
        endTime: leavingTime,
        vehicleDetails: {
          model: formData.carModel,
          licensePlate: formData.licensePlate
        },
        price: selectedLocation.pricePerHour * 2 // 2 hours
      });
      
      toast.success("Booking confirmed!");
      navigate('/confirmation');
    } catch (error) {
      toast.error("Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <NavBar type="top" showBackButton title="Booking Details" />
      
      <div className="flex-1 p-4 pt-16">
        {/* Time Selection */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-parking-lightgray animate-scale-in">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Arriving</h3>
              <div className="flex items-center">
                <Clock size={16} className="text-parking-gray mr-2" />
                <span className="text-parking-dark">{formatTime(arrivalTime)}</span>
              </div>
            </div>
            
            <div className="w-10 h-0 border-t-2 border-dashed border-parking-lightgray"></div>
            
            <div className="bg-parking-yellow text-parking-dark text-xs font-medium px-2 py-1 rounded">
              2 hrs
            </div>
            
            <div className="w-10 h-0 border-t-2 border-dashed border-parking-lightgray"></div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Leaving</h3>
              <div className="flex items-center">
                <Clock size={16} className="text-parking-gray mr-2" />
                <span className="text-parking-dark">{formatTime(leavingTime)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vehicle Details */}
        <div className="mt-6 animate-scale-in">
          <h3 className="text-lg font-bold mb-4">Vehicle Details</h3>
          
          <div className="space-y-4">
            <CustomInput
              label="Car"
              placeholder="Maruti Swift"
              name="carModel"
              value={formData.carModel}
              onChange={handleChange}
              error={errors.carModel}
              icon={<Car size={18} />}
            />
            
            <CustomInput
              label="Number Plate"
              placeholder="GJ 05 DG 8578"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              error={errors.licensePlate}
              icon={<CreditCard size={18} />}
            />
          </div>
        </div>
        
        {/* Payment Method */}
        <div className="mt-6 animate-scale-in">
          <h3 className="text-lg font-bold mb-4">Payment method</h3>
          
          <div className="flex space-x-4">
            <PaymentOption
              id="google"
              name="Google Pay"
              selected={paymentMethod === 'google'}
              onClick={() => handlePaymentMethodChange('google')}
            />
            
            <PaymentOption
              id="paytm"
              name="Paytm"
              selected={paymentMethod === 'paytm'}
              onClick={() => handlePaymentMethodChange('paytm')}
            />
          </div>
        </div>
        
        {/* Pricing Summary */}
        <div className="mt-8 bg-parking-lightgray/30 rounded-lg p-4 flex justify-between items-center animate-scale-in">
          <div>
            <p className="text-sm text-parking-gray">AMOUNT TO BE PAID</p>
            <p className="text-xl font-bold">₹{selectedLocation.pricePerHour * 2}</p>
          </div>
        </div>
      </div>
      
      {/* Bottom Action Button */}
      <div className="p-4 border-t border-parking-lightgray">
        <Button
          variant="default"
          size="lg"
          fullWidth
          onClick={handleReserve}
          isLoading={isLoading}
        >
          Pay & Reserve
        </Button>
      </div>
    </div>
  );
};

interface PaymentOptionProps {
  id: string;
  name: string;
  selected: boolean;
  onClick: () => void;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({
  id,
  name,
  selected,
  onClick
}) => (
  <button
    onClick={onClick}
    className={`flex items-center border rounded-lg p-3 transition-all ${
      selected 
        ? 'border-parking-yellow bg-parking-yellow/10' 
        : 'border-parking-lightgray'
    }`}
  >
    <div className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center ${
      selected ? 'border-parking-yellow' : 'border-parking-gray'
    }`}>
      {selected && <div className="w-2.5 h-2.5 bg-parking-yellow rounded-full"></div>}
    </div>
    <span className="font-medium">{name}</span>
  </button>
);

export default BookingDetails;
