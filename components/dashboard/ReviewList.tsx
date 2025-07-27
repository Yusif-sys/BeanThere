import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { getAllReviews } from '../../lib/reviewService';

interface Review {
  id?: string;
  cafeId: string;
  cafeName: string;
  userId: string;
  userName: string;
  rating: number;
  review: string;
  createdAt: any;
}

export default function ReviewList() {
  const { user } = useAuthContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserReviews = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError('');

        // Get all reviews from Firestore and filter by user
        const allReviews = await getAllReviews(); // This will need to be modified to get all reviews
        const userReviews = allReviews.filter(review => review.userId === user.uid);
        
        // Sort by creation date (newest first)
        userReviews.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setReviews(userReviews);
      } catch (error) {
        console.error('Error loading user reviews:', error);
        setError('Failed to load your reviews');
      } finally {
        setLoading(false);
      }
    };

    loadUserReviews();
  }, [user]);

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Reviews</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Reviews</h3>
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
        My Reviews ({reviews.length})
      </h3>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">☕</div>
          <p className="text-gray-600 mb-2">No reviews yet</p>
          <p className="text-sm text-gray-500">
            Start reviewing coffee shops to see them here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{review.cafeName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {review.rating} stars
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              
              <p className="text-gray-700 text-sm leading-relaxed">
                {review.review}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 