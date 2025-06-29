import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import LandingPage from './Pages/LandingPage';
import ProductListPage from './Pages/ProductListPage';
import ProductDetailPage from './Pages/ProductDetailPage';
import CartPage from './Pages/CartPage';
import CheckoutPage from './Pages/CheckoutPage';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import NotFoundPage from './Pages/NotFoundPage';
import Header from './Components/Header';
import Footer from './Components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test';


function App() {
  return (
    <PayPalScriptProvider options={{ "client-id": paypalClientId }}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
        <ToastContainer />
      </Router>
    </PayPalScriptProvider>

  );
}

export default App;
