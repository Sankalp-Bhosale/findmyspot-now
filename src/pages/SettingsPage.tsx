
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/ui/NavBar';
import { User, Car, CreditCard, Shield, HelpCircle, LogOut } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: <User size={20} />, title: 'Personal Information', onClick: () => {} },
    { icon: <Car size={20} />, title: 'Vehicle Details', onClick: () => {} },
    { icon: <CreditCard size={20} />, title: 'Payment Methods', onClick: () => {} },
    { icon: <Shield size={20} />, title: 'Privacy & Security', onClick: () => {} },
    { icon: <HelpCircle size={20} />, title: 'Help & Support', onClick: () => {} },
  ];

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <NavBar type="top" title="Settings" />

      <div className="p-4 pt-16">
        {/* Profile Section */}
        <div className="flex items-center p-4 bg-parking-lightgray/20 rounded-lg mb-6">
          <div className="w-12 h-12 bg-parking-yellow rounded-full flex items-center justify-center text-white font-bold text-lg">
            JS
          </div>
          <div className="ml-4">
            <h3 className="font-bold">John Smith</h3>
            <p className="text-sm text-parking-gray">john.smith@example.com</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="rounded-lg border border-parking-lightgray overflow-hidden">
          {menuItems.map((item, index) => (
            <div 
              key={index}
              className="flex items-center p-4 border-b border-parking-lightgray last:border-b-0 cursor-pointer hover:bg-gray-50"
              onClick={item.onClick}
            >
              <div className="text-parking-gray">{item.icon}</div>
              <span className="ml-4">{item.title}</span>
              <div className="ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-parking-gray">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          className="mt-6 w-full flex items-center justify-center p-4 rounded-lg border border-parking-lightgray text-red-500"
          onClick={() => {}}
        >
          <LogOut size={20} className="mr-2" />
          <span>Logout</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <NavBar type="bottom" />
    </div>
  );
};

export default SettingsPage;
