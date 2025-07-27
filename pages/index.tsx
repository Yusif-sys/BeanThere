// pages/index.tsx
import { useAuthContext } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { coffeeShops, vibeTags } from '../data.js';
import Link from 'next/link';
import Onboarding from '../components/Onboarding';
import GoogleMap from '../components/GoogleMap';
import PlacesSearch from '../components/PlacesSearch';
import StarRating from './StarRating';
import SimpleReviewsDisplay from '../components/SimpleReviewsDisplay';

export default function HomePage() {
  const { user, signOutUser } = useAuthContext();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchLocation, setSearchLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [userName, setUserName] = useState<string>('');

  // Get user's name from localStorage
  useEffect(() => {
    if (isClient && user) {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [isClient, user]);

  const handleTagChange = (tag: string) => {
    setSelectedTags(prevTags =>
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      // Clear user data from localStorage
      localStorage.removeItem('userName');
      localStorage.removeItem('userUID');
      localStorage.removeItem('userEmail');
      // Reload the page to reset state
      window.location.reload();
    }
  };

  // Check if we're on the client side and check for onboarding
  useEffect(() => {
    try {
      setIsClient(true);
      const onboardingData = localStorage.getItem('beanThereOnboarding');
      if (!onboardingData) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error in client-side initialization:', error);
      setHasError(true);
    }
  }, []);

  // Request user location when component loads
  useEffect(() => {
    if (isClient && !userLocation && !isLoadingLocation) {
      console.log('📍 Requesting user location...');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log('📍 User location obtained:', location);
            setUserLocation(location);
          },
          (error) => {
            console.error('❌ Error getting location:', error);
            // Don't show alert here, just log the error
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      }
    }
  }, [isClient, userLocation, isLoadingLocation]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNearMe = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setIsLoadingLocation(false);
          
          // Show nearby shops (within 50 miles)
          const nearbyShops = coffeeShops.filter(shop => {
            if (!shop.coordinates) return false;
            const distance = calculateDistance(location.lat, location.lng, shop.coordinates.lat, shop.coordinates.lng);
            return distance <= 50; // Within 50 miles
          });
          
          if (nearbyShops.length > 0) {
            const closestShop = nearbyShops.reduce((closest, shop) => {
              const distance = calculateDistance(location.lat, location.lng, shop.coordinates.lat, shop.coordinates.lng);
              return distance < closest.distance ? { shop, distance } : closest;
            }, { shop: nearbyShops[0], distance: Infinity });
            
            alert(`Found ${nearbyShops.length} coffee shops within 50 miles!\n\nClosest: ${closestShop.shop.name} (${closestShop.distance.toFixed(1)} miles away)`);
          } else {
            alert('No coffee shops found within 50 miles. Try expanding your search area.');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check your browser permissions.');
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
    }
  };

  const filteredShops = coffeeShops.filter(shop => {
    const matchesTags = selectedTags.every(tag => shop.tags.includes(tag));
    const matchesSearch = searchQuery === '' || 
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTags && matchesSearch;
  });

  // Show search results when available, otherwise show filtered hardcoded shops
  const allShops = placesResults.length > 0 ? placesResults : filteredShops;

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-brown-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">
            There was an error loading the application. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while client-side initialization
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-brown-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">☕</div>
          <div className="text-xl font-semibold text-gray-800">Loading BeanThere...</div>
        </div>
      </div>
    );
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <Onboarding 
        onComplete={() => setShowOnboarding(false)} 
      />
    );
  }

  return (
    <main className="font-sans bg-gradient-to-b from-amber-50 to-brown-50 min-h-screen relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* 3D Falling Coffee Cups Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-amber-800 opacity-60 animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
              transform: `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg) rotateZ(${Math.random() * 360}deg)`,
              fontSize: `${12 + Math.random() * 8}px`,
              zIndex: 1
            }}
          >
            ☕
          </div>
        ))}
        {[...Array(15)].map((_, i) => {
          const coffeeIcons = ['☕', '🥤', '🫖', '🧋', '☕️'];
          const randomIcon = coffeeIcons[Math.floor(Math.random() * coffeeIcons.length)];
          return (
            <div
              key={`cup-${i}`}
              className="absolute text-amber-900 opacity-40 animate-fall-slow"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${12 + Math.random() * 6}s`,
                transform: `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg) rotateZ(${Math.random() * 360}deg)`,
                fontSize: `${14 + Math.random() * 8}px`,
                zIndex: 1
              }}
            >
              {randomIcon}
            </div>
          );
        })}
      </div>
      
      <div className="max-w-4xl mx-auto p-4 sm:p-8 relative z-10">
        <header className="pb-4 mb-8 border-b">
          <div className="flex flex-col items-center w-full">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 text-center mb-2">BeanThere</h1>
            <div className="flex flex-wrap items-center justify-center space-x-4 mb-2">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('beanThereOnboarding');
                    setShowOnboarding(true);
                  } catch (error) {
                    console.error('Error resetting onboarding:', error);
                  }
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
              >
                Reset Onboarding
              </button>
              <Link href="/explore" className="text-amber-600 hover:text-amber-800 transition-colors text-sm font-medium">
                Explore
              </Link>
              <Link href="/about" className="text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-medium">
                About
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-green-600 text-sm font-medium">
                    Welcome, {userName || user.email?.split('@')[0] || user.email}
                  </div>
                  <Link href="/account" className="text-amber-600 hover:text-amber-800 transition-colors text-sm font-medium">
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-800 transition-colors text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/signin" className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium">
                  Sign In
                </Link>
              )}
            </div>
          </div>
          <p className="text-lg text-gray-800 mb-6 text-center">Find real coffee shops near you or search any location.</p>
          
          {/* Search Bar - REMOVED */}
          

            
            {/* Location Display for Testing - REMOVED */}
          </header>

        {/* Google Places Search */}
        {isClient && (
          <div className="mb-6">
            <PlacesSearch 
              onShopsFound={(shops) => {
                setPlacesResults(shops);
                setShowMap(true);
              }}
              userLocation={userLocation}
              onLocationUpdate={(location) => {
                setUserLocation(location);
                console.log('📍 Updated user location:', location);
              }}
              onSearchLocation={(location) => {
                setSearchLocation(location);
                if (location) {
                  console.log('🔍 Centering map on search location:', location);
                } else {
                  console.log('🔍 Clearing search location');
                }
              }}
            />
            
            {/* Clear Search Results Button */}
            {placesResults.length > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setPlacesResults([]);
                    setSearchLocation(null);
                    setShowMap(false);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  🔄 Clear Search Results
                </button>
              </div>
            )}
          </div>
        )}

        {/* Map Toggle */}
        {isClient && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setShowMap(!showMap)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
            </button>
          </div>
        )}

        {/* Google Map */}
        {isClient && showMap && (
          <div className="mb-8">
            {userLocation ? (
              <div>
                <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
                  ✅ User location available: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </div>
                <GoogleMap
                  coffeeShops={placesResults}
                  userLocation={userLocation}
                  selectedShop={selectedShop}
                  onShopSelect={setSelectedShop}
                  searchLocation={searchLocation}
                />
              </div>
            ) : (
              <div className="p-4 bg-yellow-100 border border-yellow-300 rounded text-center">
                <p className="text-yellow-800">📍 Waiting for your location...</p>
                <p className="text-yellow-700 text-sm mt-1">Please allow location access in your browser</p>
              </div>
            )}
          </div>
        )}

        {/* Filter UI */}
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Filter by Vibe:</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {vibeTags.map(tag => (
              <div key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  id={tag}
                  value={tag}
                  onChange={() => handleTagChange(tag)}
                  checked={selectedTags.includes(tag)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor={tag} className="ml-2 text-gray-700 capitalize cursor-pointer select-none">
                  {tag.replace('-', ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* List of Coffee Shops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allShops.map(shop => (
            <div key={shop.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{shop.name}</h2>
              
              {/* Star Rating Section */}
              <div className="flex items-center mb-2">
                {shop.rating ? (
                  <>
                    <StarRating rating={shop.rating} />
                    <span className="text-gray-500 ml-2">({shop.reviewCount || 0} reviews)</span>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm">No rating available</span>
                )}
              </div>
      
              <p className="text-gray-600 mb-4">{shop.address}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {shop.tags?.map((tag: string) => (
                  <span key={tag} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Reviews Display */}
              <SimpleReviewsDisplay 
                cafeId={`${shop.name}-${shop.address}`.replace(/[^a-zA-Z0-9]/g, '_')} 
                cafeName={shop.name} 
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}