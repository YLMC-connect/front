import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, usePathname, useRouter, type Router } from "expo-router";
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
import {
  TabBlurTargetContext,
  useTabBlurTarget,
} from "../../src/components/layout/TabBlurTargetContext";
import { GlassBackdrop } from "../../src/components/ui/glass-backdrop";
import { theme } from "../../src/constants/theme";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const rootTabs = [
  {
    name: "index",
    title: "홈",
    href: "/",
    testID: "tab-home",
    icon: { off: "home-outline", on: "home" },
  },
  {
    name: "market",
    title: "나눔",
    href: "/market",
    testID: "tab-market",
    icon: { off: "shopping-outline", on: "shopping" },
  },
  {
    name: "group",
    title: "동행",
    href: "/group",
    testID: "tab-group",
    icon: { off: "account-multiple-outline", on: "account-multiple" },
  },
  {
    name: "prayer",
    title: "기도",
    href: "/prayer",
    testID: "tab-prayer",
    icon: { off: "hands-pray", on: "hands-pray" },
  },
  {
    name: "life-study",
    title: "삶공부",
    href: "/life-study",
    testID: "tab-life-study",
    icon: {
      off: "book-open-page-variant-outline",
      on: "book-open-page-variant",
    },
  },
] as const satisfies readonly {
  name: string;
  title: string;
  href: "/" | "/market" | "/group" | "/prayer" | "/life-study";
  testID: string;
  icon: { off: IconName; on: IconName };
}[];

type RootTab = (typeof rootTabs)[number];
type TabRoute = BottomTabBarProps["state"]["routes"][number];

const rootTabPaths = new Set<string>(rootTabs.map((tab) => tab.href));

function findRootTab(routeName: string): RootTab | undefined {
  return rootTabs.find((tab) => tab.name === routeName);
}

export default function TabsLayout() {
  const blurTarget = useRef<View | null>(null);

  return (
    <TabBlurTargetContext.Provider value={blurTarget}>
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            const tab = findRootTab(route.name);
            return (
              <MaterialCommunityIcons
                name={tab?.icon.off ?? "circle-outline"}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        {rootTabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{ title: tab.title, tabBarButtonTestID: tab.testID }}
          />
        ))}
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
    </TabBlurTargetContext.Provider>
  );
}

function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentRoute = state.routes[state.index];
  const currentOptions = descriptors[currentRoute.key]?.options;

  if (!rootTabPaths.has(pathname) || !currentOptions?.tabBarButtonTestID) {
    return null;
  }

  const routes = state.routes.filter((route) => {
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
}: Pick<BottomTabBarProps, "state" | "descriptors" | "navigation"> & {
  router: Router;
  routes: TabRoute[];
}) {
  const blurTarget = useTabBlurTarget();
  const reduceMotion = useReducedMotion();
  const [itemWidth, setItemWidth] = useState(0);
  const selectedIndex = routes.findIndex(
    (route) =>
      state.routes.findIndex((item) => item.key === route.key) === state.index,
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
    <>
      <View
        pointerEvents="none"
        style={styles.tabBottomBlurArea}
        testID="tab-bar-bottom-blur-area"
      >
        <GlassBackdrop
          blurTarget={blurTarget ?? undefined}
          intensity={12}
          testID="tab-bar-bottom"
          tintColor={theme.colors.white}
          tintOpacity={0}
        />
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.46)"]}
          locations={[0, 1]}
          pointerEvents="none"
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          testID="tab-bar-bottom-gradient"
        />
      </View>
      <View style={styles.tabShell} testID="tab-bar-shell">
        <View
          style={styles.tabSurface}
          testID="tab-bar-surface"
          onLayout={(event) => {
            const contentWidth = Math.max(
              event.nativeEvent.layout.width - 12,
              0,
            );
            setItemWidth(routes.length > 0 ? contentWidth / routes.length : 0);
          }}
        >
          <GlassBackdrop
            blurTarget={blurTarget ?? undefined}
            testID="tab-bar"
            tintColor={theme.colors.white}
            tintOpacity={0.56}
          />
          <Animated.View
            pointerEvents="none"
            testID="tab-active-indicator"
            style={[styles.tabIndicator, indicatorStyle]}
          />
          {routes.map((route) => {
            const index = state.routes.findIndex(
              (item) => item.key === route.key,
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
                  const tab = findRootTab(route.name);
                  if (tab) {
                    router.replace(tab.href);
                    return;
                  }

                  navigation.navigate(route.name);
                }}
              />
            );
          })}
        </View>
      </View>
    </>
  );
}

function AppTabButton({
  route,
  label,
  focused,
  testID,
  onPress,
}: {
  route: TabRoute;
  label: string;
  focused: boolean;
  testID?: string;
  onPress: () => void;
}) {
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
  const tab = findRootTab(route.name);

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
              ? (tab?.icon.on ?? "circle")
              : (tab?.icon.off ?? "circle-outline")
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
  tabBottomBlurArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
    overflow: "hidden",
  },
  tabShell: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    borderRadius: 999,
    ...theme.shadow.float,
  },
  tabSurface: {
    minHeight: 64,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 6,
    paddingVertical: 7,
    flexDirection: "row",
    overflow: "hidden",
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },
  tabLabel: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: "700",
  },
});
