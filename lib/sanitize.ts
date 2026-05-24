// Input sanitization utilities for API routes

// Strip HTML tags and dangerous characters
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return String(input || "");
  return input
    .replace(/<[^>]*>/g, "")          // remove HTML tags
    .replace(/[<>"'&]/g, "")          // remove dangerous chars
    .trim()
    .slice(0, 1000);                   // max length
}

// Sanitize an object's string values recursively
export function sanitizeBody(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") clean[k] = sanitizeString(v);
    else if (typeof v === "number") clean[k] = isFinite(v) ? v : 0;
    else if (typeof v === "boolean") clean[k] = v;
    else if (v === null || v === undefined) clean[k] = v;
    else if (typeof v === "object" && !Array.isArray(v)) {
      clean[k] = sanitizeBody(v as Record<string, unknown>);
    }
    else if (Array.isArray(v)) clean[k] = v;
    else clean[k] = String(v || "");
  }
  return clean;
}

// Validate UUID format
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// Validate Kenya phone
export function isKEPhone(phone: string): boolean {
  const clean = phone.replace(/\D/g, "");
  return /^(254|0)(7\d{8}|1\d{8})$/.test(clean);
}
