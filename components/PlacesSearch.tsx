// components/PlacesSearch.tsx
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface CoffeeShop {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  coordinates: { lat: number; lng: number };
  placeId: string;
  photos?: string[];
  types?: string[];
  tags?: string[];
}

interface PlacesSearchProps {
  onShopsFound: (shops: CoffeeShop[]) => void;
  userLocation?: { lat: number; lng: number } | null;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  onSearchLocation?: (location: { lat: number; lng: number } | null) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

function PlacesSearchComponent({ onShopsFound, userLocation, onLocationUpdate, onSearchLocation }: PlacesSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Check if Google Maps API is loaded
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    const checkApiLoaded = () => {
      attempts++;
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('✅ Google Maps API loaded successfully');
        
        // Test if we can create a basic map object (this tests the API key)
        try {
          new window.google.maps.Map(document.createElement('div'), {
            center: { lat: 0, lng: 0 },
            zoom: 1
          });
          console.log('✅ API key is valid');
          setApiLoaded(true);
        } catch (error) {
          console.error('❌ API key error:', error);
          alert('Google Maps API key error. Please check the API key configuration.');
        }
      } else if (attempts < maxAttempts) {
        console.log(`❌ Google Maps API not loaded yet (attempt ${attempts}/${maxAttempts})`);
        setTimeout(checkApiLoaded, 1000); // Check again in 1 second
      } else {
        console.error('❌ Google Maps API failed to load after 30 seconds');
        alert('Google Maps API failed to load. Please refresh the page and try again.');
      }
    };
    
    checkApiLoaded();
  }, []);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    console.log('📍 Getting current location for map...');

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setIsGettingLocation(false);
      return;
    }

    try {
      console.log('Requesting user location...');
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 20000,
          enableHighAccuracy: true,
          maximumAge: 300000
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      console.log('✅ Successfully got user location for map:', location);
      console.log('Location accuracy:', position.coords.accuracy, 'meters');

      // Update the map location
      if (onLocationUpdate) {
        onLocationUpdate(location);
        alert(`📍 Map centered on your location!\nLatitude: ${location.lat.toFixed(6)}\nLongitude: ${location.lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('❌ High accuracy location failed:', error);

      // Try with lower accuracy as fallback
      try {
        console.log('🔄 Trying with lower accuracy...');
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 15000,
            enableHighAccuracy: false,
            maximumAge: 600000
          });
        });

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        console.log('✅ Got user location with lower accuracy:', location);
        console.log('Location accuracy:', position.coords.accuracy, 'meters');

        // Update the map location
        if (onLocationUpdate) {
          onLocationUpdate(location);
          alert(`📍 Map centered on your location!\nLatitude: ${location.lat.toFixed(6)}\nLongitude: ${location.lng.toFixed(6)}`);
        }
      } catch (fallbackError) {
        console.error('❌ Low accuracy location also failed:', fallbackError);
        
        let errorMessage = 'Unable to get your location. ';
        if (fallbackError instanceof GeolocationPositionError) {
          switch (fallbackError.code) {
            case fallbackError.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser settings.';
              break;
            case fallbackError.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case fallbackError.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'Please try again.';
          }
        }
        
        alert(errorMessage);
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Removed broken nearby search functionality

  const searchByQuery = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query.');
      return;
    }

    console.log('🔍 Starting query search...');
    console.log('API loaded status:', apiLoaded);
    
    if (!apiLoaded) {
      alert('Google Maps API is still loading. Please wait a moment and try again.');
      return;
    }

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      alert('Google Maps API not loaded. Please refresh the page and try again.');
      return;
    }

    setIsSearching(true);
    console.log('Starting search for:', searchQuery);

    try {
      // Create a temporary map instance for PlacesService
      const tempMapDiv = document.createElement('div');
      const tempMap = new window.google.maps.Map(tempMapDiv, {
        center: userLocation || { lat: 37.7749, lng: -122.4194 },
        zoom: 12
      });

      const service = new window.google.maps.places.PlacesService(tempMap);

      const request = {
        query: `${searchQuery} coffee shops`,
        location: userLocation || { lat: 37.7749, lng: -122.4194 },
        radius: 5000 // 5km radius in meters
      };

      console.log('Search request:', request);

      service.textSearch(request, (results: any[], status: any) => {
        console.log('Search results:', results);
        console.log('Search status:', status);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const coffeeShops: CoffeeShop[] = results
            .filter(place => 
              place.types && 
              (place.types.includes('cafe') || 
               place.name.toLowerCase().includes('coffee') ||
               place.name.toLowerCase().includes('cafe'))
            )
            .map((place, index) => {
              // Generate tags based on place types and characteristics
              const tags: string[] = [];
              
              if (place.types) {
                if (place.types.includes('food')) tags.push('serves-food');
                if (place.types.includes('establishment')) tags.push('lively');
                if (place.rating && place.rating >= 4.5) tags.push('great-espresso');
                if (place.types.includes('point_of_interest')) tags.push('trendy');
              }
              
              // Add some default tags for coffee shops
              tags.push('cozy');
              if (place.rating && place.rating >= 4.0) tags.push('good-for-friends');
              
              return {
                id: `${place.name}-${place.formatted_address || ''}`.replace(/[^a-zA-Z0-9]/g, '_'), // Consistent ID generation
                name: place.name,
                address: place.formatted_address || '',
                rating: place.rating,
                reviewCount: place.user_ratings_total,
                coordinates: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                },
                placeId: place.place_id,
                photos: place.photos ? place.photos.map((photo: any) => photo.getUrl()) : [],
                types: place.types,
                tags: tags
              };
            });

          onShopsFound(coffeeShops);
          
          // Center map on the first result if available
          if (coffeeShops.length > 0 && onSearchLocation) {
            const firstShop = coffeeShops[0];
            onSearchLocation(firstShop.coordinates);
          }
          
          if (coffeeShops.length > 0) {
            alert(`Found ${coffeeShops.length} coffee shops matching "${searchQuery}"!`);
          } else {
            alert(`No coffee shops found matching "${searchQuery}". Try a different search term.`);
          }
        } else {
          alert('Error searching for coffee shops. Please try again.');
        }
        setIsSearching(false);
      });
    } catch (error) {
      console.error('Error searching places:', error);
      alert('Error searching for coffee shops. Please try again.');
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">🔍 Find Real Coffee Shops</h3>
      </div>
      
      <div className="space-y-4">


        {/* Search by Query */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Location or Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., 'San Francisco', 'Downtown', 'Blue Bottle'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
            />
            <button
              onClick={searchByQuery}
              disabled={isSearching}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Location and Search Buttons */}
        <div className="space-y-3">
          {/* Get Current Location Button */}
          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Getting Location...
              </>
            ) : (
              <>
                <span>📍</span>
                Get My Location for Map
              </>
            )}
          </button>


          
          {!userLocation && (
            <div className="text-xs text-gray-500 mt-2 text-center space-y-1">
              <p>💡 Use "Get My Location" to center the map on your position</p>
              <p>🔍 Use the search box above to find coffee shops by name or location</p>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          💡 Tip: Use the search box to find coffee shops by name or location, or click "Get My Location" to center the map on your position.
        </div>
      </div>
    </div>
  );
}

// Export as client-only component
export default dynamic(() => Promise.resolve(PlacesSearchComponent), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}); 