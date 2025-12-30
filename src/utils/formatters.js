/**
 * Utility functions for formatting dates, numbers, currencies, and text
 */

/**
 * Format a date with various styles
 * @param {string|Date} date - Date string or Date object
 * @param {Object} options - Formatting options
 * @param {string} options.format - 'short', 'long', 'withTime', 'relative', 'iso'
 * @param {string} options.locale - Locale code (default: 'en-US')
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return '-';

  const { format = 'short', locale = 'en-US' } = options;
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '-';

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    case 'long':
      return dateObj.toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    case 'withTime':
      return dateObj.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    case 'timeOnly':
      return dateObj.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    case 'relative':
      return formatRelativeTime(dateObj);

    case 'iso':
      return dateObj.toISOString().split('T')[0];

    default:
      return dateObj.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '-';

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isFuture = diffMs > 0;
  const abs = Math.abs;

  if (abs(diffSeconds) < 60) {
    return isFuture ? 'in a few seconds' : 'just now';
  }
  if (abs(diffMinutes) < 60) {
    const mins = abs(diffMinutes);
    return isFuture
      ? `in ${mins} minute${mins === 1 ? '' : 's'}`
      : `${mins} minute${mins === 1 ? '' : 's'} ago`;
  }
  if (abs(diffHours) < 24) {
    const hrs = abs(diffHours);
    return isFuture
      ? `in ${hrs} hour${hrs === 1 ? '' : 's'}`
      : `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  }
  if (abs(diffDays) < 30) {
    const days = abs(diffDays);
    return isFuture
      ? `in ${days} day${days === 1 ? '' : 's'}`
      : `${days} day${days === 1 ? '' : 's'} ago`;
  }

  // Fallback to short date format for older/future dates
  return formatDate(dateObj, { format: 'short' });
}

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'AED')
 * @param {string} locale - Locale code (default: 'en-AE')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'AED', locale = 'en-AE') {
  if (amount === null || amount === undefined) return '-';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with locale-specific separators
 * @param {number} value - The number to format
 * @param {Object} options - Formatting options
 * @param {number} options.decimals - Number of decimal places
 * @param {string} options.locale - Locale code
 * @returns {string} Formatted number string
 */
export function formatNumber(value, options = {}) {
  if (value === null || value === undefined) return '-';

  const { decimals = 0, locale = 'en-US' } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage value
 * @param {number} value - The value to format (0-100 or 0-1)
 * @param {Object} options - Formatting options
 * @param {boolean} options.normalize - If true, treats value as 0-1 range
 * @param {number} options.decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, options = {}) {
  if (value === null || value === undefined) return '-';

  const { normalize = false, decimals = 1 } = options;
  const normalizedValue = normalize ? value * 100 : value;

  return `${normalizedValue.toFixed(decimals)}%`;
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50, suffix = '...') {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return '-';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format a phone number
 * @param {string} phone - Phone number string
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
  if (!phone) return '-';

  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format for UAE numbers
  if (cleaned.length === 9) {
    return `+971 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('971')) {
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  }

  return phone;
}

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalizeWords(text) {
  if (!text) return '';
  return text.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Format name (first + last)
 * @param {Object} person - Person object with name fields
 * @param {string} person.firstName - First name
 * @param {string} person.lastName - Last name
 * @param {string} person.name - Full name (fallback)
 * @returns {string} Formatted name
 */
export function formatName(person) {
  if (!person) return '-';
  if (person.firstName || person.lastName) {
    return [person.firstName, person.lastName].filter(Boolean).join(' ');
  }
  return person.name || '-';
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @param {number} count - Number of initials to return
 * @returns {string} Initials
 */
export function getInitials(name, count = 2) {
  if (!name) return '';

  const words = name.trim().split(/\s+/);
  const initials = words
    .map(word => word[0])
    .filter(Boolean)
    .slice(0, count)
    .join('')
    .toUpperCase();

  return initials;
}
