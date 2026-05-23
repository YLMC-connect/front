import { View } from "react-native";
import {
  BottomActions,
  FieldStack,
  FormCard,
  PrototypeScreen,
  TextBlock,
} from "../../src/components/design/PrototypeScaffold";

export default function LifeStudyApplyModal() {
  return (
    <PrototypeScreen title="수강 신청">
      <TextBlock
        title="삶공부 신청"
        body="수강 가능한 과정과 일정을 확인한 뒤 신청합니다. 실제 신청 API가 준비되기 전까지 mock-first로 접수 상태를 표시합니다."
      />
      <FormCard>
        <FieldStack title="신청 과정" description="말씀 기초반" />
        <FieldStack title="연락처" description="010-1234-5678" />
        <FieldStack
          title="요청 사항"
          description="강사에게 전달할 내용을 입력해주세요."
          multiline
        />
      </FormCard>
      <View>
        <BottomActions primary="신청하기" secondary="취소" />
      </View>
    </PrototypeScreen>
  );
}
