// Lightweight fetch-based API client with an axios-like interface.
// (axios hangs in this preview/runtime; native fetch is reliable.)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

function buildUrl(path, params) {
  let url = `${BACKEND_URL}${path}`;
  if (params && typeof params === "object") {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }
  return url;
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  try {
    const token = localStorage.getItem("hs_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return headers;
}

async function request(method, path, { params, data } = {}) {
  const res = await fetch(buildUrl(path, params), {
    method,
    headers: authHeaders(),
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
  let body = null;
  const text = await res.text();
  try { body = text ? JSON.parse(text) : null; } catch (_) { body = text; }
  if (!res.ok) {
    const error = new Error(`Request failed with status ${res.status}`);
    error.response = { status: res.status, data: body };
    throw error;
  }
  return { data: body, status: res.status };
}

export const api = {
  get: (path, cfg = {}) => request("GET", path, cfg),
  post: (path, data, cfg = {}) => request("POST", path, { ...cfg, data }),
  put: (path, data, cfg = {}) => request("PUT", path, { ...cfg, data }),
  delete: (path, cfg = {}) => request("DELETE", path, cfg),
};

export { BACKEND_URL };
