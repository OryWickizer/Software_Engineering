import { useQuery } from '@tanstack/react-query';
import { restaurantService } from '../api/services/restaurant.service';

export const useRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data.data,
  });
};

export const useRestaurant = (id) => {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => restaurantService.getById(id),
    enabled: !!id,
    select: (data) => data.data,
  });
};