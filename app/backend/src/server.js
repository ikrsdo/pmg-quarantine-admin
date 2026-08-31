const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const authRoutes = require('./routes/auth');
const quarantineRoutes = require('./routes/quarantine');
const trackingRoutes = require('./routes/tracking');

// CSP is left off: the frontend relies on inline `style` attributes (e.g.
// the iOS backdrop-blur compositing fix, the login page's gradient) that a
// default CSP's style-src would block. Helmet's other headers (X-Frame-
// Options, X-Content-Type-Options, Referrer-Policy, etc.) and disabling
// X-Powered-By still apply.
const helmetMiddleware = helmet({ contentSecurityPolicy: false });

// Login is the one endpoint an attacker can hit without already holding a
// session - throttle it against PMG credential brute-forcing. Generous
// enough not to lock out a genuine admin mistyping their password a few
// times.
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_attempts' },
});

// Populated by the Docker build (frontend build output copied here - see
// Dockerfile). Absent in local dev, where Vite's own dev server is used
// instead (see frontend/vite.config.js proxy).
const STATIC_DIR = path.join(__dirname, '../public');

function createApp() {
  const app = express();

  // Behind a reverse proxy / tunnel (Cloudflare Tunnel, nginx, etc.) that
  // terminates TLS, the connection this process sees is plain HTTP. Without
  // trust proxy, Express ignores X-Forwarded-Proto, req.secure stays false,
  // and express-session silently refuses to set a secure cookie (cookie.secure
  // requires issecure(req) to be true). This must stay set for cookie.secure
  // to work in production.
  app.set('trust proxy', 1);

  app.use(helmetMiddleware);
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

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/login', loginRateLimit);
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
