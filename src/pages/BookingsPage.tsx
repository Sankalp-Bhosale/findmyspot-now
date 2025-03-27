
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/ui/NavBar';
import { Calendar, Clock } from 'lucide-react';

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();

  // This is a placeholder for actual booking data
  const bookings = [
    {
      id: '1',
      locationName: 'City Center Parking',
      date: '27 Mar 2025',
      time: '14:00 - 16:00',
      status: 'active',
    },
    {
      id: '2',
      locationName: 'Mall Parking Lot',
      date: '30 Mar 2025',
      time: '10:00 - 12:00',
      status: 'upcoming',
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <NavBar type="top" title="Your Bookings" />

      <div className="p-4 pt-16">
        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id}
                className="border border-parking-lightgray rounded-lg p-4 animate-scale-in"
              >
                <h3 className="font-bold text-lg">{booking.locationName}</h3>
                <div className="mt-3 flex items-center text-sm text-parking-gray">
                  <Calendar size={16} className="mr-2" />
                  <span>{booking.date}</span>
                </div>
                <div className="mt-1 flex items-center text-sm text-parking-gray">
                  <Clock size={16} className="mr-2" />
                  <span>{booking.time}</span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'active' 
                      ? 'bg-parking-success/20 text-parking-success' 
                      : 'bg-parking-yellow/20 text-parking-yellow'
                  }`}>
                    {booking.status === 'active' ? 'Active' : 'Upcoming'}
                  </span>
                  <button 
                    className="text-sm text-parking-yellow font-medium"
                    onClick={() => {}}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="bg-parking-lightgray/30 p-6 rounded-full mb-4">
              <Calendar size={48} className="text-parking-gray" />
            </div>
            <h3 className="text-lg font-bold text-center">No bookings yet</h3>
            <p className="text-parking-gray text-center mt-2">
              Your parking reservations will appear here
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <NavBar type="bottom" />
    </div>
  );
};

export default BookingsPage;
