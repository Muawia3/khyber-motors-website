import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { HomePage } from '../pages/Home';
import { VehiclesPage } from '../pages/Vehicles';
import { VehicleDetailsPage } from '../pages/VehicleDetails';
import { ServicesPage } from '../pages/Services';
import { AboutPage } from '../pages/About';
import { ContactPage } from '../pages/Contact';
import { ProfilesPage } from '../pages/Profiles';


// Admin layout & core pages
import { AdminLogin } from '../pages/Admin/AdminLogin';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../pages/Admin/AdminDashboard';
import { AdminLeads } from '../pages/Admin/AdminLeads';
import { AdminCustomers } from '../pages/Admin/AdminCustomers';
import { AdminServices } from '../pages/Admin/AdminServices';
import { AdminSales } from '../pages/Admin/AdminSales';
import { AdminReports } from '../pages/Admin/AdminReports';
import { AdminSettings } from '../pages/Admin/AdminSettings';
import { AdminVisitors } from '../pages/Admin/AdminVisitors';

// Vehicle CMS suite
import { VehicleList } from '../pages/Admin/Vehicles/VehicleList';
import { PassengersList } from '../pages/Admin/Vehicles/PassengersList';
import { HeavyTrucksList } from '../pages/Admin/Vehicles/HeavyTrucksList';
import { LightTrucksList } from '../pages/Admin/Vehicles/LightTrucksList';
import { VehicleEdit } from '../pages/Admin/Vehicles/VehicleEdit';
import { VehiclePreview } from '../pages/Admin/Vehicles/VehiclePreview';

// Content CMS pages
import { HomepageCMS } from '../pages/Admin/Content/HomepageCMS';
import { ServicesCMS } from '../pages/Admin/Content/ServicesCMS';
import { AboutCMS } from '../pages/Admin/Content/AboutCMS';
import { ContactCMS } from '../pages/Admin/Content/ContactCMS';
import { HeroImagesCMS } from '../pages/Admin/Content/HeroImagesCMS';
import { SocialMediaCMS } from '../pages/Admin/Content/SocialMediaCMS';
import { AdminReviews } from '../pages/Admin/Content/AdminReviews';
import { TeamCMS } from '../pages/Admin/Content/TeamCMS';

const ProtectedRoute = ({ children }) => {

  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#C8102E] border-t-transparent"></div>
          <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  // Auto-logout when user leaves /admin routes to ensure sign-in is required every time
  useEffect(() => {
    if (isAuthenticated && !location.pathname.startsWith('/admin')) {
      logout();
    }
  }, [location.pathname, isAuthenticated, logout]);
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      
      {/* Specific Vehicle Alias Routes */}
      <Route path="/vehicles/t9" element={<VehicleDetailsPage />} />
      <Route path="/vehicles/trucks" element={<VehicleDetailsPage />} />
      <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />

      <Route path="/services" element={<ServicesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/profiles" element={<ProfilesPage />} />


      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin CRM & CMS Protected Routes */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      
      {/* Vehicle CMS */}
      <Route path="/admin/vehicles" element={<ProtectedRoute><AdminLayout><VehicleList /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/vehicles/passengers" element={<ProtectedRoute><AdminLayout><PassengersList /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/vehicles/trucks/heavy" element={<ProtectedRoute><AdminLayout><HeavyTrucksList /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/vehicles/trucks/light" element={<ProtectedRoute><AdminLayout><LightTrucksList /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/vehicles/new" element={<ProtectedRoute><AdminLayout><VehicleEdit /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/vehicles/:id/edit" element={<ProtectedRoute><AdminLayout><VehicleEdit /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/vehicles/:id/preview" element={<ProtectedRoute><VehiclePreview /></ProtectedRoute>} />

      {/* Content CMS */}
      <Route path="/admin/content/homepage" element={<ProtectedRoute><AdminLayout><HomepageCMS /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content/homepage/hero-images" element={<ProtectedRoute><AdminLayout><HeroImagesCMS /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content/hero-images" element={<ProtectedRoute><AdminLayout><HeroImagesCMS /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content/social-media" element={<ProtectedRoute><AdminLayout><SocialMediaCMS /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content/social-links" element={<ProtectedRoute><AdminLayout><SocialMediaCMS /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content/reviews" element={<ProtectedRoute><AdminLayout><AdminReviews /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content/services" element={<ProtectedRoute><AdminLayout><ServicesCMS /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content/about" element={<ProtectedRoute><AdminLayout><AboutCMS /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content/contact" element={<ProtectedRoute><AdminLayout><ContactCMS /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content/team" element={<ProtectedRoute><AdminLayout><TeamCMS /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content/profiles" element={<ProtectedRoute><AdminLayout><TeamCMS /></AdminLayout></ProtectedRoute>} />


      {/* Sales & Operations */}
      <Route path="/admin/leads" element={<ProtectedRoute><AdminLayout><AdminLeads /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute><AdminLayout><AdminCustomers /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute><AdminLayout><AdminServices /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/operations/services" element={<ProtectedRoute><AdminLayout><AdminServices /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/sales" element={<ProtectedRoute><AdminLayout><AdminSales /></AdminLayout></ProtectedRoute>} />
      
      {/* Analytics & System */}
      <Route path="/admin/visitors" element={<ProtectedRoute><AdminLayout><AdminVisitors /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><AdminLayout><AdminReports /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
