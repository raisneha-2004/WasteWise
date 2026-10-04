import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext.jsx';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import BottomNav from './components/BottomNav.jsx';
import VoiceAssistant from './components/VoiceAssistant.jsx';
import PageTransition from './components/PageTransition.jsx';

import Home from './pages/Home.jsx';
import Scan from './pages/Scan.jsx';
import Centers from './pages/Centers.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/scan" element={<PageTransition><Scan /></PageTransition>} />
        <Route path="/centers" element={<PageTransition><Centers /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/history" element={<PageTransition><History /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col relative selection:bg-eco-500 selection:text-white">
          {/* Persistent Top Navigation Bar */}
          <Navbar />

          {/* Main Application Animated Routes */}
          <main className="flex-1">
            <AnimatedRoutes />
          </main>

          {/* Persistent Comprehensive Footer */}
          <Footer />

          {/* Floating Voice Assistant (Available across all pages) */}
          <VoiceAssistant />

          {/* Mobile Sticky Bottom Navigation */}
          <BottomNav />

          {/* Toast Notification Container */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#162329',
                color: '#f3f4f6',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                fontSize: '0.875rem'
              }
            }}
          />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

