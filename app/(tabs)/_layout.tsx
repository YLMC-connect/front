import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/text";
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

type IconName = AppIconName;

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
          sceneStyle: { backgroundColor: theme.colors.bg },
          tabBarIcon: ({ color, size }) => {
            const tab = findRootTab(route.name);
            return (
              <AppIcon
                name={tab?.icon.off ?? "circle-outline"}
                size={size}
                color={typeof color === "string" ? color : undefined}
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
      </Tabs>
    </TabBlurTargetContext.Provider>
  );
}

export function AppTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const pathname = usePathname();
  const [lastTabPathname, setLastTabPathname] = useState(pathname);
  if (!pathname.startsWith("/modal/") && pathname !== lastTabPathname) {
    setLastTabPathname(pathname);
  }
  const effectivePathname = pathname.startsWith("/modal/")
    ? lastTabPathname
    : pathname;

  const currentRoute = state.routes[state.index];
  const currentOptions = descriptors[currentRoute.key]?.options;
  const visible =
    rootTabPaths.has(effectivePathname) &&
    Boolean(currentOptions?.tabBarButtonTestID);

  const routes = state.routes.filter((route) => {
    const options = descriptors[route.key]?.options;
    return options?.tabBarButtonTestID;
  });

  if (routes.length === 0) {
    return null;
  }

  return (
    <VisibleTabBar
      state={state}
      descriptors={descriptors}
      navigation={navigation}
      routes={routes}
      visible={visible}
    />
  );
}

function VisibleTabBar({
  state,
  descriptors,
  navigation,
  routes,
  visible,
}: Pick<BottomTabBarProps, "state" | "descriptors" | "navigation"> & {
  routes: TabRoute[];
  visible: boolean;
}) {
  const blurTarget = useTabBlurTarget();
  const reduceMotion = useReducedMotion();
  const [itemWidth, setItemWidth] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<
    Record<string, { x: number; width: number }>
  >({});
  const selectedIndex = routes.findIndex(
    (route) =>
      state.routes.findIndex((item) => item.key === route.key) === state.index,
  );
  const selectedRoute = routes[selectedIndex];
  const activeLayout = selectedRoute ? tabLayouts[selectedRoute.key] : null;

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const visibilityProgress = useSharedValue(visible ? 1 : 0);
  const didMount = useRef(false);

  useEffect(() => {
    const target = visible ? 1 : 0;
    if (reduceMotion) {
      visibilityProgress.value = target;
      return;
    }
    visibilityProgress.value = withTiming(target, {
      duration: 180,
    });
  }, [reduceMotion, visibilityProgress, visible]);

  useEffect(() => {
    const nextIndex = Math.max(selectedIndex, 0);
    const targetX = activeLayout ? activeLayout.x : 6 + nextIndex * itemWidth;
    const targetW = activeLayout ? activeLayout.width : itemWidth;

    if (targetW <= 0) return;

    if (!didMount.current || reduceMotion) {
      indicatorX.value = targetX;
      indicatorWidth.value = targetW;
      didMount.current = true;
      return;
    }

    indicatorX.value = withTiming(targetX, {
      duration: theme.motion.duration.base,
    });
    indicatorWidth.value = withTiming(targetW, {
      duration: theme.motion.duration.base,
    });
  }, [
    activeLayout,
    indicatorWidth,
    indicatorX,
    itemWidth,
    reduceMotion,
    selectedIndex,
  ]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorWidth.value > 0 ? 1 : 0,
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  const shellVisibilityStyle = useAnimatedStyle(() => ({
    opacity: visibilityProgress.value,
    transform: [{ translateY: (1 - visibilityProgress.value) * 20 }],
  }));

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[styles.tabBottomBlurArea, shellVisibilityStyle]}
        testID="tab-bar-bottom-blur-area"
      >
        <GlassBackdrop
          blurTarget={blurTarget ?? undefined}
          intensity={12}
          testID="tab-bar-bottom"
          tintColor={theme.colors.onPrimary}
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
      </Animated.View>
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[styles.tabShell, shellVisibilityStyle]}
        testID="tab-bar-shell"
      >
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
            tintColor={theme.colors.bg}
            tintOpacity={0.88}
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
                onLayout={(e) => {
                  const { x, width } = e.nativeEvent.layout;
                  setTabLayouts((prev) => {
                    if (
                      prev[route.key]?.x === x &&
                      prev[route.key]?.width === width
                    ) {
                      return prev;
                    }
                    return { ...prev, [route.key]: { x, width } };
                  });
                }}
                onPress={() => {
                  // 기본 탭 바와 같은 흐름: tabPress 를 보내면 이미 보고 있는 탭은
                  // 맨 위로 스크롤(useScrollToTop)되고, 다른 탭은 떠날 때 상태 그대로 연다.
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (focused || event.defaultPrevented) return;
                  navigation.navigate(route.name, route.params);
                }}
              />
            );
          })}
        </View>
      </Animated.View>
    </>
  );
}

function AppTabButton({
  route,
  label,
  focused,
  testID,
  onPress,
  onLayout,
}: {
  route: TabRoute;
  label: string;
  focused: boolean;
  testID?: string;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const reduceMotion = useReducedMotion();
  const iconScale = useSharedValue(1);
  const didMount = useRef(false);
  const color = focused ? theme.colors.primaryStrong : theme.colors.textMuted;

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
      onLayout={onLayout}
      onPress={onPress}
      style={styles.tabItem}
    >
      <Animated.View style={iconStyle}>
        <AppIcon
          name={
            focused
              ? (tab?.icon.on ?? "circle")
              : (tab?.icon.off ?? "circle-outline")
          }
          size={20}
          color={color}
          weight={focused ? "bold" : "linear"}
        />
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          { color },
          focused ? styles.tabLabelFocused : null,
          label.length >= 3 ? styles.tabLabelCompact : null,
        ]}
      >
        {label}
      </Text>
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
    borderRadius: theme.size.tabbarHeight / 2,
    ...theme.shadow.md,
  },
  tabSurface: {
    minHeight: theme.size.tabbarHeight,
    borderRadius: theme.size.tabbarHeight / 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    left: 0,
    top: 7,
    bottom: 7,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySubtle,
  },
  tabLabel: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.medium,
  },
  tabLabelFocused: {
    fontWeight: theme.fontWeight.bold,
  },
  tabLabelCompact: {
    letterSpacing: -0.3,
  },
});
