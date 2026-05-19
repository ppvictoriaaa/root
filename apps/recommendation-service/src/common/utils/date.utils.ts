/** Return a new Date offset by the given number of days. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Return a new Date that is exactly N months after the given date. */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/** Format a Date as YYYY-MM-DD string. */
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Return the number of whole days between two dates (b − a). */
export function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Clamp a date so it is never before `floor`. */
export function clampDate(date: Date, floor: Date): Date {
  return date < floor ? new Date(floor) : date;
}
