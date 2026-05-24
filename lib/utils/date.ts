export const TIMEZONE = "Africa/Nairobi";
export const todayEAT = () => new Date().toLocaleDateString("sv-SE", { timeZone: TIMEZONE });
export const formatEAT = (d: string, opts?: Intl.DateTimeFormatOptions) => d ? new Date(d).toLocaleDateString("en-KE", { timeZone: TIMEZONE, day:"numeric", month:"short", year:"numeric", ...opts }) : "-";
export const formatDateTimeEAT = (d: string) => d ? new Date(d).toLocaleString("en-KE", { timeZone: TIMEZONE, day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "-";
export const daysUntil = (d: string) => d ? Math.ceil((new Date(d).getTime() - new Date(todayEAT()).getTime()) / 86400000) : 0;
export const isOverdue = (d: string) => d ? d < todayEAT() : false;
