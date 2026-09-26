import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ContactProvider } from './context/ContactContext';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/layout/Footer';
import { AppRoutes } from './routes/AppRoutes';
import { analyticsService } from './services/analyticsService';

// Scroll to top component on route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Analytics tracker component (Tracks public website views only)
const AnalyticsTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    analyticsService.trackPageView(pathname);
  }, [pathname]);
  return null;
};

export const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 selection:bg-[#C8102E] selection:text-white font-sans">
        <ScrollToTop />
        <AnalyticsTracker />
        <AppRoutes />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 selection:bg-[#C8102E] selection:text-white">
      <ScrollToTop />
      <AnalyticsTracker />

      {/* Header Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main className="grow">
        <AppRoutes />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ContactProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ContactProvider>
    </AuthProvider>
  );
}

export default App;
