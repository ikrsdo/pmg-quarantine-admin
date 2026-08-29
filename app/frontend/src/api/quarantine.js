import { apiFetch } from './client';

export async function fetchQuarantineList({ starttime, endtime, pmail } = {}) {
  const params = new URLSearchParams();
  if (starttime !== undefined && starttime !== '') params.set('starttime', starttime);
  if (endtime !== undefined && endtime !== '') params.set('endtime', endtime);
  if (pmail) params.set('pmail', pmail);

  const query = params.toString();
  const res = await apiFetch(`/quarantine${query ? `?${query}` : ''}`);
  return res.data;
}

export async function fetchQuarantineDetail(id) {
  const res = await apiFetch(`/quarantine/${encodeURIComponent(id)}`);
  return res.data;
}

// Returns PMG's own sanitized HTML rendering of the mail (see CLAUDE.md
// "PMG API Notes" - the `/api2/htmlmail/...` formatter), not JSON, so this
// bypasses apiFetch and reads the response body as text directly.
export async function fetchQuarantinePreviewHtml(id) {
  const res = await fetch(`/api/quarantine/${encodeURIComponent(id)}/preview`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to load preview (${res.status})`);
  }
  return res.text();
}

// ids: single id string, or an array of ids (joined with ';' - PMG's own
// multi-id convention, see CLAUDE.md > "PMG API Notlari").
export function performQuarantineAction(ids, action) {
  const idParam = Array.isArray(ids) ? ids.join(';') : ids;
  return apiFetch(`/quarantine/${encodeURIComponent(idParam)}/action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}
