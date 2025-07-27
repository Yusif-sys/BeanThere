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
}

export default function TasteProfile() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<TasteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            recentActivity: 'No reviews yet'
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
          recentActivity
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

          {/* Recent Activity */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">{stats.recentActivity}</p>
          </div>
        </div>
      )}
    </div>
  );
} 