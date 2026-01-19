export function roundOff(value: string | number, decimals = 0): number {
  const [whole, decimal] = String(value).split('.');
  if (!decimal) return Number(whole);

  return Math.round(Number(`${whole}.${decimal}`) * 10 ** decimals) / 10 ** decimals;
}

/**
 * Render a number as a formatted amount with two decimal places and a denomination symbol.
 * @param value The numeric value to format.
 * @param denomination The symbol to prepend to the formatted amount.
 * @returns A string representing the formatted amount with the denomination.
 */
export function formatAmount(value: number | string, denomination = '$'): string {
  const num = Number(value);
  const absValue = Math.abs(num);

  if (!Number.isFinite(num)) return '0.00';

  if (num < 0) {
    return `-${denomination}${absValue.toFixed(2)}`;
  }

  return `${denomination}${absValue.toFixed(2)}`;
}
