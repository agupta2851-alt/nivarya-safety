import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devTrackingApiPlugin()],
})

