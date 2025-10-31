import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'
import SiteHeader from './site/Header';
import SiteFooter from './site/Footer';
import Index from './pages/Index'
import Login from './pages/Login'
import Drivers from './pages/Drivers'
import { Routes, Route } from 'react-router-dom';
function App() {
  return (
           <div className="flex min-h-screen flex-col">
           <SiteHeader />
             <main className="flex-1">
               <Routes>
                 <Route path="/" element={<Index />} />
                 <Route path="/login" element={<Login />} />
                 <Route path="/driver" element={<Drivers />} />
               </Routes>
             </main>
             <SiteFooter />
           </div>
  );
}

export default App;


