import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as a string with a thousand separator and specified decimals
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Generate a unique operation ID based on date and count
 */
export function generateOperationId(count: number): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `OP-${dateStr}-${String(count + 1).padStart(3, '0')}`;
}

/**
 * Helper to map decaping method enum values to French display text
 */
export const decapingMethodMap: Record<string, string> = {
  'transport': 'Transport',
  'poussage': 'Poussage',
  'casement': 'Casement'
};

/**
 * Helper to map machine state enum values to French display text
 */
export const machineStateMap: Record<string, string> = {
  'running': 'En marche',
  'stopped': 'À l\'arrêt'
};

/**
 * Generate PDF filename with current date
 */
export function generateFilename(prefix: string, extension: string = 'pdf'): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
  return `${prefix}_${dateStr}_${timeStr}.${extension}`;
}

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    }
  );
}
