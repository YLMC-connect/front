import { useEffect, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { Button } from "./buttons";
import { Radio } from "./checkbox";
import { motionEasing, motionExitDuration, useMotionPresence } from "./motion";

export function ConfirmDialog({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = "확인",
  cancelText = "취소",
  danger = false,
}: {
  visible: boolean;
  title: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}) {
  // 배경이 먼저 어두워지고(progress), 패널은 목록 간격(60ms) 뒤 4% 작은 크기에서 커진다.
  const { mounted, progress, reduceMotion } = useMotionPresence(visible);
  const panelProgress = useSharedValue(0);
  useEffect(() => {
    const duration = theme.motion.duration.base;
    if (reduceMotion) {
      panelProgress.value = visible ? 1 : 0;
      return;
    }
    panelProgress.value = visible
      ? withDelay(
          theme.motion.stagger,
          withTiming(1, { duration, easing: motionEasing.standard }),
        )
      : withTiming(0, {
          duration: motionExitDuration(duration),
          easing: motionEasing.exit,
        });
  }, [panelProgress, reduceMotion, visible]);
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: panelProgress.value,
    transform: [{ scale: interpolate(panelProgress.value, [0, 1], [0.96, 1]) }],
  }));

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.modalBackdrop, backdropStyle]}
        />
        <Animated.View
          testID="confirm-dialog-panel"
          style={[styles.dialog, panelStyle]}
        >
          <Text lineBreakStrategyIOS="hangul-word" style={styles.dialogTitle}>
            {title}
          </Text>
          {message ? (
            <Text lineBreakStrategyIOS="hangul-word" style={styles.dialogText}>
              {message}
            </Text>
          ) : null}
          <View style={styles.dialogActions}>
            <View style={styles.dialogAction}>
              <Button variant="outline" size="dialog" onPress={onCancel}>
                {cancelText}
              </Button>
            </View>
            <View style={styles.dialogAction}>
              <Button
                variant={danger ? "danger" : "primary"}
                size="dialog"
                onPress={onConfirm}
              >
                {confirmText}
              </Button>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function BottomSheet({
  visible,
  title,
  children,
  footer,
  onClose,
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  const [sheetMeasured, setSheetMeasured] = useState(false);
  const sheetHeight = useSharedValue(0);
  const { mounted, progress } = useMotionPresence(visible, {
    enterReady: sheetMeasured,
  });
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  // 패널은 투명도 없이 바닥에서 올라온다. 높이를 재기 전 첫 화면에만 숨겨 제자리 깜빡임을 막는다.
  const panelStyle = useAnimatedStyle(() => ({
    opacity: sheetHeight.value > 0 ? 1 : 0,
    transform: [
      {
        translateY:
          (1 - progress.value) *
          Math.max(sheetHeight.value, theme.motion.distance.sm),
      },
    ],
  }));

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.sheetBackdrop, backdropStyle]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="닫기"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <Animated.View
          testID="bottom-sheet-panel"
          onLayout={(event) => {
            sheetHeight.value = event.nativeEvent.layout.height;
            if (!sheetMeasured) setSheetMeasured(true);
          }}
          style={[styles.sheet, panelStyle]}
        >
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <View style={styles.sheetContent}>{children}</View>
          {footer ? <View style={styles.sheetFooter}>{footer}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

export function RadioSheet({
  visible,
  title,
  options,
  value,
  hint,
  confirmText = "확인",
  danger = false,
  children,
  onClose,
  onConfirm,
  onValueChange,
  confirmDisabled = false,
}: {
  visible: boolean;
  title: string;
  options: readonly {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }[];
  value: string;
  hint?: string;
  confirmText?: string;
  danger?: boolean;
  children?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  onValueChange?: (value: string) => void;
  confirmDisabled?: boolean;
}) {
  const compact = options.length > 5;

  return (
    <BottomSheet
      visible={visible}
      title={title}
      onClose={onClose}
      footer={
        <>
          <View style={styles.sheetAction}>
            <Button variant="outline" onPress={onClose}>
              취소
            </Button>
          </View>
          <View style={styles.sheetAction}>
            <Button
              variant={danger ? "danger" : "primary"}
              onPress={onConfirm}
              disabled={confirmDisabled}
            >
              {confirmText}
            </Button>
          </View>
        </>
      }
    >
      <View style={styles.radioList}>
        {options.map((option, index) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole={onValueChange ? "radio" : undefined}
              accessibilityState={{
                selected,
                disabled: option.disabled,
              }}
              onPress={
                onValueChange && !option.disabled
                  ? () => onValueChange(option.value)
                  : undefined
              }
              style={[
                styles.radioOption,
                compact ? styles.radioOptionCompact : null,
                index === options.length - 1 ? styles.radioOptionLast : null,
                option.disabled ? styles.radioOptionDisabled : null,
              ]}
            >
              {/* 표시만 공통 Radio 로 그린다. 누름·낭독은 바깥 행이 맡는다. */}
              <View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <Radio checked={selected} style={styles.radioMark} />
              </View>
              <View style={styles.radioTextWrap}>
                <Text
                  style={[
                    styles.radioLabel,
                    compact ? styles.radioLabelCompact : null,
                    selected ? styles.radioLabelSelected : null,
                  ]}
                >
                  {option.label}
                </Text>
                {option.description ? (
                  <Text style={styles.radioDescription}>
                    {option.description}
                  </Text>
                ) : null}
              </View>
              {option.disabled ? (
                <Text style={styles.radioMeta}>현재 상태</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {children}
      {hint ? (
        <View
          style={[styles.radioHint, danger ? styles.radioHintDanger : null]}
        >
          <Text
            style={[
              styles.radioHintText,
              danger ? styles.radioHintDangerText : null,
            ]}
          >
            {hint}
          </Text>
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  modalBackdrop: {
    backgroundColor: theme.colors.sheetOverlay,
  },
  dialog: {
    width: "100%",
    maxWidth: 280,
    borderRadius: theme.radius.lg,
    paddingTop: theme.spacing["6"],
    paddingHorizontal: theme.spacing["5"],
    paddingBottom: theme.spacing["5"],
    backgroundColor: theme.colors.surface,
    ...theme.shadow.lg,
  },
  dialogTitle: {
    ...theme.typography.heading,
    textAlign: "center",
    color: theme.colors.text,
  },
  dialogText: {
    ...theme.typography.label,
    marginTop: theme.spacing["2"],
    textAlign: "center",
    color: theme.colors.textMuted,
    fontWeight: theme.fontWeight.regular,
    lineHeight: 22,
  },
  dialogActions: {
    alignSelf: "stretch",
    marginTop: theme.spacing["6"],
    flexDirection: "row",
    gap: theme.spacing["2"],
  },
  dialogAction: { flex: 1 },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    backgroundColor: theme.colors.sheetOverlay,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    maxHeight: "90%",
    paddingTop: theme.spacing["2"],
    paddingHorizontal: 0,
    paddingBottom: 0,
    ...theme.shadow.sheet,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
  },
  sheetTitle: {
    ...theme.typography.heading,
    paddingHorizontal: theme.spacing["5"],
    paddingTop: theme.spacing["2"],
    paddingBottom: theme.spacing["4"],
    color: theme.colors.text,
  },
  sheetContent: {
    gap: theme.spacing["3"],
    paddingHorizontal: theme.spacing["5"],
    paddingBottom: theme.spacing["2"],
  },
  sheetFooter: {
    paddingTop: theme.spacing["3"],
    paddingHorizontal: theme.spacing["5"],
    paddingBottom: theme.spacing["6"],
    flexDirection: "row",
    gap: 8,
  },
  sheetAction: { flex: 1 },
  radioList: {},
  radioOption: {
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioOptionCompact: {
    minHeight: 44,
    paddingVertical: 12,
  },
  radioOptionLast: { borderBottomWidth: 0 },
  radioOptionDisabled: { opacity: 0.45 },
  // 공통 Radio 줄 높이(44)를 빼고 표시(22)만 남긴다.
  radioMark: { minHeight: 0 },
  radioTextWrap: { flex: 1, minWidth: 0 },
  radioLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  radioLabelCompact: {
    ...theme.typography.label,
  },
  radioLabelSelected: { fontWeight: theme.fontWeight.bold },
  radioDescription: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  radioMeta: { ...theme.typography.caption, color: theme.colors.textMuted },
  radioHint: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  radioHintText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  radioHintDanger: {
    backgroundColor: theme.colors.dangerSubtle,
  },
  radioHintDangerText: {
    color: theme.colors.dangerText,
  },
});
