/**
 * Pretendard weights used across the app.
 * On native, each weight is a separate font family name (RN does not
 * synthesize bold from a single family reliably).
 */
export const appFont = {
  regular: "Pretendard-Regular",
  medium: "Pretendard-Medium",
  semibold: "Pretendard-SemiBold",
  bold: "Pretendard-Bold",
} as const;

export type AppFontKey = keyof typeof appFont;

/** Metro requires for expo-font useFonts. */
export const appFontAssets = {
  [appFont.regular]: require("../../assets/fonts/Pretendard-Regular.otf"),
  [appFont.medium]: require("../../assets/fonts/Pretendard-Medium.otf"),
  [appFont.semibold]: require("../../assets/fonts/Pretendard-SemiBold.otf"),
  [appFont.bold]: require("../../assets/fonts/Pretendard-Bold.otf"),
} as const;

/** Map RN fontWeight token strings to Pretendard family names. */
export function fontFamilyForWeight(
  weight: string | number | undefined,
): string {
  const value = String(weight ?? "400");
  if (value === "700" || value === "800" || value === "bold") {
    return appFont.bold;
  }
  if (value === "600" || value === "semibold") {
    return appFont.semibold;
  }
  if (value === "500" || value === "medium") {
    return appFont.medium;
  }
  return appFont.regular;
}
