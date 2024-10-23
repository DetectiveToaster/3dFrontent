// src/pages/LandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="hero">
        <h1>Welcome to Our 3D Figures Store</h1>
        <p>Discover our collection of amazing 3D printed figures.</p>
        <Link to="/products" className="cta-button">
          Shop Now
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
