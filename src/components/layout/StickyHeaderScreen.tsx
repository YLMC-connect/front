import { BlurTargetView } from "expo-blur";
import { useRef, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCREEN_HEADER_HEIGHT, ScreenHeader } from "../ui/screen-header";
import { Screen } from "./Screen";

export function StickyHeaderScreen({
  title,
  subtitle,
  right,
  children,
  overlay,
  contentContainerStyle,
  testID,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  overlay?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID: string;
}) {
  const blurTarget = useRef<View | null>(null);
  const insets = useSafeAreaInsets();
  const topInset = insets.top;

  return (
    <Screen applyTopInset={false} scroll={false} padded={false} testID={testID}>
      <View style={styles.root}>
        <BlurTargetView ref={blurTarget} style={styles.target}>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              contentContainerStyle,
              { paddingTop: SCREEN_HEADER_HEIGHT + topInset },
            ]}
            testID={`${testID}-scroll`}
          >
            {children}
          </ScrollView>
          {overlay}
        </BlurTargetView>
        <ScreenHeader
          blurTarget={blurTarget}
          right={right}
          subtitle={subtitle}
          title={title}
          topInset={topInset}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  target: {
    flex: 1,
  },
  content: {
    paddingTop: SCREEN_HEADER_HEIGHT,
  },
});
