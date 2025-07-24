# 3dFrontent

This repository contains a React based storefront located in the `3dFrontend/` directory. The app was bootstrapped with Create React App and provides a user interface for browsing and purchasing 3D printed models from a backend API.

## Features

- Interactive 3D model previews built with **@react-three/fiber**
- Shopping cart and checkout flow with **PayPal** integration
- Persistent caching of images and models in IndexedDB
- Light and dark theme toggle
- Simple authentication and user registration
- Script for generating `sitemap.xml`


## Repository Structure

- `3dFrontend/` - React application
- `3dFrontend/src/` - application source (components, pages, services)
- `3dFrontend/scripts/` - utility scripts such as `generate-sitemap.js`

## Getting Started

1. **Install dependencies**
   ```bash
   cd 3dFrontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```
   This will run the app in development mode at [http://localhost:3000](http://localhost:3000).
   Using `npm start` (or any web server) is required so React Router can
   handle direct links such as `/products` or `/new-arrivals`. Opening
   `public/index.html` directly in the browser may bypass the router and cause
   these links to break.

3. **Configure the API URL**
   The application expects a backend API. Update the `API_BASE_URL` constant in `src/Services/api.js` if your backend runs on a different address:
   ```javascript
   // 3dFrontend/src/Services/api.js
   const API_BASE_URL = 'http://localhost:8000';

   The frontend reads `REACT_APP_API_URL` to determine the base URL for API
requests. You can set this variable in a `.env` file or in your environment.
If omitted, it defaults to `http://localhost:8000`.
   ```

4. **PayPal Client ID**
   Set `REACT_APP_PAYPAL_CLIENT_ID` in your environment with your PayPal client
   ID. The PayPal integration falls back to the sandbox `test` ID if this
   variable is not provided.

