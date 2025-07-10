const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/healthz`);
  if (!res.ok) {
    throw new Error('Network error');
  }
  return res.json();
}
