export type DesignVariantValue = string | string[] | undefined;

export function readDesignVariant(
  value: DesignVariantValue,
  enabled = __DEV__,
) {
  if (!enabled) return undefined;
  return Array.isArray(value) ? value[0] : value;
}
