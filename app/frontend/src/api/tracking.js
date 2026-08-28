import { apiFetch } from './client';

export async function fetchTrackingList({ starttime, endtime, xfilter, from, target, ndr, greylist, limit } = {}) {
  const params = new URLSearchParams();
  if (starttime !== undefined && starttime !== '') params.set('starttime', starttime);
  if (endtime !== undefined && endtime !== '') params.set('endtime', endtime);
  if (xfilter) params.set('xfilter', xfilter);
  if (from) params.set('from', from);
  if (target) params.set('target', target);
  if (ndr !== undefined && ndr !== '') params.set('ndr', ndr);
  if (greylist !== undefined && greylist !== '') params.set('greylist', greylist);
  if (limit !== undefined && limit !== '') params.set('limit', limit);

  const query = params.toString();
  const res = await apiFetch(`/tracking${query ? `?${query}` : ''}`);
  return res.data;
}

export async function fetchTrackingDetail(id, { starttime, endtime } = {}) {
  const params = new URLSearchParams();
  if (starttime !== undefined && starttime !== '') params.set('starttime', starttime);
  if (endtime !== undefined && endtime !== '') params.set('endtime', endtime);

  const query = params.toString();
  const res = await apiFetch(`/tracking/${encodeURIComponent(id)}${query ? `?${query}` : ''}`);
  return res.data;
}
