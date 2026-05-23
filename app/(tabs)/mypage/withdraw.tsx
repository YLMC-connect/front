import { router } from "expo-router";
import { View } from "react-native";
import {
  BottomActions,
  FieldStack,
  FormCard,
  PrototypeScreen,
  TextBlock,
  usePrototypeVariant,
} from "../../../src/components/design/PrototypeScaffold";

export default function WithdrawScreen() {
  const variant = usePrototypeVariant();

  return (
    <PrototypeScreen
      title="회원 탈퇴"
      dialog={{
        visible: variant === "confirm",
        title: "정말 탈퇴할까요?",
        message: "탈퇴 요청 후 관리자 확인이 진행됩니다.",
        confirmText: "탈퇴 요청",
      }}
      testID="screen-mypage-withdraw"
    >
      <TextBlock
        title="탈퇴 전 확인"
        body="탈퇴하면 앱 이용 권한이 중지되고, 작성한 게시글은 운영 정책에 따라 비활성 처리될 수 있습니다."
      />
      <FormCard>
        <FieldStack title="현재 비밀번호" description="본인 확인을 위해 입력" />
        <FieldStack title="탈퇴 사유" description="선택 입력" multiline />
      </FormCard>
      <View>
        <BottomActions primary="탈퇴 요청" secondary="취소" danger />
      </View>
      <View onTouchEnd={() => router.setParams({ variant: "confirm" })} />
    </PrototypeScreen>
  );
}
