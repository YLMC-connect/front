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
  TopBar,
} from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import {
  useCreateGroupNotice,
  useDeleteGroupNotice,
  useGroupDetail,
  useUpdateGroupNotice,
} from "../../../src/hooks/useGroups";

export default function GroupNoticesScreenRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    noticeId?: string;
  }>();
  const groupId = params.id ?? "1";
  const noticeId = params.noticeId;
  const isEdit = Boolean(noticeId);
  const detail = useGroupDetail(groupId);
  const createNotice = useCreateGroupNotice(groupId);
  const updateNotice = useUpdateGroupNotice(groupId);
  const deleteNotice = useDeleteGroupNotice(groupId);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [syncedDetail, setSyncedDetail] = useState<typeof detail.data>();

  if (noticeId && detail.data && detail.data !== syncedDetail) {
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
              description="소모임 멤버에게만 보여요."
              style={styles.noticeBox}
            />

            <Section card label="제목" required hint={`${title.length}/30`}>
              <FormInput
                style={styles.cardField}
                testID="group-notice-title-input"
                value={title}
                onChangeText={setTitle}
                placeholder="공지 제목 (최대 30자)"
                maxLength={30}
              />
            </Section>

            <Section card label="내용" required hint={`${body.length}/500`}>
              <FormInput
                testID="group-notice-content-input"
                value={body}
                onChangeText={setBody}
                multiline
                placeholder="공지 내용을 입력해주세요"
                maxLength={500}
                textAlignVertical="top"
                style={[styles.cardField, styles.textarea]}
              />
            </Section>

            {createNotice.isError ||
            updateNotice.isError ||
            deleteNotice.isError ? (
              <Text style={styles.error}>공지를 저장하지 못했어요.</Text>
            ) : null}
          </Pressable>
        </ScrollView>

        <FloatingBottomBar
          label={isEdit ? "저장" : "공지 등록"}
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
          title="공지를 삭제할까요?"
          message="삭제한 공지는 되돌릴 수 없어요."
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
    marginBottom: theme.spacing[4],
  },
  cardField: { marginHorizontal: 0 },
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
