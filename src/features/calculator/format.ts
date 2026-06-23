const numberFormatter = new Intl.NumberFormat("nl-NL", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatMg(value: number): string {
  return `${formatNumber(value)} mg`;
}

export function formatMl(value: number): string {
  return `${formatNumber(value)} ml`;
}

export function formatMgPerHour(value: number): string {
  return `${formatNumber(value)} mg/uur`;
}

export function formatMlPerHour(value: number): string {
  return `${formatNumber(value)} ml/uur`;
}
