import dayjs from 'dayjs';

/** Get today's date as YYYY-MM-DD */
export function today(): string {
  return dayjs().format('YYYY-MM-DD');
}

/** Format a date string for display */
export function formatDate(date: string): string {
  return dayjs(date).format('YYYY年M月D日');
}

/** Format a date with weekday */
export function formatDateFull(date: string): string {
  return dayjs(date).format('YYYY年M月D日 dddd');
}

/** Get current month key (YYYY-MM) */
export function currentMonth(): string {
  return dayjs().format('YYYY-MM');
}

/** Get number of days in month */
export function daysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth();
}

/** Get day of week for first day of month (0 = Sunday) */
export function firstDayOfWeek(year: number, month: number): number {
  return dayjs(`${year}-${String(month).padStart(2, '0')}-01`).day();
}

/** Parse year and month from YYYY-MM key */
export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split('-').map(Number);
  return { year: y, month: m };
}

/** Check if a date string is today */
export function isToday(date: string): boolean {
  return dayjs(date).isSame(dayjs(), 'day');
}

/** Get Chinese weekday name */
export function chineseWeekday(date: string): string {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const d = dayjs(date).day();
  return `星期${weekdays[d]}`;
}
