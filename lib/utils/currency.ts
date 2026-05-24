export const formatKES = (n: number | string | null | undefined) => {
  const v = Number(n || 0);
  return isNaN(v) ? "KES 0" : "KES " + v.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
export const formatKESCompact = (n: number) =>
  n >= 1_000_000 ? `KES ${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `KES ${(n/1_000).toFixed(0)}K` : formatKES(n);
