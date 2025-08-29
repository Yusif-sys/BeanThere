import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

interface FavoriteCafe {
  id?: string;
  userId: string;
  cafeId: string;
  cafeName: string;
  cafeAddress: string;
  addedAt: any;
}

interface FavoritesContextType {
  favorites: FavoriteCafe[];
  loading: boolean;
  error: string;
  addFavorite: (cafeId: string, cafeName: string, cafeAddress?: string) => Promise<void>;
  removeFavorite: (favoriteId: string) => Promise<void>;
  isFavorite: (cafeId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [favorites, setFavorites] = useState<FavoriteCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

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
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (cafeId: string, cafeName: string, cafeAddress?: string) => {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(firestore, 'favorites'), {
        userId: user.uid,
        cafeId,
        cafeName,
        cafeAddress: cafeAddress || cafeName,
        addedAt: serverTimestamp()
      });

      const newFavorite: FavoriteCafe = {
        id: docRef.id,
        userId: user.uid,
        cafeId,
        cafeName,
        cafeAddress: cafeAddress || cafeName,
        addedAt: new Date()
      };

      setFavorites(prev => [newFavorite, ...prev]);
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw new Error('Failed to add favorite');
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(firestore, 'favorites', favoriteId));
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw new Error('Failed to remove favorite');
    }
  };

  const isFavorite = (cafeId: string) => {
    return favorites.some(fav => fav.cafeId === cafeId);
  };

  const refreshFavorites = async () => {
    await loadFavorites();
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const value: FavoritesContextType = {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 