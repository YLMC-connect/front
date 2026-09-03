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
        <AppIcon
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
                <AppIcon name="close" size={16} color="#fff" />
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
  disabled: { opacity: 0.45 },
});
