  import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../api/services/order.service';
import { authService } from '../api/services/auth.service';
  // Combine with neighbors
  


const OrderDetail = () => {
  const [combining, setCombining] = useState(false);
  const [combinedOrders, setCombinedOrders] = useState([]);
  const [combineError, setCombineError] = useState(null);
  const [combineSuccess, setCombineSuccess] = useState(null);

  const handleCombineWithNeighbors = async () => {
    if (!currentUser?._id || combining) return;
    setCombining(true);
    setCombineError(null);
    setCombineSuccess(null);
    try {
      const result = await orderService.combineWithNeighbors(currentUser._id);
      setCombinedOrders(result.combinedOrders || []);
      if (result.message && result.updatedOrderIds && result.updatedOrderIds.length > 0) {
        setCombineSuccess(result.message);
        setCombineError(null);
        // Optionally, refresh order details after combine
        if (result.combinedOrders && result.combinedOrders[0]) setOrder(result.combinedOrders[0]);
      } else if (result.message) {
        setCombineError(result.message);
      }
    } catch (e) {
      setCombineError(e?.response?.data?.message || 'Failed to combine orders');
    } finally {
      setCombining(false);
    }
  };
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const currentUser = authService.getCurrentUser();

  // Load order from API
  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getById(orderId);
        if (!isMounted) return;
        setOrder(data);
        setError(null);
      } catch (e) {
        if (!isMounted) return;
        setError(e?.response?.data?.message || 'Failed to load order');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (orderId) fetchOrder();
    return () => { isMounted = false; };
  }, [orderId]);

  const handleCancel = async () => {
    if (!order || updating) return;
    const confirm = window.confirm('Are you sure you want to cancel this order?');
    if (!confirm) return;
    try {
      setUpdating(true);
      const updated = await orderService.updateStatus(order._id, { status: 'CANCELLED' });
      setOrder(updated);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (num) => {
    return Number(num).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'PLACED': 'Pending to be Confirmed',
      'placed': 'Pending to be Confirmed',
      'pending': 'Pending to be Confirmed',
      'RECEIVED': 'Pending to be Confirmed',
      'received': 'Pending to be Confirmed',
      'ACCEPTED': 'Pending to be Confirmed',
      'accepted': 'Pending to be Confirmed',
      'PREPARING': 'Preparing',
      'preparing': 'Preparing',
      'READY': 'Ready for Pickup',
      'ready': 'Ready for Pickup',
      'DRIVER_ASSIGNED': 'Ready for Pickup',
      'driver_assigned': 'Ready for Pickup',
      'PICKED_UP': 'Ready for Pickup',
      'picked_up': 'Ready for Pickup',
      'OUT_FOR_DELIVERY': 'En Route',
      'out_for_delivery': 'En Route',
      'DELIVERED': 'Delivered',
      'delivered': 'Delivered',
      'CANCELLED': 'Cancelled',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending to be confirmed':
      case 'placed':
      case 'received':
      case 'accepted':
        return 'text-yellow-600 bg-yellow-100';
      case 'preparing':
        return 'text-orange-600 bg-orange-100';
      case 'ready for pickup':
      case 'ready':
      case 'driver_assigned':
      case 'picked_up':
        return 'text-blue-600 bg-blue-100';
      case 'en route':
      case 'out_for_delivery':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading order details.</p>
          <button
            onClick={() => navigate('/customer/orders')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
          <button
            onClick={() => navigate('/customer/orders')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            ← Back to Orders
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          {/* Order Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Order #{order.orderNumber || (order._id ? order._id.slice(-6) : '')}</h2>
              <p className="text-sm text-gray-500">Placed on {formatDateTime(order.createdAt)}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(getStatusDisplay(order.status))}`}>
              {getStatusDisplay(order.status)}
            </span>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-emerald-600">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Restaurant</h3>
              <p className="text-gray-600">{order.restaurant?.name || order.restaurantName || 'Restaurant'}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h3>
              {order.deliveryAddress ? (
                <p className="text-gray-600">
                  {order.deliveryAddress?.street}<br />
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.zipCode}
                </p>
              ) : (
                <p className="text-gray-600">No address on file</p>
              )}
            </div>
          </div>

          {/* Customer actions */}
          {currentUser?.role === 'customer' && !['DELIVERED', 'CANCELLED', 'COMBINED'].includes(String(order.status).toUpperCase()) && (
            <div className="mb-6 flex gap-4">
              <button
                onClick={handleCancel}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {updating ? 'Cancelling…' : 'Cancel Order'}
              </button>
              <button
                onClick={handleCombineWithNeighbors}
                disabled={combining}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
              >
                {combining ? 'Combining…' : 'Combine with Neighbors'}
              </button>
            </div>
          )}

          {/* Combined Orders Result & Success/Error UI */}
          {combineSuccess && (
            <div className="mb-6">
              <div className="p-4 rounded bg-emerald-100 text-emerald-800 font-semibold">
                {combineSuccess}
              </div>
              {combinedOrders.length > 1 && (
                <div className="mt-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Combined Orders:</h3>
                  <ul className="space-y-2">
                    {combinedOrders.map((o) => (
                      <li key={o._id} className="border rounded p-3 flex flex-col">
                        <span className="font-medium">Order #{o.orderNumber || o._id?.slice(-6)}</span>
                        <span className="text-sm text-gray-600">{o.deliveryAddress?.street}, {o.deliveryAddress?.city}</span>
                        <span className="text-sm text-gray-500">Customer: {String(o.customerId) !== String(currentUser._id) ? o.customerId : 'You'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {combineError && (
            <div className="mb-6">
              <div className="p-4 rounded bg-red-100 text-red-800 font-semibold">
                {combineError}
              </div>
            </div>
          )}

          {/* Payment and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
              <p className="text-gray-600 capitalize">{order.paymentMethod || 'card'}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Estimated Delivery</h3>
              <p className="text-gray-600">
                {order.estimatedDeliveryTime ? formatDateTime(order.estimatedDeliveryTime) : 'Not available'}
              </p>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Special Instructions</h3>
              <p className="text-gray-600">{order.specialInstructions}</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p className="text-gray-800">{formatCurrency(order.subtotal || 0)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Delivery Fee</p>
                <p className="text-gray-800">{formatCurrency(order.deliveryFee || 0)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Tax</p>
                <p className="text-gray-800">{formatCurrency(order.tax || 0)}</p>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <p className="text-gray-800">Total</p>
                <p className="text-emerald-600">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status History</h3>
              <div className="space-y-2">
                {order.statusHistory.map((history, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{getStatusDisplay(history.status)}</span>
                    <span className="text-gray-500">{formatDateTime(history.timestamp || history.updatedAt || order.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
