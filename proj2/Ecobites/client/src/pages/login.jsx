import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useAuthContext} from "../hooks/useAuthContext";
import { authService } from "../api/services/auth.service";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuthContext();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if(isRegister){
        await authService.register({ name, email, password, phone });
        setMessage("Registration successful! You can now log in.");
        setIsRegister(false);
      } else {
        const loginData = await login({ email, password });
        setMessage("Login successful! Redirecting...");
        if (loginData.user.role === 'customer') {
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
        <div className="absolute -z-10 inset-0 bg-gradient-to-b from-emerald-50/50 to-white/50 rounded-2xl" />
        
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
