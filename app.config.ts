import type { ConfigContext, ExpoConfig } from "expo/config";

const bundleIds = {
  development: "com.ylmc.connect.dev",
  preview: "com.ylmc.connect.preview",
  production: "com.ylmc.connect",
} as const;

type Variant = keyof typeof bundleIds;

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant =
    (process.env.APP_VARIANT as Variant | undefined) ?? "development";
  const resolvedVariant = variant in bundleIds ? variant : "development";
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || undefined;

  if (!apiUrl && process.env.NODE_ENV !== "test") {
    throw new Error(
      "EXPO_PUBLIC_API_URL이 필요합니다. `.env.example`을 복사해 `.env`를 만들고 팀에서 받은 API origin을 넣으세요.",
    );
  }

  return {
    ...config,
    name:
      resolvedVariant === "production"
        ? "YLMC Connect"
        : `YLMC (${resolvedVariant})`,
    slug: "ylmc-connect",
    scheme: "ylmc-connect",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: false,
      bundleIdentifier: bundleIds[resolvedVariant],
    },
    android: {
      package: bundleIds[resolvedVariant],
    },
    web: {
      bundler: "metro",
    },
    experiments: {
      ...(process.env.EXPO_BASE_URL
        ? { baseUrl: process.env.EXPO_BASE_URL }
        : {}),
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-font",
      "expo-image",
      "expo-status-bar",
      ["expo-dev-client", { toolsButton: false }],
      [
        "expo-build-properties",
        {
          ios: {
            enableSceneSupport: true,
          },
        },
      ],
    ],
    extra: {
      apiUrl,
      variant: resolvedVariant,
    },
  };
};
