const express = require('express');
const pmgClient = require('../pmgClient');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  res.json({ username: req.session.pmgUsername });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username_and_password_required' });
  }

  try {
    const { pmgUsername, pmgTicket, pmgCsrfToken, ticketIssuedAt } = await pmgClient.login(
      username,
      password,
    );

    // Regenerate the session id on privilege change to avoid session fixation.
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ error: 'session_error' });
      }
      req.session.pmgUsername = pmgUsername;
      req.session.pmgTicket = pmgTicket;
      req.session.pmgCsrfToken = pmgCsrfToken;
      req.session.ticketIssuedAt = ticketIssuedAt;
      res.json({ username: pmgUsername });
    });
  } catch (err) {
    if (err instanceof pmgClient.PmgApiError && err.status === 401) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    // eslint-disable-next-line no-console
    console.error('[auth] PMG login failed:', err.message);
    res.status(502).json({ error: 'pmg_unreachable' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(204).end();
  });
});

module.exports = router;
