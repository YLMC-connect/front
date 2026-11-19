/** 서버 응답(unknown)을 읽는 공통 함수. 형식 오류는 `INVALID_RESPONSE` 로 던진다. */
import {
  invalidResponse as invalid,
  keepValidItems,
} from "./reportResponseIssue";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function readId(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return readString(value);
}

export function readInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

export function requireKey(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  if (!(key in data)) invalid(source, key);
}

export function requireInteger(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  const value = readInteger(data[key]);
  if (value == null) invalid(source, key);
  return value;
}

export function requireString(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (typeof data[key] !== "string") invalid(source, key);
  return data[key];
}

export function requireNullableString(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (data[key] === null) return null;
  if (typeof data[key] !== "string") invalid(source, key);
  return data[key];
}

export function requireBoolean(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
) {
  requireKey(data, key, source);
  if (typeof data[key] !== "boolean") invalid(source, key);
  return data[key];
}

export function requireOneOf<T extends string>(
  data: Record<string, unknown>,
  key: string,
  source: unknown,
  allowed: readonly T[],
): T {
  const value = requireString(data, key, source);
  if (!allowed.includes(value as T)) invalid(source, key);
  return value as T;
}

/** 화면에서 쓰지 않는 필드. 없거나 형식이 다르면 null. */
export function optionalInteger(data: Record<string, unknown>, key: string) {
  return readInteger(data[key]);
}

export function optionalString(data: Record<string, unknown>, key: string) {
  return typeof data[key] === "string" ? data[key] : null;
}

export function optionalOneOf<T extends string>(
  data: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
): T | null {
  return allowed.includes(data[key] as T) ? (data[key] as T) : null;
}

/** 배열이 아니면 응답 오류. 형식이 틀린 항목만 빼고 돌려준다. */
export function readArrayField<T>(
  data: Record<string, unknown>,
  key: string,
  source: string,
  readItem: (item: unknown, source: unknown) => T,
): T[] {
  const items = data[key];
  if (!Array.isArray(items)) invalid(data, key);
  return keepValidItems(items, `${source}.${key}`, (item) =>
    readItem(item, data),
  );
}
