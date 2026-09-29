/**
 * Formats an ISO date string into a readable localized format
 */
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(date);
  } catch {
    return String(dateString);
  }
}

/**
 * Generates initials from a full name (e.g. "Araceli Gonzalez" -> "AG")
 */
export function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Truncates text with an ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
