// src/components/Footer.js

import React from 'react';
import { useConsent } from '../context/ConsentContext';
import '../styles/Footer.css';

function Footer() {
  const { openModal } = useConsent();
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} The Easter Egg</p>
      <div className="social-media">
        <a href="https://instagram.com/yourstudio" target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
        <a href="https://youtube.com/@yourstudio" target="_blank" rel="noopener noreferrer">
          YouTube
        </a>
        <a href="mailto:sales@yourbrand.com">
          Email
        </a>
      </div>
      <div className="legal-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/cookies">Cookie Policy</a>
        <button className="linklike" onClick={openModal} aria-label="Open privacy settings">Privacy Settings</button>
      </div>
    </footer>
  );
}

export default Footer;
