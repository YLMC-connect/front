import { useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { theme } from "../../constants/theme";
import { useMotionPresence } from "./motion";

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
  const { mounted, progress } = useMotionPresence(visible);
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [theme.motion.distance.sm, 0],
        ),
      },
      { scale: interpolate(progress.value, [0, 1], [0.96, 1]) },
    ],
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
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={[styles.dialogButton, styles.dialogCancelButton]}
            >
              <Text style={styles.dialogCancelText}>{cancelText}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={[
                styles.dialogButton,
                danger ? styles.dialogDangerButton : styles.dialogConfirmButton,
              ]}
            >
              <Text style={styles.dialogConfirmText}>{confirmText}</Text>
            </Pressable>
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
  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
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
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
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
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={[styles.sheetFooterButton, styles.sheetCancelButton]}
            >
              <Text style={styles.sheetCancelText}>취소</Text>
            </Pressable>
          </View>
          <View style={styles.sheetAction}>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              disabled={confirmDisabled}
              style={[
                styles.sheetFooterButton,
                danger ? styles.sheetDangerButton : styles.sheetConfirmButton,
                confirmDisabled ? styles.sheetFooterButtonDisabled : null,
              ]}
            >
              <Text style={styles.sheetConfirmText}>{confirmText}</Text>
            </Pressable>
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
              <View
                style={[
                  styles.radioMark,
                  compact ? styles.radioMarkCompact : null,
                  selected ? styles.radioMarkSelected : null,
                ]}
              >
                {selected ? (
                  <View
                    style={[
                      styles.radioDot,
                      compact ? styles.radioDotCompact : null,
                    ]}
                  />
                ) : null}
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
  dialogButton: {
    flex: 1,
    height: theme.size.inputHeight,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogCancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderButton,
  },
  dialogConfirmButton: { backgroundColor: theme.colors.primary },
  dialogDangerButton: { backgroundColor: theme.colors.dangerBold },
  dialogCancelText: {
    ...theme.typography.label,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  dialogConfirmText: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
    fontWeight: theme.fontWeight.semibold,
  },
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
  sheetFooterButton: {
    height: theme.size.inputHeight,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderButton,
  },
  sheetConfirmButton: {
    backgroundColor: theme.colors.primary,
  },
  sheetDangerButton: {
    backgroundColor: theme.colors.dangerBold,
  },
  sheetFooterButtonDisabled: { backgroundColor: theme.colors.surfaceSubtle },
  sheetCancelText: {
    ...theme.typography.label,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  sheetConfirmText: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
    fontWeight: theme.fontWeight.semibold,
  },
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
  radioMark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioMarkCompact: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  radioMarkSelected: {
    borderWidth: 0,
    backgroundColor: theme.colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.onPrimary,
  },
  radioDotCompact: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
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
