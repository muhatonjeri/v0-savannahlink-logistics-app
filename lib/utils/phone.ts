export const formatKEPhone = (p: string) => {
  const c = p.replace(/\D/g, "");
  if (c.startsWith("254") && c.length === 12) return "+" + c;
  if (c.startsWith("0")   && c.length === 10)  return "+254" + c.slice(1);
  if (c.startsWith("7")   && c.length === 9)   return "+254" + c;
  return p;
};
export const validateKEPhone = (p: string) => /^(\+254|0254|0)(7\d{8}|1\d{8})$/.test(p.replace(/\s/g, ""));

export const maskEmail = (email: string) => {
  if (!email || !email.includes("@")) return email;
  const [user, domain] = email.split("@");
  return user.slice(0, 2) + "****@" + domain;
};

export const maskIdNumber = (id: string) => {
  if (!id || id.length < 4) return "****";
  return id.slice(0, 2) + "*".repeat(id.length - 4) + id.slice(-2);
};
