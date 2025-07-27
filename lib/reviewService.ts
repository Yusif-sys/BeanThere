import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { firestore } from './firebase';

export interface Review {
  id?: string;
  cafeId: string;
  cafeName: string;
  userId: string;
  userName: string;
  rating: number;
  review: string;
  createdAt: any;
}

export interface CafeRating {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

// Check if Firestore is properly initialized
const isFirestoreAvailable = () => {
  try {
    return firestore && typeof firestore === 'object';
  } catch (error) {
    console.error('Firestore not available:', error);
    return false;
  }
};

// Add a new review
export const addReview = async (review: Omit<Review, 'id' | 'createdAt'>): Promise<string> => {
  try {
    if (!isFirestoreAvailable()) {
      throw new Error('Firestore is not available. Please enable Firestore in your Firebase Console.');
    }

    const docRef = await addDoc(collection(firestore, 'reviews'), {
      ...review,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Update an existing review
export const updateReview = async (reviewId: string, review: Partial<Review>): Promise<void> => {
  try {
    if (!isFirestoreAvailable()) {
      throw new Error('Firestore is not available. Please enable Firestore in your Firebase Console.');
    }

    const reviewRef = doc(firestore, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      ...review,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    if (!isFirestoreAvailable()) {
      throw new Error('Firestore is not available. Please enable Firestore in your Firebase Console.');
    }

    const reviewRef = doc(firestore, 'reviews', reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Get all reviews for a specific cafe
export const getCafeReviews = async (cafeId: string): Promise<Review[]> => {
  try {
    if (!isFirestoreAvailable()) {
      throw new Error('Firestore is not available. Please enable Firestore in your Firebase Console.');
    }

    const q = query(
      collection(firestore, 'reviews'),
      where('cafeId', '==', cafeId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        cafeId: data.cafeId,
        cafeName: data.cafeName,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        review: data.review,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
      });
    });
    
    return reviews;
  } catch (error) {
    console.error('Error getting cafe reviews:', error);
    throw error;
  }
};

// Get a specific user's review for a cafe
export const getUserReview = async (cafeId: string, userId: string): Promise<Review | null> => {
  try {
    if (!isFirestoreAvailable()) {
      throw new Error('Firestore is not available. Please enable Firestore in your Firebase Console.');
    }

    const q = query(
      collection(firestore, 'reviews'),
      where('cafeId', '==', cafeId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        cafeId: data.cafeId,
        cafeName: data.cafeName,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        review: data.review,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user review:', error);
    throw error;
  }
};

// Calculate average rating for a cafe
export const getCafeRating = async (cafeId: string): Promise<CafeRating> => {
  try {
    if (!isFirestoreAvailable()) {
      throw new Error('Firestore is not available. Please enable Firestore in your Firebase Console.');
    }

    const reviews = await getCafeReviews(cafeId);
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        reviews: []
      };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      reviews
    };
  } catch (error) {
    console.error('Error getting cafe rating:', error);
    throw error;
  }
}; 

// Get all reviews (for dashboard use)
export const getAllReviews = async (): Promise<Review[]> => {
  try {
    if (!isFirestoreAvailable()) {
      throw new Error('Firestore is not available. Please enable Firestore in your Firebase Console.');
    }

    const q = query(
      collection(firestore, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reviews: Review[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        cafeId: data.cafeId,
        cafeName: data.cafeName,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        review: data.review,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
      });
    });
    
    return reviews;
  } catch (error) {
    console.error('Error getting all reviews:', error);
    throw error;
  }
}; 