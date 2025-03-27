
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Calendar, Settings, ArrowLeft } from 'lucide-react';

interface NavBarProps {
  type?: 'bottom' | 'top';
  showBackButton?: boolean;
  title?: string;
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({
  type = 'bottom',
  showBackButton = false,
  title,
  className,
}) => {
  const navigate = useNavigate();

  if (type === 'top') {
    return (
      <div className={cn(
        "fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 flex items-center border-b border-parking-lightgray",
        "animate-fade-in",
        className
      )}>
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-parking-lightgray mr-2"
          >
            <ArrowLeft size={20} className="text-parking-dark" />
          </button>
        )}
        {title && (
          <h1 className="text-lg font-medium">{title}</h1>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-parking-lightgray z-50",
      "animate-fade-in",
      className
    )}>
      <div className="max-w-md mx-auto flex items-center justify-around px-4 py-2">
        <NavButton
          icon={<Home size={24} />}
          label="Home"
          onClick={() => navigate('/')}
          isActive={location.pathname === '/'}
        />
        <NavButton
          icon={<Calendar size={24} />}
          label="Bookings"
          onClick={() => navigate('/bookings')}
          isActive={location.pathname === '/bookings'}
        />
        <NavButton
          icon={<Settings size={24} />}
          label="Settings"
          onClick={() => navigate('/settings')}
          isActive={location.pathname === '/settings'}
        />
      </div>
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  icon,
  label,
  onClick,
  isActive = false,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
      isActive
        ? "text-parking-yellow"
        : "text-parking-gray hover:text-parking-dark"
    )}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

export default NavBar;
