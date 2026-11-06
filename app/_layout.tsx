import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthRouteNavigator } from "../src/components/auth/AuthRouteNavigator";
import { appFontAssets } from "../src/constants/fonts";
import { theme } from "../src/constants/theme";
import { queryClient } from "../src/lib/queryClient";
import { initSentry, wrapWithSentry } from "../src/lib/sentry";
import { restoreAuthSession } from "../src/services/authService";

initSentry();

export { ErrorBoundary } from "expo-router";

function RootLayout() {
  const [fontsLoaded] = useFonts(appFontAssets);

  if (!fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthSessionBootstrap />
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <AuthRouteNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default wrapWithSentry(RootLayout);

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bg,
  },
});

function AuthSessionBootstrap() {
  useEffect(() => {
    restoreAuthSession().catch(() => undefined);
  }, []);

  return null;
}
