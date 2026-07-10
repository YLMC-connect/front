import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../../../src/components/layout/Screen";
import { ConfirmDialog, TopBar } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { readDesignVariant } from "../../../src/lib/designVariant";

const filledTitle = "5월 18일 토요일 모임 안내";
const filledBody = `이번 주 토요일은 북한산 도선사 코스로 갑니다.
오전 7시 교회 앞에서 모이며, 등산 시간은 약 4시간 예상해요.

준비물:
- 등산화, 물 1L 이상
- 간단한 간식
- 우산 또는 우비 (오후 비 예보 있음)

문의는 단톡방으로 부탁드려요. 함께 오르며 좋은 시간 보내요!`;

export default function GroupNoticesScreenRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ designVariant?: string }>();
  const variant = readDesignVariant(params.designVariant) ?? "create";
  const isEdit = variant === "edit" || variant === "delete-confirm";
  const isFilled = isEdit || variant === "create-filled";
  const showDelete = variant === "delete-confirm";
  const title = isFilled ? filledTitle : "";
  const body = isFilled ? filledBody : "";

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title={isEdit ? "공지 수정" : "공지 작성"}
          back
          backLabel="닫기"
          onBack={() => router.back()}
          right={
            <View style={styles.actions}>
              {isEdit ? <Text style={styles.deleteAction}>삭제</Text> : null}
              <Text
                style={[
                  styles.submitAction,
                  !isFilled ? styles.submitOff : null,
                ]}
              >
                {isEdit ? "저장" : "등록"}
              </Text>
            </View>
          }
        />

        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.noticeBox}>
            <MaterialIcons
              name="info"
              size={16}
              color={theme.colors.primaryDeep}
            />
            <Text style={styles.noticeText}>소모임 멤버에게만 공개됩니다.</Text>
          </View>

          <Field label="제목" required hint={`${title.length}/30`}>
            <TextInput
              value={title}
              editable={false}
              placeholder="공지 제목 (최대 30자)"
              placeholderTextColor={theme.colors.inkMute}
              maxLength={30}
              style={styles.input}
            />
          </Field>

          <View style={styles.divider} />

          <Field label="내용" required hint={`${body.length}/500`}>
            <TextInput
              value={body}
              editable={false}
              multiline
              placeholder="공지 내용을 입력해주세요"
              placeholderTextColor={theme.colors.inkMute}
              maxLength={500}
              textAlignVertical="top"
              style={[styles.input, styles.textarea]}
            />
          </Field>
        </ScrollView>

        <ConfirmDialog
          visible={showDelete}
          title="공지를 삭제하시겠습니까?"
          message="삭제한 공지는 복구할 수 없어요."
          confirmText="삭제"
          danger
          onCancel={() => router.back()}
          onConfirm={() => router.back()}
        />
      </View>
    </Screen>
  );
}

function Field({
  label,
  hint,
  required = false,
  children,
}: {
  label: string;
  hint: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHead}>
        <Text style={styles.fieldLabel}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  actions: {
    minWidth: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  deleteAction: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  submitAction: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  submitOff: {
    color: theme.colors.inkHint,
  },
  body: {
    paddingBottom: 28,
  },
  noticeBox: {
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noticeText: {
    flex: 1,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    lineHeight: 19,
  },
  field: {
    gap: 8,
    paddingVertical: 14,
  },
  fieldHead: {
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  fieldLabel: {
    color: theme.colors.ink,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  required: {
    color: theme.colors.danger,
  },
  hint: {
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  input: {
    marginHorizontal: 22,
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
  },
  textarea: {
    minHeight: 250,
    lineHeight: 23,
  },
  divider: {
    height: 8,
    backgroundColor: "rgba(30,41,32,0.05)",
  },
});
