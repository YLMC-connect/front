import { useEffect, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { AppIcon } from "./app-icon";
import { AppText } from "./app-text";

/** 체크·라디오 표시 크기(디자인 시스템 Checkbox). */
const MARK_SIZE = 22;
const MARK_BORDER = 1.5;
const RADIO_DOT = 10;

type MarkVariant = "checkbox" | "radio";

/**
 * 22px 체크·라디오 표시. 선택되면 채움 층이 duration 동안 나타나고
 * 체크·점이 커지며 그려진다. 동작 줄이기 설정이면 바로 바뀐다.
 */
function SelectionMark({
  variant,
  checked,
  disabled,
  duration,
  testID,
}: {
  variant: MarkVariant;
  checked: boolean;
  disabled?: boolean;
  duration: number;
  testID?: string;
}) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    const target = checked ? 1 : 0;
    progress.value = reduceMotion ? target : withTiming(target, { duration });
  }, [checked, duration, progress, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.5 + progress.value * 0.5 }],
  }));

  const isRadio = variant === "radio";

  return (
    <View
      testID={testID}
      style={[
        styles.mark,
        isRadio ? styles.markRadio : null,
        disabled ? styles.markDisabled : null,
      ]}
    >
      <Animated.View
        testID={testID ? `${testID}-fill` : undefined}
        style={[
          styles.fill,
          isRadio ? styles.fillRadio : styles.fillCheckbox,
          fillStyle,
        ]}
      >
        <Animated.View style={markStyle}>
          {isRadio ? (
            <View style={styles.radioDot} />
          ) : (
            <AppIcon
              name="check"
              size={16}
              strokeWidth={2.5}
              color={theme.colors.onPrimary}
            />
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/** 행을 직접 그리는 곳(약관 동의처럼 줄 안에 링크가 있는 곳)에서 쓰는 22px 네모 체크 표시만. */
export function CheckboxMark({
  checked,
  testID,
}: {
  checked: boolean;
  testID?: string;
}) {
  return (
    <SelectionMark
      variant="checkbox"
      checked={checked}
      duration={theme.motion.duration.fast}
      testID={testID}
    />
  );
}

export type CheckboxProps = {
  checked: boolean;
  /** 눌리면 바뀔 값을 받는다. radio 는 항상 true 를 받는다. */
  onChange?: (next: boolean) => void;
  label?: ReactNode;
  /** checkbox: 여러 개 고르기. radio: 작은 라디오(하나만 고르기). */
  variant?: MarkVariant;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * 체크박스·작은 라디오 한 줄(디자인 시스템 Checkbox). 줄 전체가 눌린다.
 * 표시 22, 줄 높이 44 이상, 글자 16/400, 간격 12, 바뀔 때 120ms.
 */
export function Checkbox({
  checked,
  onChange,
  label,
  variant = "checkbox",
  disabled = false,
  accessibilityLabel,
  testID,
  style,
}: CheckboxProps) {
  const isRadio = variant === "radio";

  return (
    <Pressable
      testID={testID}
      accessibilityRole={isRadio ? "radio" : "checkbox"}
      accessibilityLabel={
        accessibilityLabel ?? (typeof label === "string" ? label : undefined)
      }
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange?.(isRadio ? true : !checked)}
      style={[styles.row, disabled ? styles.rowDisabled : null, style]}
    >
      <SelectionMark
        variant={variant}
        checked={checked}
        disabled={disabled}
        duration={theme.motion.duration.fast}
        testID={testID ? `${testID}-mark` : undefined}
      />
      {label != null ? (
        typeof label === "string" ? (
          <AppText variant="body" style={styles.label}>
            {label}
          </AppText>
        ) : (
          <View style={styles.labelSlot}>{label}</View>
        )
      ) : null}
    </Pressable>
  );
}

/** 작은 라디오. Checkbox variant="radio" 와 같다. */
export function Radio(props: Omit<CheckboxProps, "variant">) {
  return <Checkbox {...props} variant="radio" />;
}

export type RadioRowProps = {
  label: string;
  description?: string;
  selected: boolean;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * 하나만 고르는 큰 옵션 행(디자인 시스템 Radio). 높이 54, radius.sm,
 * surface + 1px border, 오른쪽 라디오 원 22. 선택되면 infoSubtle 바탕 +
 * 2px primary 테두리 + 16/700 primaryStrong 이 200ms 동안 나타난다.
 */
export function RadioRow({
  label,
  description,
  selected,
  onPress,
  disabled = false,
  accessibilityLabel,
  testID,
  style,
}: RadioRowProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    const target = selected ? 1 : 0;
    progress.value = reduceMotion
      ? target
      : withTiming(target, { duration: theme.motion.duration.base });
  }, [progress, reduceMotion, selected]);

  const selectedLayerStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={
        accessibilityLabel ?? (description ? `${label}, ${description}` : label)
      }
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[optionStyles.row, disabled ? styles.rowDisabled : null, style]}
    >
      <Animated.View
        pointerEvents="none"
        testID={testID ? `${testID}-selected-layer` : undefined}
        style={[optionStyles.selectedLayer, selectedLayerStyle]}
      />
      <View style={optionStyles.texts}>
        <AppText
          variant="body"
          weight={selected ? "bold" : "medium"}
          tone={selected ? "brand" : "primary"}
        >
          {label}
        </AppText>
        {description ? (
          <AppText variant="label" weight="regular" tone="muted">
            {description}
          </AppText>
        ) : null}
      </View>
      <SelectionMark
        variant="radio"
        checked={selected}
        disabled={disabled}
        duration={theme.motion.duration.base}
        testID={testID ? `${testID}-mark` : undefined}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: theme.layout.touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["3"],
  },
  rowDisabled: { opacity: theme.opacity.disabled },
  label: { flexShrink: 1 },
  labelSlot: { flexShrink: 1 },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    borderRadius: 6,
    borderWidth: MARK_BORDER,
    borderColor: theme.colors.borderButton,
    backgroundColor: theme.colors.surface,
  },
  markRadio: { borderRadius: MARK_SIZE / 2 },
  markDisabled: { backgroundColor: theme.colors.surfaceSubtle },
  // 바깥 테두리까지 덮도록 테두리 두께만큼 밖으로 편다.
  fill: {
    position: "absolute",
    top: -MARK_BORDER,
    left: -MARK_BORDER,
    right: -MARK_BORDER,
    bottom: -MARK_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  fillCheckbox: {
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  fillRadio: {
    borderRadius: MARK_SIZE / 2,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  radioDot: {
    width: RADIO_DOT,
    height: RADIO_DOT,
    borderRadius: RADIO_DOT / 2,
    backgroundColor: theme.colors.primary,
  },
});

const optionStyles = StyleSheet.create({
  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["3"],
    paddingHorizontal: theme.spacing["4"],
    paddingVertical: theme.spacing["3"],
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderButton,
    backgroundColor: theme.colors.surface,
  },
  // 바깥 1px 테두리까지 덮어 선택 테두리 2px 를 그린다(글자 자리는 움직이지 않음).
  selectedLayer: {
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.infoSubtle,
  },
  texts: { flex: 1, gap: 2 },
});
