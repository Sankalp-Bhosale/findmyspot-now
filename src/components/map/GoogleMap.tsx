
import React from 'react';
import { Loader } from 'lucide-react';

interface GoogleMapProps {
  isLoading: boolean;
  mapLoaded: boolean;
  children?: React.ReactNode;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ isLoading, mapLoaded, children }) => {
  return (
    <div className="w-full h-full relative">
      {!mapLoaded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <Loader className="animate-spin h-10 w-10 text-yellow-400 mb-2" />
          <span className="text-gray-700 font-medium">Loading map...</span>
        </div>
      ) : isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 z-10">
            <div id="map" className="w-full h-full opacity-60"></div>
          </div>
          <div className="flex flex-col items-center justify-center z-20 bg-white py-3 px-6 rounded-lg shadow-lg">
            <Loader className="animate-spin h-8 w-8 text-yellow-400 mb-2" />
            <span className="text-gray-700">Finding parking spots...</span>
          </div>
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
