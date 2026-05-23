import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import {
  BottomActions,
  FieldStack,
  FormCard,
  PrototypeScreen,
  TextBlock,
} from "../../src/components/design/PrototypeScaffold";

export default function GroupNoticeModal() {
  const params = useLocalSearchParams<{ variant?: string }>();
  const variant = params.variant ?? "create";
  const isEdit = variant === "edit";

  return (
    <PrototypeScreen
      title={isEdit ? "공지 수정" : "공지 작성"}
      dialog={{
        visible: variant === "delete-confirm",
        title: "공지를 삭제할까요?",
        message: "삭제한 공지는 다시 복구할 수 없습니다.",
        confirmText: "삭제",
      }}
      testID="screen-group-notice"
    >
      <TextBlock
        title={isEdit ? "소모임 공지 수정" : "소모임 공지 작성"}
        body="모임 일정 변경, 준비물, 장소 안내처럼 멤버에게 꼭 전달할 내용을 작성합니다."
      />
      <FormCard>
        <FieldStack
          title="제목"
          description={
            variant === "create-filled" || isEdit
              ? "이번 주는 북한산 도선사 코스입니다"
              : "공지 제목"
          }
        />
        <FieldStack
          title="내용"
          description={
            variant === "create-filled" || isEdit
              ? "등산화와 물을 꼭 챙겨주세요."
              : "공지 내용을 입력해주세요."
          }
          multiline
        />
      </FormCard>
      <View>
        <BottomActions
          primary={isEdit ? "수정 완료" : "등록"}
          secondary="취소"
        />
      </View>
      {isEdit ? (
        <View
          onTouchEnd={() => router.setParams({ variant: "delete-confirm" })}
        />
      ) : null}
    </PrototypeScreen>
  );
}
