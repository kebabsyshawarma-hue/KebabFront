import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CheckoutPage from './pages/checkout/CheckoutPage.jsx';
import RejectedPage from './pages/checkout/RejectedPage.jsx';
import SuccessPage from './pages/checkout/SuccessPage.jsx';
import ResultPage from './pages/checkout/ResultPage.jsx'; // Import ResultPage
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import HeroAdminPage from './pages/admin/HeroAdminPage.jsx';
import MenuAdminPage from './pages/admin/MenuAdminPage.jsx';
import LoginPage from './pages/admin/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/rejected" element={<RejectedPage />} />
        <Route path="/checkout/success" element={<SuccessPage />} />
        <Route path="/checkout/result" element={<ResultPage />} /> {/* Add ResultPage route */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly={true} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="menu" element={<MenuAdminPage />} />
            <Route path="hero" element={<HeroAdminPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;