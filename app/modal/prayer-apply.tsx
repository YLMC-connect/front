import { View } from "react-native";
import {
  BottomActions,
  FieldStack,
  FormCard,
  PrototypeScreen,
  TextBlock,
} from "../../src/components/design/PrototypeScaffold";

export default function PrayerApplyModal() {
  return (
    <PrototypeScreen title="기도방 신청">
      <TextBlock
        title="중보기도방 참여 신청"
        body="함께 기도할 방을 선택하고 참여 신청을 보냅니다. 리더 승인 정책은 API 확정 전까지 mock으로 둡니다."
      />
      <FormCard>
        <FieldStack title="기도방" description="월요 새벽기도방" />
        <FieldStack
          title="신청 메시지"
          description="함께 기도하고 싶은 마음을 남겨주세요."
          multiline
        />
      </FormCard>
      <View>
        <BottomActions primary="신청하기" secondary="취소" />
      </View>
    </PrototypeScreen>
  );
}
