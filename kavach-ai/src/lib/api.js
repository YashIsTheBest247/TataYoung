// Pravaah API client. Backend defaults to http://localhost:8000.
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  base: BASE,
  async zones() { return (await request('/api/zones')).items; },
  async reports(limit = 30) { return (await request(`/api/reports?limit=${limit}`)).items; },
  async submitReport(body) {
    return request('/api/reports', { method: 'POST', body: JSON.stringify(body) });
  },
  async route(body) {
    return request('/api/route', { method: 'POST', body: JSON.stringify(body) });
  },
  async sos(body) {
    return request('/api/sos', { method: 'POST', body: JSON.stringify(body) });
  },
  async listSos() { return (await request('/api/sos')).items; },
  async registerVulnerable(body) {
    return request('/api/vulnerable', { method: 'POST', body: JSON.stringify(body) });
  },
  async listVulnerable() { return (await request('/api/vulnerable')).items; },
  async stats() { return request('/api/stats'); },
  async alerts(limit = 20) { return (await request(`/api/alerts?limit=${limit}`)).items; },
  async shelters() { return (await request('/api/shelters')).items; },
  async nearestShelter(lat, lng) {
    return request(`/api/shelters/nearest?lat=${lat}&lng=${lng}`);
  },
  async chat(message, history = []) {
    return request('/api/chat', { method: 'POST', body: JSON.stringify({ message, history }) });
  },
  async root() { return request('/'); },
};

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
