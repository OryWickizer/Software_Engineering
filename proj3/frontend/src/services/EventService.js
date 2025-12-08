const API_BASE = "http://localhost:8000/api/events";

export async function listEvents() {
  const res = await fetch(`${API_BASE}/`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function listMyEvents(token) {
  const res = await fetch(`${API_BASE}/mine`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch my events");
  return res.json();
}

export async function createEvent(payload, token) {
  const res = await fetch(`${API_BASE}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function getEvent(eventId) {
  const res = await fetch(`${API_BASE}/${eventId}`);
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
}

export async function joinEvent(eventId, token) {
  const res = await fetch(`${API_BASE}/${eventId}/join`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to join event");
  return res.json();
}

export async function unjoinEvent(eventId, token) {
  const res = await fetch(`${API_BASE}/${eventId}/unjoin`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error("Failed to unjoin event");
  return res.json();
}

export async function addDish(eventId, dish, token) {
  const res = await fetch(`${API_BASE}/${eventId}/dishes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(dish),
  });
  if (!res.ok) throw new Error("Failed to add dish");
  return res.json();
}
