import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../api/services/order.service';
import { useAuthContext } from '../context/AuthContext';
import { STATUS_COLORS, ORDER_STATUS } from '../utils/constants';

const OrderStatus = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthContext();

  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (authLoading) return; // wait for auth to resolve
        if (!user?._id) throw new Error('Not authenticated');
        setLoading(true);
        const data = await orderService.getByRole('customer', user._id);
        // Normalize data for UI
        const orders = (Array.isArray(data) ? data : [])
          .map(o => ({
            _id: o._id,
            orderNumber: o.orderNumber,
            date: o.createdAt || o.updatedAt,
            status: o.status,
            items: o.items || [],
            total: o.total || o.totalPrice || 0,
            restaurant: typeof o.restaurant === 'string' ? o.restaurant : (o.restaurant?.name || o.restaurantName || ''),
          }));
        setPastOrders(orders);
        setError(null);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, authLoading]);

  const formatCurrency = (num) => {
    return Number(num).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };

  const getStatusColor = (status) => {
    const key = String(status || '').toUpperCase().replace(/\s+/g, '_');
    return STATUS_COLORS[key] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status) => {
    const key = String(status || '').toUpperCase().replace(/\s+/g, '_');
    return ORDER_STATUS[key] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pt-24 flex items-center justify-center">
        <p className="text-gray-600">Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
          <button
            onClick={() => navigate('/customer')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            ← Back to Restaurants
          </button>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Orders</h2>
          {error && (
            <p className="text-red-600 mb-3">{error}</p>
          )}
          {!error && pastOrders.length === 0 ? (
            <p className="text-gray-500">No orders found.</p>
          ) : (
            <div className="space-y-4">
              {pastOrders.map((order) => (
                <div
                  key={order._id}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/customer/orders/${order._id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800">Order #{order.orderNumber || order._id?.slice(-6)}</p>
                      <p className="text-sm text-gray-500">{new Date(order.date).toLocaleString()} • {order.restaurant}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        {(order.items || []).map(item => `${(item.name || item.itemName || item.menuItem?.name || 'Item')} x ${item.quantity}`).join(', ')}
                      </p>
                    </div>
                    <p className="font-semibold text-emerald-600">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
