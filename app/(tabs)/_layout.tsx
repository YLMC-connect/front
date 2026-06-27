import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "../../src/constants/theme";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const tabIcons: Record<string, { off: IconName; on: IconName }> = {
  index: { off: "home-outline", on: "home" },
  "market/index": { off: "shopping-outline", on: "shopping" },
  "group/index": { off: "account-multiple-outline", on: "account-multiple" },
  "faith/index": { off: "heart-outline", on: "heart" },
  "mypage/index": { off: "account-outline", on: "account" },
};

const tabHrefs: Record<
  string,
  "/" | "/market" | "/group" | "/faith" | "/mypage"
> = {
  index: "/",
  "market/index": "/market",
  "group/index": "/group",
  "faith/index": "/faith",
  "mypage/index": "/mypage",
};

const rootTabPaths = new Set<string>(Object.values(tabHrefs));

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={tabIcons[route.name]?.off ?? "circle-outline"}
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
        options={{ title: "소모임", tabBarButtonTestID: "tab-group" }}
      />
      <Tabs.Screen
        name="faith/index"
        options={{ title: "동행", tabBarButtonTestID: "tab-faith" }}
      />
      <Tabs.Screen
        name="mypage/index"
        options={{ title: "MY", tabBarButtonTestID: "tab-mypage" }}
      />
      <Tabs.Screen name="market/[id]" options={{ href: null }} />
      <Tabs.Screen name="group/[id]" options={{ href: null }} />
      <Tabs.Screen name="group/notices" options={{ href: null }} />
      <Tabs.Screen name="group/members" options={{ href: null }} />
      <Tabs.Screen name="life-study/index" options={{ href: null }} />
      <Tabs.Screen name="life-study/[id]" options={{ href: null }} />
      <Tabs.Screen name="life-study/apply" options={{ href: null }} />
      <Tabs.Screen name="life-study/history" options={{ href: null }} />
      <Tabs.Screen name="prayer/index" options={{ href: null }} />
      <Tabs.Screen name="prayer/[id]" options={{ href: null }} />
      <Tabs.Screen name="prayer/apply" options={{ href: null }} />
      <Tabs.Screen name="prayer/request" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="mypage/edit" options={{ href: null }} />
      <Tabs.Screen name="mypage/activity" options={{ href: null }} />
      <Tabs.Screen name="mypage/blocked" options={{ href: null }} />
      <Tabs.Screen name="mypage/faq" options={{ href: null }} />
      <Tabs.Screen name="mypage/terms" options={{ href: null }} />
      <Tabs.Screen name="mypage/privacy" options={{ href: null }} />
      <Tabs.Screen name="mypage/withdraw" options={{ href: null }} />
      <Tabs.Screen name="mypage/user/[id]" options={{ href: null }} />
    </Tabs>
  );
}

function AppTabBar({ state, descriptors, navigation }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const currentRoute = state.routes[state.index];
  const currentOptions = descriptors[currentRoute.key]?.options;

  if (!rootTabPaths.has(pathname) || !currentOptions?.tabBarButtonTestID) {
    return null;
  }

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
            onPress={() => {
              const href = tabHrefs[route.name];
              if (href) {
                router.replace(href);
                return;
              }

              navigation.navigate(route.name);
            }}
            style={[styles.tabItem, focused ? styles.tabItemActive : null]}
          >
            <MaterialCommunityIcons
              name={
                focused
                  ? (tabIcons[route.name]?.on ?? "circle")
                  : (tabIcons[route.name]?.off ?? "circle-outline")
              }
              size={20}
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
    minHeight: 64,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(255,255,255,0.90)",
    paddingHorizontal: 6,
    paddingVertical: 7,
    flexDirection: "row",
    ...theme.shadow.float,
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  tabItemActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: "rgba(91, 122, 176, 0.74)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
});
