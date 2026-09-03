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
          <Text style={styles.dialogTitle}>{title}</Text>
          {message ? <Text style={styles.dialogText}>{message}</Text> : null}
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
    backgroundColor: theme.colors.overlay,
  },
  dialog: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 18,
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.dialog,
  },
  dialogTitle: {
    textAlign: "center",
    color: theme.colors.ink,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.lg,
    lineHeight: theme.lineHeight.lg,
  },
  dialogText: {
    marginTop: 8,
    textAlign: "center",
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.body,
  },
  dialogActions: {
    alignSelf: "stretch",
    marginTop: 22,
    flexDirection: "row",
    gap: 8,
  },
  dialogButton: {
    flex: 1,
    height: 44,
    borderRadius: theme.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogCancelButton: { backgroundColor: theme.colors.surface2 },
  dialogConfirmButton: { backgroundColor: theme.colors.primary },
  dialogDangerButton: { backgroundColor: theme.colors.danger },
  dialogCancelText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  dialogConfirmText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    backgroundColor: theme.colors.sheetOverlay,
  },
  sheet: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 10,
    paddingHorizontal: 0,
    paddingBottom: 0,
    ...theme.shadow.sheet,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.lineStrong,
    alignSelf: "center",
  },
  sheetTitle: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 16,
    fontSize: 17,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.ink,
  },
  sheetContent: { gap: 12, paddingHorizontal: 22, paddingBottom: 8 },
  sheetFooter: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 22,
    flexDirection: "row",
    gap: 8,
  },
  sheetAction: { flex: 1 },
  sheetFooterButton: {
    height: 48,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCancelButton: {
    backgroundColor: theme.colors.surface,
  },
  sheetConfirmButton: {
    backgroundColor: theme.colors.primary,
  },
  sheetDangerButton: {
    backgroundColor: theme.colors.danger,
  },
  sheetFooterButtonDisabled: { opacity: 0.45 },
  sheetCancelText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  sheetConfirmText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  radioList: {},
  radioOption: {
    minHeight: 48,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
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
    borderColor: theme.colors.lineStrong,
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
    backgroundColor: "#fff",
  },
  radioDotCompact: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  radioTextWrap: { flex: 1, minWidth: 0 },
  radioLabel: {
    color: theme.colors.ink,
    fontSize: 14.5,
    fontWeight: theme.fontWeight.medium,
  },
  radioLabelCompact: {
    fontSize: theme.fontSize.md,
  },
  radioLabelSelected: { fontWeight: theme.fontWeight.bold },
  radioDescription: { color: theme.colors.inkMute, marginTop: 2, fontSize: 12 },
  radioMeta: { color: theme.colors.inkMute, fontSize: 12 },
  radioHint: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  radioHintText: {
    color: theme.colors.inkMute,
    fontSize: 12,
    lineHeight: 18,
  },
  radioHintDanger: {
    backgroundColor: "rgba(217,131,92,0.10)",
  },
  radioHintDangerText: {
    color: "#A8643F",
  },
});
