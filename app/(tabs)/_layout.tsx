import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { MotionPressable } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const tabIcons: Record<string, { off: IconName; on: IconName }> = {
  index: { off: "home-outline", on: "home" },
  "market/index": { off: "shopping-outline", on: "shopping" },
  "group/index": { off: "account-multiple-outline", on: "account-multiple" },
  "prayer/index": { off: "hands-pray", on: "hands-pray" },
  "life-study/index": {
    off: "book-open-page-variant-outline",
    on: "book-open-page-variant",
  },
};

const tabHrefs: Record<
  string,
  "/" | "/market" | "/group" | "/prayer" | "/life-study"
> = {
  index: "/",
  "market/index": "/market",
  "group/index": "/group",
  "prayer/index": "/prayer",
  "life-study/index": "/life-study",
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
        options={{ title: "동행", tabBarButtonTestID: "tab-group" }}
      />
      <Tabs.Screen
        name="prayer/index"
        options={{ title: "기도", tabBarButtonTestID: "tab-prayer" }}
      />
      <Tabs.Screen
        name="life-study/index"
        options={{ title: "삶공부", tabBarButtonTestID: "tab-life-study" }}
      />
      <Tabs.Screen name="market/[id]" options={{ href: null }} />
      <Tabs.Screen name="group/[id]" options={{ href: null }} />
      <Tabs.Screen name="group/notices" options={{ href: null }} />
      <Tabs.Screen name="group/members" options={{ href: null }} />
      <Tabs.Screen name="life-study/[id]" options={{ href: null }} />
      <Tabs.Screen name="life-study/apply" options={{ href: null }} />
      <Tabs.Screen name="life-study/history" options={{ href: null }} />
      <Tabs.Screen name="prayer/[id]" options={{ href: null }} />
      <Tabs.Screen name="prayer/apply" options={{ href: null }} />
      <Tabs.Screen name="prayer/request" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="mypage/index" options={{ href: null }} />
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
    <VisibleTabBar
      state={state}
      descriptors={descriptors}
      navigation={navigation}
      router={router}
      routes={routes}
    />
  );
}

function VisibleTabBar({
  state,
  descriptors,
  navigation,
  router,
  routes,
}: any) {
  const reduceMotion = useReducedMotion();
  const [itemWidth, setItemWidth] = useState(0);
  const selectedIndex = routes.findIndex(
    (route: any) =>
      state.routes.findIndex((item: any) => item.key === route.key) ===
      state.index,
  );
  const indicatorIndex = useSharedValue(Math.max(selectedIndex, 0));
  const didMount = useRef(false);

  useEffect(() => {
    const nextIndex = Math.max(selectedIndex, 0);
    if (!didMount.current || reduceMotion) {
      indicatorIndex.value = nextIndex;
      didMount.current = true;
      return;
    }

    indicatorIndex.value = withTiming(nextIndex, {
      duration: theme.motion.duration.base,
    });
  }, [indicatorIndex, reduceMotion, selectedIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: itemWidth > 0 ? 1 : 0,
    width: itemWidth,
    transform: [{ translateX: indicatorIndex.value * itemWidth }],
  }));

  return (
    <View
      style={styles.tabShell}
      onLayout={(event) => {
        const contentWidth = Math.max(event.nativeEvent.layout.width - 12, 0);
        setItemWidth(routes.length > 0 ? contentWidth / routes.length : 0);
      }}
    >
      <Animated.View
        pointerEvents="none"
        testID="tab-active-indicator"
        style={[styles.tabIndicator, indicatorStyle]}
      />
      {routes.map((route: any) => {
        const index = state.routes.findIndex(
          (item: any) => item.key === route.key,
        );
        const focused = state.index === index;
        const options = descriptors[route.key].options;
        const label = options.title ?? route.name;

        return (
          <AppTabButton
            key={route.key}
            route={route}
            label={label}
            focused={focused}
            testID={options.tabBarButtonTestID}
            onPress={() => {
              const href = tabHrefs[route.name];
              if (href) {
                router.replace(href);
                return;
              }

              navigation.navigate(route.name);
            }}
          />
        );
      })}
    </View>
  );
}

function AppTabButton({ route, label, focused, testID, onPress }: any) {
  const reduceMotion = useReducedMotion();
  const iconScale = useSharedValue(1);
  const didMount = useRef(false);
  const color = focused ? theme.colors.white : theme.colors.inkMute;

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (!focused || reduceMotion) {
      iconScale.value = 1;
      return;
    }

    iconScale.value = withSequence(
      withTiming(theme.motion.scale.tabIcon, {
        duration: theme.motion.duration.fast / 2,
      }),
      withSpring(1, theme.motion.spring),
    );
  }, [focused, iconScale, reduceMotion]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <MotionPressable
      accessibilityRole="tab"
      accessibilityState={focused ? { selected: true } : {}}
      testID={testID}
      onPress={onPress}
      style={styles.tabItem}
    >
      <Animated.View style={iconStyle}>
        <MaterialCommunityIcons
          name={
            focused
              ? (tabIcons[route.name]?.on ?? "circle")
              : (tabIcons[route.name]?.off ?? "circle-outline")
          }
          size={20}
          color={color}
        />
      </Animated.View>
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </MotionPressable>
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
    backgroundColor: "transparent",
    paddingHorizontal: 6,
    paddingVertical: 7,
    flexDirection: "row",
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
    zIndex: 1,
  },
  tabIndicator: {
    position: "absolute",
    left: 6,
    top: 7,
    bottom: 7,
    borderRadius: 999,
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
