import type { ConfigContext, ExpoConfig } from "expo/config";

const bundleIds = {
  development: "com.ylmc.connect.dev",
  preview: "com.ylmc.connect.preview",
  production: "com.ylmc.connect",
} as const;

const apiUrls = {
  development: "https://ylmc-api.duckdns.org",
  preview: "https://staging-api.example.invalid",
  production: "https://api.example.invalid",
} as const;

type Variant = keyof typeof bundleIds;

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant =
    (process.env.APP_VARIANT as Variant | undefined) ?? "development";
  const resolvedVariant = variant in bundleIds ? variant : "development";
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? apiUrls[resolvedVariant];

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
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-font",
      ["expo-dev-client", { toolsButton: false }],
    ],
    extra: {
      apiUrl,
      variant: resolvedVariant,
      authAdapter:
        process.env.EXPO_PUBLIC_AUTH_ADAPTER ??
        (resolvedVariant === "development" ? "http" : "mock"),
      marketAdapter:
        process.env.EXPO_PUBLIC_MARKET_ADAPTER ??
        (resolvedVariant === "development" ? "http" : "mock"),
    },
  };
};
