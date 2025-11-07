import { useContext } from 'react';
import { RestaurantContext } from '../context/contexts';

export const useRestaurantContext = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurantContext must be used within RestaurantProvider');
  }
  return context;
};
