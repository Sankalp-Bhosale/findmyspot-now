
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressDots from '@/components/ui/ProgressDots';
import { Button } from '@/components/ui/Button';
import { ArrowRight, MapPin, Calendar, Search } from 'lucide-react';

interface OnboardingSlide {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: React.ReactNode;
}

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [animateOut, setAnimateOut] = useState(false);

  // Define our onboarding slides content
  const slides: OnboardingSlide[] = [
    {
      title: "Find the nearest parking lot",
      description: "Avoiding parking stress by finding a parking spot near you",
      icon: <MapPin className="text-parking-dark" size={24} />,
      image: (
        <div className="relative h-64 w-full flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm w-40 h-40 rounded-full absolute z-0"></div>
          <div className="relative z-10 w-64">
            <svg className="w-full" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Simplified car illustration */}
              <g transform="translate(80,100)">
                <rect x="0" y="0" width="120" height="35" rx="10" fill="#212121" />
                <rect x="15" y="-15" width="90" height="25" rx="8" fill="#424242" />
                <rect x="25" y="-5" width="70" height="15" rx="4" fill="#78909C" />
                <circle cx="25" cy="35" r="12" fill="#212121" />
                <circle cx="25" cy="35" r="6" fill="#757575" />
                <circle cx="95" cy="35" r="12" fill="#212121" />
                <circle cx="95" cy="35" r="6" fill="#757575" />
                <circle cx="107" cy="15" r="4" fill="#FFEB3B" />
                <circle cx="13" cy="15" r="4" fill="#FFEB3B" />
              </g>
              
              {/* Road */}
              <rect x="0" y="135" width="280" height="30" fill="#424242" rx="1" />
              <line x1="10" y1="150" x2="270" y2="150" stroke="#FFFFFF" strokeDasharray="10 15" strokeWidth="2" />
            </svg>
          </div>
        </div>
      )
    },
    {
      title: "Book your Slot on the go",
      description: "Reserve your spot and enjoy hassle-free parking",
      icon: <Calendar className="text-parking-dark" size={24} />,
      image: (
        <div className="relative h-64 w-full flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm w-40 h-40 rounded-full absolute z-0"></div>
          <div className="relative z-10 w-64">
            <svg className="w-full" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Scooter illustration */}
              <g transform="translate(70,110)">
                <circle cx="30" cy="30" r="25" fill="#212121" stroke="#424242" strokeWidth="2" />
                <circle cx="30" cy="30" r="15" fill="#757575" />
                <circle cx="110" cy="30" r="25" fill="#212121" stroke="#424242" strokeWidth="2" />
                <circle cx="110" cy="30" r="15" fill="#757575" />
                <path d="M40 -20 L90 -20 L115 10 L90 25 L35 25 L25 0 Z" fill="#2196F3" />
                <rect x="60" y="-40" width="20" height="20" rx="3" fill="#1976D2" />
                <rect x="95" y="-10" width="25" height="5" rx="2" fill="#BBDEFB" />
                <circle cx="70" cy="-30" r="5" fill="#FFFFFF" />
              </g>
              
              {/* Road */}
              <rect x="0" y="140" width="280" height="30" fill="#424242" rx="1" />
              <line x1="10" y1="155" x2="270" y2="155" stroke="#FFFFFF" strokeDasharray="10 15" strokeWidth="2" />
            </svg>
          </div>
        </div>
      )
    },
    {
      title: "Search, Discover & Park",
      description: "Reserve your spot and enjoy hassle-free parking",
      icon: <Search className="text-parking-dark" size={24} />,
      image: (
        <div className="relative h-64 w-full flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm w-40 h-40 rounded-full absolute z-0"></div>
          <div className="relative z-10 w-64">
            <svg className="w-full" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Map with pins */}
              <rect x="40" y="20" width="200" height="120" rx="8" fill="#E0E0E0" />
              <rect x="50" y="30" width="180" height="100" rx="4" fill="#F5F5F5" />
              
              {/* Map features */}
              <rect x="70" y="50" width="40" height="30" rx="2" fill="#BBDEFB" />
              <path d="M120 60 L150 40 L180 70 L160 90 Z" fill="#C5E1A5" />
              <rect x="60" y="90" width="120" height="10" rx="1" fill="#90A4AE" />
              
              {/* Pins */}
              <circle cx="90" cy="65" r="8" fill="#F44336" />
              <circle cx="90" cy="65" r="4" fill="#FFFFFF" />
              
              <circle cx="160" cy="50" r="8" fill="#F44336" />
              <circle cx="160" cy="50" r="4" fill="#FFFFFF" />
              
              <circle cx="130" cy="95" r="8" fill="#F44336" />
              <circle cx="130" cy="95" r="4" fill="#FFFFFF" />
              
              {/* Person */}
              <g transform="translate(180,120)">
                <circle cx="0" cy="-15" r="10" fill="#FFA726" />
                <rect x="-7" y="-5" width="14" height="20" rx="4" fill="#29B6F6" />
                <rect x="-7" y="15" width="6" height="10" fill="#FFA726" />
                <rect x="1" y="15" width="6" height="10" fill="#FFA726" />
              </g>
            </svg>
          </div>
        </div>
      )
    }
  ];

  // Handle slide transitions
  const nextSlide = () => {
    if (activeSlide < slides.length - 1) {
      setAnimateOut(true);
      setTimeout(() => {
        setActiveSlide(prev => prev + 1);
        setAnimateOut(false);
      }, 300);
    } else {
      // Navigate to auth when we reach the last slide
      navigate('/auth');
    }
  };

  // Auto-advance slides (optional)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeSlide < slides.length - 1) {
        nextSlide();
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [activeSlide]);

  const currentSlide = slides[activeSlide];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-parking-yellow">
      <div className="flex-1 flex flex-col justify-between p-6 max-w-md mx-auto w-full">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-parking-yellow to-transparent z-10"></div>
        
        {/* Skip button */}
        <div className="relative z-20 self-end mt-4">
          <button
            onClick={() => navigate('/auth')}
            className="text-sm font-medium text-parking-dark/60 hover:text-parking-dark"
          >
            Skip
          </button>
        </div>
        
        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center mt-10 mb-20">
          {/* Image */}
          <div 
            className={`transition-all duration-300 transform ${
              animateOut ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
            }`}
          >
            {currentSlide.image}
          </div>
          
          {/* Text */}
          <div 
            className={`text-center mt-8 transition-all duration-300 transform ${
              animateOut ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="inline-flex items-center justify-center gap-2 bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4">
              {currentSlide.icon}
              <span className="text-xs font-medium">Park It</span>
            </div>
            
            <h2 className="text-2xl font-bold text-parking-dark mb-2">
              {currentSlide.title}
            </h2>
            
            <p className="text-sm text-parking-dark/70 max-w-xs mx-auto">
              {currentSlide.description}
            </p>
          </div>
        </div>
        
        {/* Bottom controls */}
        <div className="relative z-20 flex flex-col items-center space-y-6">
          <ProgressDots 
            total={slides.length} 
            active={activeSlide} 
          />
          
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight size={20} />}
            iconPosition="right"
            onClick={nextSlide}
            className="bg-white text-parking-dark shadow-md"
          >
            {activeSlide < slides.length - 1 ? 'Next' : 'Get Started'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
