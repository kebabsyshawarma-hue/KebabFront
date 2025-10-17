import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CheckoutPage from './pages/checkout/CheckoutPage.jsx';
import RejectedPage from './pages/checkout/RejectedPage.jsx';
import SuccessPage from './pages/checkout/SuccessPage.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import HeroAdminPage from './pages/admin/HeroAdminPage.jsx';
import MenuAdminPage from './pages/admin/MenuAdminPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/checkout/rejected" element={<RejectedPage />} />
      <Route path="/checkout/success" element={<SuccessPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="menu" element={<MenuAdminPage />} />
        <Route path="hero" element={<HeroAdminPage />} />
      </Route>
    </Routes>
  );
}

export default App;