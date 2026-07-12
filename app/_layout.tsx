import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthRouteNavigator } from "../src/components/auth/AuthRouteNavigator";
import { GluestackUIProvider } from "../src/components/gluestack-ui/gluestack-ui-provider";
import { queryClient } from "../src/lib/queryClient";
import { restoreAuthSession } from "../src/services/authService";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
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

function AuthSessionBootstrap() {
  useEffect(() => {
    restoreAuthSession().catch(() => undefined);
  }, []);

  return null;
}
