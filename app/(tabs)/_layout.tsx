import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { theme } from "../../src/constants/theme";

type IconName = keyof typeof MaterialIcons.glyphMap;

const icons: Record<string, IconName> = {
  index: "home",
  market: "redeem",
  group: "groups",
  "life-study": "menu-book",
  prayer: "volunteer-activism",
  mypage: "person",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.white,
        tabBarInactiveTintColor: theme.colors.inkMute,
        tabBarActiveBackgroundColor: theme.colors.primary,
        tabBarStyle: {
          position: "absolute",
          marginHorizontal: 8,
          marginBottom: 12,
          height: 66,
          borderRadius: 999,
          borderTopWidth: 0,
          backgroundColor: "rgba(255,255,255,0.94)",
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarItemStyle: {
          borderRadius: 999,
          marginHorizontal: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons
            name={icons[route.name] ?? "circle"}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "홈", tabBarButtonTestID: "tab-home" }}
      />
      <Tabs.Screen
        name="market"
        options={{ title: "나눔", tabBarButtonTestID: "tab-market" }}
      />
      <Tabs.Screen
        name="group"
        options={{ title: "모임", tabBarButtonTestID: "tab-group" }}
      />
      <Tabs.Screen
        name="life-study"
        options={{ title: "공부", tabBarButtonTestID: "tab-life-study" }}
      />
      <Tabs.Screen
        name="prayer"
        options={{ title: "기도", tabBarButtonTestID: "tab-prayer" }}
      />
      <Tabs.Screen
        name="mypage"
        options={{ title: "MY", tabBarButtonTestID: "tab-mypage" }}
      />
    </Tabs>
  );
}
