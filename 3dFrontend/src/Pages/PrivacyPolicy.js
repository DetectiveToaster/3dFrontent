import React from 'react';
import { Helmet } from 'react-helmet-async';

function PrivacyPolicy() {
  return (
    <div className="page-content" style={{ padding: '1rem' }}>
      <Helmet>
        <title>Privacy Policy - 3D Figures Store</title>
        <meta name="description" content="Learn how we collect, use, and protect your data." />
      </Helmet>
      <h1>Privacy Policy</h1>
      <p>
        We respect your privacy. This policy explains what data we collect, how we use it,
        and the choices you have.
      </p>
      <h3>What we collect</h3>
      <p>
        - Account data you provide (e.g., email, address).{"\n"}
        - Order and payment-related details to fulfill purchases.{"\n"}
        - Technical data (e.g., device, IP) for security and performance.{"\n"}
      </p>
      <h3>How we use data</h3>
      <p>
        To provide and improve our services, fulfill orders, support, and meet legal obligations.
      </p>
      <h3>Cookies and similar technologies</h3>
      <p>
        We use necessary cookies for core functionality (e.g., cart, checkout). With your consent,
        we may use functional, analytics, and marketing cookies. You can manage preferences at any time
        via the Privacy Settings in the footer.
      </p>
      <h3>Your rights</h3>
      <p>
        Depending on your region, you may have rights to access, correct, delete, or export your data.
        Contact us to exercise these rights.
      </p>
      <h3>Contact</h3>
      <p>
        Email: privacy@3d-figures.example
      </p>
    </div>
  );
}

export default PrivacyPolicy;

