import { apiFetch } from './client';

export function fetchMe() {
  return apiFetch('/me');
}

export function login(username, password) {
  return apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return apiFetch('/logout', { method: 'POST' });
}
