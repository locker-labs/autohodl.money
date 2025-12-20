import { verboseLogs } from './constants';

export function logInfo(message: string, ...optionalParams: unknown[]): void {
  if (!verboseLogs) return;

  console.log(`INFO: ${message}`, ...optionalParams);
}

export function logError(message: string, ...optionalParams: unknown[]): void {
  if (!verboseLogs) return;

  console.error(`ERROR: ${message}`, ...optionalParams);
}

export function logWarn(message: string, ...optionalParams: unknown[]): void {
  if (!verboseLogs) return;

  console.warn(`WARN: ${message}`, ...optionalParams);
}
