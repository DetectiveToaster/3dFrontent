import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPage.css';
import { useLanguage } from '../context/LanguageContext';

function RegisterPage() {
  const { register } = useAuth();
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
      await register(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(t('registrationFailed'));
    }
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Register - 3D Figures Store</title>
        <meta name="description" content="Create an account to purchase 3D figures." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h2>{t('register')}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          {t('email')}:
          <input name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          {t('password')}:
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit">{t('register')}</button>
        {error && <div className="error">{error}</div>}
      </form>
      <p>
        {t('alreadyHaveAccount')} <Link to="/login">{t('login')}</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
