// Unified API fetch layer for EduGenesis
import { getAccessToken, clearSession } from './session';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';
const DEFAULT_TIMEOUT_MS = 15000;

function buildHeaders(extraHeaders = {}) {
  const token = getAccessToken();
  const headers = { ...extraHeaders };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      controller.signal.addEventListener('abort', () => reject(new Error('请求超时，请检查网络连接后重试')))
    ),
  ]).finally(() => clearTimeout(timer));
}

function handleAuthExpired() {
  clearSession();
  if (typeof window !== 'undefined') {
    window.location.hash = '#/login';
    window.location.reload();
  }
}

export async function apiGet(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `${API_BASE}${path}?${qs}` : `${API_BASE}${path}`;
  const doFetch = () => fetch(url, { headers: buildHeaders() });
  const res = await withTimeout(doFetch()).catch(async (err) => {
    if (err.name === 'TypeError' || err.message?.includes('超时')) {
      return withTimeout(doFetch());
    }
    throw err;
  });
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) { handleAuthExpired(); throw new Error('登录已过期，请重新登录'); }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `API ${path} returned ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path, body = {}) {
  const url = `${API_BASE}${path}`;
  const doFetch = () => fetch(url, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  const res = await withTimeout(doFetch());
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) { handleAuthExpired(); throw new Error('登录已过期，请重新登录'); }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `API ${path} returned ${res.status}`);
  }
  return res.json();
}

export async function apiSSEStream(path, body, onChunk) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} connection failed`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        try {
          const data = JSON.parse(trimmed.slice(6));
          onChunk(data);
        } catch (e) {
          console.error('SSE Parse Error:', trimmed);
        }
      }
    }
  }
}

export async function apiGetRaw(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `${API_BASE}${path}?${qs}` : `${API_BASE}${path}`;
  return fetch(url, {
    headers: buildHeaders(),
  });
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `API ${path} returned ${res.status}`);
  }
  return res.json();
}

export async function apiPut(path, body = {}) {
  const url = `${API_BASE}${path}`;
  const doFetch = () => fetch(url, {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  const res = await withTimeout(doFetch());
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) { handleAuthExpired(); throw new Error('登录已过期，请重新登录'); }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `API ${path} returned ${res.status}`);
  }
  return res.json();
}

export { API_BASE };
