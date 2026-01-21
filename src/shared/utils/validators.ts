// 🎸 Validation Utilities
// Eingabe-Validierungs-Funktionen

/**
 * Validiert eine E-Mail-Adresse
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validiert ein Passwort
 * Mindestens 8 Zeichen, 1 Großbuchstabe, 1 Kleinbuchstabe, 1 Zahl
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Gibt Passwort-Stärke zurück (0-4)
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return Math.min(strength, 4);
}

/**
 * Validiert einen Benutzernamen
 * 3-20 Zeichen, nur Buchstaben, Zahlen, Unterstrich und Bindestrich
 */
export function isValidUsername(username: string): boolean {
  if (username.length < 3 || username.length > 20) return false;
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(username);
}

/**
 * Validiert eine URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitiert einen String (entfernt HTML)
 */
export function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Validiert eine Telefonnummer (Schweiz)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Schweizer Format: +41 xx xxx xx xx oder 0xx xxx xx xx
  const phoneRegex = /^(\+41|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}
