/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';


function LandingPage({ onAuthSuccess }) {

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showResend, setShowResend] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const backendURL = "http://localhost:8000";

  // log user in
  const handleLogin = async (e) => {
    e.preventDefault();
    // validate credentials
    if (!loginEmail || !loginPassword) return toast.error("Enter email and password");

    setLoading(true);

    try {
      const response = await fetch(`${backendURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();

      if (response.ok) {
        // login successful
        const { user_id, full_name } = data;
        localStorage.setItem("userId", user_id);
        localStorage.setItem("fullName", full_name);
        localStorage.setItem("email",data.email);
        navigate("/dashboard");
      } else if (response.status == 403 && data.detail?.includes("verify your email")) {
          // show toast notif with resend email verification button
          toast.info( 
            <div>
              <p>Your email is not verified. Please click to resend your verification email to gain access to your account.</p>
              <Button
                onClick={async () => {
                  try {
                    const resendResponse = await fetch(`${backendURL}/api/auth/resend-verification?email=${encodeURIComponent(loginEmail)}&account_type=user`,
                    { method: "POST" });
                    const resendData = await resendResponse.json();

                    if(resendResponse.ok){
                      toast.success(resendData.message || "Verification email sent successfully. Please check your inbox.");
                    } else {
                      toast.error(resendData.detail || "Failed to send verification email");
                    }
                  } catch (resendError) {
                    console.error("Resend Error: ", resendError);
                    toast.error("Error sending verification email. Please try again.");
                  }
                }}
                style={{
                  background: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  marginTop: "8px",
                  cursor: "pointer",
                }}
                >
                  Resend Verification Email
                </Button>
            </div>,
            { autoClose: false}
          );
        } else {
          toast.error(data.detail || data.message || "Login failed. Please try again.");
        } 
      } catch (error) {
        console.error("Login error: , error");
        toast.error("Error connecting to backend");
      } finally {
        setLoading(false);
      }
  };

  // sign up user
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupName) return toast.error("Please fill in all fields");

    // password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(signupPassword)) {
        return toast.error(
          "Password must be at least 8 characters long, include at least 1 uppercase letter, 1 lowercase letter, & 1 number"
        );
      }

    // create user account
    setLoading(true);
    try {
      const response = await fetch(`${backendURL}/api/auth/register/user`, {
        method: "POST",
        headers:{ "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          full_name: signupName,
          phone: phone || "",
          location: {
            address: address || "",
            city: city || "",
            state: state || "",
            zip_code: zipCode || "",
            latitude: latitude || 0,
            longitude: longitude || 0,
          },
          profile_picture: ""
        })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userId", data.user_id);
        localStorage.setItem("email", data.email);
        localStorage.setItem("fullName", signupName);
        toast.success(data.message || "Account created successfully. Please verify your email.");
        navigate("/dashboard");
      } else {
        // Handle Pydantic/FastAPI validation errors which come back as
        // { detail: [ {loc:..., msg:..., type:...}, ... ] }
        if (data && Array.isArray(data.detail)) {
          const messages = data.detail.map(d => d.msg || JSON.stringify(d)).join('; ');
          toast.error(messages);
        } else {
          toast.error(data.detail || data.message || "Signup failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Error connecting to backend");
    } finally {
      setLoading(false);
    }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/50 to-accent/30">
      {/* Header */}
      <header className="px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground text-lg sm:text-xl">🍽️</span>
              </div>
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-3xl font-serif font-semibold tracking-tight text-primary">Taste Buddiez</h1>
              <span className="text-[10px] sm:text-xs text-muted-foreground tracking-[0.1em] sm:tracking-[0.2em] uppercase font-sans font-medium">Homemade Meals</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-10 text-sm font-medium text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-all duration-200 font-sans">Features</span>
            <span className="hover:text-foreground cursor-pointer transition-all duration-200 font-sans">How it Works</span>
            <span className="hover:text-foreground cursor-pointer transition-all duration-200 font-sans">About</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        {/* Main Hero Content */}
        <div className="text-center space-y-10 sm:space-y-16 mb-16 sm:mb-24">
          <div className="space-y-8 sm:space-y-12">
            <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-white/70 backdrop-blur-sm border border-primary/20 rounded-full px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="font-sans">Community-driven • Trusted by home cooks</span>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight max-w-6xl mx-auto font-serif">
                Buy & Swap
                <span className="block text-primary italic font-medium">
                  Homemade Meals
                </span>
              </h1>
              <div className="text-3xl sm:text-4xl md:text-5xl">🍲</div>
            </div>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-sans font-light px-4">
              Buy, sell, or swap delicious homemade meals with your neighbors. 
              <span className="text-foreground font-medium"> Support your community</span> while enjoying authentic home-cooked food.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/50 backdrop-blur-sm border border-primary/10 rounded-full px-3 sm:px-5 py-2 sm:py-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="font-sans font-medium text-foreground">Browse Local Meals</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/50 backdrop-blur-sm border border-primary/10 rounded-full px-3 sm:px-5 py-2 sm:py-3">
              <div className="w-2 h-2 bg-primary/70 rounded-full"></div>
              <span className="font-sans font-medium text-foreground">Allergen Information</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/50 backdrop-blur-sm border border-primary/10 rounded-full px-3 sm:px-5 py-2 sm:py-3">
              <div className="w-2 h-2 bg-primary/50 rounded-full"></div>
              <span className="font-sans font-medium text-foreground">Swap or Sell</span>
            </div>
          </div>
        </div>

        {/* Auth Form Section */}
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6 sm:mb-10 px-4">
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight mb-3 sm:mb-4 text-primary">Ready to Begin?</h2>
            <p className="text-sm sm:text-base text-muted-foreground font-sans">Join thousands sharing delicious homemade meals</p>
          </div>
          
          <Card className="shadow-xl border border-primary/10 bg-white/90 backdrop-blur-lg">
            <CardContent className="p-6 sm:p-10">
              <Tabs defaultValue="signup" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 h-12">
                  <TabsTrigger value="signup" className="cursor-pointer data-[state=active]:bg-white data-[state=active]:shadow-sm font-sans font-medium">Sign Up</TabsTrigger>
                  <TabsTrigger value="login" className="cursor-pointer data-[state=active]:bg-white data-[state=active]:shadow-sm font-sans font-medium">Login</TabsTrigger>
                </TabsList>

                {/* Signup Form */}                
                <TabsContent value="signup" className="space-y-5 mt-0">
                  <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="h-14 bg-white/70 border border-primary/20 shadow-sm font-sans placeholder:text-muted-foreground/70"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Create Password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="h-14 bg-white/70 border border-primary/20 shadow-sm font-sans placeholder:text-muted-foreground/70"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="h-14 bg-white/70 border border-primary/20 shadow-sm font-sans placeholder:text-muted-foreground/70"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-14 bg-white/70 border border-primary/20 shadow-sm font-sans placeholder:text-muted-foreground/70"
                        required
                      />
                    </div>
                    

                    {/* Location Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="h-14 bg-white/70 border border-primary/20 shadow-sm font-sans placeholder:text-muted-foreground/70"
                      />
                      <Input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-14 bg-white/70 border border-primary/20 shadow-sm font-sans placeholder:text-muted-foreground/70"
                      />
                      <Input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="h-14 bg-white/70 border border-primary/20 shadow-sm font-sans placeholder:text-muted-foreground/70"
                      />
                      <Input
                        type="text"
                        placeholder="Zip Code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="h-14 bg-white/70 border border-primary/20 shadow-sm font-sans placeholder:text-muted-foreground/70"
                      />
                    </div>

                    
                    <Button type="submit" className="cursor-pointer w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium text-base shadow-lg transition-all duration-200">
                      Create Account →
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="login" className="space-y-5 mt-0">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="h-14 bg-white/70 border border-primary/20 shadow-sm font-sans placeholder:text-muted-foreground/70"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="h-14 bg-white/70 border border-primary/20 shadow-sm font-sans placeholder:text-muted-foreground/70"
                        required
                      />
                    </div>
                    <Button type="submit" className="cursor-pointer w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium text-base shadow-lg transition-all duration-200">
                      Sign In →
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-8 pt-8 border-t border-primary/10">
                <p className="text-xs text-muted-foreground text-center font-sans">
                  By signing up, you agree to our terms and privacy policy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Food Imagery Section */}
        <div className="mt-16 sm:mt-24 md:mt-32 mb-20 sm:mb-32 md:mb-40">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="group relative overflow-hidden rounded-3xl aspect-[4/5] bg-gradient-to-br from-white to-secondary/30">
              <img
                src="https://images.unsplash.com/photo-1723588636244-e82f63cb01e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMHBhc3RhJTIwbWVhbHxlbnwxfHx8fDE3NTk5MzkxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Homemade pasta"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-serif text-lg font-semibold">Comfort Food</p>
                <p className="text-sm text-white/80 font-sans">Made with love</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-3xl aspect-[4/5] bg-gradient-to-br from-white to-secondary/30">
              <img
                src="https://images.unsplash.com/photo-1620416328738-dae3168e6890?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMHNvdXAlMjBib3dsfGVufDF8fHx8MTc1OTkzOTE1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Homemade soup"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-serif text-lg font-semibold">Soups & Stews</p>
                <p className="text-sm text-white/80 font-sans">Warm & hearty</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-3xl aspect-[4/5] bg-gradient-to-br from-white to-secondary/30">
              <img
                src="https://images.unsplash.com/photo-1459162314928-9fe3e6c6fc43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMHNhbGFkJTIwZnJlc2h8ZW58MXx8fHwxNzU5OTM5MTU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fresh homemade salad"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-serif text-lg font-semibold">Healthy Options</p>
                <p className="text-sm text-white/80 font-sans">Fresh & nutritious</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-3xl aspect-[4/5] bg-gradient-to-br from-white to-secondary/30">
              <img 
                src="https://images.unsplash.com/photo-1645453014403-4ad5170a386c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lbWFkZSUyMGJha2VkJTIwZGlzaHxlbnwxfHx8fDE3NTk5MzkxNTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Homemade baked dish"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-serif text-lg font-semibold">Baked Goods</p>
                <p className="text-sm text-white/80 font-sans">Fresh from the oven</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 sm:mt-16 md:mt-20 mb-16 sm:mb-24 md:mb-32">
          <div className="text-center mb-12 sm:mb-16 md:mb-20 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-semibold tracking-tight mb-4 sm:mb-6">
              Why Choose <span className="text-primary italic">Taste Buddiez</span>?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
              Connect with your community through the love of homemade food
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
            <div className="group text-center space-y-6 sm:space-y-8 p-6 sm:p-8 md:p-10 rounded-3xl bg-white/80 backdrop-blur-sm border border-primary/10 hover:bg-white/95 hover:border-primary/20 transition-all duration-500">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto transition-all duration-300" style={{ backgroundColor: 'var(--dusty-rose)', opacity: '0.75' }}>
                  <span className="text-3xl sm:text-4xl">🏘️</span>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xl sm:text-2xl font-serif font-semibold text-primary">Browse Local Meals</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">Discover delicious homemade meals available in your area based on your preferences</p>
              </div>
            </div>
            
            <div className="group text-center space-y-6 sm:space-y-8 p-6 sm:p-8 md:p-10 rounded-3xl bg-white/80 backdrop-blur-sm border border-primary/10 hover:bg-white/95 hover:border-primary/20 transition-all duration-500">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto transition-all duration-300" style={{ backgroundColor: 'var(--soft-taupe)', opacity: '0.75' }}>
                  <span className="text-3xl sm:text-4xl">🔄</span>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xl sm:text-2xl font-serif font-semibold" style={{ color: 'var(--deep-taupe)' }}>Swap or Sell</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">Share your homemade creations and swap meals with other cooks, or sell them to your neighbors</p>
              </div>
            </div>
            
            <div className="group text-center space-y-6 sm:space-y-8 p-6 sm:p-8 md:p-10 rounded-3xl bg-white/80 backdrop-blur-sm border border-primary/10 hover:bg-white/95 hover:border-primary/20 transition-all duration-500">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto transition-all duration-300" style={{ backgroundColor: 'var(--rich-rose)', opacity: '0.75' }}>
                  <span className="text-3xl sm:text-4xl">🏆</span>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xl sm:text-2xl font-serif font-semibold" style={{ color: 'var(--rich-rose)' }}>Earn Rewards</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">Get rated by your community and earn badges for your culinary excellence and reliability</p>
              </div>
            </div>
          </div>
        </div>


        {/* Success Stories Section */}
        <div className="mt-20 mb-32 px-4 text-center max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold tracking-tight mb-8">
            Success Stories
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 font-sans leading-relaxed">
            Hear from our amazing community members who have shared and enjoyed homemade meals.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
          {/* Story Card 1 */}
          <div className="bg-white/80 backdrop-blur-sm border border-primary/10 rounded-3xl p-6 sm:p-8 hover:bg-white/95 transition-all duration-500">
          <div className="flex items-center space-x-4 mb-4">
            <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" className="w-12 h-12 rounded-full object-cover"/>
            <div className="text-left">
              <h3 className="font-serif font-semibold text-primary text-lg">Angie R.</h3>
              <span className="text-xs sm:text-sm text-muted-foreground">Home Cook</span>
            </div>
          </div>
            <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
              "Taste Buddiez helped me sell my homemade meals to neighbors easily! I love being part of this community."
            </p>
          </div>

          {/* Story Card 2 */}
          <div className="bg-white/80 backdrop-blur-sm border border-primary/10 rounded-3xl p-6 sm:p-8 hover:bg-white/95 transition-all duration-500">
          <div className="flex items-center space-x-4 mb-4">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-12 h-12 rounded-full object-cover"/>
            <div className="text-left">
              <h3 className="font-serif font-semibold text-primary text-lg">Michael S.</h3>
              <span className="text-xs sm:text-sm text-muted-foreground">Meal Enthusiast</span>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
            "I discovered so many amazing meals nearby! The platform is user-friendly and trustworthy."
          </p>
          </div>

          {/* Story Card 3 */}
          <div className="bg-white/80 backdrop-blur-sm border border-primary/10 rounded-3xl p-6 sm:p-8 hover:bg-white/95 transition-all duration-500">
          <div className="flex items-center space-x-4 mb-4">
            <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="User" className="w-12 h-12 rounded-full object-cover"/>
            <div className="text-left">
              <h3 className="font-serif font-semibold text-primary text-lg">Sophia L.</h3>
              <span className="text-xs sm:text-sm text-muted-foreground">Home Chef</span>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
            "Selling my baked goods has never been easier! I’ve met wonderful neighbors and gained loyal customers."
          </p>
          </div>
          </div>
        </div>

        
        {/* Social Proof */}
        <div className="relative py-12 sm:py-16 md:py-20 border-t border-primary/10 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://www.dole.com/sites/default/files/media/featured-article-home-cooking-1338x460.jpeg"
              alt="Community cooking"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 text-center px-4">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-2xl bg-white/60 backdrop-blur-sm">
                <span className="text-3xl sm:text-4xl font-serif font-semibold text-primary">10K+</span>
                <span className="text-xs sm:text-sm font-sans tracking-wide uppercase text-muted-foreground">Home Cooks</span>
              </div>
              <div className="flex flex-col items-center space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-2xl bg-white/60 backdrop-blur-sm">
                <span className="text-3xl sm:text-4xl font-serif font-semibold" style={{ color: 'var(--deep-taupe)' }}>50K+</span>
                <span className="text-xs sm:text-sm font-sans tracking-wide uppercase text-muted-foreground">Meals Shared</span>
              </div>
              <div className="flex flex-col items-center space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-2xl bg-white/60 backdrop-blur-sm">
                <span className="text-3xl sm:text-4xl font-serif font-semibold" style={{ color: 'var(--rich-rose)' }}>4.8/5</span>
                <span className="text-xs sm:text-sm font-sans tracking-wide uppercase text-muted-foreground">Average Rating</span>
              </div>
            </div>
          </div>
  </div>

  {/* Partners & Collaborators Section */}
        <div className="mt-20 mb-32 px-4 text-center max-w-7xl mx-auto">
          <h2 className="text-primary text-3xl sm:text-4xl md:text-5xl font-serif font-semibold tracking-tight mb-8">
            Our Partners & Collaborators
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 font-sans leading-relaxed">
            We collaborate with trusted organizations to bring you the best homemade meals.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
            <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-primary/10 hover:bg-white/95 transition-all duration-300">
              <p className="text-sm sm:text-base font-sans text-muted-foreground">Madison Book</p>
            </div>
            <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-primary/10 hover:bg-white/95 transition-all duration-300">
              <p className="text-sm sm:text-base font-sans text-muted-foreground">Alice Guth</p>
            </div>
            <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-primary/10 hover:bg-white/95 transition-all duration-300">
              <p className="text-sm sm:text-base font-sans text-muted-foreground">Cynthia Espinoza-Arredondo</p>
            </div>
            <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-primary/10 hover:bg-white/95 transition-all duration-300">
              <p className="text-sm sm:text-base font-sans text-muted-foreground">Griffin Pitts</p>
            </div>
            <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-primary/10 hover:bg-white/95 transition-all duration-300">
              <p className="text-sm sm:text-base font-sans text-muted-foreground">Local Community Centers</p>
            </div>
            <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-primary/10 hover:bg-white/95 transition-all duration-300">
              <p className="text-sm sm:text-base font-sans text-muted-foreground">Local Neighborhoods</p>
            </div>
            <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-primary/10 hover:bg-white/95 transition-all duration-300">
              <p className="text-sm sm:text-base font-sans text-muted-foreground">Community Kitchens</p>
            </div>
            <div className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-primary/10 hover:bg-white/95 transition-all duration-300">
              <p className="text-sm sm:text-base font-sans text-muted-foreground">Neighborhood Associations</p>
            </div>
        </div>
        </div>


        {/* Support / Contact */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center">
            <p className="text-sm sm:text-base text-muted-foreground">
              Need help? Reach out to our support team at
              <a href="mailto:tbuddiez@yahoo.com" className="ml-2 text-primary underline">tbuddiez@yahoo.com</a>
            </p>
          </div>
        </div>

        {/* Footer / Copyright Section */}
        <footer className="bg-primary/10 backdrop-blur-sm border-t border-primary/20 py-6 mt-16">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left space-y-2 sm:space-y-0">
            <span className="text-sm sm:text-base text-muted-foreground">
              &copy; {new Date().getFullYear()} Taste Buddiez. Developed by Madison Book, Alice Guth, Cynthia Espinoza-Arredondo, & Griffin Pitts. All rights reserved.
            </span>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans">
              Licensed under the MIT License.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;