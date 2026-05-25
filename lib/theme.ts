// Theme configuration for Moventra Admin
export type Theme = "dark" | "light" | "system";

export const THEMES: { value: Theme; label: string; icon: string }[] = [
  { value: "dark",   label: "Dark",    icon: "🌙" },
  { value: "light",  label: "Light",   icon: "☀️" },
  { value: "system", label: "System",  icon: "💻" },
];

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
  localStorage.setItem("moventra-theme", theme);
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("moventra-theme") as Theme) || "dark";
}
