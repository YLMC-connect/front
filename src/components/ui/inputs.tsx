import { AppIcon } from "@/components/ui/app-icon";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState, type ReactNode } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { Text, TextInput } from "@/components/ui/text";
import { theme } from "../../constants/theme";
import { AppText } from "./app-text";
import { MotionEnter } from "./motion";

/** 여러 줄 입력 최소 높이(디자인 시스템 Input). */
export const INPUT_MULTILINE_MIN_HEIGHT = 132;
/** 포커스 바깥 고리 두께(디자인 시스템 Input). */
const FOCUS_HALO_WIDTH = 3;

const inputSurfaceStyles = StyleSheet.create({
  surface: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing["4"],
    position: "relative",
  },
  surfaceReadOnly: { backgroundColor: theme.colors.surfaceSubtle },
  border: {
    ...StyleSheet.absoluteFill,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderButton,
  },
  borderReadOnly: { borderColor: theme.colors.border },
  borderError: { borderColor: theme.colors.dangerText },
  focusHalo: {
    position: "absolute",
    top: -FOCUS_HALO_WIDTH,
    left: -FOCUS_HALO_WIDTH,
    right: -FOCUS_HALO_WIDTH,
    bottom: -FOCUS_HALO_WIDTH,
    borderRadius: theme.radius.sm + FOCUS_HALO_WIDTH,
    borderWidth: FOCUS_HALO_WIDTH,
    borderColor: theme.colors.primarySubtle,
  },
  focusRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  focusRingError: { borderColor: theme.colors.dangerText },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing["1"],
  },
  errorText: { flexShrink: 1 },
});

/**
 * 입력창 겉모양 하나(디자인 시스템 Input). TextField·Textarea·ModalFormTextInput·AuthInput 이 함께 쓴다.
 * 테두리·포커스 고리는 겹쳐 그리는 층이라 상태가 바뀌어도 안쪽 글자 자리가 움직이지 않는다.
 * - 기본: surface + 1px borderButton(버튼과 같은 테두리), radius.sm, 안쪽 16
 * - 포커스: 2px primary + 바깥 3px primarySubtle 고리 (오류일 때는 2px dangerText)
 * - 오류: dangerText 테두리
 * - 읽기 전용: surfaceSubtle + border
 */
export function InputSurface({
  focused = false,
  error = false,
  readOnly = false,
  style,
  testID,
  children,
}: {
  focused?: boolean;
  error?: boolean;
  readOnly?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children: ReactNode;
}) {
  return (
    <View
      testID={testID ? `${testID}-container` : undefined}
      style={[
        inputSurfaceStyles.surface,
        readOnly ? inputSurfaceStyles.surfaceReadOnly : null,
        style,
      ]}
    >
      {children}
      <View
        pointerEvents="none"
        testID={testID ? `${testID}-border` : undefined}
        style={[
          inputSurfaceStyles.border,
          readOnly ? inputSurfaceStyles.borderReadOnly : null,
          error ? inputSurfaceStyles.borderError : null,
        ]}
      />
      {focused && !error ? (
        <View
          pointerEvents="none"
          testID={testID ? `${testID}-focus-halo` : undefined}
          style={inputSurfaceStyles.focusHalo}
        />
      ) : null}
      {focused ? (
        <View
          pointerEvents="none"
          testID={testID ? `${testID}-focus-ring` : undefined}
          style={[
            inputSurfaceStyles.focusRing,
            error ? inputSurfaceStyles.focusRingError : null,
          ]}
        />
      ) : null}
    </View>
  );
}

/** 입력 아래 오류 문구. 아이콘과 함께 200ms 동안 아래에서 떠오른다(흔들지 않음). */
export function InputErrorText({
  children,
  testID,
}: {
  children: ReactNode;
  testID?: string;
}) {
  return (
    <MotionEnter mode="fadeUp" testID={testID}>
      <View style={inputSurfaceStyles.errorRow}>
        <AppIcon
          name="error-outline"
          size={16}
          color={theme.colors.dangerText}
        />
        <AppText
          variant="caption"
          tone="danger"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={inputSurfaceStyles.errorText}
        >
          {children}
        </AppText>
      </View>
    </MotionEnter>
  );
}

/** 입력창 안 TextInput 의 공통 글자 모양. */
export const inputTextStyles = StyleSheet.create({
  input: {
    flex: 1,
    alignSelf: "stretch",
    padding: 0,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    outlineColor: "transparent",
    outlineWidth: 0,
  },
  multiline: {
    minHeight: INPUT_MULTILINE_MIN_HEIGHT,
    paddingVertical: theme.spacing["3"],
    lineHeight: theme.typography.body.lineHeight,
  },
  readOnly: { color: theme.colors.textMuted },
});

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  keyboardType,
  size = "md",
  height,
  readOnly = false,
  testID,
}: {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  height?: number;
  readOnly?: boolean;
  testID?: string;
}) {
  const sizeHeights = { xs: 40, sm: 44, md: 48, lg: 52, xl: 56 } as const;
  const resolvedHeight = height ?? sizeHeights[size];
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <InputSurface
        focused={focused}
        error={Boolean(error)}
        readOnly={readOnly}
        testID={testID}
      >
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={secureTextEntry}
          editable={!readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // 비밀번호 칸은 영문 자판으로 연다(iOS 비밀번호 칸은 한글 조합이 막혀 입력되지 않음)
          keyboardType={secureTextEntry ? "ascii-capable" : keyboardType}
          style={[
            inputTextStyles.input,
            { height: resolvedHeight },
            readOnly ? inputTextStyles.readOnly : null,
          ]}
        />
      </InputSurface>
      {error ? <InputErrorText>{error}</InputErrorText> : null}
    </View>
  );
}

export function Textarea({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  readOnly = false,
  testID,
}: {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
  testID?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <InputSurface
        focused={focused}
        error={Boolean(error)}
        readOnly={readOnly}
        testID={testID}
      >
        <TextInput
          testID={testID}
          multiline
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          editable={!readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            inputTextStyles.input,
            inputTextStyles.multiline,
            readOnly ? inputTextStyles.readOnly : null,
          ]}
          textAlignVertical="top"
        />
      </InputSurface>
      {error ? <InputErrorText>{error}</InputErrorText> : null}
    </View>
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
      mediaTypes: ["images"],
      // quality 는 기본값(1)으로 둔다. 압축은 업로드 직전 resizeImageForUpload 가 한 번만 한다
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
        <AppIcon
          name="add-photo-alternate"
          size={28}
          color={theme.colors.primaryStrong}
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
          {value.map((uri, index) => (
            <View key={uri} style={styles.imagePreviewItem}>
              <Image
                source={{ uri }}
                style={styles.imagePreview}
                contentFit="cover"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`사진 ${index + 1} 삭제`}
                onPress={() => removeImage(uri)}
                style={styles.imageRemoveButton}
              >
                <View style={styles.imageRemoveIcon}>
                  <AppIcon
                    name="close"
                    size={16}
                    color={theme.colors.onPrimary}
                  />
                </View>
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

const styles = StyleSheet.create({
  field: { gap: theme.spacing["2"] },
  fieldLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  errorText: { ...theme.typography.caption, color: theme.colors.dangerText },
  imagePickerWrap: { gap: 10 },
  imagePicker: {
    minHeight: 104,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderButton,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  imagePickerText: {
    ...theme.typography.label,
    color: theme.colors.primaryStrong,
    fontWeight: theme.fontWeight.bold,
  },
  imagePickerHint: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  imagePreviewList: { gap: 10 },
  imagePreviewItem: {
    width: 86,
    height: 86,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceSubtle,
  },
  imagePreview: { width: "100%", height: "100%" },
  // 터치 영역은 44×44, 보이는 원은 그 안 오른쪽 위 24.
  imageRemoveButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    padding: 6,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  imageRemoveIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.sheetOverlay,
  },
  formSection: { gap: 12 },
  formTitle: { ...theme.typography.heading, color: theme.colors.text },
  disabled: { opacity: 0.45 },
});
