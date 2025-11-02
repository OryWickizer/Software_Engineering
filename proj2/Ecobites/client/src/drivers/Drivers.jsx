import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { orderService } from "../api/services/order.service";

export default function Drivers() {
  const [activeTab, setActiveTab] = useState("available");
  const [activeSection, setActiveSection] = useState("orders");
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderStatusMap, setOrderStatusMap] = useState({});
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedOrderForLocation, setSelectedOrderForLocation] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuthContext();

  // Fetch available orders
  useEffect(() => {
      // State declarations
    const fetchAvailableOrders = async () => {
      try {
        setIsLoading(true);
  const orders = await orderService.getAvailableForDrivers();
  setAvailableOrders(orders);
  // keep tabbed state in sync so Available tab renders immediately
  setOrders(prev => ({ ...prev, available: orders }));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'driver') {
      fetchAvailableOrders();
      // Refresh every 30 seconds
      const interval = setInterval(fetchAvailableOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  // If driver gets a current order, focus Current tab; otherwise prefer Available
  useEffect(() => {
    if (acceptedOrders.length > 0 && activeTab !== 'current') {
      setActiveTab('current');
    } else if (acceptedOrders.length === 0 && availableOrders.length > 0 && activeTab !== 'available') {
      setActiveTab('available');
    }
  }, [acceptedOrders, availableOrders]);
  
  // Handler for accepting orders
  const handleAcceptOrder = async (orderId) => {
    try {
      setIsLoading(true);
      await orderService.updateStatus(orderId, {
        status: 'DRIVER_ASSIGNED',
        driverId: user._id
      });
      
      // Move order to accepted orders
  const order = availableOrders.find(o => o._id === orderId);
      setAcceptedOrders(prev => [...prev, order]);
       setOrderStatusMap(prev => ({
         ...prev,
         [orderId]: "DRIVER_ASSIGNED"
       }));
  setAvailableOrders(prev => prev.filter(o => o._id !== orderId));

      // Keep rendered orders in sync immediately
      setOrders(prev => ({
        ...prev,
        available: prev.available.filter(o => (o._id || o.id) !== orderId),
        current: [...prev.current, { ...order, status: 'DRIVER_ASSIGNED' }]
      }));
      // Focus Current tab for a smoother UX
      setActiveTab('current');
    } catch (error) {
      console.error("Error accepting order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for updating order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsLoading(true);
      await orderService.updateStatus(orderId, {
        status: newStatus,
        driverId: user._id
      });
      
      // Update local state for acceptedOrders (used for tab auto-switch)
      setAcceptedOrders(prev => {
        if (newStatus === 'DELIVERED') {
          return prev.filter(o => o._id !== orderId);
        }
        return prev.map(order => order._id === orderId ? { ...order, status: newStatus } : order);
      });

      // Update rendered orders immediately
      setOrders(prev => {
        // If delivered: move from current -> past
        if (newStatus === 'DELIVERED') {
          const deliveredOrder = prev.current.find(o => (o._id || o.id) === orderId);
          const updatedDelivered = deliveredOrder ? { ...deliveredOrder, status: 'DELIVERED' } : null;
          return {
            ...prev,
            current: prev.current.filter(o => (o._id || o.id) !== orderId),
            past: updatedDelivered ? [updatedDelivered, ...prev.past] : prev.past
          };
        }
        // Otherwise: just update status within current
        return {
          ...prev,
          current: prev.current.map(o => (o._id || o.id) === orderId ? { ...o, status: newStatus } : o)
        };
      });

      // Optional: if last current order was delivered, bounce back to Available
      setActiveTab(prevTab => {
        if (newStatus === 'DELIVERED') {
          const nextHasCurrent = (orders.current || []).some(o => (o._id || o.id) !== orderId);
          if (!nextHasCurrent && availableOrders.length > 0) return 'available';
        }
        return prevTab;
      });
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced driver state with vehicle and rewards info
  const [driver] = useState({
    name: user?.name || "Driver",
    rating: 4.8,
    totalDeliveries: 156,
    efficiency: 92,
    availablePoints: 450,
    vehicle: {
      type: "EV",
      model: "Tesla Model 3",
      isVerified: true
    },
    rewards: {
      currentTier: "Eco Pioneer",
      nextTier: "Sustainability Champion",
      pointsToNext: 50,
      multipliers: {
        ev: 1.5,
        community: 2.0,
        efficiency: 1.2
      }
    },
    stats: {
      communityOrders: 45,
      evSavings: "2.3 tons CO2",
      averageRating: 4.8
    }
  });

  // Fetch current and past orders
  useEffect(() => {
    const fetchDriverOrders = async () => {
      if (!isAuthenticated || user?.role !== 'driver') return;
      
      try {
        setIsLoading(true);
  const driverOrders = await orderService.getByRole('driver', user._id);
        
        // Separate orders by status
        const current = driverOrders.filter(order => 
          ['DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status)
        );
        const past = driverOrders.filter(order => 
          ['DELIVERED', 'CANCELLED'].includes(order.status)
        );
        
        setAcceptedOrders(current);
        // Update orders state with real data
        setOrders({
          current,
          past,
          available: availableOrders
        });
      } catch (error) {
        console.error("Error fetching driver orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverOrders();
  }, [isAuthenticated, user, availableOrders]);

  // Enhanced orders state management
  const [orders, setOrders] = useState({
    current: [],
    past: [],
    available: []
  });
      

  // Handle location updates
  const updateDriverLocation = async (latitude, longitude) => {
    if (!isAuthenticated || !user) return;
    
    setDriverLocation({ latitude, longitude });
    // Here we would typically send this to the server
    // We'll need to add this endpoint to the API
  };

  // Start location tracking
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocationTracking(true);
    navigator.geolocation.watchPosition(
      (position) => {
        updateDriverLocation(position.coords.latitude, position.coords.longitude);
        setLocationError(null);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setIsLocationTracking(false);
      }
    );
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    setIsLocationTracking(false);
  };

  // Reviews and insights data
  const reviews = {
    recent: [
      { id: 1, rating: 5, comment: "Very professional and eco-conscious driver", date: "2025-10-22" },
      { id: 2, rating: 5, comment: "Appreciated the EV delivery", date: "2025-10-21" }
    ],
    insights: {
      positiveKeywords: ["on time", "professional", "eco-friendly"],
      areas: ["Timeliness: 95%", "Communication: 92%", "Eco-consciousness: 98%"],
      trend: "improving"
    }
  };

  // Get current geolocation
  const getDriverCurrentLocation = () => {
    setIsLocationTracking(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLocationTracking(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (positionObject) => {
        const latitude = positionObject.coords.latitude;
        const longitude = positionObject.coords.longitude;
        const accuracy = positionObject.coords.accuracy;
        
        setDriverLocation({
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toLocaleTimeString()
        });
        setIsLocationTracking(false);
      },
      (geoError) => {
        setLocationError(geoError.message || "Failed to get location");
        setIsLocationTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Reject order function
  const handleRejectOrder = (orderId) => {
    setRejectedOrders([...rejectedOrders, orderId]);
    setOrderStatusMap(prev => ({
      ...prev,
      [orderId]: "rejected"
    }));

    // Remove rejected order from available
    setOrders(prevOrders => ({
      ...prevOrders,
      available: prevOrders.available.filter(order => (order._id || order.id) !== orderId)
    }));
  };

  // Change order delivery status (handled above with API: handleUpdateOrderStatus async)

  // Show location modal for specific order
  const handleShowLocationModal = (orderId) => {
    setSelectedOrderForLocation(orderId);
    setShowLocationModal(true);
    getDriverCurrentLocation();
  };

  // Close location modal
  const handleCloseLocationModal = () => {
    setShowLocationModal(false);
    setSelectedOrderForLocation(null);
  };

  // Calculate points with multipliers
  const calculatePoints = (order) => {
    let pointsValue = order.points;
    if (driver.vehicle.type === "EV") pointsValue *= driver.rewards.multipliers.ev;
    if (order.type === "community") pointsValue *= driver.rewards.multipliers.community;
    if (order.ecoRoute) pointsValue *= driver.rewards.multipliers.efficiency;
    return Math.round(pointsValue);
  };

  // Safely format address objects for display
  const formatAddress = (addr) => {
    if (!addr) return "";
    if (typeof addr === "string") return addr;
    if (typeof addr === "object") {
      const { street, city, zipCode, zip } = addr || {};
      return [street, city, zipCode || zip].filter(Boolean).join(", ");
    }
    try { return String(addr); } catch { return ""; }
  };

  // Get status badge color
  const getStatusBadgeColor = (orderStatus) => {
    const statusColorMap = {
      "Picking up": "bg-blue-100 text-blue-700",
      "En route": "bg-yellow-100 text-yellow-700",
      "Arriving": "bg-purple-100 text-purple-700",
      "Delivered": "bg-green-100 text-green-700",
      "Order Accepted": "bg-emerald-100 text-emerald-700",
      "accepted": "bg-emerald-100 text-emerald-700",
      "rejected": "bg-red-100 text-red-700"
    };
    return statusColorMap[orderStatus] || "bg-gray-100 text-gray-700";
  };

  return (
    user && user.role == 'driver' ? (
    <div className="min-h-screen bg-emerald-50/60">
      {/* Profile Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_-10%,hsl(142.1_76.2%_36.3%/0.25),transparent_70%)]" />
        </div>
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar and Vehicle Badge */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-3xl text-emerald-700">{driver.name[0]}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-100 rounded-full px-2 py-1">
                  <span className="text-sm font-semibold text-emerald-700">★ {driver.rating}</span>
                </div>
                {driver.vehicle.type === "EV" && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Driver Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-800">{driver.name}</h1>
                <div className="text-sm text-emerald-600">{driver.vehicle.type} Driver • {driver.vehicle.model}</div>
                <p className="text-gray-600 mt-1">{driver.rewards.currentTier}</p>
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="px-3 py-1 bg-emerald-50 rounded-full">
                    <span className="text-sm text-emerald-700">{driver.totalDeliveries} Deliveries</span>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 rounded-full">
                    <span className="text-sm text-emerald-700">{driver.stats.communityOrders} Community Orders</span>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 rounded-full">
                    <span className="text-sm text-emerald-700">{driver.stats.evSavings} CO2 Saved</span>
                  </div>
                </div>
              </div>

              {/* Interactive Rewards Section */}
              <div className="bg-white rounded-xl p-4 shadow-sm w-full md:w-auto">
                <div className="text-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Eco Rewards</span>
                  <h3 className="text-2xl font-bold text-emerald-600">{driver.availablePoints} pts</h3>
                  <p className="text-xs text-emerald-600 mt-1">
                    {driver.rewards.pointsToNext} pts to {driver.rewards.nextTier}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(driver.availablePoints / (driver.availablePoints + driver.rewards.pointsToNext)) * 100}%` }}
                  />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">EV Bonus</span>
                    <span className="text-emerald-600">x{driver.rewards.multipliers.ev}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Community Bonus</span>
                    <span className="text-emerald-600">x{driver.rewards.multipliers.community}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Eco-Route Bonus</span>
                    <span className="text-emerald-600">x{driver.rewards.multipliers.efficiency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Sections */}
      <div className="container mx-auto px-4 py-6">
        {/* Main Content Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveSection("orders")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === "orders"
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 hover:bg-emerald-50"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveSection("reviews")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === "reviews"
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 hover:bg-emerald-50"
            }`}
          >
            Reviews & Insights
          </button>
        </div>

        {activeSection === "orders" ? (
          <>
            {/* Orders Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {["current", "available", "past"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-600 hover:bg-emerald-50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Orders
                </button>
              ))}
            </div>

            {/* Orders Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {orders[activeTab].map((order) => (
                <div key={order._id || order.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Current Orders */}
                  {activeTab === "current" && (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-600">Order #{order.orderNumber || order._id || order.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800">{order.restaurant}</p>
                      <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                      <p className="text-sm text-gray-600 mt-1">📞 {order.customerPhone}</p>
                      <p className="text-sm text-emerald-600 font-medium mt-2">ETA: {order.eta}</p>
                      
                      {/* Address Details */}
                      <div className="mt-3 space-y-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <p>
                          <strong>Pickup:</strong> {order.pickupAddress ? formatAddress(order.pickupAddress) : "Restaurant pickup"}
                        </p>
                        <p>
                          <strong>Delivery:</strong> {formatAddress(order.deliveryAddress)}
                        </p>
                      </div>

                      {/* Status Update Buttons */}
                      <div className="mt-4 space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, "OUT_FOR_DELIVERY")}
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                          >
                            Out for delivery
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, "DELIVERED")}
                            className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-colors"
                          >
                            Delivered
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, "DELIVERED")}
                            className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                          >
                            Delivered
                          </button>
                        </div>
                      </div>

                      {/* Location Button */}
                      <button
                        onClick={() => handleShowLocationModal(order._id)}
                        className="w-full mt-3 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                      >
                        📍 Share Location
                      </button>
                    </>
                  )}

                  {/* Past Orders */}
                  {activeTab === "past" && (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-600">Order #{order.orderNumber || order._id || order.id}</span>
                        <span className="text-xs text-gray-500">{order.date}</span>
                      </div>
                      <p className="font-medium text-gray-800">{order.restaurant}</p>
                      <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        {order.status}
                      </span>
                      
                      {order.review && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-1 text-yellow-500">
                            {[...Array(order.review.rating)].map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{order.review.comment}</p>
                        </div>
                      )}
                      <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 rounded-full text-xs text-emerald-700">
                        +{order.points} pts
                      </span>
                    </>
                  )}

                  {/* Available Orders */}
                  {activeTab === "available" && (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-600">{order.restaurant}</span>
                        {order.type === "community" && (
                          <span className="px-2 py-1 bg-emerald-100 rounded-full text-xs text-emerald-700">
                            👥 Group ({order.groupSize})
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">📍 {order.distance}</span>
                        <span className="text-sm font-medium text-emerald-600">{order.estimate}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {order.ecoRoute && "🌱 Eco-route available"}
                        </span>
                        <span className="font-medium text-emerald-600">
                          +{calculatePoints(order)} pts
                        </span>
                      </div>

                      {/* Address Details */}
                      <div className="mt-3 space-y-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <p>
                          <strong>Pickup:</strong> {order.pickupAddress ? formatAddress(order.pickupAddress) : "Restaurant pickup"}
                        </p>
                        <p>
                          <strong>Delivery:</strong> {formatAddress(order.deliveryAddress)}
                        </p>
                      </div>

                      {/* Accept/Reject Buttons */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          disabled={acceptedOrders.some(o => (o._id || o.id) === (order._id || order.id)) || rejectedOrders.includes(order._id || order.id)}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleRejectOrder(order._id || order.id)}
                          disabled={acceptedOrders.some(o => (o._id || o.id) === (order._id || order.id)) || rejectedOrders.includes(order._id || order.id)}
                          className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Reviews & Insights Section */
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {reviews.recent.map((review) => (
                  <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Strength Areas</h4>
                  <div className="space-y-2">
                    {reviews.insights.areas.map((area, index) => (
                      <div key={index} className="bg-emerald-50 px-3 py-2 rounded-lg">
                        <span className="text-sm text-emerald-700">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Common Praise</h4>
                  <div className="flex flex-wrap gap-2">
                    {reviews.insights.positiveKeywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-emerald-100 rounded-full text-xs text-emerald-700">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Driver Location</h3>
              <button
                onClick={handleCloseLocationModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {isLocationTracking ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="text-gray-600 mt-4">Getting your location...</p>
              </div>
            ) : driverLocation ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600"><strong>Latitude:</strong> {driverLocation.latitude.toFixed(6)}</p>
                  <p className="text-sm text-gray-600"><strong>Longitude:</strong> {driverLocation.longitude.toFixed(6)}</p>
                  <p className="text-sm text-gray-600"><strong>Accuracy:</strong> {driverLocation.accuracy.toFixed(2)} meters</p>
                  <p className="text-sm text-gray-600"><strong>Updated:</strong> {driverLocation.timestamp}</p>
                </div>

                {selectedOrderForLocation && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Order ID:</strong> {selectedOrderForLocation}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      Location shared with customer ✓
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={getDriverCurrentLocation}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    🔄 Refresh Location
                  </button>
                  <button
                    onClick={handleCloseLocationModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : locationError ? (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600">
                    <strong>Error:</strong> {locationError}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={getDriverCurrentLocation}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    🔄 Retry
                  </button>
                  <button
                    onClick={handleCloseLocationModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>) : (<div className="min-h-screen flex items-center justify-center bg-emerald-50/60">
      <div className="bg-white rounded-xl p-6 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-600">You must be logged in as a driver to access this page.</p>
      </div>
    </div>)
  );

}


