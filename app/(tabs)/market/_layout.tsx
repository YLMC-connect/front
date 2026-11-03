import { Stack } from "expo-router";
import { theme } from "../../../src/constants/theme";

export default function MarketLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    />
  );
}
