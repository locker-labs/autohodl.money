export function truncateToTwoDecimals(value: string | number): number {
  const [whole, decimal] = String(value).split('.');
  if (!decimal) return Number(whole);
  return Number(`${whole}.${decimal.slice(0, 2)}`);
}

export function formatAmount(value: number, sign = '$'): string {
  const absValue = Math.abs(value);

  if (value < 0) {
    return `-${sign}${absValue}`;
  }

  return `${sign}${absValue}`;
}
