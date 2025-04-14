
import React, { useRef, useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  distance?: string;
  available_spots: number;
  lat: number;
  lng: number;
}

interface MapSearchBarProps {
  locations: ParkingLocation[];
  onLocationSelect: (locationId: string) => void;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({ locations, onLocationSelect }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ParkingLocation[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleSearchSelect = (locationId: string) => {
    onLocationSelect(locationId);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Filter search results based on query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = locations.filter(location => 
      location.name.toLowerCase().includes(query) ||
      location.address.toLowerCase().includes(query)
    );
    
    console.log('Search results:', filtered);
    setSearchResults(filtered);
  }, [searchQuery, locations]);

  // Close search when clicking outside
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const element = event.target as HTMLElement;
      // Skip if clicking on the search input or inside Command component
      if (element.closest('[cmdk-input]') || element.closest('[cmdk-root]')) {
        return;
      }
      setIsSearchOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <>
      {/* Search Input */}
      <div className="absolute top-16 left-0 right-0 px-4 z-20">
        <div 
          className="bg-white rounded-full shadow-lg flex items-center px-4 py-2 cursor-pointer"
          onClick={handleSearchClick}
        >
          <Search size={20} className="text-parking-gray mr-2" />
          <span className="text-sm text-parking-gray">Where do you want to park?</span>
        </div>
      </div>
      
      {/* Search Results */}
      {isSearchOpen && (
        <div className="absolute top-28 left-0 right-0 px-4 z-30">
          <div className="bg-white rounded-lg shadow-lg">
            <Command>
              <CommandInput
                ref={searchInputRef}
                placeholder="Search by location name or address..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="h-12"
              />
              <CommandList>
                <CommandEmpty>No locations found.</CommandEmpty>
                <CommandGroup>
                  {searchResults.map(location => (
                    <CommandItem
                      key={location.id}
                      onSelect={() => handleSearchSelect(location.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{location.name}</span>
                        <span className="text-xs text-parking-gray">{location.address}</span>
                        <div className="flex items-center mt-1">
                          <MapPin size={12} className="text-parking-yellow" />
                          <span className="text-xs ml-1">{location.distance} away</span>
                          <span className="mx-2 text-parking-gray">•</span>
                          <span className={`text-xs ${location.available_spots > 0 ? 'text-parking-success' : 'text-parking-error'}`}>
                            {location.available_spots > 0 ? `${location.available_spots} spots available` : 'No spots available'}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="p-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapSearchBar;
