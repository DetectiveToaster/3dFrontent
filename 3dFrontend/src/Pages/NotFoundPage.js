import React from 'react';
import { Helmet } from 'react-helmet-async';

function NotFoundPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <Helmet>
        <title>404 - Page Not Found - 3D Figures Store</title>
        <meta name="description" content="The page you are looking for does not exist." />
      </Helmet>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
}

export default NotFoundPage;
