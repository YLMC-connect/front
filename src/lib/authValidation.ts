export const LOGIN_ID_PATTERN = /^[a-z0-9]+$/;

/**
 * Sanitizes input ID: converts to lowercase and strips non-alphanumeric chars (korean, special chars, spaces).
 */
export function sanitizeLoginId(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Validates if the ID matches the allowed charset (lowercase english + numbers only, at least 1 char).
 */
export function isValidLoginId(id: string): boolean {
  return LOGIN_ID_PATTERN.test(id);
}
