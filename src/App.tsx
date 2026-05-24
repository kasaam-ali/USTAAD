/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import WorkerDetail from './pages/WorkerDetail';
import HowItWorks from './pages/HowItWorks';
import NearMe from './pages/NearMe';
import Auth from './pages/Auth';
import ChatBot from './components/ChatBot';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import WorkerDashboard from './pages/WorkerDashboard';
import BottomNav from './components/BottomNav';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'worker' ? '/worker-dashboard' : '/home'} replace />;
  }

  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { isAuthenticated, role } = useAuth();
  
  if (!isAuthenticated) return <Home />;
  
  if (role === 'worker') return <Navigate to="/worker-dashboard" replace />;
  return <Navigate to="/home" replace />;
}

import BookingDetail from './pages/BookingDetail';
import Profile from './pages/Profile';
import GenericList from './pages/GenericList';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RoleBasedRedirect />
            </motion.div>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Home />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker-dashboard"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <WorkerDashboard />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GenericList title="Mere Kaam" />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker-bookings"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GenericList title="Mili Hui Bookings" />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/earnings"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GenericList title="Kamai (Earnings)" />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GenericList title="Ustaad Reviews" />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BookingDetail />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Profile />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <Search />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <Search />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/:id"
          element={
            <ProtectedRoute>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <WorkerDetail />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HowItWorks />
            </motion.div>
          }
        />
        <Route
          path="/near-me"
          element={
            <ProtectedRoute>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <NearMe />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Auth />
            </motion.div>
          }
        />
        <Route
          path="*"
          element={
            <div className="pt-32 text-center text-2xl font-bold uppercase tracking-widest text-primary h-screen bg-background-soft">
              Feature Coming Soon
              <br />
              <Link to="/" className="text-sm underline mt-4 block">Go Back Home</Link>
            </div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}


function AppContent() {
  const location = useLocation();
  const { role } = useAuth();
  const isAuthPage = location.pathname === '/auth';
  const isWorker = role === 'worker';

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden font-sans scroll-smooth">
      {/* Background Orbs */}
      <div className="fixed top-[-100px] left-[-100px] w-[600px] h-[600px] bg-primary/40 rounded-full blur-[100px] z-0 animate-orb pointer-events-none opacity-60" />
      <div className="fixed top-[20%] right-[-150px] w-[500px] h-[500px] bg-accent/30 rounded-full blur-[100px] z-0 animate-orb pointer-events-none opacity-40 [animation-delay:2s]" />
      <div className="fixed bottom-[-150px] left-[20%] w-[700px] h-[500px] bg-primary-dark/50 rounded-full blur-[120px] z-0 animate-orb pointer-events-none opacity-50 [animation-delay:4s]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {!isAuthPage && <Navbar />}
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        {!isAuthPage && <BottomNav />}
        {!isAuthPage && <Footer />}
        {!isAuthPage && !isWorker && <ChatBot />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Toaster position="top-center" toastOptions={{
          style: {
            borderRadius: '1rem',
            background: '#333',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
          },
        }} />
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}



