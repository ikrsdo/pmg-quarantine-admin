const path = require('path');

// Local dev convenience: repo root .env (one level above app/backend/..).
// In production the container gets env vars via docker-compose env_file,
// so a missing file here is not an error.
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
} catch {
  // dotenv is not a dependency in production images; ignore if absent.
}

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  sessionSecret: required('SESSION_SECRET'),
  pmg: {
    baseUrl: required('PMG_BASE_URL').replace(/\/$/, ''),
    apiPath: process.env.PMG_API_PATH || '/api2/json',
    allowSelfSigned: /^true$/i.test(process.env.PMG_ALLOW_SELF_SIGNED || 'false'),
  },
};

if (config.nodeEnv === 'production' && config.sessionSecret === 'change-me-to-a-long-random-string') {
  throw new Error('SESSION_SECRET must be changed from its placeholder value in production.');
}

if (config.pmg.allowSelfSigned) {
  // Intentional, documented in .env.example / CLAUDE.md - PMG appliances
  // commonly run self-signed certs on internal networks.
  // eslint-disable-next-line no-console
  console.warn('[pmg-quarantine-admin] PMG_ALLOW_SELF_SIGNED=true - TLS certificate validation to PMG is DISABLED.');
}

module.exports = config;
