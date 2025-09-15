import React from 'react';
import { Helmet } from 'react-helmet-async';

function CookiePolicy() {
  return (
    <div className="page-content" style={{ padding: '1rem' }}>
      <Helmet>
        <title>Cookie Policy - 3D Figures Store</title>
        <meta name="description" content="Details about our use of cookies and your choices." />
      </Helmet>
      <h1>Cookie Policy</h1>
      <p>
        Cookies are small text files placed on your device. We categorize them as:
      </p>
      <ul>
        <li><b>Necessary</b>: Required for core site functionality (e.g., cart, checkout, security).</li>
        <li><b>Functional</b>: Remember preferences and enhance usability.</li>
        <li><b>Analytics</b>: Help us understand usage to improve the site.</li>
        <li><b>Marketing</b>: Personalize content and measure advertising.</li>
      </ul>
      <p>
        You can change or withdraw consent at any time via the Privacy Settings link in the footer or the cookie banner.
      </p>
      <p>
        Third-party services like payment providers may set cookies when used for checkout. These are necessary to complete transactions you initiate.
      </p>
    </div>
  );
}

export default CookiePolicy;

