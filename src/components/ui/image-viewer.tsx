import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { AppIcon } from "./app-icon";
import { Text } from "./text";

/** 아래로 이만큼 끌었다 놓으면 닫는다. */
const DISMISS_DRAG = 80;

/**
 * 디자인 시스템 ImageViewer. 사진을 화면 전체에서 크게 본다.
 * 어두운(`text`) 바탕, 오른쪽 위 닫기 44, 여러 장이면 아래 가운데 "2 / 5".
 * 두 손가락으로 넓히면 확대(iOS ScrollView 확대), 옆으로 밀면 다음 사진,
 * 확대하지 않은 상태에서 아래로 끌어 놓거나 닫기로 닫는다.
 * 여는 움직임은 페이드(동작 줄이기 설정이면 바로)로 대신한다.
 */
export function ImageViewer({
  visible,
  images,
  initialIndex = 0,
  onClose,
  testID = "image-viewer",
}: {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setIndex(initialIndex);
  }

  const onPageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index && next >= 0 && next < images.length) setIndex(next);
  };

  const onZoomDragEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, zoomScale } = event.nativeEvent;
    if ((zoomScale ?? 1) <= 1 && contentOffset.y < -DISMISS_DRAG) onClose();
  };

  return (
    <Modal
      animationType={reduceMotion ? "none" : "fade"}
      onRequestClose={onClose}
      statusBarTranslucent
      transparent={false}
      visible={visible}
    >
      <StatusBar style="light" />
      <View style={styles.root} testID={testID}>
        <ScrollView
          contentOffset={{ x: initialIndex * width, y: 0 }}
          horizontal
          onScroll={onPageScroll}
          pagingEnabled
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          testID={`${testID}-pager`}
        >
          {images.map((uri, imageIndex) => (
            <ScrollView
              key={`${uri}-${imageIndex}`}
              alwaysBounceVertical
              centerContent
              contentContainerStyle={styles.page}
              maximumZoomScale={3}
              minimumZoomScale={1}
              onScrollEndDrag={onZoomDragEnd}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={{ width, height }}
            >
              <Image
                accessibilityIgnoresInvertColors
                accessibilityLabel={`사진 ${imageIndex + 1}/${images.length}`}
                contentFit="contain"
                source={{ uri }}
                style={{ width, height }}
              />
            </ScrollView>
          ))}
        </ScrollView>

        <Pressable
          accessibilityLabel="닫기"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
          style={[
            styles.close,
            { top: Math.max(insets.top, theme.size.safeTop) },
          ]}
          testID={`${testID}-close`}
        >
          <AppIcon name="close" size={24} color={theme.colors.onPrimary} />
        </Pressable>

        {images.length > 1 ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[
              styles.counter,
              { bottom: Math.max(insets.bottom, theme.spacing["8"]) },
            ]}
            testID={`${testID}-counter`}
          >
            {`${index + 1} / ${images.length}`}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.text,
  },
  page: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  close: {
    position: "absolute",
    right: theme.spacing["3"],
    width: theme.size.buttonHeightSm,
    height: theme.size.buttonHeightSm,
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    ...theme.typography.label,
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    color: theme.colors.onPrimary,
  },
});
