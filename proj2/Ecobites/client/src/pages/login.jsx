import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useAuthContext} from "../context/AuthContext";
import { authService } from "../api/services/auth.service";
import { profileService } from "../api/services/profile.service";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [restaurantName, setRestaurantName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login, register} = useAuthContext();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if(isRegister){
        const registrationData = { 
          name, 
          email, 
          password, 
          phone,
          role 
        };
        
        // Add role-specific fields
        if (role === 'restaurant') {
          registrationData.restaurantName = restaurantName;
          registrationData.cuisine = cuisine.split(',').map(c => c.trim()).filter(c => c);
        } else if (role === 'driver') {
          registrationData.vehicleType = vehicleType;
          registrationData.licensePlate = licensePlate;
        }
        
        const registerResponse = await authService.register(registrationData);
        
        // If customer provided address, geocode and update profile
        if (role === 'customer' && address && city && zipCode) {
          try {
            // Login first to get token
            const loginData = await login({ email, password });
            // Now update address with geocoding
            await profileService.updateAddress({
              street: address,
              city: city,
              zipCode: zipCode
            });
            setMessage("Registration successful with address! Redirecting...");
            // Navigate based on role
            if (loginData.user.role === 'customer') {
              try { sessionStorage.setItem('showSeasonalNudge', '1'); } catch {}
              navigate("/customer");
            }
            return;
          } catch (addressError) {
            console.warn('Failed to geocode address during registration:', addressError);
            // Continue with success message even if geocoding fails
          }
        }
        
        setMessage("Registration successful! You can now log in.");
        setIsRegister(false);
        // Reset form
        setRole("customer");
        setRestaurantName("");
        setCuisine("");
        setVehicleType("");
        setLicensePlate("");
        setAddress("");
        setCity("");
        setZipCode("");
      } else {
        const loginData = await login({ email, password });
        setMessage("Login successful! Redirecting...");
        if (loginData.user.role === 'customer') {
          try { sessionStorage.setItem('showSeasonalNudge', '1'); } catch {}
          navigate("/customer");
        } else if (loginData.user.role === 'driver') {
          navigate("/driver");
        } else if (loginData.user.role === 'restaurant') {
          navigate("/restaurants");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage(error.response?.data?.error || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }





    console.log("Submitting to:", name, email, password, isRegister);
  };


  return (
    <div className="relative flex items-center justify-center min-h-screen bg-emerald-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_-10%,hsl(142.1_76.2%_36.3%/0.25),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_90%_90%,hsl(142.1_76.2%_36.3%/0.15),transparent_70%)]" />
      </div>

      <div className="relative bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-8 w-full max-w-md mx-4">
        <div className="absolute -z-10 inset-0 bg-linear-to-b from-emerald-50/50 to-white/50 rounded-2xl" />
        
        {/* Brand element matching Hero section */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            EcoBites • Join Us
          </span>
        </div>

        <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-800">
          {isRegister ? "Join EcoBites" : "Welcome Back"}
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          {isRegister 
            ? "Start your sustainable food journey today" 
            : "Continue your eco-friendly food experience"}
        </p>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${
            message.includes("successful") 
              ? "bg-emerald-50 text-emerald-700" 
              : "bg-red-50 text-red-600"
          }`}>
            {message}
          </div>
        )}

     

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label={isRegister ? "Registration Form" : "Login Form"}>
          {isRegister && (
            <>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300"
                />
              </div>

              <div className="relative group">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="customer">Customer</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
            </>
          )}

          <div className="relative group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300"
            />
          </div>

          <div className="relative group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300"
            />
          </div>
          
          {isRegister && (
            <>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300"
                />
              </div>

              {/* Restaurant-specific fields */}
              {role === 'restaurant' && (
                <>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Restaurant name"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300"
                    />
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Cuisine types (e.g., Italian, Pizza)"
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300"
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-1">Separate multiple cuisines with commas</p>
                  </div>
                </>
              )}

              {/* Driver-specific fields */}
              {role === 'driver' && (
                <>
                  <div className="relative group">
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">Select vehicle type</option>
                      <option value="electric">Electric (15 pts/delivery)</option>
                      <option value="hybrid">Hybrid (10 pts/delivery)</option>
                      <option value="gas">Gas (5 pts/delivery)</option>
                    </select>
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="License plate"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      required
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300"
                    />
                  </div>
                </>
              )}

              {/* Customer address fields (optional but recommended for order combining) */}
              {role === 'customer' && (
                <>
                  <div className="text-sm text-gray-600 mt-2 mb-1">
                    <span className="font-medium">📍 Delivery Address (Optional)</span>
                    <p className="text-xs text-gray-500">Add your address to enable order combining with neighbors</p>
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Street address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300"
                      />
                    </div>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="ZIP code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/70 group-hover:border-emerald-300"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative overflow-hidden px-6 py-3.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all duration-200 disabled:opacity-60 disabled:hover:bg-emerald-600 group"
          >
            <span className={`inline-block transition-all duration-200 ${loading ? "opacity-0" : "opacity-100"}`}>
              {isRegister ? "Create Account" : "Sign In"}
            </span>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center" data-testid="loading-spinner">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </button>
        </form>

        <div className="relative mt-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative">
            <button
              className="px-4 py-2 text-sm text-gray-600 bg-white hover:text-emerald-600 transition-colors rounded-full"
              onClick={() => {
                setIsRegister(!isRegister);
                setMessage("");
                setRole("customer");
                setRestaurantName("");
                setCuisine("");
                setVehicleType("");
                setLicensePlate("");
                setAddress("");
                setCity("");
                setZipCode("");
              }}
            >
              {isRegister ? "Already have an account? Sign in" : "New to EcoBites? Join now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}