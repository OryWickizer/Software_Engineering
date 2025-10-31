import { useState } from 'react'
import './index.css'
import SiteHeader from './site/Header';
import SiteFooter from './site/Footer';
import Index from './pages/Index'
import Profile from './pages/Profile'
import Login from './pages/login'
import { Routes, Route } from 'react-router-dom';
function App() {
  return (
           <div className="flex min-h-screen flex-col">
           <SiteHeader />
             <main className="flex-1">
               <Routes>
                 <Route path="/" element={<Index />} />
                 <Route path="/login" element={<Login />} />
                 <Route path="/profile" element={<Profile />} />
               </Routes>
             </main>
             <SiteFooter />
           </div>
  );
}

export default App;


