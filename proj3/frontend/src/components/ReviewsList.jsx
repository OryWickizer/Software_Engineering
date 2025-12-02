import React, { useEffect, useState } from 'react';
import StarRating from './StarRating';

const ReviewsList = ({ userId }) => {
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8000/reviews/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviewsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!reviewsData || reviewsData.total_reviews === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{reviewsData.average_rating}</span>
              <StarRating rating={reviewsData.average_rating} readOnly />
            </div>
            <p className="text-gray-600 mt-1">
              Based on {reviewsData.total_reviews} review{reviewsData.total_reviews !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviewsData.rating_distribution[star.toString()] || 0;
            const percentage = reviewsData.total_reviews > 0 
              ? (count / reviewsData.total_reviews) * 100 
              : 0;
            
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-8">{star}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Recent Reviews</h3>
        {reviewsData.recent_reviews.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-start gap-4">
              {review.reviewer_profile_picture ? (
                <img
                  src={review.reviewer_profile_picture}
                  alt={review.reviewer_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                  {review.reviewer_name.charAt(0)}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.reviewer_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} readOnly />
                      <span className="text-sm text-gray-500">
                        • {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    review.transaction_type === 'sale' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {review.transaction_type === 'sale' ? 'Purchased' : 'Swapped'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  For: <span className="font-medium">{review.meal_title}</span>
                </p>

                {review.comment && (
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
