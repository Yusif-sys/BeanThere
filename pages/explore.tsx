import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useRouter } from "next/router";

// Default to San Francisco if geolocation fails
const SF_LOCATION = { lat: 37.7749, lng: -122.4194 };

type Budget = "budget" | "moderate" | "premium";

interface UserPreferences {
  coffeeTypes: string[];
  vibe: string[];
  budget: Budget;
  favoriteFlavor: string;
  milkType: string;
}

interface CoffeeShop {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  placeId: string;
  matchScore: number;
  matchedPreferences: {
    vibes: string[];
    flavors: string[];
    milk: string[];
  };
}

// Local metadata mapping for coffee shops
const cafeMetadata: Record<string, {
  vibes: string[];
  flavors: string[];
  milk: string[];
  budget: Budget;
}> = {
  // Popular coffee chains
  "starbucks": {
    vibes: ["quick-grab", "study-friendly"],
    flavors: ["chocolatey", "fruity", "nutty"],
    milk: ["dairy", "oat", "almond", "soy"],
    budget: "moderate"
  },
  "peets": {
    vibes: ["study-friendly", "quiet"],
    flavors: ["chocolatey", "nutty"],
    milk: ["dairy", "oat", "almond"],
    budget: "moderate"
  },
  "blue bottle": {
    vibes: ["aesthetic", "trendy"],
    flavors: ["fruity", "chocolatey"],
    milk: ["dairy", "oat"],
    budget: "premium"
  },
  "philz": {
    vibes: ["cozy", "study-friendly"],
    flavors: ["chocolatey", "spicy"],
    milk: ["dairy", "oat", "almond"],
    budget: "moderate"
  },
  "ritual": {
    vibes: ["aesthetic", "trendy"],
    flavors: ["fruity", "chocolatey"],
    milk: ["dairy", "oat"],
    budget: "premium"
  },
  "sightglass": {
    vibes: ["aesthetic", "date-spot"],
    flavors: ["fruity", "chocolatey"],
    milk: ["dairy", "oat"],
    budget: "premium"
  },
  "verve": {
    vibes: ["aesthetic", "trendy"],
    flavors: ["fruity", "chocolatey"],
    milk: ["dairy", "oat", "almond"],
    budget: "premium"
  },
  "four barrel": {
    vibes: ["aesthetic", "trendy"],
    flavors: ["fruity", "chocolatey"],
    milk: ["dairy", "oat"],
    budget: "premium"
  },
  "equator": {
    vibes: ["cozy", "study-friendly"],
    flavors: ["chocolatey", "nutty"],
    milk: ["dairy", "oat", "almond"],
    budget: "moderate"
  },
  "spro": {
    vibes: ["quick-grab", "study-friendly"],
    flavors: ["chocolatey", "nutty"],
    milk: ["dairy", "oat"],
    budget: "budget"
  },
  "coffee bar": {
    vibes: ["study-friendly", "quiet"],
    flavors: ["chocolatey", "fruity"],
    milk: ["dairy", "oat", "almond"],
    budget: "moderate"
  },
  "sweet maria": {
    vibes: ["cozy", "quiet"],
    flavors: ["chocolatey", "nutty"],
    milk: ["dairy", "oat"],
    budget: "budget"
  },
  "cafe triste": {
    vibes: ["aesthetic", "date-spot"],
    flavors: ["chocolatey", "fruity"],
    milk: ["dairy", "oat"],
    budget: "premium"
  },
  "andytown": {
    vibes: ["cozy", "study-friendly"],
    flavors: ["chocolatey", "fruity"],
    milk: ["dairy", "oat"],
    budget: "moderate"
  },
  "saint frank": {
    vibes: ["aesthetic", "trendy"],
    flavors: ["fruity", "chocolatey"],
    milk: ["dairy", "oat"],
    budget: "premium"
  }
};

const budgetToPriceLevel = (budget: Budget) => {
  switch (budget) {
    case "budget":
      return { min: 0, max: 1 };
    case "moderate":
      return { min: 1, max: 2 };
    case "premium":
      return { min: 2, max: 3 };
    default:
      return { min: 0, max: 3 };
  }
};

const calculateMatchScore = (
  cafeName: string,
  userPrefs: UserPreferences,
  metadata: typeof cafeMetadata
): { score: number; matchedPreferences: { vibes: string[]; flavors: string[]; milk: string[] } } => {
  const lowerName = cafeName.toLowerCase();
  let score = 0;
  const matchedPreferences = {
    vibes: [] as string[],
    flavors: [] as string[],
    milk: [] as string[]
  };

  // Find matching metadata
  const matchingMetadata = Object.entries(metadata).find(([key]) => 
    lowerName.includes(key.toLowerCase())
  );

  if (matchingMetadata) {
    const [, cafeData] = matchingMetadata;
    
    // Check vibes match
    const vibeMatches = (userPrefs.vibe || []).filter((vibe: string) => 
      cafeData.vibes.includes(vibe)
    );
    if (vibeMatches.length > 0) {
      score += vibeMatches.length * 2;
      matchedPreferences.vibes = vibeMatches;
    }

    // Check flavors match
    const flavorMatches = userPrefs.favoriteFlavor ? 
      (cafeData.flavors.includes(userPrefs.favoriteFlavor) ? [userPrefs.favoriteFlavor] : []) : [];
    if (flavorMatches.length > 0) {
      score += flavorMatches.length;
      matchedPreferences.flavors = flavorMatches;
    }

    // Check milk match
    if (cafeData.milk.includes(userPrefs.milkType || 'dairy')) {
      score += 1;
      matchedPreferences.milk = [userPrefs.milkType || 'dairy'];
    }
  }

  return { score, matchedPreferences };
};

export default function Explore() {
  const { user, signOutUser } = useAuthContext();
  const router = useRouter();
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [userName, setUserName] = useState<string>('');

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get user's name from localStorage
  useEffect(() => {
    if (user) {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [user]);

  // 1. Get user location
  useEffect(() => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setUserLocation(SF_LOCATION);
      setLocationError("Geolocation not supported. Using San Francisco.");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      () => {
        setUserLocation(SF_LOCATION);
        setLocationError("Location permission denied or unavailable. Using San Francisco.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  // 2. Load user preferences from localStorage
  useEffect(() => {
    const data = localStorage.getItem("beanThereOnboarding");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setPreferences(parsed);
      } catch (error) {
        console.error("Error parsing preferences:", error);
      }
    }
  }, []);

  // 3. Fetch coffee shops from Google Places API
  useEffect(() => {
    if (!userLocation || !preferences) return;
    setIsLoading(true);

    // Wait for Google Maps JS API to load
    let attempts = 0;
    const checkApi = () => {
      attempts++;
      if (window.google && window.google.maps && window.google.maps.places) {
        fetchCafes();
      } else if (attempts < 30) {
        setTimeout(checkApi, 500);
      } else {
        setIsLoading(false);
      }
    };
    checkApi();

    function fetchCafes() {
      const { min, max } = budgetToPriceLevel(preferences!.budget);
      const mapDiv = document.createElement("div");
      const map = new window.google.maps.Map(mapDiv, { center: userLocation, zoom: 14 });
      const service = new window.google.maps.places.PlacesService(map);

      const request = {
        location: userLocation,
        radius: 5000,
        type: "cafe",
        keyword: (preferences!.coffeeTypes || []).join(" "),
        minPriceLevel: min,
        maxPriceLevel: max,
      };

              service.nearbySearch(request, (results: any[], status: string) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const processedShops = results.slice(0, 10).map((place, i) => {
            const { score, matchedPreferences } = calculateMatchScore(
              place.name,
              preferences!,
              cafeMetadata
            );

            return {
              id: place.place_id || `cafe_${i}`,
              name: place.name,
              address: place.vicinity || place.formatted_address || "",
              rating: place.rating,
              reviewCount: place.user_ratings_total,
              priceLevel: place.price_level,
              placeId: place.place_id,
              matchScore: score,
              matchedPreferences,
            };
          });

          // Sort by match score (highest first)
          processedShops.sort((a, b) => b.matchScore - a.matchScore);
          setCoffeeShops(processedShops);
        } else {
          setCoffeeShops([]);
        }
        setIsLoading(false);
      });
    }
    // eslint-disable-next-line
  }, [userLocation, preferences]);

  // Loading state
  if (isLocating || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Finding your perfect coffee spots...</h2>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="text-6xl mb-4">☕</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No preferences found</h2>
          <p className="text-gray-600">Please complete the onboarding first.</p>
        </div>
      </div>
    );
  }

  const recommendedShops = coffeeShops.filter(shop => shop.matchScore > 0);
  const otherShops = coffeeShops.filter(shop => shop.matchScore === 0);

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      router.push('/signin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Your Personalized Coffee Guide</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-gray-600">
                Welcome, {userName || user.email?.split('@')[0] || user.email}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {locationError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-4 text-center">
            {locationError}
          </div>
        )}

        {/* Preferences Summary */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Coffee Types:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(preferences.coffeeTypes || []).map(type => (
                  <span key={type} className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Vibes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(preferences.vibe || []).map((vibe: string) => (
                  <span key={vibe} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {vibe}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Budget:</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs capitalize ml-1">
                {preferences.budget || 'moderate'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Favorite Flavor:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {preferences.favoriteFlavor && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {preferences.favoriteFlavor}
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Milk:</span>
              <div className="mt-1">
                <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                  {preferences.milkType || 'dairy'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended for You Section */}
        {recommendedShops.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⭐</span>
              Recommended for You
            </h2>
            <div className="grid gap-4">
              {recommendedShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-amber-400"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-xl text-gray-800 mb-2">{shop.name}</div>
                      <div className="text-gray-600 text-sm mb-3">{shop.address}</div>
                      
                      {shop.rating && (
                        <div className="text-amber-600 text-sm mb-3">
                          ★ {shop.rating}{" "}
                          <span className="text-gray-400">({shop.reviewCount} reviews)</span>
                        </div>
                      )}

                      {/* Matched Preferences Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {shop.matchedPreferences.vibes.map(vibe => (
                          <span key={vibe} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {vibe}
                          </span>
                        ))}
                        {shop.matchedPreferences.flavors.map(flavor => (
                          <span key={flavor} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {flavor}
                          </span>
                        ))}
                        {shop.matchedPreferences.milk.map(milk => (
                          <span key={milk} className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">
                            {milk}
                          </span>
                        ))}
                      </div>

                      <div className="text-sm text-amber-600 font-medium">
                        Match Score: {shop.matchScore}/5
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 lg:ml-4">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          shop.name
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium"
                      >
                        View on Map
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Nearby Cafes Section */}
        {otherShops.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Other Nearby Cafes</h2>
            <div className="grid gap-4">
              {otherShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white rounded-xl p-6 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg text-gray-800">{shop.name}</div>
                      <div className="text-gray-600 text-sm">{shop.address}</div>
                      {shop.rating && (
                        <div className="text-amber-600 text-sm mt-1">
                          ★ {shop.rating}{" "}
                          <span className="text-gray-400">({shop.reviewCount} reviews)</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          shop.name
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        View on Map
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {coffeeShops.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">☕</div>
            <div className="text-lg font-semibold mb-2">No coffee shops found nearby</div>
            <div>Try adjusting your location or preferences.</div>
          </div>
        )}

        {/* No Matches Message */}
        {coffeeShops.length > 0 && recommendedShops.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">🤔</div>
            <div className="text-lg font-semibold mb-2">No perfect matches found</div>
            <div>We found some cafes nearby, but none perfectly match your preferences.</div>
            <div className="text-sm mt-2">Try adjusting your preferences or check out the nearby cafes below.</div>
          </div>
        )}
      </div>
    </div>
  );
} 