import { Stack } from "expo-router";
import { theme } from "../../../src/constants/theme";

export default function GroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    />
  );
}
