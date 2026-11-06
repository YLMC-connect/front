import { AppIcon } from "@/components/ui/app-icon";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { type ReactNode } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "../../constants/theme";

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
}) {
  const sizeHeights = { xs: 40, sm: 44, md: 48, lg: 52, xl: 56 } as const;
  const resolvedHeight = height ?? sizeHeights[size];

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry={secureTextEntry}
        // 비밀번호 칸은 영문 자판으로 연다(iOS 비밀번호 칸은 한글 조합이 막혀 입력되지 않음)
        keyboardType={secureTextEntry ? "ascii-capable" : keyboardType}
        style={[
          styles.input,
          { height: resolvedHeight },
          error ? styles.inputError : null,
        ]}
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
        placeholderTextColor={theme.colors.textMuted}
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
  field: { gap: 6 },
  fieldLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  input: {
    minHeight: theme.size.inputHeight,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing["4"],
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
  textarea: { minHeight: 132, paddingTop: theme.spacing["3"] },
  inputError: { borderColor: theme.colors.dangerText },
  errorText: { ...theme.typography.caption, color: theme.colors.dangerText },
  imagePickerWrap: { gap: 10 },
  imagePicker: {
    minHeight: 104,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
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
