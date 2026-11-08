import { useRef, useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { theme } from "../../constants/theme";
import { MotionFadeIn } from "./motion";
import { Text } from "./text";

const MAX_WIDTH = 240;
const GAP = 4;

/**
 * 디자인 시스템 Tooltip(말풍선 안내). 감싼 대상을 누르면 아래 4px 에 떠오르고,
 * 다른 곳을 누르면 사라진다. 흰 `surface` + 1px `border`, `radius-sm`, `shadow-md`,
 * 안쪽 8×12, 글자 12/18, 최대 폭 240, 두 줄까지. 중요한 설명은 화면 글자로도 함께 적는다.
 */
export function Tooltip({
  text,
  children,
  testID = "tooltip",
}: {
  text: string;
  children: ReactNode;
  testID?: string;
}) {
  const triggerRef = useRef<View>(null);
  const { width: screenWidth } = useWindowDimensions();
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const left = Math.min(
        Math.max(x + width / 2 - MAX_WIDTH / 2, theme.layout.screenX),
        screenWidth - MAX_WIDTH - theme.layout.screenX,
      );
      setAnchor({ x: left, y: y + height + GAP });
    });
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        accessibilityHint={text}
        onPress={open}
        testID={`${testID}-trigger`}
      >
        {children}
      </Pressable>
      <Modal
        animationType="none"
        onRequestClose={() => setAnchor(null)}
        transparent
        visible={anchor !== null}
      >
        <Pressable
          accessibilityLabel="닫기"
          onPress={() => setAnchor(null)}
          style={StyleSheet.absoluteFill}
          testID={`${testID}-backdrop`}
        >
          {anchor ? (
            <MotionFadeIn
              style={[styles.bubble, { left: anchor.x, top: anchor.y }]}
              testID={testID}
            >
              <Text numberOfLines={2} style={styles.text}>
                {text}
              </Text>
            </MotionFadeIn>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    maxWidth: MAX_WIDTH,
    paddingVertical: theme.spacing["2"],
    paddingHorizontal: theme.spacing["3"],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.md,
  },
  text: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
});
