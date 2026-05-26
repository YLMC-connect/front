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
  type PressableProps,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "../../constants/theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

const avatarPalettes = [
  "#8FA882",
  "#C7B89D",
  "#9FBFA0",
  "#C97C6E",
  "#A6B79A",
  "#B79F8C",
  "#7E9C8E",
] as const;

function avatarColorFor(seed: string | number) {
  if (typeof seed === "number") {
    return avatarPalettes[seed % avatarPalettes.length];
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return avatarPalettes[hash % avatarPalettes.length];
}

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
  const buttonStyle = StyleSheet.flatten([
    styles.button,
    variant === "primary" && styles.buttonPrimary,
    variant === "soft" && styles.buttonSoft,
    variant === "ghost" && styles.buttonGhost,
    variant === "danger" && styles.buttonDanger,
    disabled && styles.disabled,
  ]);
  const textStyle = [
    styles.buttonText,
    (variant === "soft" || variant === "ghost") && styles.buttonTextSoft,
    variant === "danger" && styles.buttonTextInverse,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={buttonStyle}
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

export function FloatingActionButton({
  label,
  icon = "add",
  compact = false,
  style,
  ...pressableProps
}: PressableProps & {
  label?: string;
  icon?: IconName;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      {...pressableProps}
      style={({ pressed }) => [
        styles.fab,
        compact ? styles.fabCompact : null,
        pressed ? styles.pressed : null,
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      <MaterialIcons name={icon} size={20} color="#fff" />
      {label ? <Text style={styles.fabText}>{label}</Text> : null}
    </Pressable>
  );
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

export function Avatar({
  name,
  size = 40,
  seed,
}: {
  name: string;
  size?: number;
  seed?: string | number;
}) {
  const initial = name.trim().slice(0, 1) || "?";
  const backgroundColor = avatarColorFor(seed ?? name);
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.42 }]}>
        {initial}
      </Text>
    </View>
  );
}

export function VisualThumb({
  size = 86,
  seed = 0,
  icon,
  style,
}: {
  size?: number;
  seed?: number;
  icon?: IconName;
  style?: object;
}) {
  const palette = thumbPalettes[seed % thumbPalettes.length];

  return (
    <View
      style={[
        styles.visualThumb,
        {
          width: size,
          height: size,
          backgroundColor: palette.bg,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.visualOrbLarge,
          {
            backgroundColor: palette.fg,
            left: 10 + ((seed * 11) % 24),
            top: 8 + ((seed * 7) % 24),
          },
        ]}
      />
      <View
        style={[
          styles.visualOrbSmall,
          {
            backgroundColor: palette.fg,
            right: 8 + ((seed * 5) % 18),
            bottom: 10 + ((seed * 13) % 18),
          },
        ]}
      />
      {icon ? (
        <MaterialIcons
          name={icon}
          size={Math.max(22, size * 0.34)}
          color="#fff"
        />
      ) : null}
    </View>
  );
}

export function VisualCover({
  height = 88,
  seed = 0,
  icon = "groups",
  label,
  style,
}: {
  height?: number;
  seed?: number;
  icon?: IconName;
  label?: string;
  style?: object;
}) {
  const palette = coverPalettes[seed % coverPalettes.length];

  return (
    <View
      style={[
        styles.visualCover,
        { height, backgroundColor: palette.bg },
        style,
      ]}
    >
      <View
        style={[
          styles.coverWave,
          {
            backgroundColor: palette.fg,
            transform: [{ rotate: `${-8 + (seed % 4) * 4}deg` }],
          },
        ]}
      />
      <View style={[styles.coverCircle, { backgroundColor: palette.tint }]} />
      {label ? (
        <View style={styles.coverLabel}>
          <MaterialIcons name={icon} size={16} color={palette.fg} />
          <Text style={[styles.coverLabelText, { color: palette.fg }]}>
            {label}
          </Text>
        </View>
      ) : null}
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
        placeholderTextColor={theme.colors.inkMute}
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
        placeholderTextColor={theme.colors.inkMute}
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
  backLabel = "뒤로",
  right,
  onBack,
  testID,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  backLabel?: string;
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
              size={22}
              color={theme.colors.inkSoft}
            />
            <Text style={styles.backButtonText}>{backLabel}</Text>
          </Pressable>
        ) : null}
        <View style={styles.topTextWrap}>
          <Text numberOfLines={1} style={styles.topTitle}>
            {title}
          </Text>
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

export function Toast({
  message,
  offset = 28,
  icon = "check",
}: {
  message?: string;
  offset?: number;
  icon?: IconName;
}) {
  if (!message) return null;
  return (
    <View style={[styles.toast, { bottom: offset }]}>
      <MaterialIcons name={icon} size={18} color="#fff" />
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
        </View>
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
          <View style={styles.sheetContent}>{children}</View>
          {footer ? <View style={styles.sheetFooter}>{footer}</View> : null}
        </View>
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
              style={[
                styles.sheetFooterButton,
                danger ? styles.sheetDangerButton : styles.sheetConfirmButton,
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
            <View
              key={option.value}
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
            </View>
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
      style={styles.horizontalChipsScroll}
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

const thumbPalettes = [
  { bg: "#E6EBDB", fg: "#C9D6B2" },
  { bg: "#F3E8D7", fg: "#DBC9A5" },
  { bg: "#E0E9DE", fg: "#B7CCB3" },
  { bg: "#F3DED7", fg: "#DCB1A6" },
  { bg: "#E8E4D3", fg: "#C9C2A4" },
  { bg: "#DDE8E4", fg: "#B0C9C0" },
];

const coverPalettes = [
  { bg: "#DDE5CD", fg: "#8FA882", tint: "rgba(255,255,255,0.42)" },
  { bg: "#EAE0CB", fg: "#C7B89D", tint: "rgba(255,255,255,0.36)" },
  { bg: "#D4E1D1", fg: "#7E9C8E", tint: "rgba(255,255,255,0.38)" },
  { bg: "#E7D2CB", fg: "#C97C6E", tint: "rgba(255,255,255,0.34)" },
  { bg: "#DEE5D4", fg: "#A6B79A", tint: "rgba(255,255,255,0.36)" },
  { bg: "#D8E5DD", fg: "#7BA194", tint: "rgba(255,255,255,0.38)" },
];

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.primary,
  },
  buttonSoft: { backgroundColor: theme.colors.primarySoft },
  buttonGhost: { backgroundColor: "transparent" },
  buttonDanger: { backgroundColor: theme.colors.danger },
  buttonText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.base,
  },
  buttonTextSoft: { color: theme.colors.primaryDeep },
  buttonTextInverse: { color: theme.colors.white },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.ring,
    ...theme.shadow.card,
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 86,
    zIndex: 20,
    minWidth: 56,
    height: 56,
    borderRadius: theme.radius.pill,
    paddingLeft: 16,
    paddingRight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
    ...theme.shadow.fab,
  },
  fabCompact: {
    width: 56,
    paddingLeft: 0,
    paddingRight: 0,
  },
  fabText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badge_primary: { backgroundColor: theme.colors.primarySoft },
  badge_mute: { backgroundColor: theme.colors.surface2 },
  badge_warn: { backgroundColor: theme.colors.amberSoft },
  badge_danger: { backgroundColor: "#FDF4F1" },
  badge_success: { backgroundColor: "#EFF7EC" },
  badgeText: {
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    lineHeight: theme.lineHeight.xs,
  },
  badgeTextMute: { color: theme.colors.inkMute },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.sage,
    shadowColor: "rgba(20,30,18,0.10)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarText: { color: theme.colors.white, fontWeight: theme.fontWeight.bold },
  field: { gap: 6 },
  fieldLabel: {
    color: theme.colors.inkSoft,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.sm,
  },
  input: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 16,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
  },
  textarea: { minHeight: 120, paddingTop: 14 },
  inputError: { borderColor: theme.colors.danger, backgroundColor: "#FDF4F1" },
  errorText: { color: theme.colors.danger, fontSize: 12 },
  chip: {
    minHeight: 34,
    paddingHorizontal: 12,
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
  chipText: {
    color: theme.colors.inkSoft,
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.sm,
  },
  chipTextSelected: { color: theme.colors.white },
  segmented: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    backgroundColor: "rgba(30,41,32,0.05)",
    borderRadius: theme.radius.pill,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.pill,
  },
  segmentSelected: {
    backgroundColor: theme.colors.surface,
    ...theme.shadow.card,
  },
  segmentText: {
    color: theme.colors.inkMute,
    fontWeight: theme.fontWeight.semibold,
    fontSize: 13,
  },
  segmentTextSelected: {
    color: theme.colors.ink,
    fontWeight: theme.fontWeight.bold,
  },
  topBar: {
    minHeight: 58,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitleWrap: { flexDirection: "row", alignItems: "center", flex: 1, gap: 4 },
  topTextWrap: { flex: 1, minWidth: 0 },
  topTitle: {
    color: theme.colors.ink,
    fontWeight: theme.fontWeight.bold,
    fontSize: 20,
  },
  topSubtitle: {
    color: theme.colors.inkMute,
    marginTop: 2,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  backButton: {
    height: 36,
    paddingLeft: 8,
    paddingRight: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 2,
    backgroundColor: "rgba(20,30,18,0.05)",
  },
  backButtonText: {
    color: theme.colors.inkSoft,
    fontSize: 14.5,
    fontWeight: theme.fontWeight.semibold,
  },
  visualThumb: {
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  visualOrbLarge: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
    opacity: 0.34,
  },
  visualOrbSmall: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    opacity: 0.22,
  },
  visualCover: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    position: "relative",
  },
  coverWave: {
    position: "absolute",
    left: -18,
    right: -18,
    bottom: -34,
    height: 76,
    opacity: 0.32,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 80,
  },
  coverCircle: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    right: 18,
    top: 12,
    opacity: 0.45,
  },
  coverLabel: {
    position: "absolute",
    left: 14,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  coverLabelText: { fontSize: 13, fontWeight: "800" },
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
    zIndex: 40,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: theme.colors.toast,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...theme.shadow.toast,
  },
  toastText: {
    color: theme.colors.white,
    fontWeight: theme.fontWeight.semibold,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
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
  horizontalChipsScroll: { flexGrow: 0 },
  horizontalChips: { gap: 8, paddingHorizontal: 18, paddingVertical: 6 },
});

const badgeToneStyles = {
  primary: styles.badge_primary,
  mute: styles.badge_mute,
  warn: styles.badge_warn,
  danger: styles.badge_danger,
  success: styles.badge_success,
};
