# 3dFrontent

This repository contains a React frontend application located in the `3dFrontend/` directory. The project was bootstrapped with Create React App and provides the UI for interacting with a backend API.

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


The bulk of the source code (components, pages and services) lives inside the `3dFrontend/src` folder.

