const numberFormatter = new Intl.NumberFormat("nl-NL", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const oneDecimalFormatter = new Intl.NumberFormat("nl-NL", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatOneDecimal(value: number): string {
  return oneDecimalFormatter.format(value);
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

export function formatGPerL(value: number): string {
  return `${formatOneDecimal(value)} g/L`;
}

export function formatMgPerMl(value: number): string {
  return `${formatOneDecimal(value)} mg/ml`;
}

export function formatMlOneDecimal(value: number): string {
  return `${formatOneDecimal(value)} ml`;
}

export function formatHours(value: number): string {
  return `${formatOneDecimal(value)} uur`;
}
