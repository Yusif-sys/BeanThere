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

interface TasteStats {
  totalReviews: number;
  averageRating: number;
  favoriteTags: { tag: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  recentActivity: string;
  todayReviews: Review[];
}

export default function TasteProfile() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<TasteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTodayReviews, setShowTodayReviews] = useState(false);

  useEffect(() => {
    const analyzeTasteProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError('');

        // Get all reviews from Firestore and filter by user
        const allReviews = await getAllReviews(); // This will need to be modified to get all reviews
        const userReviews = allReviews.filter(review => review.userId === user.uid);

        if (userReviews.length === 0) {
          setStats({
            totalReviews: 0,
            averageRating: 0,
            favoriteTags: [],
            ratingDistribution: [],
            recentActivity: 'No reviews yet',
            todayReviews: []
          });
          return;
        }

        // Calculate average rating
        const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / userReviews.length;

        // Calculate rating distribution
        const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
          rating,
          count: userReviews.filter(review => review.rating === rating).length
        }));

        // Get today's reviews
        const todayReviews = userReviews.filter(review => {
          const reviewDate = review.createdAt instanceof Date ? review.createdAt : new Date(review.createdAt);
          const today = new Date();
          return reviewDate.toDateString() === today.toDateString();
        });

        // Analyze recent activity
        const sortedReviews = userReviews.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        const lastReviewDate = sortedReviews[0]?.createdAt;
        let recentActivity = 'No recent activity';
        
        if (lastReviewDate) {
          const lastReview = lastReviewDate instanceof Date ? lastReviewDate : new Date(lastReviewDate);
          const daysSince = Math.floor((Date.now() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSince === 0) {
            recentActivity = 'Reviewed today';
          } else if (daysSince === 1) {
            recentActivity = 'Reviewed yesterday';
          } else if (daysSince < 7) {
            recentActivity = `Reviewed ${daysSince} days ago`;
          } else if (daysSince < 30) {
            recentActivity = `Reviewed ${Math.floor(daysSince / 7)} weeks ago`;
          } else {
            recentActivity = `Reviewed ${Math.floor(daysSince / 30)} months ago`;
          }
        }

        // For now, we'll use placeholder tags since we don't have tag data in reviews
        // In a real implementation, you'd extract tags from the cafe data
        const favoriteTags = [
          { tag: 'Great Espresso', count: Math.floor(userReviews.length * 0.6) },
          { tag: 'Cozy Atmosphere', count: Math.floor(userReviews.length * 0.4) },
          { tag: 'Good for Work', count: Math.floor(userReviews.length * 0.3) }
        ].filter(tag => tag.count > 0);

        setStats({
          totalReviews: userReviews.length,
          averageRating: Math.round(averageRating * 10) / 10,
          favoriteTags,
          ratingDistribution,
          recentActivity,
          todayReviews
        });

      } catch (error) {
        console.error('Error analyzing taste profile:', error);
        setError('Failed to analyze your taste profile');
      } finally {
        setLoading(false);
      }
    };

    analyzeTasteProfile();
  }, [user]);

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

  const formatTime = (dateInput: any) => {
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
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Taste Profile</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your taste...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Taste Profile</h3>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">❌</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Taste Profile</h3>
        <div className="text-center py-8">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Taste Profile</h3>

      {stats.totalReviews === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600 mb-2">No reviews yet</p>
          <p className="text-sm text-gray-500">
            Start reviewing to see your taste profile!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{stats.totalReviews}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{stats.averageRating}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </div>

          {/* Average Rating Display */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              {renderStars(stats.averageRating)}
            </div>
            <p className="text-sm text-gray-600">Your average rating</p>
          </div>

          {/* Rating Distribution */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {stats.ratingDistribution.map(({ rating, count }) => (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm text-gray-600">{rating}</span>
                    <span className="text-yellow-400">★</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{
                        width: `${(count / stats.totalReviews) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Favorite Tags */}
          {stats.favoriteTags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">You Love</h4>
              <div className="flex flex-wrap gap-2">
                {stats.favoriteTags.map(({ tag, count }) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                  >
                    {tag} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviewed Today Section */}
          {stats.todayReviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Reviewed Today</h4>
                <button
                  onClick={() => setShowTodayReviews(!showTodayReviews)}
                  className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                >
                  {showTodayReviews ? 'Hide' : `Show (${stats.todayReviews.length})`}
                </button>
              </div>
              
              {showTodayReviews && (
                <div className="space-y-3">
                  {stats.todayReviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 text-sm">{review.cafeName}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-xs text-gray-500">
                              {review.rating} stars
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTime(review.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 text-xs leading-relaxed">
                        {review.review}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Activity - REMOVED */}
        </div>
      )}
    </div>
  );
} 