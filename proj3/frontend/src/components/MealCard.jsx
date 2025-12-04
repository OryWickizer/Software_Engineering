/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Clock, User2, MapPin, Package, Heart } from "lucide-react";
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

export default function MealCard({
  meal,
  onAddToCart,
  onRate,
  onReport,
  userRatings,
  renderStars,
  renderPriceLevel,
  setSelectedMeal,
  setReportingMeal,
  setReportDialogOpen,
  onRemoveFromCart,
  showRemoveFromCart,
  showSwapButton,
  onSwapClick,
  onUpdateSwap,
  selectedSwapMeal
}) 
{

  const displayedSwapMeal = selectedSwapMeal || meal.selectedSwapMeal;
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerDialogOpen, setSellerDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");


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

  return (
    <>
    {/** construction of meal card with all specific info */}
    <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
          <img
            src={meal.photos?.[0]}
            alt={meal.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2">
            <Badge className="bg-green-500/90 backdrop-blur-sm text-xs">
              <Clock className="w-3 h-3 mr-1" />
            </Badge>
            {meal.available_for_swap && (
              <Badge className="bg-primary/90 backdrop-blur-sm text-xs sm:text-sm">
                🔄 Swap Available
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 sm:space-y-3">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <span>{meal.title}</span>
                  {userRatings?.[meal.id] && (
                    <Heart className="w-4 h-4 fill-red-500 text-red-500 shrink-0" />
                  )}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1 cursor-pointer hover:underline text-[#A86A66]"
                    onClick={() => handleViewSeller(meal.seller_id)}>
                        <User2 className="w-3 h-3 shrink-0" /><span>{meal.seller_name}</span>
                  </div>
                  <span>{meal.cuisine_type}</span>
                  <div className="flex items-center space-x-1">
                    <span>{renderPriceLevel?.(meal.sale_price)}</span>
                    <span>${meal.sale_price}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{meal.distance !== null && meal.distance !== undefined ? `${meal.distance} mi away` : 'Distance unknown'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="w-3 h-3 shrink-0" />
                    <span>{meal.portion_size}</span>
                  </div>
                </div>
                {renderStars?.(meal.average_rating)}
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
                        {meal.allergen_info.contains.map((allergen) => (
                          <Badge key={allergen} variant="destructive" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {meal.dietary_restrictions?.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <span className="text-xs text-muted-foreground shrink-0">Contains:</span>
                      <div className="flex flex-wrap gap-1">
                        {meal.dietary_restrictions.map((dietary) => (
                          <Badge key={dietary} variant="destructive" className="text-xs">
                            {dietary}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(meal.ingredients || meal.nutrition_info) && (
                          <div className="space-y-1 pt-2">
                            {meal.ingredients && <div className="text-xs sm:text-sm"><span className="font-medium">Ingredients: </span><span className="text-muted-foreground">{meal.ingredients}</span></div>}
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
                  {onAddToCart && (
                    <Button
                      onClick={() => onAddToCart(meal)}
                      className="cursor-pointer mt-3 bg-[#D9A299] hover:bg-[#d18e82] text-white px-4 py-2 rounded-lg"
                    >
                      Add to Cart
                    </Button>
                  )}


              {showSwapButton && meal.available_for_swap && (
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  size="sm"
                  variant="outline"
                  checked={!!meal.selectedSwapMeal}
                  onCheckedChange={(checked) => {
                  if (checked) {
                    // open swap dialog to select a meal
                    onSwapClick(meal);

                  } else {
                    // remove swap
                    onUpdateSwap(meal.id, null);
                  }
                  }}
                  className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200"
                />
                <span
                  className="text-sm font-medium cursor-pointer"
                  onClick={() => onSwapClick(meal)}
                >
                  {displayedSwapMeal
                  ? `Swapping with ${meal.selectedSwapMeal.title}`
                  : "Swap Meal"}
                </span>
              </div>
              )}

              {/** message seller button */}
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer mt-2"
                onClick={() => setMessageDialogOpen(true)}
              >
                Message Seller
              </Button>


              {/** remove from cart button */}
              {showRemoveFromCart && (
                <Button
                  variant="destructive"
                  className="cursor-pointer mt-1"
                  onClick={() => onRemoveFromCart(meal)}
                >
                  Remove
                </Button>
              )}
                  {onRate && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSelectedMeal(meal)}
                    >
                      Rate Meal
                    </Button>
                  )}

                  {onReport && (
                    <Button
                      size="sm"
                      variant="destructive-outline"
                      className="cursor-pointer bg-[#FAF7F3]"
                      onClick={() => {
                        setReportingMeal(meal);
                        setReportDialogOpen(true);
                      }}
                    >
                      Report
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
 
        </div>
      </div>
    </Card>


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


      {/** message seller dialog box */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Message {meal.seller_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write your message..."
            className="w-full border p-2 rounded-md resize-none"
            rows={4}
          />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => setMessageDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => {
              // send the message
              console.log("Message sent to seller:", messageText);
              setMessageText("");
              setMessageDialogOpen(false);
            }}
          >
            Send
          </Button>
        </div>
        </div>
      </DialogContent>
      </Dialog>

    </>
  );
}
