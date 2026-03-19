const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrencyValue(value?: number | null) {
  if (value === undefined || value === null) return '-';
  return moneyFormatter.format(value);
}

export function formatPercentValue(value?: number | null) {
  if (value === undefined || value === null) return '-';
  return `${numberFormatter.format(value)}%`;
}

export function SummaryItem({ label, value }: Readonly<{ label: string; value?: string | number | null }>) {
  const displayValue =
    value === undefined || value === null || value === '' ? '-' : value;

  return (
    <div className="grid gap-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-primary">{displayValue}</p>
    </div>
  );
}
