/* eslint-disable no-unused-vars */
import React from 'react';
import { toast } from 'react-toastify';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';

const AVAILABLE_CUISINES = [
  'Italian', 'Asian', 'Latino', 'Mexican', 'American', 'Mediterranean',
  'Indian', 'Japanese', 'Chinese', 'Korean', 'Thai', 'Vietnamese', 
  'Middle Eastern', 'French', 'German'
];

const COMMON_ALLERGENS = [
  'nuts', 'dairy', 'eggs', 'gluten', 'shellfish',
  'fish', 'soy', 'corn', 'coconut'
];

const DIETARY_RESTRICTIONS = [
  '🌱 Vegetarian', '🥬 Vegan', '🥩 Keto', '🌾 Gluten-Free', '🧂 Low-Sodium',
  '🍯 Paleo', '🥛 Lactose-Free', '🫘 Kosher', '☪️ Halal'
];

export function PreferencesTab({ preferences, onPreferencesChange, onSave }) {
  const toggleArrayItem = (array, item) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  // change cuisine preferences
  const handleCuisineToggle = (cuisine) => {
    onPreferencesChange({
      ...preferences,
      cuisines: toggleArrayItem(preferences.cuisines, cuisine)
    });
  };

  // change allergens
  const handleAllergenToggle = (allergen) => {
    onPreferencesChange({
      ...preferences,
      allergens: toggleArrayItem(preferences.allergens, allergen)
    });
  };

  const handleDietaryToggle = (dietary) => {
    onPreferencesChange({
      ...preferences,
      dietary_restrictions: toggleArrayItem(preferences.dietary_restrictions, dietary)
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid sm:grid-cols-1 gap-4 sm:gap-6">
        {/* Cuisine Preferences */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-lg sm:text-xl">Cuisine Preferences</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Select the types of food you enjoy most
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CUISINES.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={preferences.cuisines.includes(cuisine) ? "default" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    preferences.cuisines.includes(cuisine)
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'hover:border-primary hover:text-primary'
                  }`}
                  onClick={() => handleCuisineToggle(cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Allergens & Dietary*/}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-lg sm:text-xl">Allergens</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Foods you need to avoid
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGENS.map((allergen) => (
                <Badge
                  key={allergen}
                  variant={preferences.allergens.includes(allergen) ? "destructive" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => handleAllergenToggle(allergen)}
                >
                  {allergen}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-lg sm:text-xl">Dietary Restrictions</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Your lifestyle choices
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-wrap gap-2">
              {DIETARY_RESTRICTIONS.map((dietary) => (
                <Badge
                  key={dietary}
                  variant={preferences.dietary_restrictions.includes(dietary) ? "secondary" : "outline"}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    preferences.dietary_restrictions.includes(dietary)
                      ? 'bg-accent hover:bg-accent/90'
                      : 'hover:border-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => handleDietaryToggle(dietary)}
                >
                  {dietary}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Range & Distance */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-lg sm:text-xl">Price Range</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              How much are you comfortable spending?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-2">
            <div className="space-y-3 sm:space-y-4">
              <div className="px-3">
                <Slider
                  value={preferences.priceRange}
                  onValueChange={(value) =>
                    onPreferencesChange({
                      ...preferences,
                      priceRange: value
                    })
                  }
                  max={4}
                  min={1}
                  step={1}
                  className="cursor-pointer w-full"
                />
              </div>
              <div className="grid grid-cols-4 text-xs sm:text-sm text-muted-foreground text-center">
                <span>$ Budget</span>
                <span>$$ Moderate</span>
                <span>$$$ Upscale</span>
                <span>$$$$ Fine</span>
              </div>
              <div className="text-center">
                <Badge variant="outline">
                  {preferences.priceRange[0] === preferences.priceRange[1]
                    ? '$'.repeat(preferences.priceRange[0])
                    : '$'.repeat(preferences.priceRange[0]) +
                      ' - ' +
                      '$'.repeat(preferences.priceRange[1])}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Maximum Distance */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-lg sm:text-xl">Maximum Distance</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              How far are you willing to travel?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-2">
            <div className="space-y-3 sm:space-y-4">
              <div className="px-3">
                <Slider
                  value={[preferences.maxDistance]}
                  onValueChange={(value) =>
                    onPreferencesChange({
                      ...preferences,
                      maxDistance: value[0]
                    })
                  }
                  max={25}
                  min={1}
                  step={1}
                  className="cursor-pointer w-full"
                />
              </div>
              <div className="text-center">
                <Badge variant="outline">{preferences.maxDistance} miles</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Location */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
          <CardTitle className="text-lg sm:text-xl">Your Location</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Set your location to see nearby meals and enable pickup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="location">Address</Label>
            <div className="flex space-x-2">
              <Input
                id="location"
                value={preferences.userLocation?.address || ''}
                onChange={(e) =>
                  onPreferencesChange({
                    ...preferences,
                    userLocation: { address: e.target.value, lat: 0, lng: 0 }
                  })
                }
                placeholder="Enter your address or zip code"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This helps calculate distance to meals and sets your default pickup location
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end px-4 sm:px-0">
        <Button className="cursor-pointer bg-primary hover:bg-primary/90 font-sans w-full sm:w-auto"
          onClick={onSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
