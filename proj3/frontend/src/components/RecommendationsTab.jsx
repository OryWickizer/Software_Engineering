/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { getAllMeals } from '../services/MealService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Star, MapPin, Clock, DollarSign, Heart, User2, MessageCircle, Flag, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';


export default function RecommendationsTab({ preferences, userRatings, onRateRestaurant, userLocation, addToCart, currentUserId }) {
  const [meals, setMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportingMeal, setReportingMeal] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerDialogOpen, setSellerDialogOpen] = useState(false);

  // fetch meals
  useEffect(() => {
    async function fetchMeals() {
      const data = await getAllMeals();
      console.log('Fetched meals from DB:', data);
      setMeals(data);
    } fetchMeals();
  }, []);

  // meal price range  
  function mapPriceToLevel(price) {
    if (price <= 20) return "1";       
    if (price <= 40) return "2";      
    if (price <= 60) return "3";       
  return "4";                        
}

  // render meal price range in $
  function renderPriceLevel(price) {
  const level = mapPriceToLevel(price);
  const color =
    level === "1"
      ? "text-[#D9A299]"
      : level === "2"
      ? "text-[#C2857F]"
      : level === "3"
      ? "text-[#A86A66]"
      : "text-[#8F5250]";

  return <span className={`font-semibold ${color}`}>{"$".repeat(level)}</span>;
}

  // filter meals based on preferences & remove user's own meals
  useEffect(() => {
    if (!meals.length || !preferences) return;
    // get current date
    //const now = new Date();

    const filtered = meals.filter((meal) => {
      if (meal.seller_id === currentUserId) return false;
      // filter out expired meals, remove these next 2 lines if needed
      //const expirationDate = new Date(meal.expires_date);
      //if (expirationDate <= now) return false;

      const cuisineMatch = !(preferences?.cuisines?.length) || preferences.cuisines.includes(meal.cuisine_type);
      const allergenMatch = !meal.allergen_info?.contains?.some(a => preferences?.allergens?.includes(a));
      const dietaryMatch = !meal.dietary_restrictions?.some(d => preferences?.dietary_restrictions?.includes(d));
      const priceLevel = mapPriceToLevel(Number(meal.sale_price));
      const priceMatch = !(preferences?.priceRange?.length) ||
        (priceLevel >= preferences.priceRange[0] && priceLevel <= preferences.priceRange[1]);
         console.log(meal.name, { cuisineMatch, allergenMatch, priceMatch });
      return cuisineMatch && allergenMatch && priceMatch;
    });

    // debug logs
    console.log('Meals before filtering:', meals);
    console.log('Preferences:', preferences);
    console.log('Filtered meals:', filtered);

    setFilteredMeals(filtered);
  }, [meals, preferences, currentUserId]);


  // fetch seller info by id
  const handleViewSeller = async (seller_id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/users/${seller_id}`);
      if (!response.ok) throw new Error("Failed to fetch seller info");
      const data = await response.json();
      setSelectedSeller(data);
      setSellerDialogOpen(true);
    } catch (error) {
      console.error("Error fetching seller info: ", error);
    }
  };

  // handle reporting & rating
  const handleReport = () => {
    if (!reportReason) {
      alert('Please select a reason for reporting');
      return;
    }
    alert(`Report submitted for "${reportingMeal?.name}". We'll review this within 24 hours.`);
    setReportDialogOpen(false);
    setReportReason('');
    setReportDetails('');
    setReportingMeal(null);
  };

  const handleRateMeal = () => {
    if (selectedMeal) {
      onRateRestaurant(selectedMeal.id, ratingValue, reviewText);
      setSelectedMeal(null);
      setRatingValue(5);
      setReviewText('');
    }
  };

  // render stars for rating
  const renderStars = (rating = 0, interactive = false, onRatingChange) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
        />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );

  // if no meals match preferences
  if (!filteredMeals.length) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3>No meals match your preferences</h3>
        <p className="text-muted-foreground">Try adjusting your preferences or check back later for new meals</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <h2 className="text-xl sm:text-2xl">Available Meals Near You</h2>
        <Badge variant="secondary" className="self-start sm:self-auto">{filteredMeals.length} meals found</Badge>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {filteredMeals.length > 0 && filteredMeals.map(meal => (
          <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
                <img src={meal.photos[0]} alt={meal.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2">
                  <Badge className="bg-green-500/90 backdrop-blur-sm text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    
                  </Badge>
                  {meal.available_for_swap && <Badge className="bg-primary/90 backdrop-blur-sm text-xs sm:text-sm">🔄 Swap Available</Badge>}
                </div>
              </div>

              <div className="flex-1">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 sm:space-y-3">
                      <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                        <span>{meal.title}</span>
                        {userRatings[meal.id] && <Heart className="w-4 h-4 fill-red-500 text-red-500 shrink-0" />}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1 cursor-pointer hover:underline text-[#A86A66]"
                          onClick={() => handleViewSeller(meal.seller_id)}>
                            <User2 className="w-3 h-3 shrink-0" /><span>{meal.seller_name}</span>
                        </div>
                        <span>{meal.cuisine_type}</span>
                        <div className="flex items-center space-x-1"><span>{renderPriceLevel(meal.sale_price)}</span><span>${meal.sale_price}</span></div>
                        <div className="flex items-center space-x-1"><MapPin className="w-3 h-3 shrink-0" /><span>{meal.distance} mi away</span></div>
                        <div className="flex items-center space-x-1"><Package className="w-3 h-3 shrink-0" /><span>{meal.portion_size} servings</span></div>
                      </div>
                      {renderStars(meal.average_rating)}
                    </div>
                  </div>
                  <CardDescription className="text-sm sm:text-base">{meal.description}</CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-2 text-sm bg-muted/50 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pickup Location</p>
                        <p className="text-xs text-muted-foreground">{meal.pickup_instructions}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="space-y-2">

                        {meal.allergen_info?.contains?.length > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            <span className="text-xs text-muted-foreground shrink-0">Contains:</span>
                            <div className="flex flex-wrap gap-1">
                              {meal.allergen_info.contains.map(allergen => <Badge key={allergen} variant="destructive" className="text-xs">{allergen}</Badge>)}
                            </div>
                          </div>
                        )}

                          {meal.dietary_restrictions?.contains?.length > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            <span className="text-xs text-muted-foreground shrink-0">Contains:</span>
                            <div className="flex flex-wrap gap-1">
                              {meal.dietary_restrictions.contains.map(dietary => <Badge key={dietary} variant="destructive" className="text-xs">{dietary}</Badge>)}
                            </div>
                          </div>
                        )}

                        {(meal.ingredients || meal.nutrition_info) && (
                          <div className="space-y-1 pt-2">
                          {meal.ingredients && (
                          <div className="text-xs sm:text-sm">
                            <span className="font-medium">Ingredients: </span>
                            <span className="text-muted-foreground">{meal.ingredients}</span>
                          </div>
                        )}

                        {meal.nutrition_info && (
                        <div className="text-xs sm:text-sm">
                          <span className="font-medium">Nutrition: </span>
                          <span className="text-muted-foreground">
                          {meal.nutrition_info}
                          </span>
                        </div>
                        )}
                      </div>
                          
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 sm:space-y-3">
                          <Button
                            onClick={() => addToCart(meal)}
                            className="cursor-pointer mt-3 bg-[#D9A299] hover:bg-[#d18e82] text-white px-4 py-2 rounded-lg"
                          >
                            Add to Cart
                          </Button>
                        <Button size="sm" variant="secondary" className="cursor-pointer" onClick={() => setSelectedMeal(meal)}>Rate Meal</Button>
                        <Button size="sm" variant="destructive-outline" className="cursor-pointer bg-[#FAF7F3]" onClick={() => { setReportingMeal(meal); setReportDialogOpen(true); }}>Report</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedMeal && (
        <Dialog open={!!selectedMeal} onOpenChange={(open) => { if (!open) setSelectedMeal(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate {selectedMeal.name}</DialogTitle>
              <DialogDescription>Provide a rating and review for this meal</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Rating</Label>
                {renderStars(ratingValue, true, setRatingValue)}
              </div>

              <div>
                <Label>Review</Label>
                <Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write your review..." />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setSelectedMeal(null)}>Cancel</Button>
                <Button onClick={handleRateMeal}>Submit</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report {reportingMeal?.name}</AlertDialogTitle>
            <AlertDialogDescription>Please select a reason and provide any additional details.</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Caused Illness">Caused Illness</SelectItem>
                  <SelectItem value="Spoiled">Spoiled</SelectItem>
                  <SelectItem value="Unhygienic">Unhygienic</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Details</Label>
              <Textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Additional details (optional)" />
            </div>

            <AlertDialogFooter className="flex justify-end gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReport}>Submit Report</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/** seller info dialog box */}
      <Dialog open={sellerDialogOpen} onOpenChange={setSellerDialogOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedSeller?.name || "Seller Info"}</DialogTitle>
          <DialogDescription>Learn more about this seller</DialogDescription>
        </DialogHeader>

      {selectedSeller ? (
        <div className="space-y-3">
          <p><strong>Seller:</strong> {selectedSeller.full_name || "No name available."}</p>
          <p><strong>Bio:</strong> {selectedSeller.bio || "No bio available."}</p>
          <p><strong>Social Media:</strong> 
            {selectedSeller.social_media?.facebook && ` FB: ${selectedSeller.social_media.facebook}`}
            {selectedSeller.social_media?.instagram && ` IG: ${selectedSeller.social_media.instagram}`}
            {selectedSeller.social_media?.twitter && ` TW: ${selectedSeller.social_media.twitter}`}
          </p>
          {selectedSeller.profile_picture && (
            <img
              src={selectedSeller.profile_picture}
              alt={`${selectedSeller.name}'s profile`}
              className="w-32 h-32 object-cover rounded-full border"
            />
          )}
        </div>
      ) : (
        <p>Loading seller info...</p>
      )}

      <div className="flex justify-end mt-4">
        <Button className="cursor-pointer" onClick={() => setSellerDialogOpen(false)}>Close</Button>
      </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
