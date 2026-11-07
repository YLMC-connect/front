import { FLOATING_BOTTOM_BAR_INSET } from "@/components/ui/floating-bottom-bar";
import { InfoBox } from "@/components/ui/info-box";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Screen } from "../../../src/components/layout/Screen";
import {
  ConfirmDialog,
  FloatingBottomBar,
  ModalFormSection as Section,
  ModalFormTextInput as FormInput,
  SectionDivider,
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  useCreateGroupNotice,
  useDeleteGroupNotice,
  useGroupDetail,
  useUpdateGroupNotice,
} from "../../../src/hooks/useGroups";
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
  const params = useLocalSearchParams<{
    id?: string;
    noticeId?: string;
    designVariant?: string;
  }>();
  const groupId = params.id ?? "1";
  const variant = readDesignVariant(params.designVariant);
  const isDesignEdit = variant === "edit" || variant === "delete-confirm";
  const noticeId = params.noticeId ?? (isDesignEdit ? "notice-1" : undefined);
  const isEdit = Boolean(noticeId);
  const detail = useGroupDetail(groupId);
  const createNotice = useCreateGroupNotice(groupId);
  const updateNotice = useUpdateGroupNotice(groupId);
  const deleteNotice = useDeleteGroupNotice(groupId);
  const isDesignFilled = isDesignEdit || variant === "create-filled";
  const [title, setTitle] = useState(isDesignFilled ? filledTitle : "");
  const [body, setBody] = useState(isDesignFilled ? filledBody : "");
  const [showDelete, setShowDelete] = useState(variant === "delete-confirm");
  const [seenVariant, setSeenVariant] = useState(variant);
  const [syncedDetail, setSyncedDetail] = useState<typeof detail.data>();
  if (variant && variant !== seenVariant) {
    setSeenVariant(variant);
    const filled = isDesignEdit || variant === "create-filled";
    setTitle(filled ? filledTitle : "");
    setBody(filled ? filledBody : "");
    setShowDelete(variant === "delete-confirm");
  }

  if (!variant && noticeId && detail.data && detail.data !== syncedDetail) {
    setSyncedDetail(detail.data);
    const notice = detail.data.notices.find(({ id }) => id === noticeId);
    if (notice) {
      setTitle(notice.title);
      setBody(notice.content);
    }
  }

  const isFilled = Boolean(title.trim() && body.trim());
  const isPending = createNotice.isPending || updateNotice.isPending;
  const onSubmit = () => {
    if (!isFilled || isPending) return;
    const onSuccess = () => router.replace(`/group/${groupId}`);
    if (noticeId) {
      updateNotice.mutate({ noticeId, title, content: body }, { onSuccess });
      return;
    }
    createNotice.mutate({ title, content: body }, { onSuccess });
  };
  const onConfirmDelete = () => {
    if (!noticeId) return;
    deleteNotice.mutate(noticeId, {
      onSuccess: () => router.replace(`/group/${groupId}`),
    });
  };

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar
          title={isEdit ? "공지 수정" : "공지 작성"}
          close
          onBack={() => router.back()}
          testID="group-notice-header"
          right={
            isEdit ? (
              <Pressable
                testID="group-notice-delete"
                accessibilityRole="button"
                style={styles.headerAction}
                onPress={() => setShowDelete(true)}
              >
                <Text style={styles.deleteAction}>삭제</Text>
              </Pressable>
            ) : null
          }
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.body, { flexGrow: 1 }]}
        >
          <Pressable
            accessible={false}
            onPress={Keyboard.dismiss}
            style={{ flexGrow: 1 }}
          >
            <InfoBox
              description="소모임 멤버에게만 공개됩니다."
              style={styles.noticeBox}
            />

            <Section label="제목" required hint={`${title.length}/30`}>
              <FormInput
                testID="group-notice-title-input"
                value={title}
                onChangeText={setTitle}
                placeholder="공지 제목 (최대 30자)"
                maxLength={30}
              />
            </Section>

            <SectionDivider />

            <Section label="내용" required hint={`${body.length}/500`}>
              <FormInput
                testID="group-notice-content-input"
                value={body}
                onChangeText={setBody}
                multiline
                placeholder="공지 내용을 입력해주세요"
                maxLength={500}
                textAlignVertical="top"
                style={styles.textarea}
              />
            </Section>

            {createNotice.isError ||
            updateNotice.isError ||
            deleteNotice.isError ? (
              <Text style={styles.error}>공지 처리에 실패했습니다.</Text>
            ) : null}
          </Pressable>
        </ScrollView>

        <FloatingBottomBar
          label={isEdit ? "저장" : "등록"}
          disabled={!isFilled}
          loading={isPending}
          onPress={onSubmit}
          testID="group-notice-submit"
        />

        {isEdit && detail.isPending ? (
          <ActivityIndicator
            color={theme.colors.primary}
            style={styles.loading}
          />
        ) : null}

        <ConfirmDialog
          visible={showDelete}
          title="공지를 삭제하시겠습니까?"
          message="삭제한 공지는 복구할 수 없어요."
          confirmText="삭제"
          danger
          onCancel={() => setShowDelete(false)}
          onConfirm={onConfirmDelete}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerAction: {
    minHeight: theme.layout.touchTarget,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  deleteAction: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: theme.fontWeight.semibold,
  },
  body: {
    paddingBottom: FLOATING_BOTTOM_BAR_INSET,
  },
  noticeBox: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 8,
  },
  // 공지 본문은 길게 쓰므로 기본 여러 줄 높이(132)보다 넉넉히 둔다.
  textarea: {
    minHeight: 250,
    lineHeight: theme.typography.body.lineHeight,
  },
  error: {
    color: theme.colors.dangerText,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  loading: {
    position: "absolute",
    top: 70,
    right: 22,
  },
});
