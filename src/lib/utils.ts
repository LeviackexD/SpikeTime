import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as formatTz, utcToZonedTime } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSafeDate = (date: string | Date): Date => {
  if (date instanceof Date) {
    return date;
  }
  // This handles ISO strings from the DB (which are in UTC)
  // and creates a Date object representing that same moment in time.
  return new Date(date);
};

export const formatDateTimeLocal = (date: Date | string, formatString: string) => {
    const safeDate = getSafeDate(date);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = utcToZonedTime(safeDate, timeZone);
    return formatTz(zonedDate, formatString, { timeZone });
};

export const toYYYYMMDD = (date: Date): string => {
  // Use local date parts for input fields to match user's expectation
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toHHMM = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}
