import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// PayPal provider moved to Checkout page to avoid site-wide script loading
import LandingPage from './Pages/LandingPage';
import ProductListPage from './Pages/ProductListPage';
import ProductDetailPage from './Pages/ProductDetailPage';
import CartPage from './Pages/CartPage';
import CheckoutPage from './Pages/CheckoutPage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import NotFoundPage from './Pages/NotFoundPage';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import CookiePolicy from './Pages/CookiePolicy';
import AdminDashboard from './Pages/AdminDashboard';
import RequireAdmin from './Components/RequireAdmin';
import Header from './Components/Header';
import Footer from './Components/Footer';
import CategorySidebar from './Components/CategorySidebar';
import './styles/AppLayout.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConsentBanner from './Components/ConsentBanner';
import ConsentModal from './Components/ConsentModal';

function App() {
  return (
    <Router>
      <Header />
        <div className="app-container">
          <CategorySidebar />
          <main id="main-content" role="main">
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      <Footer />
      <ToastContainer />
      <ConsentBanner />
      <ConsentModal />
    </Router>

  );
}

export default App;
