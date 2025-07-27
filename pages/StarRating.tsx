// pages/StarRating.tsx
interface StarRatingProps {
    rating: number;
  }
  
  export default function StarRating({ rating }: StarRatingProps) {
  // Ensure rating is a number and handle edge cases
  const numericRating = Number(rating) || 0;
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  // Debug logging
  console.log('Rating:', rating, 'Numeric:', numericRating, 'Full stars:', fullStars, 'Half star:', hasHalfStar, 'Empty stars:', emptyStars);
  
    return (
      <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-500 text-lg">★</span>
        ))}
        {hasHalfStar && (
          <span className="text-yellow-500 text-lg relative">
            <span className="text-gray-300">★</span>
            <span className="absolute inset-0 text-yellow-500 overflow-hidden" style={{ width: '50%' }}>★</span>
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-lg">☆</span>
        ))}
        <span className="font-semibold text-gray-700 ml-1">{numericRating.toFixed(1)}</span>
      </div>
    );
  }