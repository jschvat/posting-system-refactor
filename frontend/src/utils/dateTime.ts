/**
 * Centralized date and time formatting utilities
 * Provides consistent date/time formatting across the application
 */

/**
 * Formats a date string into a relative time string (e.g., "2m ago", "3h ago")
 * Used for posts, comments, and general activity timestamps
 *
 * @param dateString - ISO date string or any valid date format
 * @returns Formatted relative time string
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
};

/**
 * Formats a date string into a time string (e.g., "2:30 PM")
 * Used for message timestamps and precise time display
 *
 * @param timestamp - ISO date string or any valid date format
 * @returns Formatted time string in 12-hour format
 */
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Formats a date string into a full date and time string
 * Used for detailed timestamp display
 *
 * @param dateString - ISO date string or any valid date format
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * Formats a date string into a short date string (e.g., "Jan 15, 2024")
 * Used for date-only display
 *
 * @param dateString - ISO date string or any valid date format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Checks if a date is today
 *
 * @param dateString - ISO date string or any valid date format
 * @returns True if the date is today
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Checks if a date is yesterday
 *
 * @param dateString - ISO date string or any valid date format
 * @returns True if the date is yesterday
 */
export const isYesterday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

/**
 * Formats a date string with smart relative formatting
 * - "Just now" for < 1 minute
 * - "Xm ago" for < 1 hour
 * - "Xh ago" for < 24 hours
 * - "Yesterday at HH:MM" for yesterday
 * - "MMM DD at HH:MM" for this year
 * - "MMM DD, YYYY" for older dates
 *
 * @param dateString - ISO date string or any valid date format
 * @returns Smart formatted date string
 */
export const formatSmartDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  if (isYesterday(dateString)) {
    return `Yesterday at ${formatTime(dateString)}`;
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) + ` at ${formatTime(dateString)}`;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Gets the difference between two dates in human-readable format
 *
 * @param startDate - Start date string
 * @param endDate - End date string (defaults to now)
 * @returns Human-readable duration string
 */
export const getDuration = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();

  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
