// components/GoogleMap.tsx
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

interface CoffeeShop {
  id: number | string;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  coordinates?: { lat: number; lng: number };
}

interface GoogleMapProps {
  coffeeShops: CoffeeShop[];
  userLocation?: { lat: number; lng: number } | null;
  selectedShop?: CoffeeShop | null;
  onShopSelect?: (shop: CoffeeShop) => void;
  searchLocation?: { lat: number; lng: number } | null;
}

declare global {
  interface Window {
    google: any;
  }
}

function GoogleMapComponent({ coffeeShops, userLocation, selectedShop, onShopSelect, searchLocation }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Wait for Google Maps to load
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        // Initialize map when user location is available
        if (userLocation) {
          initializeMap();
        }
      } else {
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };
    checkGoogleMapsLoaded();
  }, [userLocation]); // Add userLocation dependency

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Don't initialize map if we don't have user location yet
    if (!userLocation) {
      console.log('🗺️ Waiting for user location before initializing map...');
      return;
    }

    console.log('🗺️ Initializing map with user location:', userLocation);

    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 14,
      styles: [
        {
          featureType: "poi.business",
          stylers: [{ visibility: "on" }]
        },
        {
          featureType: "transit",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    mapInstanceRef.current = map;
    console.log('🗺️ Map initialized successfully');

    // Add a simple test marker first to make sure markers work
    const testMarker = new window.google.maps.Marker({
      position: userLocation,
      map: map,
      title: "Test Marker",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#FF0000",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2
      }
    });
    console.log('🗺️ Test marker added:', testMarker);

    // Add user location marker
    console.log('🗺️ Creating user location marker at:', userLocation);
    
    try {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location",
        zIndex: 1000, // Ensure it's on top
        label: {
          text: "YOU ARE HERE",
          color: "#2563EB",
          fontSize: "12px",
          fontWeight: "bold",
          className: "user-location-label"
        },
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Drop shadow -->
              <ellipse cx="24" cy="42" rx="12" ry="3" fill="rgba(0,0,0,0.3)"/>
              <!-- Outer pulse ring -->
              <circle cx="24" cy="24" r="20" fill="none" stroke="#2563EB" stroke-width="3" opacity="0.3">
                <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
              </circle>
              <!-- Middle pulse ring -->
              <circle cx="24" cy="24" r="16" fill="none" stroke="#3B82F6" stroke-width="2" opacity="0.5">
                <animate attributeName="r" values="16;24;16" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <!-- Main circle -->
              <circle cx="24" cy="24" r="14" fill="#2563EB" stroke="white" stroke-width="3"/>
              <!-- Inner circle -->
              <circle cx="24" cy="24" r="10" fill="#3B82F6"/>
              <!-- Center dot -->
              <circle cx="24" cy="24" r="6" fill="white"/>
              <!-- Location icon -->
              <path d="M24 8C18.48 8 14 12.48 14 18c0 8 10 16 10 16s10-8 10-16c0-5.52-4.48-10-10-10z" fill="white" opacity="0.9"/>
              <circle cx="24" cy="18" r="3" fill="#2563EB"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24)
        }
      });

      console.log('🗺️ User location marker created:', userMarker);
      // Store user marker reference
      markersRef.current.push(userMarker);
    } catch (error) {
      console.error('❌ Error creating user location marker:', error);
      
      // Fallback to simple marker
      const fallbackMarker = new window.google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location",
        zIndex: 1000,
        label: {
          text: "YOU ARE HERE",
          color: "#2563EB",
          fontSize: "12px",
          fontWeight: "bold"
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#2563EB",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3
        }
      });
      
      console.log('🗺️ Fallback user location marker created:', fallbackMarker);
      markersRef.current.push(fallbackMarker);
    }

    addCoffeeShopMarkers(map);
  };

  const addCoffeeShopMarkers = (map: any) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    coffeeShops.forEach(shop => {
      if (!shop.coordinates) return;

      const marker = new window.google.maps.Marker({
        position: shop.coordinates,
        map: map,
        title: shop.name,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Drop shadow -->
              <ellipse cx="24" cy="44" rx="10" ry="2" fill="rgba(0,0,0,0.3)"/>
              <!-- Outer pulse ring -->
              <circle cx="24" cy="24" r="20" fill="none" stroke="#FF6B35" stroke-width="2" opacity="0.4">
                <animate attributeName="r" values="20;28;20" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <!-- Middle pulse ring -->
              <circle cx="24" cy="24" r="16" fill="none" stroke="#FF8C42" stroke-width="1.5" opacity="0.6">
                <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
              </circle>
              <!-- Main marker -->
              <path d="M24 4C17.37 4 12 9.37 12 16c0 8 12 20 12 20s12-12 12-20c0-6.63-5.37-12-12-12z" fill="#FF6B35" stroke="#E55A2B" stroke-width="1.5"/>
              <!-- Inner highlight -->
              <path d="M24 6C18.48 6 14 10.48 14 16c0 7 10 17 10 17s10-10 10-17c0-5.52-4.48-10-10-10z" fill="#FF8C42"/>
              <!-- Coffee cup icon -->
              <path d="M16 12h16v8c0 1.1-.9 2-2 2H18c-1.1 0-2-.9-2-2v-8z" fill="white"/>
              <path d="M18 14h12v5H18v-5z" fill="#8B4513"/>
              <path d="M22 10h4v2h-4v-2z" fill="white"/>
              <!-- Steam effect -->
              <path d="M20 8c0-1.1.9-2 2-2s2 .9 2 2" stroke="#FFD700" stroke-width="1" fill="none" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite"/>
              </path>
              <path d="M24 6c0-1.1.9-2 2-2s2 .9 2 2" stroke="#FFD700" stroke-width="1" fill="none" opacity="0.6">
                <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.8s" repeatCount="indefinite"/>
              </path>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 44)
        }
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px; color: black;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: black;">${shop.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: black;">${shop.address}</p>
            ${shop.rating ? `
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <span style="color: #FFD700;">★</span>
                <span style="font-size: 12px; margin-left: 4px; color: black;">${shop.rating}${shop.reviewCount ? ` (${shop.reviewCount} reviews)` : ''}</span>
              </div>
            ` : ''}
            ${shop.tags && shop.tags.length > 0 ? `
              <div style="margin-top: 8px;">
                ${shop.tags.slice(0, 3).map(tag => 
                  `<span style="background: #f0f0f0; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-right: 4px; color: black;">${tag.replace('-', ' ')}</span>`
                ).join('')}
              </div>
            ` : ''}
          </div>
        `
      });

      // Add click listener
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        if (onShopSelect) {
          onShopSelect(shop);
        }
      });

      markersRef.current.push(marker);
    });
  };

  // Update markers when coffee shops change
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current) {
      addCoffeeShopMarkers(mapInstanceRef.current);
    }
  }, [coffeeShops, isMapLoaded]);

  // Center map on selected shop
  useEffect(() => {
    if (selectedShop && selectedShop.coordinates && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(selectedShop.coordinates);
      mapInstanceRef.current.setZoom(15);
    }
  }, [selectedShop]);

  // Center map on user location when it changes
  useEffect(() => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(14);
      console.log('🗺️ Map centered on user location:', userLocation);
      
      // Add user location marker if not already present
      if (!markersRef.current.some(marker => marker.title === "Your Location")) {
        const userMarker = new window.google.maps.Marker({
          position: userLocation,
          map: mapInstanceRef.current,
          title: "Your Location",
          zIndex: 1000, // Ensure it's on top
          label: {
            text: "YOU ARE HERE",
            color: "#2563EB",
            fontSize: "12px",
            fontWeight: "bold",
            className: "user-location-label"
          },
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Drop shadow -->
                <ellipse cx="24" cy="42" rx="12" ry="3" fill="rgba(0,0,0,0.3)"/>
                <!-- Outer pulse ring -->
                <circle cx="24" cy="24" r="20" fill="none" stroke="#2563EB" stroke-width="3" opacity="0.3">
                  <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <!-- Middle pulse ring -->
                <circle cx="24" cy="24" r="16" fill="none" stroke="#3B82F6" stroke-width="2" opacity="0.5">
                  <animate attributeName="r" values="16;24;16" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <!-- Main circle -->
                <circle cx="24" cy="24" r="14" fill="#2563EB" stroke="white" stroke-width="3"/>
                <!-- Inner circle -->
                <circle cx="24" cy="24" r="10" fill="#3B82F6"/>
                <!-- Center dot -->
                <circle cx="24" cy="24" r="6" fill="white"/>
                <!-- Location icon -->
                <path d="M24 8C18.48 8 14 12.48 14 18c0 8 10 16 10 16s10-8 10-16c0-5.52-4.48-10-10-10z" fill="white" opacity="0.9"/>
                <circle cx="24" cy="18" r="3" fill="#2563EB"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(48, 48),
            anchor: new window.google.maps.Point(24, 24)
          }
        });
        markersRef.current.push(userMarker);
      }
    }
  }, [userLocation]);

  // Center map on search location when it changes
  useEffect(() => {
    if (searchLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(searchLocation);
      mapInstanceRef.current.setZoom(13);
      console.log('🗺️ Map centered on search location:', searchLocation);
    } else if (searchLocation === null && userLocation && mapInstanceRef.current) {
      // Reset to user location when search is cleared
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(14);
      console.log('🗺️ Map reset to user location');
    }
  }, [searchLocation, userLocation]);

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
      {(!isMapLoaded || !userLocation) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-gray-600">
              {!userLocation ? 'Getting your location...' : 'Loading map...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Export as client-only component
export default dynamic(() => Promise.resolve(GoogleMapComponent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg border border-gray-200 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});