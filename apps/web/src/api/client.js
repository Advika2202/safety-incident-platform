const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data.error === "string" ? data.error : "Something went wrong";
    throw new Error(message);
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  listIncidents: (token, filters = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    ).toString();
    return request(`/incidents${query ? `?${query}` : ""}`, { token });
  },
  getIncidentStats: (token) => request("/incidents/stats", { token }),
  getIncident: (token, id) => request(`/incidents/${id}`, { token }),
  createIncident: (token, payload) =>
    request("/incidents", { method: "POST", body: payload, token }),
  updateIncidentStatus: (token, id, status) =>
    request(`/incidents/${id}/status`, { method: "PATCH", body: { status }, token }),
  listNotifications: (token) => request("/notifications", { token }),
};
