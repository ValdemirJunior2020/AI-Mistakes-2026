// utils/format.ts
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
}

export function safeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}
