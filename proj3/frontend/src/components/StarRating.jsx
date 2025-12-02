import React, { useState } from 'react';

const StarRating = ({ rating, onRatingChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={`text-2xl transition-colors ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          onClick={() => !readOnly && onRatingChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          <span
            className={
              star <= (hover || rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
