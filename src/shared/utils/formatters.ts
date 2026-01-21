// 🎸 Shared Utility Functions
// Allgemeine Helper-Funktionen

/**
 * Formatiert einen Preis in Schweizer Franken
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(amount);
}

/**
 * Formatiert ein Datum für die Anzeige
 */
export function formatDate(
  date: Date | string,
  locale: "de" | "en" = "de",
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat(
    locale === "de" ? "de-DE" : "en-US",
    defaultOptions
  ).format(dateObj);
}

/**
 * Formatiert ein Datum mit Uhrzeit
 */
export function formatDateTime(
  date: Date | string,
  locale: "de" | "en" = "de"
): string {
  return formatDate(date, locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Gibt eine relative Zeitangabe zurück (z.B. "vor 2 Stunden")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: "de" | "en" = "de"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    numeric: "auto",
  });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, "second");
  if (diffInSeconds < 3600)
    return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
  if (diffInSeconds < 86400)
    return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
  if (diffInSeconds < 604800)
    return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
  if (diffInSeconds < 2592000)
    return rtf.format(-Math.floor(diffInSeconds / 604800), "week");
  if (diffInSeconds < 31536000)
    return rtf.format(-Math.floor(diffInSeconds / 2592000), "month");
  return rtf.format(-Math.floor(diffInSeconds / 31536000), "year");
}

/**
 * Kürzt einen Text auf eine bestimmte Länge
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Generiert eine zufällige ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce Funktion
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle Funktion
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
