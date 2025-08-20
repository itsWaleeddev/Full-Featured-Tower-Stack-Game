export const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 255) + percent);
  const g = Math.min(255, ((num >> 8) & 255) + percent);
  const b = Math.min(255, (num & 255) + percent);

  return `#${(1 << 24 | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};