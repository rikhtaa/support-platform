export function getReadableForeground(hex: string | undefined | null): string {
  const FALLBACK = "#ffffff";

  if (!hex) return FALLBACK;

  const normalized = hex.trim().replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return FALLBACK;
  }

  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);

  // YIQ perceived brightness, 0 (darkest) – 255 (lightest)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Threshold of 128 is the standard midpoint for this formula
  return brightness >= 128 ? "#000000" : "#ffffff";
}