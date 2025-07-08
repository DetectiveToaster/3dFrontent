import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaShoppingBag, FaStar, FaLayerGroup, FaInfoCircle, FaEnvelope } from 'react-icons/fa';
import '../styles/SideNav.css';

function SideNav() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 769) {
      setOpen(false);
    }
  }, []);

  const toggleOpen = () => setOpen(!open);
  const closeMenu = () => {
    if (window.innerWidth < 769) {
      setOpen(false);
    }
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleOpen} aria-label="Toggle navigation">
        {open ? <FaTimes /> : <FaBars />}
      </button>
      <nav className={`side-nav ${open ? 'open' : ''}`}>
        <ul>
          <li><Link to="/" onClick={closeMenu}><FaHome /><span>Home</span></Link></li>
          <li><Link to="/products" onClick={closeMenu}><FaShoppingBag /><span>Products</span></Link></li>
          <li><Link to="/new-arrivals" onClick={closeMenu}><FaStar /><span>New Arrivals</span></Link></li>
          <li><Link to="/collections" onClick={closeMenu}><FaLayerGroup /><span>Collections</span></Link></li>
          <li><Link to="/about" onClick={closeMenu}><FaInfoCircle /><span>About</span></Link></li>
          <li><Link to="/contact" onClick={closeMenu}><FaEnvelope /><span>Contact</span></Link></li>
        </ul>
      </nav>
    </>
  );
}

export default SideNav;
