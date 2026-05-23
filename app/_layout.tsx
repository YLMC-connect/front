import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "../src/lib/queryClient";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
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
            <Stack.Screen
              name="modal/life-study-apply"
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="modal/prayer-apply"
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="modal/prayer-request"
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="modal/group-notice"
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="modal/group-members"
              options={{ presentation: "modal" }}
            />
          </Stack>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
