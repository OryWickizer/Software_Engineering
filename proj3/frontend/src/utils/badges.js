// Badge definitions - all available badges in the system
export const BADGE_DEFINITIONS = [
  {
    id: 'first_meal',
    name: 'First Meal',
    icon: '🍽️',
    description: 'Post your first meal',
    color: 'from-blue-500 to-blue-600',
    requirement: 'Post 1 meal'
  },
  {
    id: 'chef_starter',
    name: 'Chef Starter',
    icon: '👨‍🍳',
    description: 'Post 5 meals',
    color: 'from-green-500 to-green-600',
    requirement: 'Post 5 meals'
  },
  {
    id: 'top_chef',
    name: 'Top Chef',
    icon: '⭐',
    description: 'Post 20 meals',
    color: 'from-yellow-500 to-yellow-600',
    requirement: 'Post 20 meals'
  },
  {
    id: 'master_chef',
    name: 'Master Chef',
    icon: '👑',
    description: 'Post 50 meals',
    color: 'from-purple-500 to-purple-600',
    requirement: 'Post 50 meals'
  },
  {
    id: 'five_star',
    name: 'Five Star',
    icon: '⭐⭐⭐⭐⭐',
    description: 'Achieve a 5.0 average rating',
    color: 'from-orange-500 to-orange-600',
    requirement: 'Get 5.0 rating average',
    iconSize: 'small' // Flag for smaller icon
  },
  {
    id: 'highly_rated',
    name: 'Highly Rated',
    icon: '🌟',
    description: 'Maintain 4.5+ rating with 10+ reviews',
    color: 'from-amber-500 to-amber-600',
    requirement: '4.5+ rating, 10+ reviews'
  },
  {
    id: 'first_swap',
    name: 'First Swap',
    icon: '🔄',
    description: 'Complete your first meal swap',
    color: 'from-teal-500 to-teal-600',
    requirement: 'Complete 1 swap'
  },
  {
    id: 'swap_enthusiast',
    name: 'Swap Enthusiast',
    icon: '🔁',
    description: 'Complete 10 swaps',
    color: 'from-cyan-500 to-cyan-600',
    requirement: 'Complete 10 swaps'
  },
  {
    id: 'swap_master',
    name: 'Swap Master',
    icon: '💫',
    description: 'Complete 50 swaps',
    color: 'from-indigo-500 to-indigo-600',
    requirement: 'Complete 50 swaps'
  },
  {
    id: 'community_favorite',
    name: 'Community Favorite',
    icon: '❤️',
    description: 'Receive 100 total ratings',
    color: 'from-pink-500 to-pink-600',
    requirement: 'Get 100 ratings'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    icon: '🐦',
    description: 'Post a meal before 8 AM',
    color: 'from-sky-500 to-sky-600',
    requirement: 'Post meal before 8 AM'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    icon: '🦉',
    description: 'Post a meal after 10 PM',
    color: 'from-violet-500 to-violet-600',
    requirement: 'Post meal after 10 PM'
  },
  {
    id: 'quick_seller',
    name: 'Quick Seller',
    icon: '⚡',
    description: 'Sell a meal within 1 hour of posting',
    color: 'from-yellow-400 to-yellow-500',
    requirement: 'Sell within 1 hour'
  },
  {
    id: 'diverse_cook',
    name: 'Diverse Cook',
    icon: '🌎',
    description: 'Post meals from 5 different cuisines',
    color: 'from-emerald-500 to-emerald-600',
    requirement: '5 different cuisines'
  },
  {
    id: 'verified_seller',
    name: 'Verified Seller',
    icon: '✅',
    description: 'Complete email and profile verification',
    color: 'from-green-600 to-green-700',
    requirement: 'Verify email & profile'
  },
  {
    id: 'generous_sharer',
    name: 'Generous Sharer',
    icon: '🎁',
    description: 'Offer 10 meals for free or swap only',
    color: 'from-rose-500 to-rose-600',
    requirement: '10 free/swap meals'
  }
];

// Check which badges a user has earned based on their stats
export const checkEarnedBadges = (userStats, userMeals = []) => {
  const earnedBadges = [];

  // Meal count badges (using total_meals_sold from backend)
  const mealCount = (userStats?.total_meals_sold || 0) + (userStats?.total_meals_swapped || 0);
  // Also count from userMeals array if provided
  const totalMealsPosted = userMeals.length > 0 ? userMeals.length : mealCount;
  
  if (totalMealsPosted >= 1) earnedBadges.push('first_meal');
  if (totalMealsPosted >= 5) earnedBadges.push('chef_starter');
  if (totalMealsPosted >= 20) earnedBadges.push('top_chef');
  if (totalMealsPosted >= 50) earnedBadges.push('master_chef');

  // Rating badges
  const avgRating = userStats?.average_rating || 0;
  const totalReviews = userStats?.total_reviews || 0;
  if (avgRating === 5.0 && totalReviews > 0) earnedBadges.push('five_star');
  if (avgRating >= 4.5 && totalReviews >= 10) earnedBadges.push('highly_rated');

  // Swap badges
  const swapsCompleted = userStats?.total_meals_swapped || 0;
  if (swapsCompleted >= 1) earnedBadges.push('first_swap');
  if (swapsCompleted >= 10) earnedBadges.push('swap_enthusiast');
  if (swapsCompleted >= 50) earnedBadges.push('swap_master');

  // Community badges
  if (totalReviews >= 100) earnedBadges.push('community_favorite');

  // Verification badge
  if (userStats?.is_verified || userStats?.email_verified) earnedBadges.push('verified_seller');

  // Time-based badges (check from user meals if provided)
  if (userMeals.length > 0) {
    const hasEarlyBirdMeal = userMeals.some(meal => {
      const hour = new Date(meal.created_at).getHours();
      return hour < 8;
    });
    if (hasEarlyBirdMeal) earnedBadges.push('early_bird');

    const hasNightOwlMeal = userMeals.some(meal => {
      const hour = new Date(meal.created_at).getHours();
      return hour >= 22;
    });
    if (hasNightOwlMeal) earnedBadges.push('night_owl');

    // Diverse cook - unique cuisines
    const uniqueCuisines = new Set(userMeals.map(m => m.cuisine_type).filter(Boolean));
    if (uniqueCuisines.size >= 5) earnedBadges.push('diverse_cook');

    // Generous sharer
    const freeOrSwapMeals = userMeals.filter(m => 
      (m.sale_price === 0 || !m.available_for_sale) && m.available_for_swap
    );
    if (freeOrSwapMeals.length >= 10) earnedBadges.push('generous_sharer');
  }

  return earnedBadges;
};

// Get badge progress (for showing "X/Y" progress)
export const getBadgeProgress = (badgeId, userStats, userMeals = []) => {
  const mealCount = (userStats?.total_meals_sold || 0) + (userStats?.total_meals_swapped || 0);
  const totalMealsPosted = userMeals.length > 0 ? userMeals.length : mealCount;
  const swapsCompleted = userStats?.total_meals_swapped || 0;
  const totalReviews = userStats?.total_reviews || 0;
  const avgRating = userStats?.average_rating || 0;

  switch (badgeId) {
    case 'first_meal':
      return { current: totalMealsPosted, required: 1 };
    case 'chef_starter':
      return { current: totalMealsPosted, required: 5 };
    case 'top_chef':
      return { current: totalMealsPosted, required: 20 };
    case 'master_chef':
      return { current: totalMealsPosted, required: 50 };
    case 'first_swap':
      return { current: swapsCompleted, required: 1 };
    case 'swap_enthusiast':
      return { current: swapsCompleted, required: 10 };
    case 'swap_master':
      return { current: swapsCompleted, required: 50 };
    case 'highly_rated':
      return { current: totalReviews, required: 10, extraInfo: `${avgRating.toFixed(1)} rating` };
    case 'community_favorite':
      return { current: totalReviews, required: 100 };
    case 'diverse_cook': {
      const uniqueCuisines = new Set(userMeals.map(m => m.cuisine_type).filter(Boolean));
      return { current: uniqueCuisines.size, required: 5 };
    }
    case 'generous_sharer': {
      const freeOrSwapMeals = userMeals.filter(m => 
        (m.sale_price === 0 || !m.available_for_sale) && m.available_for_swap
      );
      return { current: freeOrSwapMeals.length, required: 10 };
    }
    default:
      return null;
  }
};
