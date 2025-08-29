import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getCafeRating, getUserReview, Review } from '../lib/reviewService';
import SimpleReviewModal from './SimpleReviewModal';

interface SimpleReviewsDisplayProps {
  cafeId: string;
  cafeName: string;
}

export default function SimpleReviewsDisplay({ cafeId, cafeName }: SimpleReviewsDisplayProps) {
  const { user } = useAuthContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const cafeRating = await getCafeRating(cafeId);
      

      
      setReviews(cafeRating.reviews);
      setTotalReviews(cafeRating.totalReviews);
      setAverageRating(cafeRating.averageRating);

      // Find user's review
      if (user) {
        const userReview = await getUserReview(cafeId, user.uid);
        setUserReview(userReview);
      }
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      if (error.message?.includes('Firestore is not available')) {
        setError('Firestore is not enabled. Please enable Firestore in your Firebase Console to use reviews.');
      } else {
        setError('Failed to load reviews. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [cafeId, user?.uid]);

  const handleReviewSubmitted = () => {
    loadReviews();
  };

  const formatDate = (dateInput: any) => {
    let date: Date;
    
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (dateInput?.toDate) {
      // Firestore timestamp
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

  return (
    <div className="mt-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-black">
              {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
            </div>
            {averageRating > 0 && (
              <div className="flex flex-col">
                {renderStars(averageRating)}
                <span className="text-sm text-black">
                  {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          
          {/* Review Button - Only show if user is logged in */}
          {user ? (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              {userReview ? 'Edit Review' : 'Write Review'}
            </button>
          ) : (
            <p className="text-sm text-black">
              Sign in to write a review
            </p>
          )}
        </div>
      </div>



      {/* Reviews List */}
      {loading ? (
        <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
          <div className="text-4xl mb-2">⚙️</div>
          <p className="text-black mb-2">Loading reviews...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
          <div className="text-4xl mb-2">❌</div>
          <p className="text-black mb-2">{error}</p>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-black">
                    {review.userName}
                  </div>
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-black">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              
              <p className="text-black text-sm leading-relaxed">
                {review.review}
              </p>
              

              
              {user && review.userId === user.uid && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setUserReview(review);
                      setShowReviewModal(true);
                    }}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Edit your review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
          <div className="text-4xl mb-2">☕</div>
          <p className="text-black mb-2">No reviews yet</p>
          <p className="text-sm text-black">
            Be the first to review {cafeName}!
          </p>
        </div>
      )}

      {/* Review Modal */}
      <SimpleReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setUserReview(null);
        }}
        cafeId={cafeId}
        cafeName={cafeName}
        onReviewSubmitted={handleReviewSubmitted}
        existingReview={userReview || undefined}
      />
    </div>
  );
} 