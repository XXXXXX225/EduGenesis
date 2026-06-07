// Unified API fetch layer for EduGenesis
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

export async function apiGet(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `${API_BASE}${path}?${qs}` : `${API_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `API ${path} returned ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `API ${path} returned ${res.status}`);
  }
  return res.json();
}

/**
 * SSE streaming helper.
 * Calls `onChunk(data)` for each `data:` line parsed as JSON.
 * Returns the raw response body so the caller can also read directly.
 */
export async function apiSSEStream(path, body, onChunk) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

export { API_BASE };