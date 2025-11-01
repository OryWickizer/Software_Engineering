import { useState } from 'react'
import './index.css'
import SiteHeader from './site/Header';
import SiteFooter from './site/Footer';
import Index from './pages/Index'
import Profile from './pages/Profile'
import Login from './pages/login'
import Drivers from './drivers/Drivers'
import { Routes, Route } from 'react-router-dom';
import Customer from './customers/Customer';
import Restaurant from './restaurants/Restaurants';
import MenuItems from './restaurants/MenuItems';
import CustomerOrders from './restaurants/CustomerOrders';
import About from './pages/About';
function App() {
  return (
           <div className="flex min-h-screen flex-col">
           <SiteHeader />
             <main className="flex-1">
               <Routes>
                 <Route path="/" element={<Index />} />
                 <Route path="/login" element={<Login />} />
                 <Route path="/profile" element={<Profile />} />
                 <Route path="/driver" element={<Drivers />} />
                  <Route path="/customer" element={<Customer />} />
                  <Route path="/restaurants" element={<Restaurant />} />
                   <Route path="/restaurants/menu" element={<MenuItems />} />
                   <Route path="/restaurants/orders" element={<CustomerOrders />} />
                 <Route path="/about" element={<About />} />
               </Routes>
             </main>
             <SiteFooter />
           </div>
  );
}

export default App;


