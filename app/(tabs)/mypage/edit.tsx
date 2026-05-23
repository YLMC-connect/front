import { View } from "react-native";
import {
  BottomActions,
  FieldStack,
  FormCard,
  ProfileHero,
  PrototypeScreen,
  VariantNote,
  usePrototypeVariant,
} from "../../../src/components/design/PrototypeScaffold";
import { useAuth } from "../../../src/hooks/useAuth";

export default function EditProfileScreen() {
  const { currentUser } = useAuth();
  const variant = usePrototypeVariant();

  const phoneError =
    variant === "phone-dup" ? "이미 등록된 연락처입니다." : undefined;
  const currentPwError =
    variant === "current-pw-error"
      ? "현재 비밀번호가 일치하지 않습니다."
      : undefined;
  const newPwError =
    variant === "pw-mismatch" ? "새 비밀번호가 서로 다릅니다." : undefined;

  return (
    <PrototypeScreen title="프로필 수정" testID="screen-mypage-edit">
      <ProfileHero
        name={currentUser?.name ?? "김은혜"}
        subtitle="이름과 목장 정보는 교회 DB 기준으로 표시됩니다."
        value="성도"
      />
      <FormCard note="연락처와 비밀번호만 앱에서 직접 수정할 수 있습니다.">
        <FieldStack
          title="휴대폰"
          description="010-1234-5678"
          error={phoneError}
        />
        <FieldStack
          title="현재 비밀번호"
          description="현재 비밀번호"
          error={currentPwError}
        />
        <FieldStack title="새 비밀번호" description="변경할 때만 입력" />
        <FieldStack
          title="새 비밀번호 확인"
          description="한 번 더 입력"
          error={newPwError}
        />
      </FormCard>
      <VariantNote>
        성도 이름, 교구, 목장 정보는 관리자 확인 후 수정됩니다.
      </VariantNote>
      <View>
        <BottomActions primary="변경 저장" secondary="취소" />
      </View>
    </PrototypeScreen>
  );
}
