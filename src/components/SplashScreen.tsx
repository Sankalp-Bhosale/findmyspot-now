
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Start animation after a small delay
    const animationTimer = setTimeout(() => {
      setAnimate(true);
    }, 300);

    // Navigate to onboarding after 2.5s
    const navigationTimer = setTimeout(() => {
      navigate('/onboarding');
    }, 2500);

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-parking-yellow text-parking-dark p-6">
      <div className={`transition-all duration-700 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* City Illustration */}
        <div className="relative w-full max-w-xs mx-auto mb-12 animate-float">
          <div className="relative">
            <svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" className="w-full">
              {/* Simplified city skyline */}
              <rect x="40" y="80" width="30" height="100" fill="#f1f1f1" rx="2" />
              <rect x="80" y="50" width="40" height="130" fill="#e6e6e6" rx="2" />
              <rect x="130" y="70" width="25" height="110" fill="#f8f8f8" rx="2" />
              <rect x="165" y="40" width="35" height="140" fill="#e0e0e0" rx="2" />
              <rect x="210" y="90" width="30" height="90" fill="#f5f5f5" rx="2" />
              <rect x="250" y="60" width="45" height="120" fill="#e9e9e9" rx="2" />
              
              {/* Windows */}
              {Array.from({ length: 12 }).map((_, i) => (
                <rect key={i} 
                  x={90 + (i % 4) * 10} 
                  y={60 + Math.floor(i / 4) * 20} 
                  width="6" 
                  height="6" 
                  fill="#FFD54F" 
                />
              ))}
              
              {Array.from({ length: 9 }).map((_, i) => (
                <rect key={i} 
                  x={175 + (i % 3) * 8} 
                  y={50 + Math.floor(i / 3) * 15} 
                  width="4" 
                  height="4" 
                  fill="#FFD54F" 
                />
              ))}
              
              {/* Road */}
              <rect x="0" y="170" width="320" height="10" fill="#424242" />
              <line x1="0" y1="175" x2="320" y2="175" stroke="#FFFFFF" strokeDasharray="8 12" />
              
              {/* Car */}
              <g transform="translate(60, 155)" className="animate-pulse-soft">
                <rect x="0" y="0" width="30" height="12" fill="#2196F3" rx="3" />
                <rect x="5" y="-5" width="20" height="8" fill="#64B5F6" rx="2" />
                <circle cx="5" cy="12" r="3" fill="#212121" />
                <circle cx="25" cy="12" r="3" fill="#212121" />
              </g>
              
              {/* Clouds */}
              <g className="animate-pulse-soft">
                <circle cx="50" cy="30" r="10" fill="white" opacity="0.9" />
                <circle cx="60" cy="35" r="8" fill="white" opacity="0.9" />
                <circle cx="40" cy="35" r="7" fill="white" opacity="0.9" />
              </g>
              
              <g className="animate-pulse-soft">
                <circle cx="260" cy="40" r="12" fill="white" opacity="0.9" />
                <circle cx="270" cy="45" r="10" fill="white" opacity="0.9" />
                <circle cx="250" cy="45" r="8" fill="white" opacity="0.9" />
              </g>
              
              {/* Map pins */}
              <circle cx="100" cy="110" r="5" fill="#F44336" stroke="white" strokeWidth="2" />
              <circle cx="200" cy="90" r="5" fill="#F44336" stroke="white" strokeWidth="2" />
              <circle cx="270" cy="120" r="5" fill="#F44336" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Logo and Text */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">
            Park It
          </h1>
          <p className="text-sm font-medium opacity-80">
            Make it Smart City
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
