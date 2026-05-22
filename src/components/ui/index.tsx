import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  type DimensionValue,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "../../constants/theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

export function Button({
  children,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon,
}: {
  children: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "soft" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
}) {
  const style = [
    styles.button,
    variant === "primary" && styles.buttonPrimary,
    variant === "soft" && styles.buttonSoft,
    variant === "ghost" && styles.buttonGhost,
    variant === "danger" && styles.buttonDanger,
    disabled && styles.disabled,
  ];
  const textStyle = [
    styles.buttonText,
    (variant === "soft" || variant === "ghost") && styles.buttonTextSoft,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        style,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? "#fff"
              : theme.colors.primaryDeep
          }
        />
      ) : (
        <>
          {icon ? (
            <MaterialIcons
              name={icon}
              size={20}
              color={
                variant === "primary" || variant === "danger"
                  ? "#fff"
                  : theme.colors.primaryDeep
              }
            />
          ) : null}
          <Text style={textStyle}>{children}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "mute" | "warn" | "danger" | "success";
}) {
  return (
    <View style={[styles.badge, badgeToneStyles[tone]]}>
      <Text
        style={[
          styles.badgeText,
          tone === "mute" ? styles.badgeTextMute : null,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const initial = name.trim().slice(0, 1) || "?";
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.42 }]}>
        {initial}
      </Text>
    </View>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  keyboardType,
}: {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
}) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inkHint}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Textarea({
  label,
  value,
  onChangeText,
  placeholder,
  error,
}: {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inkHint}
        style={[
          styles.input,
          styles.textarea,
          error ? styles.inputError : null,
        ]}
        textAlignVertical="top"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : null]}
    >
      <Text
        style={[styles.chipText, selected ? styles.chipTextSelected : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SegmentedTabs<T extends string>({
  items,
  active,
  onChange,
}: {
  items: readonly { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text
              style={[
                styles.segmentText,
                selected && styles.segmentTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TopBar({
  title,
  subtitle,
  back,
  right,
  onBack,
  testID,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  onBack?: () => void;
  testID?: string;
}) {
  return (
    <View testID={testID} style={styles.topBar}>
      <View style={styles.topTitleWrap}>
        {back ? (
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={styles.backButton}
          >
            <MaterialIcons
              name="chevron-left"
              size={26}
              color={theme.colors.inkSoft}
            />
          </Pressable>
        ) : null}
        <View style={styles.topTextWrap}>
          <Text style={styles.topTitle}>{title}</Text>
          {subtitle ? <Text style={styles.topSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right}
    </View>
  );
}

export function TabBar() {
  return null;
}

export function EmptyState({
  title,
  description,
  icon = "inbox",
}: {
  title: string;
  description?: string;
  icon?: IconName;
}) {
  return (
    <View style={styles.state}>
      <View style={styles.stateIcon}>
        <MaterialIcons name={icon} size={42} color={theme.colors.inkHint} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {description ? <Text style={styles.stateText}>{description}</Text> : null}
    </View>
  );
}

export function ErrorState({
  message = "잠시 후 다시 시도해주세요.",
}: {
  message?: string;
}) {
  return (
    <EmptyState
      title="불러오지 못했습니다"
      description={message}
      icon="error-outline"
    />
  );
}

export function Skeleton({
  height = 18,
  width = "100%",
}: {
  height?: number;
  width?: DimensionValue;
}) {
  return <View style={[styles.skeleton, { height, width }]} />;
}

export function Toast({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View style={styles.toast}>
      <MaterialIcons name="check" size={18} color="#fff" />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

export function ConfirmDialog({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = "확인",
}: {
  visible: boolean;
  title: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>{title}</Text>
          {message ? <Text style={styles.dialogText}>{message}</Text> : null}
          <View style={styles.dialogActions}>
            <Button variant="soft" onPress={onCancel}>
              취소
            </Button>
            <Button onPress={onConfirm}>{confirmText}</Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function BottomSheet({
  visible,
  title,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function ImagePickerField({
  label = "사진",
  value = [],
  onChange,
  maxImages = 5,
  error,
}: {
  label?: string;
  value?: string[];
  onChange?: (uris: string[]) => void;
  maxImages?: number;
  error?: string;
}) {
  const canAdd = value.length < maxImages;

  const pickImages = async () => {
    if (!canAdd) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "사진 접근 권한이 필요합니다",
        "사진을 첨부하려면 갤러리 접근을 허용해주세요.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: maxImages > 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      selectionLimit: Math.max(1, maxImages - value.length),
    });

    if (result.canceled) return;

    const selected = result.assets.map((asset) => asset.uri).filter(Boolean);
    onChange?.([...value, ...selected].slice(0, maxImages));
  };

  const removeImage = (uri: string) => {
    onChange?.(value.filter((item) => item !== uri));
  };

  return (
    <View style={styles.imagePickerWrap}>
      <Pressable
        accessibilityRole="button"
        disabled={!canAdd}
        onPress={pickImages}
        style={[styles.imagePicker, !canAdd && styles.disabled]}
      >
        <MaterialIcons
          name="add-photo-alternate"
          size={28}
          color={theme.colors.primaryDeep}
        />
        <Text style={styles.imagePickerText}>{label} 추가</Text>
        <Text style={styles.imagePickerHint}>
          최대 {maxImages}장까지 선택할 수 있습니다.
        </Text>
      </Pressable>
      {value.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagePreviewList}
        >
          {value.map((uri) => (
            <View key={uri} style={styles.imagePreviewItem}>
              <Image
                source={{ uri }}
                style={styles.imagePreview}
                contentFit="cover"
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => removeImage(uri)}
                style={styles.imageRemoveButton}
              >
                <MaterialIcons name="close" size={16} color="#fff" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function HorizontalChips<T extends string>({
  items,
  active,
  onChange,
}: {
  items: readonly { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalChips}
    >
      {items.map((item) => (
        <Chip
          key={item.key}
          label={item.label}
          selected={active === item.key}
          onPress={() => onChange(item.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonPrimary: { backgroundColor: theme.colors.primary },
  buttonSoft: { backgroundColor: theme.colors.primarySoft },
  buttonGhost: { backgroundColor: "transparent" },
  buttonDanger: { backgroundColor: theme.colors.danger },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  buttonTextSoft: { color: theme.colors.primaryDeep },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badge_primary: { backgroundColor: theme.colors.primarySoft },
  badge_mute: { backgroundColor: theme.colors.surface2 },
  badge_warn: { backgroundColor: theme.colors.amberSoft },
  badge_danger: { backgroundColor: "#FDF4F1" },
  badge_success: { backgroundColor: "#EFF7EC" },
  badgeText: {
    color: theme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: "800",
  },
  badgeTextMute: { color: theme.colors.inkMute },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.sage,
  },
  avatarText: { color: "#fff", fontWeight: "800" },
  field: { gap: 6 },
  fieldLabel: { color: theme.colors.inkSoft, fontWeight: "700", fontSize: 13 },
  input: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    color: theme.colors.ink,
    fontSize: 15,
  },
  textarea: { minHeight: 120, paddingTop: 14 },
  inputError: { borderColor: theme.colors.danger, backgroundColor: "#FDF4F1" },
  errorText: { color: theme.colors.danger, fontSize: 12 },
  chip: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.inkSoft, fontWeight: "700", fontSize: 13 },
  chipTextSelected: { color: "#fff" },
  segmented: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    backgroundColor: "rgba(30,41,32,0.05)",
    borderRadius: theme.radius.pill,
  },
  segment: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
  },
  segmentSelected: { backgroundColor: theme.colors.surface },
  segmentText: { color: theme.colors.inkMute, fontWeight: "700" },
  segmentTextSelected: { color: theme.colors.ink },
  topBar: {
    minHeight: 62,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitleWrap: { flexDirection: "row", alignItems: "center", flex: 1, gap: 6 },
  topTextWrap: { flex: 1 },
  topTitle: { color: theme.colors.ink, fontWeight: "800", fontSize: 22 },
  topSubtitle: { color: theme.colors.inkMute, marginTop: 2, fontSize: 13 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  state: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  stateIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface2,
  },
  stateTitle: {
    color: theme.colors.inkSoft,
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
  stateText: {
    color: theme.colors.inkMute,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  skeleton: {
    borderRadius: theme.radius.sm,
    backgroundColor: "rgba(30,41,32,0.07)",
  },
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "rgba(28,38,30,0.94)",
    borderRadius: theme.radius.md,
    padding: 14,
  },
  toastText: { color: "#fff", fontWeight: "700", flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20,22,28,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  dialog: {
    width: "100%",
    borderRadius: theme.radius.lg,
    padding: 22,
    backgroundColor: theme.colors.surface,
    gap: 14,
  },
  dialogTitle: {
    textAlign: "center",
    color: theme.colors.ink,
    fontWeight: "800",
    fontSize: 17,
  },
  dialogText: {
    textAlign: "center",
    color: theme.colors.inkSoft,
    lineHeight: 20,
  },
  dialogActions: { flexDirection: "row", gap: 8 },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(20,22,28,0.35)",
  },
  sheet: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.lineStrong,
    alignSelf: "center",
  },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.ink },
  imagePickerWrap: { gap: 10 },
  imagePicker: {
    minHeight: 104,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: theme.colors.surface2,
  },
  imagePickerText: { color: theme.colors.primaryDeep, fontWeight: "800" },
  imagePickerHint: { color: theme.colors.inkMute, fontSize: 12 },
  imagePreviewList: { gap: 10 },
  imagePreviewItem: {
    width: 86,
    height: 86,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surface2,
  },
  imagePreview: { width: "100%", height: "100%" },
  imageRemoveButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(30,41,32,0.72)",
  },
  formSection: { gap: 12 },
  formTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: "800" },
  horizontalChips: { gap: 8, paddingHorizontal: 18, paddingVertical: 6 },
});

const badgeToneStyles = {
  primary: styles.badge_primary,
  mute: styles.badge_mute,
  warn: styles.badge_warn,
  danger: styles.badge_danger,
  success: styles.badge_success,
};
