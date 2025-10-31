import React, { useState } from 'react';
import { restaurants, mockOrders } from '../data/mockRestaurants';

const Customer = () => {
  const [activeTab, setActiveTab] = useState('restaurants');

  const RestaurantCard = ({ restaurant }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={restaurant.image} 
        alt={restaurant.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold">{restaurant.name}</h3>
        <p className="text-gray-600">{restaurant.cuisine}</p>
        <div className="flex justify-between mt-2">
          <span className="text-gray-700">⭐ {restaurant.rating}</span>
          <span className="text-gray-700">{restaurant.price}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{restaurant.deliveryTime}</p>
        <button className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Order Now
        </button>
      </div>
    </div>
  );

  const OrderCard = ({ order }) => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{order.restaurant}</h3>
          <p className="text-sm text-gray-600">Order #{order.id}</p>
          <p className="text-sm text-gray-600">{order.date}</p>
          <div className="mt-2">
            {order.items.map((item, index) => (
              <span key={index} className="text-sm text-gray-700 block">• {item}</span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm ${
            order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {order.status}
          </span>
          <p className="mt-2 font-semibold">${order.total}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4">
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab('restaurants')}
          className={`px-4 py-2 rounded ${
            activeTab === 'restaurants' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Restaurants
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded ${
            activeTab === 'orders' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Orders
        </button>
      </div>

      {activeTab === 'restaurants' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
          {mockOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Customer;
