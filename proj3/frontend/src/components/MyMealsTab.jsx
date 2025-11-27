/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getMyMeals, createMeal, deleteMeal, updateMeal, uploadPhotos } from '../services/MealService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Plus, MapPin, Clock, DollarSign, Trash2, Package } from 'lucide-react';
import { toast } from 'react-toastify';


const COMMON_ALLERGENS = [
  'nuts', 'dairy', 'eggs', 'gluten', 'shellfish',
  'fish', 'soy', 'corn', 'coconut'
];

const AVAILABLE_CUISINES = [
  'Italian', 'Asian', 'Latino', 'Mexican', 'American', 'Mediterranean',
  'Indian', 'Japanese', 'Chinese', 'Korean', 'Thai', 'Vietnamese', 
  'Middle Eastern', 'French', 'German'
];

const DIETARY_RESTRICTIONS = [
  '🌱 Vegetarian', '🥬 Vegan', '🥩 Keto', '🌾 Gluten-Free', '🧂 Low-Sodium',
  '🍯 Paleo', '🥛 Lactose-Free', '🫘 Kosher', '☪️ Halal'
];

export default function MyMealsTab({ userLocation, onMealsUpdate }) {
  const [meals, setMeals] = useState([]);
  const [editMeal, setEditMeal] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cuisine: '',
    price: '',
    servings: '',
    allergens: [],
    dietary_restrictions: [],
    isSwapAvailable: false,
    ingredients: '',
    nutritionInfo: '',
    pickupAddress: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // fetch existing meals
  useEffect(() => {
    const fetchMyMeals = async () => {
      try {
        const data = await getMyMeals();
        setMeals(data);
      } catch(error) {
        console.error("Error loading meals: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyMeals();
  }, []);

  // creating new meal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userLocation && !formData.pickupAddress) {
      toast.error('Please add your location in Preferences or enter a pickup address');
      return;
    }

    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hrs later

    // upload single photo if selected
    let photoUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
    if (photoFile) {
      try {
        const urls = await uploadPhotos([photoFile]);
        photoUrl = urls[0]; // Take the first URL since we only upload one image
      } catch (err) {
        console.error('Photo upload failed:', err);
        alert('Failed to upload photo');
        setLoading(false);
        return;
      }
    }

    const mealData = {
      title: formData.name,
      description: formData.description,
      cuisine_type: formData.cuisine.replace(/^[^\w]+/, ""),
      meal_type: "Lunch",
      photos: [photoUrl],
      portion_size: `${formData.servings}`,
      available_for_sale: true,
      sale_price: parseFloat(formData.price) || 0,
      available_for_swap: formData.isSwapAvailable,
      swap_preferences: [],
      allergen_info: {
        contains: formData.allergens,
        may_contain: [],
      },
      dietary_restrictions: formData.dietary_restrictions,
      nutrition_info: formData.nutritionInfo,
      preparation_date: now.toISOString(),
      expires_date: expires.toISOString(),
      pickup_instructions: formData.pickupAddress || userLocation?.address || "Location not specified",
    };

    try {
      const newMeal = await createMeal(mealData);
      const updatedMeals = await getMyMeals();
      setMeals(updatedMeals);
      
      // Notify parent component of the update
      if (onMealsUpdate) {
        onMealsUpdate(updatedMeals);
      }
      
      setIsAddDialogOpen(false);

      // Reset form
      setFormData({
        title: '',
        description: '',
        cuisine: '',
        price: '',
        servings: '',
        allergens: [],
        dietary_restrictions: [],
        isSwapAvailable: false,
        ingredients: '',
        nutritionInfo: '',
        pickupAddress: ''
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error("Error adding meal: ", error);
      toast.error(error.message);
    }
  };

  // delete meal
  const handleDeleteMeal = async (mealId) => {
    try {
      await deleteMeal(mealId);
      const updatedMeals = meals.filter((meal) => meal.id !== mealId);
      setMeals(updatedMeals);
      
      // Notify parent component of the update
      if (onMealsUpdate) {
        onMealsUpdate(updatedMeals);
      }
    } catch (error) {
      console.error("Error deleting meal: ", error);
      toast.error(error.message);
    }
  };

  // edit meal
  const handleEditMeal = (meal) => {
    setSelectedMeal(meal);
    setEditMeal(meal.id);
    setFormData({
      title: meal.title || "",
      description: meal.description || "",
      cuisine: meal.cuisine_type || "",
      price: meal.sale_price ?? "",
      servings: meal.portion_size ?? "",
      allergens: meal.allergen_info?.contains || [],
      dietary_restrictions: meal.dietary_restrictions || [],
      isSwapAvailable: meal.available_for_swap || false,
      nutritionInfo: meal.nutrition_info || "",
      pickupAddress: meal.pickup_instructions || "",
    });
    setIsEditOpen(true);
  };

  const handleSaveEdits = async (mealId) => {
    try {
      await updateMeal(mealId, formData);
      console.log("Meal updated succesfully!!");
      setEditMeal(null);
      // refresh meal list
      getMyMeals();
    } catch (error) {
      console.error("Failed to update meal: ", error.message);
    };
  };

  const handleUpdateMeal = async () => {
    if (!selectedMeal) return;

  const updatePayload = {
    title: formData.title,
    description: formData.description,
    cuisine_type: formData.cuisine,          // maps 'cuisine' -> 'cuisine_type'
    meal_type: formData.meal_type || "Lunch", // or however you want to handle this
    photos: formData.photos || selectedMeal.photos || [],
    allergen_info: {
      contains: formData.allergens || [],
      may_contain: [], // optional, can keep empty
    },
    dietary_restrictions: formData.dietary_restrictions || [],
    nutrition_info: formData.nutritionInfo || null,
    portion_size: formData.servings,
    available_for_sale: formData.availableForSale ?? true,
    sale_price: parseFloat(formData.price) || 0,
    available_for_swap: formData.isSwapAvailable ?? false,
    swap_preferences: formData.swapPreferences || [],
    status: selectedMeal.status || "available",
    pickup_instructions: formData.pickupAddress || "",
  };

    try {
      await updateMeal(selectedMeal.id, updatePayload);
      console.log("Meal updated successfully");
      toast.success("Meal updated")
      setIsEditOpen(false);
      const updatedMeals = await getMyMeals(); // refresh meal list
      setMeals(updatedMeals);
    } catch (error) {
      console.error("Failed to update meal", error.message);
    }
  };

  const toggleArrayItem = (array, item) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const getTimeRemaining = (expiresAt) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires - now; // time remaining in milliseconds

    if (diffMs <= 0) return "Expired";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m left`;
    return `${diffMinutes}m left`;
  };

  const isExpired = (expiresAt) => {
    const expires = new Date(expiresAt);
    return new Date() >= expires;
  };

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

  // filter out expired meals
  // const activeMeals = meals.filter(meal => !isExpired(meal.expires_date));

  // show all meals
  const displayedMeals = meals;


  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading your meals...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl mb-2">Your Meals</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Share your homemade creations with the community
          </p>
        </div>

        {/* adding new meal */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 flex flex-col">
            <div className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Add New Meal</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Share your homemade meal with the community. Meals are available for 24 hours.
                </DialogDescription>
              </DialogHeader>
            </div>
            <ScrollArea className="flex-1">
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-5">
                  {/* Meal Name + Cuisine */}
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="name" className="text-sm">Meal Name *</Label>
                      <Input
                        id="name"
                        value={formData.name ?? ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Homemade Lasagna"
                        required
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="cuisine" className="text-sm">Cuisine *</Label>
                      <Select
                        value={formData.cuisine}
                        onValueChange={(value) => setFormData({ ...formData, cuisine: value })}
                        required
                      >
                        <SelectTrigger className="cursor-pointer h-9 sm:h-10">
                          <SelectValue placeholder="Select cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_CUISINES.map((cuisine) => (
                            <SelectItem key={cuisine} value={cuisine}>
                              {cuisine}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Photo upload */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="photo" className="text-sm">Photo (optional)</Label>
                    <div className="flex flex-col items-center gap-2">
                      {photoPreview ? (
                        <div className="relative w-full h-48">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setPhotoFile(null);
                              setPhotoPreview(null);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-48 flex flex-col items-center justify-center gap-2"
                          onClick={() => document.getElementById('photo-upload').click()}
                        >
                          <Plus className="h-8 w-8" />
                          <span>Click to upload a photo</span>
                        </Button>
                      )}
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPhotoFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPhotoPreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Upload a single image for your meal listing.</p>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="description" className="text-sm">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your meal..."
                      rows={3}
                      required
                      className="resize-none text-sm"
                    />
                  </div>

                  {/* Price + Servings */}
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="price" className="text-sm">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price ?? ""}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="15.00"
                        required
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="servings" className="text-sm">Servings *</Label>
                      <Input
                        id="servings"
                        type="number"
                        value={formData.servings ?? ""}
                        onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                        placeholder="4"
                        required
                        className="h-9 sm:h-10"
                      />
                    </div>
                  </div>

                  {/* Pickup Address */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="pickupAddress" className="text-sm">Pickup Location</Label>
                    <Input
                      id="pickupAddress"
                      value={formData.pickupAddress ?? ""}
                      onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                      placeholder={userLocation?.address || "Enter pickup address"}
                      className="h-9 sm:h-10"
                    />
                    {!userLocation && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Or set your default location in Preferences
                      </p>
                    )}
                  </div>

                  <Separator className="my-3 sm:my-4" />

                  {/* Allergens */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-sm">Allergens</Label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {COMMON_ALLERGENS.map((allergen) => (
                        <Badge
                          key={allergen}
                          variant={formData.allergens.includes(allergen) ? "destructive" : "outline"}
                          className="cursor-pointer text-xs hover:scale-105 transition-transform"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              allergens: toggleArrayItem(formData.allergens, allergen)
                            })
                          }
                        >
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>


                  <Separator className="my-3 sm:my-4" />

                  {/* Ingredients */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="ingredients" className="text-sm">Ingredients (Optional)</Label>
                    <Textarea
                      id="ingredients"
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      placeholder="List main ingredients (e.g., Tomatoes, Mozzarella, Basil, Olive Oil)"
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>

                  {/* Nutrition Info */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="nutritionInfo" className="text-sm">Nutrition Info (Optional)</Label>
                    <Textarea
                      id="nutritionInfo"
                      value={formData.nutritionInfo}
                      onChange={(e) => setFormData({ ...formData, nutritionInfo: e.target.value })}
                      placeholder="e.g., Calories: 450, Protein: 25g, Carbs: 40g, Fat: 15g"
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>

                  {/* Swap Available */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-sm font-medium">Available for Swap</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow meal swaps with other cooks
                      </p>
                    </div>
                    <Switch
                      checked={formData.isSwapAvailable}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isSwapAvailable: checked })
                      }
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-muted/30 mt-4">
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="cursor-pointer w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="cursor-pointer bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    >
                      Add Meal
                    </Button>
                  </div>
                </div>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {displayedMeals.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl">🍳</div>
          <h3 className="text-xl">No meals yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start sharing your homemade creations! Click "Add Meal" to get started.
          </p>
        </div>
      ) : (

        <div className="grid gap-4 sm:gap-6">
          {displayedMeals.map((meal) => (
            
            <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row">
                {/* --- Meal Image --- */}
                <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
                  <img
                    src={meal.photos?.[0]}
                    alt={meal.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2">
                    {/* --- display time left on meal, if a meal is expired, if a meal can be swapped --- */} 
                    <Badge className={`backdrop-blur-sm text-xs flex items-center ${
                      isExpired(meal.expires_date) ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'
                    }`} >
                      <Clock className="w-3 h-3 mr-1" />
                        {isExpired(meal.expires_date) ? 'Expired' : getTimeRemaining(meal.expires_date)}
                    </Badge>
                    {meal.available_for_swap && <Badge className="bg-primary/90 backdrop-blur-sm text-xs sm:text-sm">🔄 Swap Available</Badge>}
                  </div>
                </div>

                {/* --- meal title, cuisine, description, location --- */}
                <div className="flex-1">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 sm:space-y-3">
                        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                        <span>{meal.title}</span>
                        </CardTitle>  
                      </div>
                    </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                        <span>{meal.cuisine_type}</span>
                        <div className="flex items-center space-x-1"><span>{renderPriceLevel?.(meal.sale_price)}</span><span>${meal.sale_price}</span></div>
                        <div className="flex items-center space-x-1"><MapPin className="w-3 h-3 shrink-0" /><span>{meal.pickup_instructions}</span></div>
                        <div className="flex items-center space-x-1"><Package className="w-3 h-3 shrink-0" /><span>{meal.portion_size} servings</span></div>
                      </div> 
                    <CardDescription className="text-sm sm:text-base">{meal.description}</CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start space-x-2 text-sm bg-muted/50 p-2 rounded-lg">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pickup Location</p>
                        <p className="text-xs text-muted-foreground">{meal.pickup_instructions}</p>
                      </div>
                    </div>
                    </div>
                    
                    {/* Allergens, Ingredients, Nutrition */}
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="space-y-2">
                        {meal.allergen_info?.contains?.length > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-5 sm:space-x-2">
                            <span className="text-xs text-muted-foreground shrink-0 relative top-[5px]">Contains:</span>
                            <div className="flex flex-wrap gap-1">
                              {meal.allergen_info.contains.map((allergen) => 
                                (<Badge key={allergen} variant="destructive" className="text-xs">{allergen}</Badge>))}
                            </div>
                          </div>
                        )}

                        {meal.dietary_restrictions?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {meal.dietary_restrictions.map((dietary) => (
                            <Badge key={dietary} variant="secondary" className="text-xs">
                              {dietary}
                            </Badge>
                            ))}
                          </div>
                        )}

                         {(meal.ingredients || meal.nutrition_info) && (
                          <div className="space-y-1 pt-2">
                            {meal.ingredients && <div className="text-xs sm:text-sm"><span className="font-medium">Ingredients: </span><span className="text-muted-foreground">{meal.ingredients}</span></div>}
                            {meal.nutrition_info && (
                            <div className="text-xs sm:text-sm">
                              <span className="font-medium">Nutrition: </span>
                              <span className="text-muted-foreground">
                                {meal.nutrition_info || meal.nutritionInfo}
                              </span>
                            </div>
                            )}                 
                          </div>
                        )}

                      </div>
                      </div>

                      {/* delete meal, edit meal */}
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMeal(meal)}
                          className="cursor-pointer"
                        >
                          Edit
                        </Button>

                        <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMealToDelete(meal);
                          setIsDeleteOpen(true);
                        }}
                        className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      </div>
                      
                  </ CardContent>

                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* dialog box for editing meal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 flex flex-col">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Edit Meal</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Update the details of your meal. Changes will be saved immediately upon clicking Save Changes.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable content */}
          <ScrollArea className="flex-1">
          <form
            onSubmit={(e) => {
            e.preventDefault();
            handleUpdateMeal();
            }}
            className="flex flex-col"
          >
          <div className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-5">
          {/* Meal Name + Cuisine */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-sm">Meal Name *</Label>
              <Input
                id="name"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Homemade Lasagna"
                required
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="cuisine" className="text-sm">Cuisine *</Label>
              <Select
                value={formData.cuisine || ""}
                onValueChange={(value) => setFormData({ ...formData, cuisine: value })}
                required
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_CUISINES.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="description" className="text-sm">Description *</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your meal..."
              rows={3}
              required
              className="resize-none text-sm"
            />
          </div>

          {/* Price + Servings */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="price" className="text-sm">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price ?? ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="15.00"
                required
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="servings" className="text-sm">Servings *</Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings ?? ""}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                placeholder="4"
                required
                className="h-9 sm:h-10"
              />
            </div>
          </div>

          {/* Pickup Address */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="pickupAddress" className="text-sm">Pickup Location</Label>
            <Input
              id="pickupAddress"
              value={formData.pickupAddress || ""}
              onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
              placeholder={userLocation?.address || "Enter pickup address"}
              className="h-9 sm:h-10"
            />
            {!userLocation && (
              <p className="text-xs text-muted-foreground mt-1">
                Or set your default location in Preferences
              </p>
            )}
          </div>

          <Separator className="my-3 sm:my-4" />

          {/* Allergens */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-sm">Allergens</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {COMMON_ALLERGENS.map((allergen) => (
                <Badge
                  key={allergen}
                  variant={formData.allergens?.includes(allergen) ? "destructive" : "outline"}
                  className="cursor-pointer text-xs hover:scale-105 transition-transform"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      allergens: toggleArrayItem(formData.allergens || [], allergen)
                    })
                  }
                >
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="my-3 sm:my-4" />

          {/* Ingredients */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="ingredients" className="text-sm">Ingredients (Optional)</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients || ""}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              placeholder="List main ingredients (e.g., Tomatoes, Mozzarella, Basil, Olive Oil)"
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Swap Available */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="space-y-0.5 flex-1">
              <Label className="text-sm font-medium">Available for Swap</Label>
              <p className="text-xs text-muted-foreground">
                Allow meal swaps with other cooks
              </p>
            </div>
            <Switch
              checked={formData.isSwapAvailable || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isSwapAvailable: checked })
              }
            />
          </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-muted/30 mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">Save Changes</Button>
          </div>
          </form>
        </ScrollArea>
        </DialogContent>
        </Dialog>

        {/* dialog box for delete meal */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{mealToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
            Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!mealToDelete) return;

                await handleDeleteMeal(mealToDelete.id); // call the handler
                setIsDeleteOpen(false); // close the dialog
                setMealToDelete(null);  // reset the state
              }}
              className="bg-[#dc3545]"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>


    </div>
  );
}
