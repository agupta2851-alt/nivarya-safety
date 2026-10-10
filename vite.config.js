import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const devTrackingSessions = new Map();

function devTrackingApiPlugin() {
  return {
    name: 'dev-tracking-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/api/track')) {
          const match = url.match(/^\/api\/track(?:\/([^/?#]+))?/i);
          const trackingId = match && match[1] ? decodeURIComponent(match[1]) : null;

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }

          if (req.method === 'GET') {
            if (!trackingId) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing tracking ID' }));
              return;
            }
            const session = devTrackingSessions.get(trackingId);
            if (session) {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, session }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Session not found' }));
            }
            return;
          }

          if (req.method === 'POST') {
            if (!trackingId) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing tracking ID' }));
              return;
            }
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const existing = devTrackingSessions.get(trackingId) || {};
                const updated = { ...existing, ...data, trackingId, updatedAt: new Date().toISOString() };
                devTrackingSessions.set(trackingId, updated);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, session: updated }));
              } catch (e) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }

          if (req.method === 'DELETE') {
            if (!trackingId) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing tracking ID' }));
              return;
            }
            const existing = devTrackingSessions.get(trackingId);
            if (existing) {
              existing.isActive = false;
              existing.status = 'ARRIVED';
              existing.endedAt = new Date().toISOString();
              devTrackingSessions.set(trackingId, existing);
            }
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
            return;
          }
        }
        next();
      });
    }
  };
}

const basePath = process.env.GITHUB_PAGES ? '/nivarya-safety/' : '/';

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    devTrackingApiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons.svg', 'shield.svg', 'offline.html'],
      manifest: {
        name: 'NIVARYA | Move Without Fear — Women Safety Platform',
        short_name: 'Nivarya',
        description: 'Proactive women safety platform offering Safe Journey tracking, Emergency SOS, trusted contacts, and offline emergency protocols.',
        theme_color: '#0B1120',
        background_color: '#0B1120',
        display: 'standalone',
        orientation: 'portrait',
        start_url: basePath,
        scope: basePath,
        icons: [
          {
            src: 'shield.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'favicon.svg',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: `${basePath}index.html`,
        navigateFallbackDenylist: [/^\/api\//, /^\/supabase\//],
        runtimeCaching: [
          {
            // Cache Google Fonts stylesheets with StaleWhileRevalidate
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Google Fonts webfont files with CacheFirst
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Leaflet CDN styles
            urlPattern: /^https:\/\/unpkg\.com\/leaflet.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'leaflet-cdn-assets',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Never cache internal /api/ endpoints (e.g. tracking / telemetry)
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkOnly'
          },
          {
            // Never cache Supabase database / auth endpoints
            urlPattern: /.*supabase\.co\/.*/i,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
})


