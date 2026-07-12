import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="modal/market-new"
                options={{ presentation: "modal" }}
              />
              <Stack.Screen
                name="modal/group-new"
                options={{ presentation: "modal" }}
              />
              <Stack.Screen
                name="modal/prayer-new"
                options={{ presentation: "modal" }}
              />
            </Stack>
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
