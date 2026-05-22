import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
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

function AppTabBar({ state, descriptors, navigation }: any) {
  const routes = state.routes.filter((route: any) => {
    const options = descriptors[route.key]?.options;
    return options?.tabBarButtonTestID;
  });

  return (
    <View style={styles.tabShell}>
      {routes.map((route: any) => {
        const index = state.routes.findIndex(
          (item: any) => item.key === route.key,
        );
        const focused = state.index === index;
        const options = descriptors[route.key].options;
        const label = options.title ?? route.name;
        const color = focused ? theme.colors.white : theme.colors.inkMute;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={focused ? { selected: true } : {}}
            testID={options.tabBarButtonTestID}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tabItem, focused ? styles.tabItemActive : null]}
          >
            <MaterialIcons
              name={icons[route.name] ?? "circle"}
              size={focused ? 25 : 24}
              color={color}
            />
            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabShell: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    minHeight: 70,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 6,
    paddingVertical: 7,
    flexDirection: "row",
    shadowColor: "rgba(20,30,18,0.22)",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 2,
  },
  tabItemActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: "rgba(91,122,176,0.55)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
});
