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

// ids: single id string, or an array of ids (joined with ';' - PMG's own
// multi-id convention, see CLAUDE.md > "PMG API Notlari").
export function performQuarantineAction(ids, action) {
  const idParam = Array.isArray(ids) ? ids.join(';') : ids;
  return apiFetch(`/quarantine/${encodeURIComponent(idParam)}/action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}
