// Input sanitization utilities

export function sanitizeString(value: unknown): string {
  return String(value || "").replace(/[<>"'`;]/g, "").trim().slice(0, 500);
}

export function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") clean[key] = sanitizeString(value);
    else if (typeof value === "number") clean[key] = isNaN(value) ? 0 : value;
    else if (typeof value === "boolean") clean[key] = value;
    else if (value === null || value === undefined) clean[key] = null;
    else if (Array.isArray(value)) clean[key] = value;
    else if (typeof value === "object") clean[key] = sanitizeBody(value as Record<string, unknown>);
    else clean[key] = value;
  }
  return clean;
}

export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\s\-()]/g, "").trim().slice(0, 20);
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().replace(/[^a-z0-9@._\-+]/g, "").trim().slice(0, 200);
}

export function sanitizeSearch(value: string): string {
  return value.replace(/[%_\\;'"]/g, "").trim().toLowerCase().slice(0, 100);
}
