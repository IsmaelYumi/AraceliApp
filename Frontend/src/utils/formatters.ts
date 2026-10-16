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

/**
 * Calculates human readable pediatric age from a birth date
 */
export function calculateAge(birthDateString: string): string {
  if (!birthDateString) return '';
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return '';
  const now = new Date();
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years < 0) return 'Recién nacido';
  if (years === 0) {
    return `${Math.max(0, months)} ${months === 1 ? 'mes' : 'meses'}`;
  }
  return `${years} ${years === 1 ? 'año' : 'años'}${months > 0 ? ` ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`;
}

