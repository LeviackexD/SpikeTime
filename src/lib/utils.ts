import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(timeString: string) {
  if (!timeString || !timeString.includes(':')) {
    return '00:00';
  }
  const [hours, minutes] = timeString.split(':');
  const h = hours.padStart(2, '0');
  const m = minutes.padStart(2, '0');
  return `${h}:${m}`;
}

export const getSafeDate = (date: string | Date): Date => {
  if (date instanceof Date) {
    return date;
  }
  // This handles ISO strings from the DB (which are in UTC)
  // and creates a Date object representing that same moment in time.
  return new Date(date);
};

/**
 * Converts a Date object to a 'YYYY-MM-DD' string, using UTC values.
 * This is crucial for avoiding timezone-related off-by-one-day errors
 * when interacting with date inputs and databases.
 */
export const toYYYYMMDD = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
