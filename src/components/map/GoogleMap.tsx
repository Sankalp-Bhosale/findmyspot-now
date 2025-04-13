
import React, { useEffect } from 'react';
import { Loader } from 'lucide-react';

interface GoogleMapProps {
  isLoading: boolean;
  mapLoaded: boolean;
  children?: React.ReactNode;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ isLoading, mapLoaded, children }) => {
  return (
    <div className="w-full h-full relative">
      {!mapLoaded || isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader className="animate-spin h-8 w-8 text-parking-yellow" />
          <span className="ml-2">Loading map...</span>
        </div>
      ) : (
        <>
          <div id="map" className="w-full h-full"></div>
          {children}
        </>
      )}
    </div>
  );
};

export default GoogleMap;
