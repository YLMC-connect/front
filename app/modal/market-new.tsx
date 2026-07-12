import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { VisualThumb } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { readDesignVariant } from "../../src/lib/designVariant";

const categories = [
  "의류·잡화",
  "가전·가구",
  "도서·문구",
  "식품·생필품",
  "유아·아동용품",
  "스포츠·취미",
  "기타",
] as const;

const conditions = ["새것", "사용감 있음", "파손 있음"] as const;

const filledValues = {
  title: "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
  description:
    "아이가 커서 더 이상 쓰지 않는 장난감 정리해요.\n대부분 깨끗하게 사용한 것들이고, 블록류 20점 + 인형류 10점 정도 됩니다.\n필요하신 분께 무료로 드려요!\n\n수령은 토요일 오후 교회 1층 로비에서 가능합니다.",
};

export default function MarketNewModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = readDesignVariant(params.designVariant) ?? "create";
  const isEdit = variant === "edit";
  const isFilled =
    isEdit ||
    variant === "create-filled" ||
    variant === "back-warn" ||
    variant === "limit-toast";
  const photos = isFilled ? [0, 1, 2] : [];
  const title = isFilled ? filledValues.title : "";
  const description = isFilled ? filledValues.description : "";

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <MaterialIcons name="close" size={22} color={theme.colors.inkSoft} />
          <Text style={styles.closeText}>닫기</Text>
        </Pressable>
        <Text style={styles.topTitle}>
          {isEdit ? "나눔 수정" : "나눔 등록"}
        </Text>
        <Text style={[styles.saveText, !isFilled ? styles.saveDisabled : null]}>
          {isEdit ? "저장" : "등록"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.photoSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoRail}
          >
            <View style={styles.photoAdd}>
              <MaterialIcons
                name="photo-camera"
                size={22}
                color={theme.colors.inkMute}
              />
              <Text style={styles.photoCount}>사진 {photos.length}/5</Text>
            </View>
            {photos.map((seed, index) => (
              <View key={seed} style={styles.photoItem}>
                <VisualThumb size={90} seed={seed} />
                {index === 0 ? (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>대표</Text>
                  </View>
                ) : null}
                <View style={styles.removePhoto}>
                  <MaterialIcons name="close" size={12} color="#fff" />
                </View>
              </View>
            ))}
          </ScrollView>
          <Text style={styles.photoHint}>최대 5장, JPG/PNG/WEBP, 5MB 이하</Text>
        </View>

        <Divider />

        <Section label="카테고리" required>
          <View style={styles.chips}>
            {categories.map((category) => {
              const selected = isFilled && category === "유아·아동용품";
              return (
                <View
                  key={category}
                  style={[styles.chip, selected ? styles.chipOn : null]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected ? styles.chipTextOn : null,
                    ]}
                  >
                    {category}
                  </Text>
                </View>
              );
            })}
          </View>
        </Section>

        <Divider />

        <Section label="제목" required hint={`${title.length}/30`}>
          <TextInput
            editable={false}
            value={title}
            placeholder="제목을 입력해주세요 (최대 30자)"
            placeholderTextColor={theme.colors.inkMute}
            style={styles.input}
          />
        </Section>

        <Divider />

        <Section label="물품 상태" required>
          <View style={styles.conditionRow}>
            {conditions.map((condition) => {
              const selected = isFilled && condition === "사용감 있음";
              return (
                <View
                  key={condition}
                  style={[
                    styles.condition,
                    selected ? styles.conditionOn : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.conditionText,
                      selected ? styles.conditionTextOn : null,
                    ]}
                  >
                    {condition}
                  </Text>
                </View>
              );
            })}
          </View>
        </Section>

        <Divider />

        <Section label="상세 설명" required hint={`${description.length}/500`}>
          <TextInput
            editable={false}
            multiline
            value={description}
            placeholder="물품 상태, 수령 방법, 일정 등을 자세히 적어주세요"
            placeholderTextColor={theme.colors.inkMute}
            style={[styles.input, styles.textarea]}
            textAlignVertical="top"
          />
        </Section>

        <View style={styles.infoBox}>
          <MaterialIcons
            name="info"
            size={16}
            color={theme.colors.primaryDeep}
          />
          <Text style={styles.infoText}>
            직거래 시 안전한 장소(교회 로비 등)에서 만나주세요.
          </Text>
        </View>
      </ScrollView>

      {variant === "limit-toast" ? (
        <View style={styles.toast}>
          <MaterialIcons name="check" size={18} color="#fff" />
          <Text style={styles.toastText}>
            하루에 나눔은 5개까지 등록할 수 있어요
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Section({
  label,
  required = false,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionLabel}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  topBar: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  closeButton: {
    minWidth: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  closeText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    color: theme.colors.ink,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  saveText: {
    minWidth: 68,
    textAlign: "right",
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  saveDisabled: {
    color: theme.colors.inkHint,
  },
  body: {
    paddingBottom: 24,
  },
  photoSection: {
    paddingTop: 6,
    paddingBottom: 18,
  },
  photoRail: {
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 4,
  },
  photoAdd: {
    width: 90,
    height: 90,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoCount: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  photoHint: {
    paddingHorizontal: 22,
    paddingTop: 8,
    color: theme.colors.inkHint,
    fontSize: 11.5,
  },
  photoItem: {
    position: "relative",
  },
  mainBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mainBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
  },
  removePhoto: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,30,18,0.70)",
  },
  divider: {
    height: 8,
    backgroundColor: "rgba(20,30,18,0.04)",
  },
  section: {
    paddingVertical: 16,
  },
  sectionHead: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    marginBottom: 10,
  },
  sectionLabel: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  required: {
    color: theme.colors.danger,
  },
  sectionHint: {
    color: theme.colors.inkHint,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 22,
  },
  chip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  chipTextOn: {
    color: theme.colors.white,
  },
  input: {
    minHeight: 48,
    marginHorizontal: 22,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
  },
  textarea: {
    minHeight: 150,
    paddingTop: 12,
    lineHeight: 22,
  },
  conditionRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 22,
  },
  condition: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  conditionOn: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  conditionText: {
    color: theme.colors.inkSoft,
    fontSize: 13,
    fontWeight: theme.fontWeight.medium,
  },
  conditionTextOn: {
    color: theme.colors.primaryDeep,
    fontWeight: theme.fontWeight.bold,
  },
  infoBox: {
    marginHorizontal: 22,
    marginTop: 16,
    marginBottom: 22,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoText: {
    flex: 1,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
  },
  toast: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.toast,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    ...theme.shadow.toast,
  },
  toastText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
