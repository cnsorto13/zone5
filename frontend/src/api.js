const BASE = 'http://localhost:8001';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  runs: {
    list: () => req('/runs/'),
    create: (body) => req('/runs/', { method: 'POST', body: JSON.stringify(body) }),
  },
  lifts: {
    list: () => req('/lift-sessions/'),
    create: (body) => req('/lift-sessions/', { method: 'POST', body: JSON.stringify(body) }),
  },
  nutrition: {
    list: () => req('/nutrition/'),
    create: (body) => req('/nutrition/', { method: 'POST', body: JSON.stringify(body) }),
  },
  sleep: {
    list: () => req('/sleep/'),
    create: (body) => req('/sleep/', { method: 'POST', body: JSON.stringify(body) }),
  },
  weight: {
    list: () => req('/weight/'),
    create: (body) => req('/weight/', { method: 'POST', body: JSON.stringify(body) }),
  },
};
