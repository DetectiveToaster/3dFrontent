// src/pages/LandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import ThreeDViewer from '../Components/ThreeDViewer';
import '../styles/LandingPage.css';

function LandingPage() {
  const modelUrl =
    "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
  return (
    <div className="landing-page">
      <div className="hero">
        <h1>Welcome to Our 3D Figures Store</h1>
        <p>Discover our collection of amazing 3D printed figures.</p>
        <Link to="/products" className="cta-button">
          Shop Now
        </Link>
      </div>
      <section className="featured-model">
        <h2>Featured 3D Models</h2>
        <div className="showcases">
          <ThreeDViewer
            modelUrl={modelUrl}
            style={{ maxWidth: "400px", height: "333px" }}
          />
          <ThreeDViewer
            modelUrl={modelUrl}
            style={{ maxWidth: "400px", height: "333px" }}
          />
          <ThreeDViewer
            modelUrl={modelUrl}
            style={{ maxWidth: "400px", height: "333px" }}
          />
        </div>
        <p>Experience our latest creation from every angle.</p>
        <Link to="/products" className="cta-button">
          Explore Models
        </Link>
      </section>
    </div>
  );
}

export default LandingPage;
