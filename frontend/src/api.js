const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("formy_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("formy_token", token);
  else localStorage.removeItem("formy_token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options) {
  try {
    return await fetch(`${API}${path}`, options);
  } catch (err) {
    throw new Error("Cannot reach the server. It may be waking up, try again in a minute.");
  }
}

async function readError(res) {
  const data = await res.json().catch(() => ({}));
  const err = new Error(data.message || "Something went wrong");
  err.errors = data.errors;
  return err;
}

export async function api(path, { method = "GET", body } = {}) {
  const res = await request(path, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await readError(res);
  return res.json().catch(() => ({}));
}

export async function upload(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await request("/api/files", { method: "POST", headers: authHeaders(), body: form });
  if (!res.ok) throw await readError(res);
  return res.json();
}

export async function fetchBlob(path) {
  const res = await request(path, { headers: authHeaders() });
  if (!res.ok) throw await readError(res);
  return res.blob();
}

// Downloads a file (like a PDF letter) that needs the login token
export async function downloadFile(path, filename) {
  const blob = await fetchBlob(path);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
