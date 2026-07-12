import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";

export function AuthRouteNavigator() {
  const status = useAuthStore((state) => state.status);

  if (status === "restoring") {
    return (
      <View testID="auth-restoring" style={styles.restoring}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  const isAuthenticated = status === "authenticated";

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
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
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  restoring: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bg,
  },
});
