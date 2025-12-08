# 3dFrontent

This repository contains a React based storefront located in the `3dFrontend/` directory. The app was bootstrapped with Create React App and provides a user interface for browsing and purchasing 3D printed models from a backend API.

## Features

- Interactive 3D model previews built with **@react-three/fiber**
- Shopping cart and checkout flow with **PayPal** integration
- Persistent caching of images and models in IndexedDB
- Light and dark theme toggle
- Simple authentication and user registration
- Script for generating `sitemap.xml`



## Technology Overview

### Core Frontend Stack
- **React 18** application bootstrapped with Create React App (CRA).
- Client-side routing via **React Router** (see `src/App.js`) with a default storefront layout and an experimental Tailwind showcase mounted at `/new`.
- Page metadata handled through **react-helmet-async**.
- Toast notifications provided by **react-toastify**.

### Styling & Design System
- Legacy global styling lives under `src/styles/*.css` and continues to support the storefront.
- **Tailwind CSS 3** (configured in `tailwind.config.js` with PostCSS/Autoprefixer) powers the new showcase experience (`src/ShowcaseApp.jsx`). Tailwind directives are injected in `src/index.css`, which also locks `html, body, #root` to full height.
- Theme variables (light/dark palettes) are defined in `src/theme.css` and toggled at runtime by `src/context/ThemeContext.js`.
- Iconography uses **lucide-react**.

### State, Data & Context
- Global providers registered in `src/index.js` supply app-wide state:
  - `ThemeProvider` (light/dark mode)
  - `LanguageProvider` (basic i18n strings)
  - `AuthProvider` (session/auth handling)
  - `CartProvider` (cart persistence and actions)
  - `ConsentProvider` (cookie/consent banner logic)
- REST communication is wrapped in `src/Services/api.js` with product helpers in `src/Services/products.js` and media caching via IndexedDB inside `src/Services/mediaCache.js`.

### 3D & Media
- Product previews rely on **@react-three/fiber** / Three.js through `src/Components/ThreeDViewer.js` with accompanying styling in `src/styles/ThreeDViewer.css`.
- Admin tooling (`src/Pages/AdminDashboard.js`) manages product CRUD, pricing, visibility, and media uploads.

### Payments, Auth & Utilities
- Checkout integrates the PayPal SDK on demand (`src/Pages/CheckoutPage.js`), using the `REACT_APP_PAYPAL_CLIENT_ID` environment variable.
- Authentication helpers live in `src/context/AuthContext.js` and `src/utils/authz.js`.
- Ancillary scripts (e.g., `scripts/generate-sitemap.js`) support build and deployment tasks.

### Build & Tooling
- Tailwind/PostCSS pipelines are configured via committed `tailwind.config.js` and `postcss.config.js` files.
- CRA provides the build toolchain (`npm start`, `npm run build`, `npm test`). ESLint warnings currently flag placeholder links (`href="#"`) and hook dependencies—address these prior to production.

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

## Backend and environment notes

- The backend now seeds an admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Set these in your backend environment so the dashboard at `/admin` has credentials.
- Define `SECRET_KEY` in the backend environment to remove startup warnings.
- Order creation endpoints expect `currency` and `shipping` fields in both `/orders/` and `/guest_orders/` payloads. Guest line items can include `unit_price` and `currency` to lock in pricing; otherwise the backend will price with live product data.
- If you need custom order numbers, pass `order_number` in the payload; the backend will auto-generate one when it is omitted.

## Arch Linux tips

- Node 18+ is recommended; install via `nvm` or your package manager (`sudo pacman -S nodejs npm`).
- No Windows-specific paths are used; the project is case-sensitive-friendly and runs with the standard CRA scripts (`npm start`, `npm test`, `npm run build`).
- If you see missing OpenGL/WebGL support when previewing 3D models, ensure GPU drivers are installed (e.g., `mesa` and your vendor driver packages).

## Showcase-only mode

`src/config/showcase.js` sets `SHOWCASE_MODE = true` to disable pricing/cart/checkout and route inquiries to `theeastereggstore@gmail.com`. In this mode product cards/details hide prices and checkout/cart pages display contact instructions instead of payment flows.

