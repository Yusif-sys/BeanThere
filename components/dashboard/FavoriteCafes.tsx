import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';

interface FavoriteCafe {
  id?: string;
  userId: string;
  cafeId: string;
  cafeName: string;
  cafeAddress: string;
  addedAt: any;
}

export default function FavoriteCafes() {
  const { user } = useAuthContext();
  const [favorites, setFavorites] = useState<FavoriteCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError('');

        const q = query(
          collection(firestore, 'favorites'),
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const userFavorites: FavoriteCafe[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userFavorites.push({
            id: doc.id,
            userId: data.userId,
            cafeId: data.cafeId,
            cafeName: data.cafeName,
            cafeAddress: data.cafeAddress,
            addedAt: data.addedAt?.toDate?.() || data.addedAt || new Date()
          });
        });

        // Sort by added date (newest first)
        userFavorites.sort((a, b) => {
          const dateA = a.addedAt instanceof Date ? a.addedAt : new Date(a.addedAt);
          const dateB = b.addedAt instanceof Date ? b.addedAt : new Date(b.addedAt);
          return dateB.getTime() - dateA.getTime();
        });

        setFavorites(userFavorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
        setError('Failed to load your favorites');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const removeFavorite = async (favoriteId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(firestore, 'favorites', favoriteId));
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite');
    }
  };

  const formatDate = (dateInput: any) => {
    let date: Date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (dateInput?.toDate) {
      date = dateInput.toDate();
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      date = new Date();
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Cafes</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Cafes</h3>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">❌</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Favorite Cafes ({favorites.length})
      </h3>

      {favorites.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">❤️</div>
          <p className="text-gray-600 mb-2">No favorite cafes yet</p>
          <p className="text-sm text-gray-500">
            Start exploring and save your favorite coffee shops!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{favorite.cafeName}</h4>
                  <p className="text-sm text-gray-500 mt-1">{favorite.cafeAddress}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Added {formatDate(favorite.addedAt)}
                  </p>
                </div>
                <button
                  onClick={() => favorite.id && removeFavorite(favorite.id)}
                  className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                  title="Remove from favorites"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 