export function roundOff(value: string | number, decimals = 0): number {
  const [whole, decimal] = String(value).split('.');
  if (!decimal) return Number(whole);

  return Math.round(Number(`${whole}.${decimal}`) * 10 ** decimals) / 10 ** decimals;
}

export function formatAmount(value: number, sign = '$'): string {
  const absValue = Math.abs(value);

  if (value < 0) {
    return `-${sign}${absValue}`;
  }

  return `${sign}${absValue}`;
}
