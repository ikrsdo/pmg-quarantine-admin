const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const config = require('./config');
const authRoutes = require('./routes/auth');
const quarantineRoutes = require('./routes/quarantine');
const trackingRoutes = require('./routes/tracking');

// Populated by the Docker build (frontend build output copied here - see
// Dockerfile). Absent in local dev, where Vite's own dev server is used
// instead (see frontend/vite.config.js proxy).
const STATIC_DIR = path.join(__dirname, '../public');

function createApp() {
  const app = express();

  // TEMP DEBUG - remove after diagnosing missing Set-Cookie on /api/login
  app.use((req, res, next) => {
    // eslint-disable-next-line no-console
    console.log('[debug] TOP incoming request:', req.method, req.originalUrl);
    next();
  });

  app.use(express.json());
  app.use(
    session({
      name: 'connect.sid',
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 4, // 4h - well above PMG's own ~2h ticket life
      },
    }),
  );

  // TEMP DEBUG - remove after diagnosing missing Set-Cookie on /api/login
  app.use((req, res, next) => {
    // eslint-disable-next-line no-console
    console.log('[debug] incoming request:', req.method, req.originalUrl);
    res.on('finish', () => {
      // eslint-disable-next-line no-console
      console.log('[debug] finished:', req.method, req.originalUrl, 'status=' + res.statusCode);
      if (req.path === '/api/login') {
        // eslint-disable-next-line no-console
        console.log('[debug] sessionID:', req.sessionID);
        // eslint-disable-next-line no-console
        console.log('[debug] session:', req.session);
        // eslint-disable-next-line no-console
        console.log('[debug] response headers:', res.getHeaders());
      }
    });
    next();
  });

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', authRoutes);
  app.use('/api/quarantine', quarantineRoutes);
  app.use('/api/tracking', trackingRoutes);

  if (fs.existsSync(STATIC_DIR)) {
    app.use(express.static(STATIC_DIR));
    // SPA fallback: any non-API GET route serves index.html, letting
    // react-router-dom handle the path client-side.
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(STATIC_DIR, 'index.html'));
    });
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error('[server] unhandled error:', err);
    res.status(500).json({ error: 'internal_error' });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[pmg-quarantine-admin] backend listening on :${config.port} (${config.nodeEnv})`);
  });
}

module.exports = createApp;
