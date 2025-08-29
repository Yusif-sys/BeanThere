import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import UserProfile from '../components/dashboard/UserProfile';
import ReviewList from '../components/dashboard/ReviewList';
import FavoriteCafes from '../components/dashboard/FavoriteCafes';
import TasteProfile from '../components/dashboard/TasteProfile';

export default function AccountDashboard() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/signin');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <FavoritesProvider>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  ← Back to Home
                </button>
                <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile and Taste */}
            <div className="lg:col-span-1 space-y-6">
              <UserProfile />
              <TasteProfile />
            </div>

            {/* Right Column - Reviews and Favorites */}
            <div className="lg:col-span-2 space-y-6">
              <ReviewList />
              <FavoriteCafes />
            </div>
          </div>
        </div>
      </div>
    </FavoritesProvider>
  );
} 