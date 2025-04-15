
import React from 'react';
import { Loader, AlertTriangle } from 'lucide-react';

interface GoogleMapProps {
  isLoading: boolean;
  mapLoaded: boolean;
  loadError?: string | null;
  children?: React.ReactNode;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ isLoading, mapLoaded, loadError, children }) => {
  return (
    <div className="w-full h-full relative">
      {loadError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-2" />
          <span className="text-gray-700 font-medium">{loadError}</span>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-xs px-4">
            Please check your internet connection and ensure the API key is valid.
          </p>
        </div>
      ) : !mapLoaded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          <Loader className="animate-spin h-10 w-10 text-yellow-400 mb-2" />
          <span className="text-gray-700 font-medium">Loading map...</span>
        </div>
      ) : (
        <>
          <div id="map" className="w-full h-full"></div>
          {children}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
                <Loader className="animate-spin h-5 w-5 text-yellow-400" />
                <span>Updating location...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GoogleMap;
