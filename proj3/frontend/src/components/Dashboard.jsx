/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { updateDietaryPreferences } from '../services/MealService';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import BadgeCard from './BadgeCard';
import { BADGE_DEFINITIONS, checkEarnedBadges, getBadgeProgress } from '../utils/badges';
import { LogOut, Settings, User, Star } from 'lucide-react';
import { PreferencesTab } from './PreferencesTab';
import RecommendationsTab from './RecommendationsTab';
import MyMealsTab from './MyMealsTab';
import CartTab from './CartTab';
import EventsTab from './EventsTab';
import { useNavigate } from 'react-router-dom';
import Profile from './Profile';
import { toast } from 'react-toastify';


export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myMeals, setMyMeals] = useState([]);
  const [error, setError] = useState(null);
  const backendURL = "http://localhost:8000";
  const navigate = useNavigate();
  
  const userId = localStorage.getItem("userId");
  const userEmail = localStorage.getItem("email");
  const fullName = localStorage.getItem("fullName");

  // check if current user is logged in
  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
  }, [userId, navigate]);

  // fetch current user info
  useEffect(() => {
    if(!userId) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${backendURL}/api/users/${userId}`);
        if (!res.ok) {
          if (res.status == 404) {
            throw new Error("User not found");
          } throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        console.log("Fetched user data: ", data);
        setUser(data);
      } catch (err) {
        console.error("Error fetching user: ", err);
        setError(err.message);

        // if user not found, redirect to login
        if (err.message == "User not found") {
          localStorage.clear();
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
  }; 
  fetchUser();
}, [userId, navigate]);


  // fetch user's meals
  useEffect(() => {
    if (!userId) return;

    // using email as bearer token for temp auth
    const fetchMeals = async () => {
      try {
        const res = await fetch(`${backendURL}/api/meals/my/listings`, {
          method: "GET",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userEmail}` },
        });

        if (!res.ok) {
          if (res.status === 404) {
            console.log("No meals found for this user");
            setMyMeals([])
            return;
          }
          throw new Error("Failed to fetch meals");
        }
        const data = await res.json();
        console.log("Fetched meals: ", data);
        setMyMeals(data);
      } catch (err) {
        console.error("Error fetching meals: ", err);
        setMyMeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [userId, userEmail]);

  // save user preferences
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem("preferences");
    return saved
      ? JSON.parse(saved)
      : {
          cuisines: [], // Empty by default - show all cuisines
          allergens: [],
          dietary_restrictions: [],
          priceRange: [1, 4], // Show all price ranges by default
          maxDistance: 25, // Maximum distance
          userLocation: null // Will store { address: string, lat: number, lng: number }
        };

  });
  useEffect(() => {
    localStorage.setItem("preferences", JSON.stringify(preferences));
    console.log('Preferences updated:', preferences);
}, [preferences]);

  const savePreferences = () => {
    localStorage.setItem("preferences", JSON.stringify(preferences));
    toast.success("Preferences saved!")
  };

  // user ratings
  const [userRatings, setUserRatings] = useState({});

  const handleRateRestaurant = (restaurantId, rating, review) => {
    setUserRatings(prev => ({
      ...prev,
      [restaurantId]: { rating, review }
    }));
  };
  
  // add meal
  const handleAddMeal = (meal) => {
    const newMeal = {
      ...meal,
      id: Date.now().toString(),
      cookName: fullName || 'Unknown',
      rating: 0,
      postedAt: new Date().toISOString()
    };
    setMyMeals(prev => [...prev, newMeal]);
  };

  // delete meal
  const handleDeleteMeal = (mealId) => {
    setMyMeals(prev => prev.filter(m => m.id !== mealId));
  };

  // initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);


  // add meal to cart
  const handleAddToCart = (meal) => {
    console.log("Adding to cart:", meal);
    toast.success("Meal added to cart");
    setCart((prev) => {
      if (prev.find((item) => item.id === meal.id)) return prev; // prevent duplicates
      return [...prev, meal];
    });
  };

  // remove meal from cart
  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // swap meal
  const handleSwapMeal = (mealId, selectedSwapMeal) => {
  const updatedCart = cart.map((item) =>
    item.id === mealId ? { ...item, selectedSwapMeal } : item
  );
  setCart(updatedCart); // React state updates instantly
  localStorage.setItem("cart", JSON.stringify(updatedCart)); // optional persistence
};

  // get meal ids of meals that are already swapped as they should not be an option to swap again
  const swappedMealIds = cart.filter(item => item.selectedSwapMeal).map(item => item.selectedSwapMeal.id);

  // user ratings
  const getTotalRatings = () => Object.keys(userRatings).length;

  const getAverageRating = () => {
    const ratings = Object.values(userRatings);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / ratings.length;
  };

  // log user out
  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    navigate('/');
  };

  if (loading) return <p>Loading user data...</p>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Logo and title */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-2xl flex items-center justify-center">
                <span className="text-primary-foreground text-base sm:text-lg">🍽️</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-serif font-semibold text-primary">Taste Buddiez</h1>
            </div>

            {/* User section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{getTotalRatings()} ratings</span>
                </div>
                {getTotalRatings() > 0 && (
                  <Badge variant="secondary">
                    Avg: {getAverageRating().toFixed(1)}⭐
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-1 sm:space-x-3">
                <Profile user={user} onUpdate={(updatedUser) => setUser(updatedUser)} />
               
                <div className="hidden md:block">
                  <p className="text-sm">{user?.full_name ? user.full_name : (fullName || 'User')}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 tracking-tight font-serif font-semibold text-primary">
            Welcome back, {user?.full_name ? user.full_name.split(' ')[0] : "User"}!
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-sans">
            Ready to discover delicious homemade meals or share your own creations?
          </p>
        </div>

        <Tabs defaultValue="browse" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-8xl grid-cols-6 h-auto">
            <TabsTrigger
              value="browse"
              className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 space-y-1 sm:space-y-0 text-xs sm:text-sm py-2 sm:py-2.5 transition-all duration-200"
            >
              <span className="text-base sm:text-lg">🍽️</span>
              <span className="hidden sm:inline">Browse Meals</span>
              <span className="sm:hidden">Browse</span>
            </TabsTrigger>

            <TabsTrigger
              value="my-meals"
              className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 space-y-1 sm:space-y-0 text-xs sm:text-sm py-2 sm:py-2.5 transition-all duration-200"
            >
              <span className="text-base sm:text-lg">📋</span>
              <span className="hidden sm:inline">My Meals</span>
              <span className="sm:hidden">My Meals</span>
            </TabsTrigger>

            <TabsTrigger
              value="badges"
              className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 space-y-1 sm:space-y-0 text-xs sm:text-sm py-2 sm:py-2.5 transition-all duration-200"
            >
              <span className="text-base sm:text-lg">🏆</span>
              <span>Badges</span>
            </TabsTrigger>

            <TabsTrigger
              value="preferences"
              className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 space-y-1 sm:space-y-0 text-xs sm:text-sm py-2 sm:py-2.5 transition-all duration-200"
            >
              <span className="text-base sm:text-lg">⚙️</span>
              <span className="hidden lg:inline">Preferences</span>
              <span className="lg:hidden">Settings</span>
            </TabsTrigger>

            <TabsTrigger
              value="cart"
              className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 space-y-1 sm:space-y-0 text-xs sm:text-sm py-2 sm:py-2.5 transition-all duration-200"
            >
              <span className="text-base sm:text-lg">🛒</span>
              <span className="hidden sm:inline">Meal Cart ({cart.length})</span>
              <span className="sm:hidden">Cart ({cart.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-2 space-y-1 sm:space-y-0 text-xs sm:text-sm py-2 sm:py-2.5 transition-all duration-200"
            >
              <span className="text-base sm:text-lg">🎉</span>
              <span className="hidden sm:inline">Events</span>
              <span className="sm:hidden">Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <RecommendationsTab
              preferences={preferences}
              userRatings={userRatings}
              onRateRestaurant={handleRateRestaurant}
              userLocation={preferences.userLocation}
              addToCart={handleAddToCart}
              currentUserId={userId}
            />
          </TabsContent>

          <TabsContent value="my-meals">
            <MyMealsTab
              meals={myMeals}
              onAddMeal={handleAddMeal}
              onDeleteMeal={handleDeleteMeal}
              userLocation={preferences.userLocation}
              onMealsUpdate={setMyMeals}
            />
          </TabsContent>

          <TabsContent value="badges" key={myMeals.length}>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Achievement Badges</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Earn badges for posting meals, getting great reviews, and being an active community member
                </p>
                {user?.stats && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {((user.stats.total_meals_sold || 0) + (user.stats.total_meals_swapped || 0)) || myMeals.length} meals posted
                    </Badge>
                    <Badge variant="outline">
                      {user.stats.total_meals_swapped || 0} swaps completed
                    </Badge>
                    <Badge variant="outline">
                      {(user.stats.average_rating || 0).toFixed(1)} ⭐ average rating
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Badge Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {BADGE_DEFINITIONS.map((badge) => {
                  const earnedBadges = checkEarnedBadges(user?.stats || {}, myMeals);
                  const isEarned = earnedBadges.includes(badge.id);
                  const progress = getBadgeProgress(badge.id, user?.stats || {}, myMeals);
                  
                  return (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      isEarned={isEarned}
                      progress={progress}
                    />
                  );
                })}
              </div>
              
              {/* Summary */}
              <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const earnedCount = checkEarnedBadges(user?.stats || {}, myMeals).length;
                    const totalCount = BADGE_DEFINITIONS.length;
                    const percentage = Math.round((earnedCount / totalCount) * 100);
                    
                    return (
                      <>
                        You've earned <span className="font-bold text-foreground">{earnedCount}</span> of{' '}
                        <span className="font-bold text-foreground">{totalCount}</span> badges ({percentage}%)
                      </>
                    );
                  })()}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesTab
              preferences={preferences}
              onPreferencesChange={setPreferences}
              onSave={savePreferences}
            />
          </TabsContent>

          <TabsContent value="cart">
            <CartTab 
              cart={cart} 
              onRemoveFromCart={handleRemoveFromCart} 
              handleSwapMeal={handleSwapMeal}
              onUpdateSwap={handleSwapMeal}
              swappedMealIds={swappedMealIds}
              clearCart={clearCart}
            />
          </TabsContent>
          <TabsContent value="events">
            <EventsTab currentUser={user} authToken={userEmail} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
