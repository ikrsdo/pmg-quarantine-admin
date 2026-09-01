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
    const { type, starttime, endtime, pmail } = req.query;
    const list = await pmgClient.getQuarantineList(req.session, { type, starttime, endtime, pmail });
    res.json({ data: list });
  } catch (err) {
    handlePmgError(err, res);
  }
});

router.get('/:id/attachments', async (req, res) => {
  try {
    const attachments = await pmgClient.getQuarantineAttachments(req.session, req.params.id);
    res.json({ data: attachments });
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

router.get('/:id/preview', async (req, res) => {
  try {
    const html = await pmgClient.getQuarantineHtmlPreview(req.session, req.params.id);
    // The frontend only ever loads this via fetch() into a sandboxed
    // iframe's srcDoc - this header is defense-in-depth for the case where
    // someone navigates the browser straight to this URL, so mail content
    // (already sanitized by PMG, but still third-party HTML) can't run
    // script or navigate the top frame in the app's own origin.
    res.set('Content-Security-Policy', "sandbox; default-src 'none'");
    res.type('html').send(html);
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
