import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useThemeStore, themePalettes } from './store/themeStore';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantPage from './pages/RestaurantPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OwnerMenuPage from './pages/OwnerMenuPage';
import OwnerRestaurantsPage from './pages/OwnerRestaurantsPage';
import OwnerSettingsPage from './pages/OwnerSettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import Navbar from './components/layout/Navbar';
import { Toaster } from 'sonner';

function App() {
  const { color } = useThemeStore();

  useEffect(() => {
    const palette = themePalettes[color];
    document.documentElement.style.setProperty('--primary', palette.primary);
    document.documentElement.style.setProperty('--accent', palette.accent);
  }, [color]);

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors closeButton />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <Navbar />
            <LandingPage />
          </>
        } />
        <Route path="/restaurants" element={
          <>
            <Navbar />
            <HomePage />
          </>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/restaurant/:id" element={
          <>
            <Navbar />
            <RestaurantPage />
          </>
        } />

        {/* Protected Routes - Customer */}
        <Route path="/checkout" element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['CUSTOMER']}>
              <Navbar />
              <CheckoutPage />
            </RoleGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['CUSTOMER']}>
              <Navbar />
              <OrderHistoryPage />
            </RoleGuard>
          </ProtectedRoute>
        } />

        {/* Protected Routes - Owner */}
        <Route path="/owner/dashboard" element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['RESTAURANT_OWNER']}>
              <Navbar />
              <OwnerDashboardPage />
            </RoleGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/owner/restaurants" element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['RESTAURANT_OWNER']}>
              <Navbar />
              <OwnerRestaurantsPage />
            </RoleGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/owner/menu" element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['RESTAURANT_OWNER']}>
              <Navbar />
              <OwnerMenuPage />
            </RoleGuard>
          </ProtectedRoute>
        } />

        <Route path="/owner/settings" element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['RESTAURANT_OWNER']}>
              <OwnerSettingsPage />
            </RoleGuard>
          </ProtectedRoute>
        } />

        {/* Catch-all - 404 */}
        <Route path="*" element={
          <>
            <Navbar />
            <NotFoundPage />
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
