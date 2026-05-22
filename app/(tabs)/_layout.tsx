import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { theme } from "../../src/constants/theme";

type IconName = keyof typeof MaterialIcons.glyphMap;

const icons: Record<string, IconName> = {
  index: "home",
  "market/index": "redeem",
  "group/index": "groups",
  "life-study/index": "menu-book",
  "prayer/index": "volunteer-activism",
  "mypage/index": "person",
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
        name="market/index"
        options={{ title: "나눔", tabBarButtonTestID: "tab-market" }}
      />
      <Tabs.Screen
        name="group/index"
        options={{ title: "모임", tabBarButtonTestID: "tab-group" }}
      />
      <Tabs.Screen
        name="life-study/index"
        options={{ title: "공부", tabBarButtonTestID: "tab-life-study" }}
      />
      <Tabs.Screen
        name="prayer/index"
        options={{ title: "기도", tabBarButtonTestID: "tab-prayer" }}
      />
      <Tabs.Screen
        name="mypage/index"
        options={{ title: "MY", tabBarButtonTestID: "tab-mypage" }}
      />
      <Tabs.Screen name="market/[id]" options={{ href: null }} />
      <Tabs.Screen name="group/[id]" options={{ href: null }} />
      <Tabs.Screen name="life-study/[id]" options={{ href: null }} />
      <Tabs.Screen name="prayer/[id]" options={{ href: null }} />
    </Tabs>
  );
}
