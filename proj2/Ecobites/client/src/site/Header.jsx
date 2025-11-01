import { use, useEffect, useState } from "react";
import {useAuthContext} from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function SiteHeader({ onMenuClick, showMenuButton, user }) {
  const [role, setRole] = useState(null);

  const { isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) setRole(storedRole);
  }, []);

  

  // Determine dashboard route by role
  const getDashboardLink = () => {
    switch (role) {
      case "customer":
        return "/customer";
      case "restaurant":
        return "/restaurant";
      case "driver":
        return "/driver";
      default:
        return "/login";
    }
  };

  const handleLogout = async () => {
    try {
          
            await logout();
            navigate("/login");
        } catch (error) {
          console.error("Authentication error:", error);
        } finally {
          setRole(false);
        }
    // window.location.href = "/"; // redirect to home
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <span className="text-white text-xl font-bold">🍃</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              EcoBites
            </span>
          </a>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <a href="/" className="px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium">
              Home
            </a>
            <a 
              href="/restaurants" 
              className="px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium"
            >
              Restaurants
            </a>
            <a 
              href="/customer" 
              className="px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium"
            >
              Customers
            </a>
            <a 
              href="/driver" 
              className="px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium"
            >
              Drivers
            </a>
            <a 
              href="/about" 
              className="px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium"
            >
              About
            </a>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            {/* Conditional Buttons */}
            {!user ? (
              <>
                <a
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Login
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Logout
                </button>
                <a
                  href={getDashboardLink()}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          {showMenuButton && (
            <button 
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
