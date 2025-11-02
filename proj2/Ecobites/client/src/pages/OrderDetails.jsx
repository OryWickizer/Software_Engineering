import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { orderService } from '../api/services/order.service';
import { ORDER_STATUS, STATUS_COLORS, PACKAGING_LABELS, ECO_REWARDS } from '../utils/constants';

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const updated = await orderService.updateStatus(orderId, {
        status: newStatus,
        driverId: user.role === 'driver' ? user._id : undefined
      });
      setOrder(updated);
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    const { street, city, zipCode, zip } = addr;
    return [street, city, zipCode || zip].filter(Boolean).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/60 p-6 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-emerald-50/60 p-6 pt-24">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const showCustomerActions = user.role === 'customer' && order.customerId === user._id;
  const showRestaurantActions = user.role === 'restaurant' && order.restaurantId === user._id;
  const showDriverActions = user.role === 'driver';

  return (
    <div className="min-h-screen bg-emerald-50/60 p-6 pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
            >
              ← Back
            </button>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
              {ORDER_STATUS[order.status] || order.status}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Order #{order._id?.slice(-8)}</h1>
          <p className="text-gray-600 mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status</h2>
          <div className="space-y-3">
            {order.statusHistory?.map((history, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${index === order.statusHistory.length - 1 ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{ORDER_STATUS[history.status] || history.status}</p>
                  <p className="text-sm text-gray-500">{formatDate(history.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal || 0)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(order.total || 0)}</span>
            </div>
          </div>
        </div>

        {/* Eco Rewards Info */}
        {order.packagingPreference && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 shadow-lg border-2 border-emerald-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🌿</span>
              <h2 className="text-xl font-semibold text-emerald-800">Eco-Friendly Choice</h2>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700">
                Packaging: <span className="font-semibold text-emerald-700">{PACKAGING_LABELS[order.packagingPreference] || order.packagingPreference}</span>
              </p>
              <p className="text-gray-700">
                Eco Reward Points: <span className="font-semibold text-emerald-700">+{order.ecoRewardPoints || ECO_REWARDS[order.packagingPreference] || 0} pts</span>
              </p>
              {order.ecoRewardCredited && (
                <p className="text-sm text-emerald-600">✓ Rewards credited to your account</p>
              )}
            </div>
          </div>
        )}

        {/* Driver Incentive (for driver view) */}
        {showDriverActions && order.driverId === user._id && order.driverRewardPoints > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⚡</span>
              <h2 className="text-xl font-semibold text-blue-800">Green Delivery Incentive</h2>
            </div>
            <p className="text-gray-700">
              Earned: <span className="font-semibold text-blue-700">+{order.driverRewardPoints} pts</span>
            </p>
            {order.driverRewardCredited && (
              <p className="text-sm text-blue-600">✓ Incentive credited to your account</p>
            )}
          </div>
        )}

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Address</h2>
          <p className="text-gray-700">{formatAddress(order.deliveryAddress)}</p>
        </div>

        {/* Restaurant Actions */}
        {showRestaurantActions && ['PLACED', 'RECEIVED'].includes(order.status) && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
            <div className="flex gap-3">
              {order.status === 'PLACED' && (
                <button
                  onClick={() => handleStatusUpdate('ACCEPTED')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
                >
                  Accept Order
                </button>
              )}
              {order.status === 'ACCEPTED' && (
                <button
                  onClick={() => handleStatusUpdate('PREPARING')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Start Preparing
                </button>
              )}
              {order.status === 'PREPARING' && (
                <button
                  onClick={() => handleStatusUpdate('READY')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                >
                  Mark as Ready
                </button>
              )}
            </div>
          </div>
        )}

        {/* Driver Actions */}
        {showDriverActions && order.driverId === user._id && ['DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status) && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Driver Actions</h2>
            <div className="flex gap-3">
              {order.status === 'DRIVER_ASSIGNED' && (
                <button
                  onClick={() => handleStatusUpdate('PICKED_UP')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  Mark as Picked Up
                </button>
              )}
              {order.status === 'PICKED_UP' && (
                <button
                  onClick={() => handleStatusUpdate('OUT_FOR_DELIVERY')}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
                >
                  Out for Delivery
                </button>
              )}
              {order.status === 'OUT_FOR_DELIVERY' && (
                <button
                  onClick={() => handleStatusUpdate('DELIVERED')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        )}

        {/* Customer Cancel */}
        {showCustomerActions && !['DELIVERED', 'CANCELLED'].includes(order.status) && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to cancel this order?')) {
                  handleStatusUpdate('CANCELLED');
                }
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
