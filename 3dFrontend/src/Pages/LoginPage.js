import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPage.css';
import { useLanguage } from '../context/LanguageContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(t('loginFailed'));
    }
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Login - 3D Figures Store</title>
        <meta name="description" content="Access your account to manage orders and purchases." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h2>{t('login')}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          {t('email')}:
          <input name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          {t('password')}:
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit">{t('login')}</button>
        {error && <div className="error">{error}</div>}
      </form>
      <p>
        {t('dontHaveAccount')} <Link to="/register">{t('register')}</Link>
      </p>
    </div>
  );
}

export default LoginPage;
