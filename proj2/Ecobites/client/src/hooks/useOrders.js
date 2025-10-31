import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../api/services/order.service';

export const useOrders = (role, userId) => {
  return useQuery({
    queryKey: ['orders', role, userId],
    queryFn: () => orderService.getByRole(role, userId),
    enabled: !!userId,
    refetchInterval: 10000, // Refetch every 10 seconds
    select: (data) => data.data,
  });
};

export const useOrder = (orderId) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !!orderId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time tracking
    select: (data) => data.data,
  });
};

export const useAvailableOrders = () => {
  return useQuery({
    queryKey: ['availableOrders'],
    queryFn: () => orderService.getAvailableForDrivers(),
    refetchInterval: 5000,
    select: (data) => data.data,
  });
};

export const useOrderMutations = () => {
  const queryClient = useQueryClient();

  const createOrder = useMutation({
    mutationFn: orderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, statusData }) => 
      orderService.updateStatus(orderId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order']);
      queryClient.invalidateQueries(['availableOrders']);
    },
  });

  const cancelOrder = useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });

  return {
    createOrder: createOrder.mutate,
    updateStatus: updateStatus.mutate,
    cancelOrder: cancelOrder.mutate,
    isCreating: createOrder.isPending,
    isUpdating: updateStatus.isPending,
    isCancelling: cancelOrder.isPending,
  };
};
