import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthRouteNavigator } from "../src/components/auth/AuthRouteNavigator";
import { GluestackUIProvider } from "../src/components/gluestack-ui/gluestack-ui-provider";
import { appFontAssets } from "../src/constants/fonts";
import { theme } from "../src/constants/theme";
import { queryClient } from "../src/lib/queryClient";
import { restoreAuthSession } from "../src/services/authService";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
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
      <GluestackUIProvider mode="light">
        <QueryClientProvider client={queryClient}>
          <AuthSessionBootstrap />
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <AuthRouteNavigator />
          </SafeAreaProvider>
        </QueryClientProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}

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
