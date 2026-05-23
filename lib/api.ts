// Client-side API helpers — call Supabase via API routes
// Use these in pages instead of lib/store.ts

const api = async (path: string, options?: RequestInit) => {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
};

// ── CLIENTS ──────────────────────────────────────────
export const clientsApi = {
  getAll: () => api("/api/clients"),
  getById: (id: string) => api(`/api/clients?id=${id}`),
  search: (q: string) => api(`/api/clients?q=${encodeURIComponent(q)}`),
  create: (data: Record<string, unknown>) => api("/api/clients", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api("/api/clients", { method: "PUT", body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => api(`/api/clients?id=${id}`, { method: "DELETE" }),
};

// ── BOOKINGS ─────────────────────────────────────────
export const bookingsApi = {
  getAll: () => api("/api/bookings"),
  getByService: (service: string) => api(`/api/bookings?service=${encodeURIComponent(service)}`),
  getByClient: (clientId: string) => api(`/api/bookings?clientId=${clientId}`),
  create: (data: Record<string, unknown>) => api("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api("/api/bookings", { method: "PUT", body: JSON.stringify({ id, ...data }) }),
};

// ── INVOICES ─────────────────────────────────────────
export const invoicesApi = {
  getAll: () => api("/api/invoices"),
  getById: (id: string) => api(`/api/invoices?id=${id}`),
  create: (data: Record<string, unknown>) => api("/api/invoices", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api("/api/invoices", { method: "PUT", body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => api(`/api/invoices?id=${id}`, { method: "DELETE" }),
};

// ── RECEIPTS ─────────────────────────────────────────
export const receiptsApi = {
  getAll: () => api("/api/receipts"),
  create: (data: Record<string, unknown>) => api("/api/receipts", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api("/api/receipts", { method: "PUT", body: JSON.stringify({ id, ...data }) }),
};

// ── FLEET ─────────────────────────────────────────────
export const fleetApi = {
  getAll: () => api("/api/fleet"),
  getById: (id: string) => api(`/api/fleet?id=${id}`),
  create: (data: Record<string, unknown>) => api("/api/fleet", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => api("/api/fleet", { method: "PUT", body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => api(`/api/fleet?id=${id}`, { method: "DELETE" }),
};

// ── TRANSACTIONS ─────────────────────────────────────
export const transactionsApi = {
  getAll: (filters?: { type?: string; from?: string; to?: string }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    return api(`/api/transactions?${params}`);
  },
  create: (data: Record<string, unknown> | Record<string, unknown>[]) =>
    api("/api/transactions", { method: "POST", body: JSON.stringify(data) }),
};
