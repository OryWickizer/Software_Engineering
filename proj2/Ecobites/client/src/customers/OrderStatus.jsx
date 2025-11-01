import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderStatus = () => {
  const navigate = useNavigate();

  // Mock data for orders
  const [ongoingOrder] = useState({
    id: 'ORD-12345',
    status: 'Preparing',
    items: [
      { name: 'Buddha Bowl', quantity: 1, price: 12.99 },
      { name: 'Green Smoothie', quantity: 2, price: 6.99 },
    ],
    total: 26.97,
    estimatedTime: '25-30 mins',
    restaurant: 'Green Eats',
  });

  const [pastOrders] = useState([
    {
      id: 'ORD-12344',
      date: '2023-10-15',
      status: 'Delivered',
      items: [{ name: 'Paneer Tikka', quantity: 1, price: 14.99 }],
      total: 14.99,
      restaurant: 'Veggie Haven',
    },
    {
      id: 'ORD-12343',
      date: '2023-10-10',
      status: 'Delivered',
      items: [{ name: 'Margherita Pizza', quantity: 1, price: 9.99 }],
      total: 9.99,
      restaurant: 'Eco Pizza',
    },
  ]);

  const formatCurrency = (num) => {
    return Number(num).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'preparing':
        return 'text-yellow-600 bg-yellow-100';
      case 'ready':
        return 'text-blue-600 bg-blue-100';
      case 'out for delivery':
        return 'text-orange-600 bg-orange-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order Status</h1>
          <button
            onClick={() => navigate('/customer')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            ← Back to Restaurants
          </button>
        </div>

        {/* Ongoing Order */}
        {ongoingOrder && (
          <div className="bg-white rounded-xl p-6 shadow-md mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Current Order</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ongoingOrder.status)}`}>
                {ongoingOrder.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Order ID: {ongoingOrder.id}</p>
                <p className="text-sm text-gray-500">Restaurant: {ongoingOrder.restaurant}</p>
                <p className="text-sm text-gray-500">Estimated Time: {ongoingOrder.estimatedTime}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Items:</h3>
                <ul className="space-y-1">
                  {ongoingOrder.items.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
                      {item.name} x {item.quantity} - {formatCurrency(item.price * item.quantity)}
                    </li>
                  ))}
                </ul>
                <p className="font-semibold text-emerald-600 mt-2">Total: {formatCurrency(ongoingOrder.total)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Past Orders */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order History</h2>
          {pastOrders.length === 0 ? (
            <p className="text-gray-500">No past orders found.</p>
          ) : (
            <div className="space-y-4">
              {pastOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date} • {order.restaurant}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.items.map(item => `${item.name} x ${item.quantity}`).join(', ')}
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
