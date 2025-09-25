import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSafeDate = (date: string | Date): Date => {
  if (date instanceof Date) {
    return date;
  }
  // This handles ISO strings from the DB (which might be just 'YYYY-MM-DD')
  // By appending T00:00:00, we ensure it's parsed as local time, not UTC.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T00:00:00`);
  }
  return new Date(date);
};

export const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

export const toYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
}

export const toHHMM = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}
