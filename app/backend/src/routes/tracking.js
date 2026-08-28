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
  // eslint-disable-next-line no-console
  console.error('[tracking] unexpected error:', err);
  res.status(500).json({ error: 'internal_error' });
}

router.get('/', async (req, res) => {
  try {
    const { starttime, endtime, xfilter, from, target, ndr, greylist, limit } = req.query;
    const list = await pmgClient.getTrackingList(req.session, {
      starttime,
      endtime,
      xfilter,
      from,
      target,
      ndr,
      greylist,
      limit,
    });
    res.json({ data: list });
  } catch (err) {
    handlePmgError(err, res);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { starttime, endtime } = req.query;
    const detail = await pmgClient.getTrackingDetail(req.session, req.params.id, { starttime, endtime });
    res.json({ data: detail });
  } catch (err) {
    handlePmgError(err, res);
  }
});

module.exports = router;
