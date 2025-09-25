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

/**
 * Converts a Date object to a 'YYYY-MM-DD' string, ignoring timezone effects.
 * This is the safest way to compare dates without timezone-related issues.
 */
export const toYYYYMMDD = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
