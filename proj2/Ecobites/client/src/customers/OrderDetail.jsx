import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for orders
  const mockOrders = {
    'ORD-12344': {
      orderNumber: 'ORD-12344',
      createdAt: '2023-10-15T14:30:00Z',
      status: 'DELIVERED',
      items: [
        { name: 'Paneer Tikka', quantity: 1, price: 14.99 },
        { name: 'Garlic Naan', quantity: 2, price: 3.99 },
      ],
      restaurant: { name: 'Veggie Haven' },
      deliveryAddress: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001'
      },
      paymentMethod: 'credit_card',
      estimatedDeliveryTime: '2023-10-15T15:00:00Z',
      specialInstructions: 'Extra spicy please',
      subtotal: 22.97,
      deliveryFee: 2.99,
      tax: 2.30,
      total: 28.26,
      statusHistory: [
        { status: 'PLACED', timestamp: '2023-10-15T14:30:00Z' },
        { status: 'ACCEPTED', timestamp: '2023-10-15T14:35:00Z' },
        { status: 'PREPARING', timestamp: '2023-10-15T14:40:00Z' },
        { status: 'READY', timestamp: '2023-10-15T14:55:00Z' },
        { status: 'OUT_FOR_DELIVERY', timestamp: '2023-10-15T15:00:00Z' },
        { status: 'DELIVERED', timestamp: '2023-10-15T15:15:00Z' },
      ]
    },
    'ORD-12343': {
      orderNumber: 'ORD-12343',
      createdAt: '2023-10-10T12:00:00Z',
      status: 'DELIVERED',
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 9.99 },
        { name: 'Caesar Salad', quantity: 1, price: 7.99 },
      ],
      restaurant: { name: 'Eco Pizza' },
      deliveryAddress: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        zipCode: '90210'
      },
      paymentMethod: 'paypal',
      estimatedDeliveryTime: '2023-10-10T12:45:00Z',
      specialInstructions: 'No onions on pizza',
      subtotal: 17.98,
      deliveryFee: 3.99,
      tax: 1.80,
      total: 23.77,
      statusHistory: [
        { status: 'PLACED', timestamp: '2023-10-10T12:00:00Z' },
        { status: 'ACCEPTED', timestamp: '2023-10-10T12:05:00Z' },
        { status: 'PREPARING', timestamp: '2023-10-10T12:10:00Z' },
        { status: 'READY', timestamp: '2023-10-10T12:30:00Z' },
        { status: 'OUT_FOR_DELIVERY', timestamp: '2023-10-10T12:35:00Z' },
        { status: 'DELIVERED', timestamp: '2023-10-10T12:50:00Z' },
      ]
    },
    'ORD-12342': {
      orderNumber: 'ORD-12342',
      createdAt: '2023-10-05T18:20:00Z',
      status: 'DELIVERED',
      items: [
        { name: 'Vegan Burger', quantity: 2, price: 11.99 },
        { name: 'Sweet Potato Fries', quantity: 1, price: 5.99 },
        { name: 'Green Smoothie', quantity: 1, price: 6.99 },
      ],
      restaurant: { name: 'Green Eats' },
      deliveryAddress: {
        street: '789 Pine St',
        city: 'Chicago',
        zipCode: '60601'
      },
      paymentMethod: 'cash',
      estimatedDeliveryTime: '2023-10-05T19:00:00Z',
      specialInstructions: 'Extra pickles on burgers',
      subtotal: 36.96,
      deliveryFee: 4.99,
      tax: 3.70,
      total: 45.65,
      statusHistory: [
        { status: 'PLACED', timestamp: '2023-10-05T18:20:00Z' },
        { status: 'ACCEPTED', timestamp: '2023-10-05T18:25:00Z' },
        { status: 'PREPARING', timestamp: '2023-10-05T18:30:00Z' },
        { status: 'READY', timestamp: '2023-10-05T18:50:00Z' },
        { status: 'OUT_FOR_DELIVERY', timestamp: '2023-10-05T18:55:00Z' },
        { status: 'DELIVERED', timestamp: '2023-10-05T19:10:00Z' },
      ]
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundOrder = mockOrders[orderId];
      if (foundOrder) {
        setOrder(foundOrder);
        setIsLoading(false);
      } else {
        setError('Order not found');
        setIsLoading(false);
      }
    }, 500); // Simulate loading delay
  }, [orderId]);

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
              <h2 className="text-2xl font-semibold text-gray-800">Order #{order.orderNumber}</h2>
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
              <p className="text-gray-600">{order.restaurant?.name || 'Restaurant Name'}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h3>
              <p className="text-gray-600">
                {order.deliveryAddress?.street}<br />
                {order.deliveryAddress?.city}, {order.deliveryAddress?.zipCode}
              </p>
            </div>
          </div>

          {/* Payment and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
              <p className="text-gray-600 capitalize">{order.paymentMethod}</p>
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
                    <span className="text-gray-500">{formatDateTime(history.timestamp)}</span>
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
