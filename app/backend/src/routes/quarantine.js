const express = require('express');
const pmgClient = require('../pmgClient');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();
router.use(requireAuth);

function handlePmgError(err, res) {
  if (err instanceof pmgClient.PmgApiError) {
    if (err.status === 401) {
      return res.status(401).json({ error: 'pmg_ticket_expired' });
    }
    return res.status(502).json({ error: 'pmg_api_error', detail: err.body });
  }
  if (err.status === 400) {
    return res.status(400).json({ error: err.message });
  }
  // eslint-disable-next-line no-console
  console.error('[quarantine] unexpected error:', err);
  res.status(500).json({ error: 'internal_error' });
}

router.get('/', async (req, res) => {
  try {
    const { starttime, endtime, pmail } = req.query;
    const list = await pmgClient.getQuarantineList(req.session, { starttime, endtime, pmail });
    res.json({ data: list });
  } catch (err) {
    handlePmgError(err, res);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const content = await pmgClient.getQuarantineContent(req.session, req.params.id);
    res.json({ data: content });
  } catch (err) {
    handlePmgError(err, res);
  }
});

router.post('/:id/action', async (req, res) => {
  try {
    const { action } = req.body || {};
    if (!action) {
      return res.status(400).json({ error: 'action_required' });
    }
    const result = await pmgClient.quarantineAction(req.session, req.params.id, action);
    res.json({ data: result });
  } catch (err) {
    handlePmgError(err, res);
  }
});

module.exports = router;
