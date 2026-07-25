/** Common two-syllable Korean surnames. */
const COMPOUND_SURNAMES = [
  "남궁",
  "독고",
  "동방",
  "사공",
  "서문",
  "선우",
  "제갈",
  "황보",
] as const;

/**
 * Returns the given name (이름) without the family name (성).
 * e.g. 이민구 → 민구, 김은혜 → 은혜, 남궁민수 → 민수
 */
export function getGivenName(fullName: string): string {
  const name = fullName.trim();
  if (!name) return "";
  if (name.length === 1) return name;

  for (const surname of COMPOUND_SURNAMES) {
    if (name.startsWith(surname) && name.length > surname.length) {
      return name.slice(surname.length);
    }
  }

  return name.slice(1);
}

export function getGivenNameInitial(fullName: string): string {
  const given = getGivenName(fullName);
  return given.slice(0, 1) || "?";
}
