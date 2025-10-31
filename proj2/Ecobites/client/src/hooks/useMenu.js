import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../api/services/menu.service';

export const useMenu = (restaurantId) => {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => menuService.getByRestaurant(restaurantId),
    enabled: !!restaurantId,
    select: (data) => data.data,
  });
};

export const useMenuMutations = () => {
  const queryClient = useQueryClient();

  const createMenuItem = useMutation({
    mutationFn: menuService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['menu']);
    },
  });

  const updateMenuItem = useMutation({
    mutationFn: ({ id, data }) => menuService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menu']);
    },
  });

  const deleteMenuItem = useMutation({
    mutationFn: menuService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['menu']);
    },
  });

  return {
    createMenuItem: createMenuItem.mutate,
    updateMenuItem: updateMenuItem.mutate,
    deleteMenuItem: deleteMenuItem.mutate,
    isCreating: createMenuItem.isPending,
    isUpdating: updateMenuItem.isPending,
    isDeleting: deleteMenuItem.isPending,
  };
};