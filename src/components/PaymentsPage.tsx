
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/ui/NavBar';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { Button } from '@/components/ui/Button';
import { CreditCard, Download, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  date: Date;
  parkingName: string;
  transactionId: string;
  paymentMethod: string;
  status: 'successful' | 'failed' | 'pending';
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  
  useEffect(() => {
    // Simulate API call to fetch payment history
    const fetchPayments = async () => {
      // Mocked data
      const mockPayments: Payment[] = [
        {
          id: '1',
          amount: 80,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          parkingName: 'Central City Parking',
          transactionId: 'TXN123456789',
          paymentMethod: 'Credit Card',
          status: 'successful'
        },
        {
          id: '2',
          amount: 40,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          parkingName: 'Market Square Garage',
          transactionId: 'TXN987654321',
          paymentMethod: 'UPI',
          status: 'successful'
        },
        {
          id: '3',
          amount: 120,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          parkingName: 'Tech Park Lot',
          transactionId: 'TXN456789123',
          paymentMethod: 'Debit Card',
          status: 'successful'
        },
        {
          id: '4',
          amount: 60,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          parkingName: 'Harbor View Garage',
          transactionId: 'TXN789123456',
          paymentMethod: 'Net Banking',
          status: 'failed'
        }
      ];
      
      setPayments(mockPayments);
    };
    
    fetchPayments();
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex items-center border-b border-parking-lightgray">
        <NavigationDrawer />
        <h1 className="text-lg font-medium ml-4">Payment History</h1>
      </div>
      
      <div className="flex-1 pt-16 px-4">
        <div className="py-4">
          {/* Payment Methods Section */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Payment Methods</h2>
            <div className="bg-white rounded-lg border border-parking-lightgray p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-parking-yellow rounded-full flex items-center justify-center mr-4">
                  <CreditCard size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Add Payment Method</h3>
                  <p className="text-sm text-parking-gray">Add a card or UPI for faster checkout</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
              >
                Add Payment Method
              </Button>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div>
            <h2 className="text-lg font-bold mb-4">Transaction History</h2>
            
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-parking-gray">No payment history available</p>
              </div>
            ) : (
              payments.map(payment => (
                <div key={payment.id} className="mb-4 bg-white rounded-lg border border-parking-lightgray p-4 animate-scale-in">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{payment.parkingName}</h3>
                      <p className="text-sm text-parking-gray mt-1">
                        Transaction ID: {payment.transactionId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{payment.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-parking-gray mr-2" />
                      <span className="text-sm">
                        {format(payment.date, 'dd MMM yyyy')}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock size={16} className="text-parking-gray mr-2" />
                      <span className="text-sm">
                        {format(payment.date, 'hh:mm a')}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <CreditCard size={16} className="text-parking-gray mr-2" />
                      <span className="text-sm">{payment.paymentMethod}</span>
                    </div>
                  </div>
                  
                  {payment.status === 'successful' && (
                    <div className="mt-4">
                      <Button variant="outline" className="w-full flex items-center justify-center">
                        <Download size={16} className="mr-2" />
                        Download Receipt
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <NavBar type="bottom" />
    </div>
  );
};

export default PaymentsPage;
