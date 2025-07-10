const fs = require('fs');
const path = require('path');

// Basic script to generate sitemap.xml from the app's route definitions

const appFile = path.join(__dirname, '../src/App.js');
const appContent = fs.readFileSync(appFile, 'utf8');

// Regex to extract path="..." in <Route path="..." ...>
const routeRegex = /<Route\s+path="([^"]+)"/g;
const routes = [];
let match;
while ((match = routeRegex.exec(appContent)) !== null) {
  const route = match[1];
  if (!route.includes(':') && route !== '*') {
    routes.push(route);
  }
}

// Ensure unique routes
const uniqueRoutes = Array.from(new Set(routes));

const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
const urls = uniqueRoutes
  .map((r) => {
    const loc = r === '/' ? baseUrl : baseUrl + r;
    return `  <url><loc>${loc}</loc></url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

const outPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(outPath, xml);
console.log(`Generated sitemap with ${uniqueRoutes.length} routes at ${outPath}`);
