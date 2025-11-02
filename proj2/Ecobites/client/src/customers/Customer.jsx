import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantService } from '../api/services/restaurant.service.js';
import { menuService } from '../api/services/menu.service.js';
import { useRestaurantContext } from '../context/RestaurantContext';


const Customer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch restaurants from API
  const [restaurants, setRestaurants] = useState([]);
  const { selectedRestaurant, setSelectedRestaurant, menu, fetchMenu } = useRestaurantContext();


  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantService.getAll();
        if (response.success && response.data) {
          // Transform the data to match our component's needs
          const transformedData = response.data.map(restaurant => ({
            id: restaurant._id,
            name: restaurant.restaurantName,
            ownerName: restaurant.name,
            email: restaurant.email,
            phone: restaurant.phone,
            cuisine: restaurant.cuisine.join(', '), // Join array into string for compatibility
            address: `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.zipCode}`,
            isAvailable: restaurant.isAvailable,
            // Add default values for missing fields
            rating: 4.5, // Default rating
            deliveryTime: '30-45', // Default delivery time
            image: '🍽️', // Default image
            description: `${restaurant.restaurantName} - ${restaurant.cuisine.join(' & ')} cuisine`,
            menuItems: [] // We'll need to fetch menu items separately
          }));
          setRestaurants(transformedData);
        } else {
          throw new Error('Invalid response format');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch restaurants: ' + err.message);
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Effect to fetch menu items when a restaurant is selected
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (selectedRestaurant) {
        try {
          const response = await menuService.getByRestaurant(selectedRestaurant.id);
          if (response) {
              const menuItems = response;
              console.log('Fetched menu items:', menuItems);
              // Update selected restaurant with menu items (preserve id/_id so frontend can send menuItemId)
              setSelectedRestaurant(prev => ({
                ...prev,
                menuItems: menuItems.map(item => ({
                  _id: item._id || item.id,
                  id: item._id || item.id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  category: item.category,
                  isAvailable: item.isAvailable
                }))
              }));
          }
        } catch (err) {
          console.error('Failed to fetch menu items:', err);
        }
      }
    };

    fetchMenuItems();
  }, [selectedRestaurant?.id, setSelectedRestaurant]);


  const [query, setQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');

  // Cart structure: [{ name, price, restaurant, quantity }]
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cuisines = useMemo(() => {
    const set = new Set();
    restaurants.forEach((r) => {
      if (typeof r.cuisine === 'string') {
        r.cuisine.split(',').forEach((c) => set.add(c.trim()));
      }
    });
    return ['All', ...Array.from(set)];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    const q = query.toLowerCase();
    return restaurants.filter((r) => {
      const matchesQuery =
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        (r.menuItems && r.menuItems.some((mi) => mi.name.toLowerCase().includes(q) || mi.description.toLowerCase().includes(q)));
      const matchesCuisine = cuisineFilter === 'All' || r.cuisine.includes(cuisineFilter);
      return matchesQuery && matchesCuisine && r.isAvailable;
    });
  }, [restaurants, query, cuisineFilter]);

  const formatCurrency = (num) => {
    return Number(num).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };

  // Add item to cart; if exists, increment quantity
  const addToCart = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.name === item.name && p.restaurant === item.restaurant);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // Decrease quantity or remove
  const removeFromCart = (index) => {
    setCart((prev) => {
      const copy = [...prev];
      if (copy[index].quantity > 1) {
        copy[index].quantity -= 1;
      } else {
        copy.splice(index, 1);
      }
      return copy;
    });
  };

  // Explicit increase/decrease to avoid accidental double-calls
  const increaseQuantity = (index) => {
    setCart((prev) => {
      const copy = prev.map((it, i) => (i === index ? { ...it, quantity: (it.quantity || 0) + 1 } : it));
      return copy;
    });
  };

  const decreaseQuantity = (index) => {
    setCart((prev) => {
      const copy = [...prev];
      if (!copy[index]) return copy;
      if (copy[index].quantity > 1) {
        copy[index].quantity -= 1;
      } else {
        copy.splice(index, 1);
      }
      return copy;
    });
  };

  const getTotal = () => {
    const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    return total.toFixed(2);
  };

  const handleCheckout = () => {
    navigate('/customer/checkout', { state: { cart } });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      {/* Hero */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white rounded-xl p-8 shadow-md flex flex-col md:flex-row items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Discover local eco-friendly restaurants</h1>
            <p className="mt-2 text-emerald-100">Fresh, sustainable meals delivered fast — curated for you.</p>
            <div className="mt-4 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants or dishes..."
                className="px-4 py-2 rounded-lg text-gray-800 w-full md:w-96"
              />
              <button onClick={() => { setQuery(''); setCuisineFilter('All'); }} className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-semibold">Clear</button>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm">Cart & Orders</div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => navigate('/customer/orders')}
                className="bg-white text-emerald-600 px-3 py-2 rounded-full font-semibold shadow-md hover:bg-emerald-50 transition-colors"
                title="View Order Status"
              >
                📋
              </button>
              <button
                onClick={() => setIsCartOpen((s) => !s)}
                className="bg-white text-emerald-600 px-4 py-2 rounded-full font-semibold shadow-md flex items-center gap-3 hover:bg-emerald-50 transition-colors"
              >
                <span className="text-lg">🛒</span>
                <span>{cart.reduce((s, i) => s + (i.quantity || 1), 0)}</span>
                <span className="text-sm font-medium">{cart.length > 0 ? formatCurrency(getTotal()) : ''}</span>
              </button>
            </div>
            {/* Ongoing Order Indicator */}
            <div className="mt-2 text-xs text-emerald-200">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                Order in progress
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex gap-3 flex-wrap">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setCuisineFilter(c)}
              className={`px-3 py-1 rounded-full text-sm ${cuisineFilter === c ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 shadow-sm'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

  {/* Main content */}
  <main className="max-w-6xl mx-auto grid grid-cols-1 gap-6">
  {/* Restaurants grid / Menu view */}
  <section>
          {selectedRestaurant ? (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedRestaurant.name}</h2>
                  <p className="text-sm text-gray-500">{selectedRestaurant.cuisine} • {selectedRestaurant.deliveryTime} mins</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setSelectedRestaurant(null);
                      // Clear the menu when going back
                      fetchMenu(null);
                    }} 
                    className="px-3 py-1 rounded-md bg-gray-100"
                  >
                    ← Back
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedRestaurant.menuItems.map((item, i) => (
                  <div key={i} className="border rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{item.name}</h3>
                        <div className="text-emerald-600 font-bold">{formatCurrency(item.price)}</div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      <div className="text-xs text-gray-400 mt-2">Category: {item.category}</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => addToCart({ 
                          ...item, 
                          restaurant: selectedRestaurant.name,
                          restaurantId: selectedRestaurant.id,
                          menuItemId: item._id // Make sure this is also included
                        })} 
                        className="ml-auto px-3 py-2 bg-emerald-600 text-white rounded-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            filteredRestaurants.length === 0 ? (
              <div className="bg-white rounded-lg p-6 shadow-sm">No restaurants match your search.</div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredRestaurants.map((r) => (
                  <article key={r.id} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{r.image}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="text-lg font-semibold">{r.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-yellow-500 font-bold">⭐ {r.rating}</div>
                            <div className="text-sm text-gray-400">{r.deliveryTime} mins</div>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2 items-center">
                          <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">{r.cuisine}</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedRestaurant(r);
                              fetchMenu(r.id);
                            }} 
                            className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm font-semibold"
                          >
                            View Menu
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
        </section>

        {/* Right column removed per request - restaurants grid now uses full width */}
      </main>

      {/* Menu is now shown inline in the left column when a restaurant is selected */}

      {/* Cart Drawer */}
      {isCartOpen && (
        <aside className={`fixed top-20 right-6 z-60 w-80 bg-white rounded-xl shadow-xl transition-transform overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Your Cart</h3>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">{cart.reduce((s, i) => s + (i.quantity || 1), 0)} items</div>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
          </div>

          <ul className="divide-y divide-gray-100 mt-3 max-h-64 overflow-y-auto">
            {cart.length === 0 && <li className="py-4 text-sm text-gray-500">Cart is empty</li>}
            {cart.map((it, idx) => (
              <li key={idx} className="py-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-gray-400">{it.restaurant}</div>
                    </div>
                    <div className="text-sm font-semibold">{formatCurrency(it.price * (it.quantity || 1))}</div>
                  </div>
                    <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => decreaseQuantity(idx)} className="px-2 py-1 bg-gray-100 rounded">-</button>
                    <div className="text-sm">{it.quantity}</div>
                    <button onClick={() => increaseQuantity(idx)} className="px-2 py-1 bg-gray-100 rounded">+</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-600">Subtotal</div>
              <div className="font-bold">{formatCurrency(getTotal())}</div>
            </div>
            <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-emerald-600 text-white py-2 rounded font-semibold disabled:opacity-60">Checkout</button>
          </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Customer;
