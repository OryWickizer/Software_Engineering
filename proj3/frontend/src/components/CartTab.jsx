 
import React from "react";
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Label } from './ui/label';
import MealCard from "./MealCard";
import { getMyMeals } from "../services/MealService";

export default function CheckoutTab({ cart, onRemoveFromCart, userRatings, onRate, onReport, handleSwapMeal, onUpdateSwap, swappedMealIds, clearCart }) {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [reportingMeal, setReportingMeal] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [mealToRemove, setMealToRemove] = useState(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [mealToSwap, setMealToSwap] = useState(null);
  const [selectedSwapMeal, setSelectedSwapMeal] = useState(null);

  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // removing a meal from cart
  const handleRemoveClick = (meal) => {
    setMealToRemove(meal);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    if (mealToRemove) {
      onRemoveFromCart(mealToRemove.id);
      setMealToRemove(null);
      setRemoveDialogOpen(false);
    }
  };

  // simulate checkout
  const handleConfirmCheckout = async () => {
    // Create transactions for each cart item
    const userEmail = localStorage.getItem('email');
    
    try {
      for (const item of cart) {
        const transactionData = {
          meal_id: item.id,
          transaction_type: item.selectedSwapMeal ? 'swap' : 'sale',
          offered_meal_id: item.selectedSwapMeal?.id || null,
          message: item.selectedSwapMeal 
            ? `Swapping for ${item.selectedSwapMeal.title}` 
            : null
        };

        const response = await fetch('http://localhost:8000/api/transactions/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userEmail}`
          },
          body: JSON.stringify(transactionData)
        });

        if (!response.ok) {
          console.error('Failed to create transaction for meal:', item.title);
        }
      }
    } catch (error) {
      console.error('Error creating transactions:', error);
    }
    
    setOrderConfirmed(true);
  };

  // when user closes confirmation pop up, clear cart
  const handleCloseConfirmation = () => {
    setCheckoutDialogOpen(false);
    setOrderConfirmed(false);
    console.log("Cart before clearing:", cart);
    clearCart?.(); // now we clear the cart
    console.log("Cleared!");
  };

  // short cart summary for checkout
  const cartSummary = cart.map((item, i) => {
    const mealTitle = item?.title ?? "Unknown meal";
    const mealPrice = item?.sale_price ?? "N/A";
    const swapMealTitle = item?.selectedSwapMeal?.title;
      return (
        <div key={i} className="text-sm">
          {swapMealTitle
            ? `Swapping ${mealTitle} for ${swapMealTitle}`
            : `${mealTitle} - $${mealPrice}`}
        </div>
      );
  });

  // fetch users own (unexpired) meals to swap with
  const [userMeals, setUserMeals] = useState([]);

  useEffect(() => {
    const fetchUserMeals = async () => {
      try {
        const data = await getMyMeals();
        const now = new Date();
        const unexpiredMeals = data.filter(meal => {
          const expirationDate = new Date(meal.expires_date);
          return expirationDate > now;
        });
        setUserMeals(unexpiredMeals); 
      } catch (error) {
        console.error("Failed to fetch user meals:", error);
      }
    };
    fetchUserMeals();
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

    // show meal star rating
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

  // calculate total price (excluding swapped meals)
  const totalPrice = cart.reduce((sum, meal) => {
    if (meal.selectedSwapMeal) return sum;
    return sum + Number(meal.sale_price || 0);
  }, 0) || 0;

  return (
    <div className="grid gap-4 sm:gap-6">
      {/** show meal card with info */}
      {cart.length > 0 && cart.map(meal => (
        <MealCard
          key={meal.id}
          meal={meal}
          onRate={true}
          onReport={true}
          userRatings={userRatings}
          renderStars={renderStars}
          renderPriceLevel={renderPriceLevel}
          onRemoveFromCart={handleRemoveClick}
          showAddToCart={false}
          showRemoveFromCart={true}
          setSelectedMeal={setSelectedMeal}
          setReportingMeal={setReportingMeal}
          setReportDialogOpen={setReportDialogOpen}
          showSwapButton={true}
          onSwapClick={() => {
            setMealToSwap(meal);
            setSwapDialogOpen(true);
          }}
          selectedSwapMeal = {meal.selectedSwapMeal}
          onUpdateSwap = {(mealId, selectedSwapMeal) => handleSwapMeal(mealId, selectedSwapMeal)}
        />
      ))}

          {/** Show empty cart message only if cart is empty and order is not confirmed */}
          {cart.length === 0 && !orderConfirmed && (
            <div className="text-center py-12 space-y-4">
              <h3>Your cart is empty</h3>
              <p className="text-muted-foreground">Add meals from the Browse tab to see them here</p>
            </div>
          )}


      {/* total price & checkout section */}
      {cart.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 p-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold">
          Total: <span className="text-[#D9A299]">${totalPrice.toFixed(2)}</span>
        </h3>

        <Button
          className="cursor-pointer mt-3 sm:mt-0 bg-[#D9A299] hover:bg-[#c58c82] text-white px-6 py-2 rounded-lg"
          onClick={() => setCheckoutDialogOpen(true)}
          disabled={!cart.length}
        >
          Proceed to Checkout
        </Button>
      </div>
      )}


        {/** confirm order checkout */}
        <AlertDialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <AlertDialogContent>
          {!orderConfirmed ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Please review your order before confirming.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="max-h-48 overflow-y-auto mt-2 space-y-1">
                {cartSummary.length ? (
                  cartSummary 
                  ) : (
                  <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                )}
              </div>

              <div className="mt-4 font-medium text-right">
                Total: ${totalPrice.toFixed(2)}
              </div>

            <AlertDialogFooter className="flex justify-end gap-2 mt-4">
              <AlertDialogCancel className="cursor-pointer" onClick={() => setCheckoutDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault(); // prevent AlertDialog from auto-closing
                  handleConfirmCheckout();
                }} 
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>

            </>
            ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Order Confirmed 🎉</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="space-y-3 mt-2">
                <p className="text-sm">
                  Your order has been placed successfully. You will receive communication
                  regarding the specific meetup time and place.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Need help?</strong> If you don't receive the correct meal or have any issues, 
                    you can file a dispute from the Disputes tab to request a refund.
                  </p>
                </div>
              </div>

              <AlertDialogFooter className="flex justify-end gap-2 mt-4">
                <AlertDialogAction
                  onClick={() => handleCloseConfirmation()}
                >
                Close
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
            )}
          </AlertDialogContent>
          </AlertDialog>

      {/** enable rating & reporting a meal */}
      {selectedMeal && (
        <Dialog open={!!selectedMeal} onOpenChange={(open) => { if (!open) setSelectedMeal(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate {selectedMeal?.title}</DialogTitle>
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
                <Button onClick= {() => {onRate(selectedMeal, ratingValue, reviewText);
            setSelectedMeal(null);}}>Submit</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report {reportingMeal?.title}</AlertDialogTitle>
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
              <AlertDialogAction onClick={() => {
          onReport(reportingMeal, reportReason, reportDetails);
          setReportDialogOpen(false);
        }}>Submit Report</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>


      {/* remove confirmation dialog */}
      {mealToRemove && (
        <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Cart</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {mealToRemove.title} from your cart?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-end gap-2">
              <AlertDialogCancel onClick={() => setRemoveDialogOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRemove
              }>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}


      {/** swap meal dialog */}
      <AlertDialog open={swapDialogOpen} onOpenChange={setSwapDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Swap for {mealToSwap?.title}</AlertDialogTitle>
              <AlertDialogDescription>
                Select one of your unexpired meals to swap.
              </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {userMeals.length ? (
              userMeals.filter((myMeal) => !myMeal.isExpired).map((myMeal) => (
              <Button
                key={myMeal.id}
                variant={selectedSwapMeal?.id === myMeal.id ? "default" : "outline"}
                className={`w-full justify-start ${
                  swappedMealIds.includes(myMeal.id) || myMeal.id === mealToSwap?.id
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : ""
                }`}
                onClick={() => {
                  if (
                    !swappedMealIds.includes(myMeal.id) &&
                    myMeal.id !== mealToSwap?.id
                  ) {
                    setSelectedSwapMeal(myMeal);
                  }
                }}
                disabled = {
                  swappedMealIds.includes(myMeal.id) || myMeal.id === mealToSwap?.id
                }
              >
                {myMeal.title}
              </Button>
              ))
            ) : (
            <p className="text-sm text-muted-foreground">
              You have no available meals to swap.
            </p>
            )}
          </div>

          {/** confirm swap */}
          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel onClick={() => setSwapDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!selectedSwapMeal}
              onClick={() => {
                if (selectedSwapMeal && mealToSwap) {
                onUpdateSwap(mealToSwap.id, selectedSwapMeal);
                setSelectedSwapMeal(null);
                setMealToSwap(null);
                setSwapDialogOpen(false);
                }
              }}
            >
              Confirm Swap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

  </div>
  );
}
