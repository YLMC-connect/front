export const LOGIN_ID_PATTERN = /^[a-z0-9]+$/;

/**
 * Sanitizes input ID: converts uppercase characters to lowercase.
 * Characters like Korean or spaces are not stripped on input so the user can see what was typed,
 * and will be caught by validation (isValidLoginId).
 */
export function sanitizeLoginId(input: string): string {
  return input.toLowerCase();
}

/**
 * Validates if the ID matches the allowed charset (lowercase english + numbers only, at least 1 char).
 */
export function isValidLoginId(id: string): boolean {
  return LOGIN_ID_PATTERN.test(id);
}
