/**
 * Number formatting utilities
 * Centralized functions for formatting numbers in a consistent way across the application
 */

/**
 * Format a number with compact notation (K, M, B)
 * Examples: 1234 → "1.2K", 1234567 → "1.2M", 1234567890 → "1.2B"
 *
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with compact notation
 */
export function formatCompactNumber(num: number, decimals: number = 1): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(decimals)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(decimals)}K`;
  }
  return num.toString();
}

/**
 * Format a number with locale-aware thousands separators
 * Examples: 1234 → "1,234", 1234567 → "1,234,567"
 *
 * @param num - The number to format
 * @param locale - The locale to use (default: 'en-US')
 * @returns Formatted string with thousands separators
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return num.toLocaleString(locale);
}

/**
 * Format a count (follower count, post count, etc.) with smart formatting
 * - Numbers < 1000: Show exact number
 * - Numbers >= 1000: Use compact notation
 *
 * @param count - The count to format
 * @returns Formatted count string
 */
export function formatCount(count: number): string {
  return formatCompactNumber(count);
}

/**
 * Parse a formatted number string back to a number
 * Examples: "1.2K" → 1200, "1.5M" → 1500000
 *
 * @param str - The formatted number string
 * @returns The parsed number
 */
export function parseFormattedNumber(str: string): number {
  const num = parseFloat(str);
  if (str.endsWith('B')) return num * 1_000_000_000;
  if (str.endsWith('M')) return num * 1_000_000;
  if (str.endsWith('K')) return num * 1_000;
  return num;
}

/**
 * Format a percentage
 * Examples: 0.1234 → "12.3%", 0.5 → "50.0%"
 *
 * @param value - The decimal value (0-1)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number with optional suffix
 * Examples: (1234, "items") → "1,234 items", (1, "item") → "1 item"
 *
 * @param num - The number to format
 * @param singular - Singular form of the suffix
 * @param plural - Plural form of the suffix (defaults to singular + 's')
 * @returns Formatted number with suffix
 */
export function formatNumberWithSuffix(
  num: number,
  singular: string,
  plural?: string
): string {
  const suffix = num === 1 ? singular : (plural || `${singular}s`);
  return `${formatNumber(num)} ${suffix}`;
}

/**
 * Abbreviate a number to a fixed character length
 * Examples: (123456, 5) → "123K", (1234567890, 6) → "1.23B"
 *
 * @param num - The number to abbreviate
 * @param maxLength - Maximum length of the result
 * @returns Abbreviated number string
 */
export function abbreviateNumber(num: number, maxLength: number = 5): string {
  const formatted = formatCompactNumber(num, 2);
  if (formatted.length <= maxLength) {
    return formatted;
  }

  // Try with 1 decimal
  const formatted1 = formatCompactNumber(num, 1);
  if (formatted1.length <= maxLength) {
    return formatted1;
  }

  // Try with 0 decimals
  return formatCompactNumber(num, 0);
}

/**
 * Format bytes to human-readable format
 * Examples: 1024 → "1.0 KB", 1048576 → "1.0 MB"
 *
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted byte string
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

/**
 * Clamp a number between min and max values
 *
 * @param num - The number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Round a number to a specific number of decimal places
 *
 * @param num - The number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
export function roundToDecimals(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
