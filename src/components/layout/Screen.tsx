import { useEffect, useRef, type ReactNode } from "react";
import { useNavigation, usePathname } from "expo-router";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { SCREEN_HEADER_VERTICAL_PADDING } from "../ui/screen-header";

const rootTabPaths = new Set([
  "/",
  "/market",
  "/group",
  "/prayer",
  "/life-study",
]);
export function Screen({
  children,
  scroll = true,
  padded = true,
  applyTopInset = true,
  resetScrollOnFocus = true,
  backgroundColor,
  style,
  testID,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  applyTopInset?: boolean;
  resetScrollOnFocus?: boolean;
  /** Override default canvas bg (e.g. white home sheet to tab bar). */
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const pathname = usePathname();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView | null>(null);
  const insets = useSafeAreaInsets();
  const contentStyle = rootTabPaths.has(pathname)
    ? styles.contentWithTab
    : styles.content;

  useEffect(() => {
    if (!resetScrollOnFocus || !scroll) return;
    const unsubscribe = navigation?.addListener?.("focus", () => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
    return unsubscribe;
  }, [navigation, resetScrollOnFocus, scroll]);

  return (
    <View
      testID={testID}
      style={[
        styles.safe,
        backgroundColor ? { backgroundColor } : null,
        applyTopInset
          ? { paddingTop: insets.top + SCREEN_HEADER_VERTICAL_PADDING }
          : null,
        style,
      ]}
    >
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            contentStyle,
            padded ? styles.padded : null,
          ]}
        >
          <Pressable
            accessible={false}
            onPress={Keyboard.dismiss}
            style={styles.fill}
          >
            {children}
          </Pressable>
        </ScrollView>
      ) : (
        <Pressable
          accessible={false}
          onPress={Keyboard.dismiss}
          style={[styles.fill, padded ? styles.padded : null]}
        >
          {children}
        </Pressable>
      )}
    </View>
  );
}

export function Section({
  title,
  children,
  trailing,
}: {
  title: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {trailing}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { paddingBottom: 28 },
  contentWithTab: { paddingBottom: 100 },
  padded: { paddingHorizontal: 18, gap: 16 },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontWeight: theme.fontWeight.bold,
    fontSize: 15,
  },
});
