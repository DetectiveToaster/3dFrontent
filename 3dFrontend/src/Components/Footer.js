// src/components/Footer.js

import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} The Easter Egg</p>
      <div className="social-media">
        <a href="#" target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Twitter
        </a>
      </div>
    </footer>
  );
}

export default Footer;
