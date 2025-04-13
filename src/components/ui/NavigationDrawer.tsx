
import React from 'react';
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerTrigger 
} from '@/components/ui/drawer';
import { useExtendedAuth } from '@/hooks/useExtendedAuth';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  User,
  MessageSquare,
  List,
  CreditCard,
  Map,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface NavigationDrawerProps {
  children?: React.ReactNode;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ children }) => {
  const { user, signOut } = useExtendedAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleNavigation = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleSignOut = () => {
    signOut();
    setOpen(false);
    navigate('/login');
  };
  
  const navItems = [
    { label: 'Home', icon: <Home size={20} />, path: '/home' },
    { label: 'Profile', icon: <User size={20} />, path: '/profile' },
    { label: 'Feedback', icon: <MessageSquare size={20} />, path: '/feedback' },
    { label: 'Reservations', icon: <List size={20} />, path: '/reservations' },
    { label: 'Payments', icon: <CreditCard size={20} />, path: '/payments' },
    { label: 'Map', icon: <Map size={20} />, path: '/home' },
  ];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="p-2 rounded-full hover:bg-parking-lightgray">
          <Menu size={24} className="text-parking-dark" />
        </button>
      </DrawerTrigger>
      
      <DrawerContent className="h-[95%] rounded-t-xl">
        <div className="px-4 py-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.name || 'User'}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-parking-yellow text-white flex items-center justify-center mr-3">
                  <span className="text-lg font-medium">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
              )}
              <div>
                <h3 className="font-medium text-lg">{user?.name || 'User'}</h3>
                <p className="text-xs text-parking-gray">{user?.email}</p>
              </div>
            </div>
            
            <DrawerClose asChild>
              <button className="p-2 rounded-full hover:bg-parking-lightgray">
                <X size={20} className="text-parking-dark" />
              </button>
            </DrawerClose>
          </div>
          
          <div className="mt-2 space-y-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className="flex items-center w-full p-3 rounded-lg hover:bg-parking-lightgray transition-colors"
              >
                <div className="mr-3 text-parking-dark">{item.icon}</div>
                <span className="text-parking-dark">{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-auto pt-4 border-t border-parking-lightgray">
            <Button
              variant="outline"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut size={20} className="mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NavigationDrawer;
