import { useState } from "react";

export default function Drivers() {
  const [activeTab, setActiveTab] = useState("current");
  const [activeSection, setActiveSection] = useState("orders");
  
  // Enhanced driver state with vehicle and rewards info
  const [driver] = useState({
    name: "John Driver",
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

  // Enhanced orders with community options and eco-impact
  const orders = {
    current: [
      {
        id: 1,
        customer: "Alice",
        restaurant: "Green Eats",
        status: "Picking up",
        eta: "10 mins",
        isEcoRoute: true,
        points: 30
      }
    ],
    past: [
      {
        id: 2,
        customer: "Bob",
        restaurant: "Eco Cafe",
        status: "Delivered",
        date: "2025-10-22",
        points: 25,
        review: {
          rating: 5,
          comment: "Very professional and on time!"
        }
      },
      {
        id: 3,
        customer: "Carol",
        restaurant: "Veggie Haven",
        status: "Delivered",
        date: "2025-10-21",
        points: 35,
        review: {
          rating: 4,
          comment: "Great service, food was still hot"
        }
      }
    ],
    available: [
      {
        id: 4,
        restaurant: "Fresh Foods",
        distance: "2.5km",
        estimate: "$18-22",
        type: "regular",
        points: 20,
        ecoRoute: true
      },
      {
        id: 5,
        restaurant: "Organic Bites",
        distance: "3.1km",
        estimate: "$20-25",
        type: "community",
        groupSize: 3,
        points: 45,
        ecoRoute: true
      }
    ]
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

  const calculatePoints = (order) => {
    let points = order.points;
    if (driver.vehicle.type === "EV") points *= driver.rewards.multipliers.ev;
    if (order.type === "community") points *= driver.rewards.multipliers.community;
    if (order.ecoRoute) points *= driver.rewards.multipliers.efficiency;
    return Math.round(points);
  };

  return (
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
                <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-4" data-testid="driver-stats">
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
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-600 hover:bg-emerald-50"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Orders
                </button>
              ))}
            </div>

        {/* Orders Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders[activeTab].map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              {activeTab === "current" && (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">Order #{order.id}</span>
                    <span className="px-2 py-1 bg-emerald-100 rounded-full text-xs text-emerald-700">
                      {order.status}
                    </span>
                  </div>
                  <p className="font-medium">{order.restaurant}</p>
                  <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                  <p className="text-sm text-emerald-600 mt-2">ETA: {order.eta}</p>
                </>
              )}

              {activeTab === "past" && (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">Order #{order.id}</span>
                    <span className="text-xs text-gray-500">{order.date}</span>
                  </div>
                  <p className="font-medium">{order.restaurant}</p>
                  <p className="text-sm text-gray-600">Customer: {order.customer}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {order.status}
                  </span>
                </>
              )}

              {activeTab === "available" && (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">{order.restaurant}</span>
                    {order.type === "community" && (
                      <span className="px-2 py-1 bg-emerald-100 rounded-full text-xs text-emerald-700">
                        👥 Community ({order.groupSize})
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">{order.distance}</span>
                    <span className="text-sm font-medium text-emerald-600">{order.estimate}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {order.ecoRoute && "🌱 Eco-route available"}
                    </span>
                    <span className="font-medium text-emerald-600">
                      +{calculatePoints(order)} pts
                    </span>
                  </div>
                  <button className="w-full mt-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
                    Accept Order
                  </button>
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
    </div>
  );
}
