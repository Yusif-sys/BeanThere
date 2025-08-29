import { useFavorites } from '../../contexts/FavoritesContext';

export default function FavoriteCafes() {
  const { favorites, loading, error, removeFavorite } = useFavorites();

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

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      await removeFavorite(favoriteId);
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite');
    }
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
                  onClick={() => favorite.id && handleRemoveFavorite(favorite.id)}
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