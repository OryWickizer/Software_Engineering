import { useState, useEffect } from "react";
import Customer from "../customers/Customer";
import { useAuthContext } from "../context/AuthContext";

// Single Profile component that renders different UI based on authenticated user's role.
export default function Profile() {
  const { user: authUser } = useAuthContext();
  // role derives from authenticated user only (no manual switching)
  const [role, setRole] = useState(() => authUser?.role || "customer");

  const [sidebarSelection, setSidebarSelection] = useState("overview");

  // shared user (hydrate from auth; fallback to minimal stub)
  const [user, setUser] = useState(() => authUser || { name: "User", email: "user@example.com" });

  // If localStorage changes elsewhere, sync role/user (lightweight)
  useEffect(() => {
    setUser((prevUser) => authUser || prevUser);
    if (authUser?.role) setRole(authUser.role);
  }, [authUser]);

  // --- Driver specific data / actions ---
  const driverInfo = {
    vehicleType: authUser?.vehicleType || "EV",
    points: authUser?.rewardPoints ?? 0,
    efficiency: 89,
  };

  const driverActions = {
    claimReward: () => alert("Claim reward flow (stub)"),
    toggleVehicleType: (type) => alert(`Vehicle type changed to ${type} (stub)`),
  };

  // --- Customer specific data / actions ---
  const customerInfo = {
    orders: 12,
    favoriteRestaurants: ["Green Eats", "Veggie Haven"],
    rewardPoints: authUser?.rewardPoints ?? 0,
  };

  const customerActions = {
    addAddress: () => alert("Add address (stub)"),
  };

  // --- Restaurant specific data / actions ---
  const restaurantInfo = {
    name: "Green Eats",
    openOrders: 5,
    menuItems: [
      { id: 1, name: "Veggie Bowl", price: 9.5 },
      { id: 2, name: "Green Smoothie", price: 4.5 },
    ],
  };

  const restaurantActions = {
    addMenuItem: () => alert("Add menu item (stub)"),
    toggleOrder: (id) => alert(`Toggle order ${id} (stub)`),
  };

  // Sidebar items differ per role
  const sidebarItems = {
    driver: [
      { key: "overview", label: "Overview" },
      { key: "current", label: "Current Orders" },
      { key: "available", label: "Available Orders" },
      { key: "rewards", label: "Rewards" },
      { key: "settings", label: "Settings" },
    ],
    customer: [
      { key: "overview", label: "Dashboard" },
      { key: "orders", label: "Order History" },
      { key: "addresses", label: "My Addresses" },
      { key: "payments", label: "Payment Methods" },
      { key: "settings", label: "Account Settings" },
    ],
    restaurant: [
      { key: "overview", label: "Overview" },
      { key: "incoming", label: "Incoming Orders" },
      { key: "menu", label: "Menu" },
      { key: "stats", label: "Statistics" },
      { key: "settings", label: "Settings" },
    ],
  };

  // Main content renderers per role and selection
  const renderDriverMain = () => {
    switch (sidebarSelection) {
      case "overview":
        return (
          <div>
            <h3 className="text-xl font-semibold">Driver Overview</h3>
            <p className="text-sm text-gray-600">Green Incentive Points: <span className="font-medium text-emerald-600">{driverInfo.points}</span></p>
            <p className="text-sm text-gray-600">Efficiency: {driverInfo.efficiency}%</p>
            <p className="text-sm text-gray-600">Vehicle: {driverInfo.vehicleType}</p>
          </div>
        );
      case "current":
        return (
          <div>
            <h3 className="text-xl font-semibold">Current Orders</h3>
            <p className="text-sm text-gray-600">(Placeholder) List of active deliveries.</p>
          </div>
        );
      case "available":
        return (
          <div>
            <h3 className="text-xl font-semibold">Available Orders</h3>
            <p className="text-sm text-gray-600">Includes community/shared orders and EV bonuses.</p>
            <div className="mt-3">
              <button onClick={() => alert('Accept community order (stub)')} className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded">Accept community order</button>
            </div>
          </div>
        );
      case "rewards":
        return (
          <div>
            <h3 className="text-xl font-semibold">Driver Rewards & Efficiency</h3>
            <p className="text-sm text-gray-600">Use EV, bikes, or low-emission methods to earn incentives on deliveries.</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className="bg-emerald-600 h-3 rounded-full" style={{ width: `${(driverInfo.points/500)*100}%` }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => driverActions.claimReward()} className="px-3 py-2 bg-emerald-600 text-white rounded">Claim Reward</button>
                <button onClick={() => driverActions.toggleVehicleType('ICE')} className="px-3 py-2 bg-gray-100 rounded">Switch Vehicle (stub)</button>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div>
            <h3 className="text-xl font-semibold">Driver Settings</h3>
            <p className="text-sm text-gray-600">Manage vehicle type, notifications and payout settings.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderCustomerMain = () => {
    switch (sidebarSelection) {
      case "overview":
        return (
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Customer Dashboard</h3>
              <p className="text-sm text-gray-600">Eco Rewards Balance: <span className="font-medium text-emerald-600">{customerInfo.rewardPoints}</span> pts</p>
              <p className="text-xs text-gray-500 mt-1">Choose reusable/compostable/minimal packaging at checkout to earn more.</p>
            </div>
            <Customer />
          </div>
        );
      case "orders":
        return (
          <div>
            <h3 className="text-xl font-semibold">My Orders</h3>
            <p className="text-sm text-gray-600">(Placeholder) Past and active orders list.</p>
          </div>
        );
      case "addresses":
        return (
          <div>
            <h3 className="text-xl font-semibold">Saved Addresses</h3>
            <p className="text-sm text-gray-600">Manage your delivery addresses.</p>
            <button onClick={() => customerActions.addAddress()} className="mt-3 px-3 py-2 bg-emerald-50 text-emerald-700 rounded">Add address</button>
          </div>
        );
      case "payments":
        return (
          <div>
            <h3 className="text-xl font-semibold">Payment Methods</h3>
            <p className="text-sm text-gray-600">Manage saved cards and wallets.</p>
          </div>
        );
      case "settings":
        return (
          <div>
            <h3 className="text-xl font-semibold">Account Settings</h3>
          </div>
        );
      default:
        return null;
    }
  };

  const renderRestaurantMain = () => {
    switch (sidebarSelection) {
      case "overview":
        return (
          <div>
            <h3 className="text-xl font-semibold">Restaurant Overview</h3>
            <p className="text-sm text-gray-600">Open orders: {restaurantInfo.openOrders}</p>
          </div>
        );
      case "incoming":
        return (
          <div>
            <h3 className="text-xl font-semibold">Incoming Orders</h3>
            <p className="text-sm text-gray-600">(Placeholder) Accept or reject incoming orders.</p>
          </div>
        );
      case "menu":
        return (
          <div>
            <h3 className="text-xl font-semibold">Menu</h3>
            <p className="text-sm text-gray-600">Manage your menu items.</p>
            <p className="text-xs text-emerald-700 mt-1">Tip: set packaging options (reusable/compostable/minimal) so customers can earn rewards.</p>
            <button onClick={() => restaurantActions.addMenuItem()} className="mt-3 px-3 py-2 bg-emerald-50 text-emerald-700 rounded">Add item</button>
            <div className="mt-3 space-y-2">
              {restaurantInfo.menuItems.map((m) => (
                <div className="p-2 bg-gray-50 rounded" key={m.id}>
                  <div className="flex justify-between">
                    <span>{m.name}</span>
                    <span className="text-sm text-gray-600">${m.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "stats":
        return (
          <div>
            <h3 className="text-xl font-semibold">Statistics</h3>
            <p className="text-sm text-gray-600">Sales, ratings and eco-impact insights (placeholder).</p>
          </div>
        );
      case "settings":
        return (
          <div>
            <h3 className="text-xl font-semibold">Restaurant Settings</h3>
            <p className="text-sm text-gray-600">Business settings, opening hours, payout info.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderMain = () => {
    if (role === "driver") return renderDriverMain();
    if (role === "customer") return renderCustomerMain();
    if (role === "restaurant") return renderRestaurantMain();
    return null;
  };

  return (
    <div className="min-h-screen bg-emerald-50/60 p-6 pt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-3">
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl text-emerald-700">
                {(user?.name || 'U').slice(0,1).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {sidebarItems[role].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSidebarSelection(item.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${sidebarSelection === item.key ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-gray-700'}`}>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9 lg:col-span-9">
          <div className="bg-white rounded-2xl p-6 shadow">
            {renderMain()}
          </div>
        </main>
      </div>
    </div>
  );
}
