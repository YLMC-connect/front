import { View } from "react-native";
import {
  BottomActions,
  FieldStack,
  FormCard,
  PrototypeScreen,
  TextBlock,
} from "../../src/components/design/PrototypeScaffold";

export default function PrayerRequestModal() {
  return (
    <PrototypeScreen title="기도요청">
      <TextBlock
        title="기도 요청"
        body="중보기도팀에 함께 기도할 제목을 요청합니다. 공개 범위와 익명 여부를 선택할 수 있습니다."
      />
      <FormCard>
        <FieldStack title="제목" description="기도 제목을 입력해주세요." />
        <FieldStack
          title="내용"
          description="기도가 필요한 상황을 나눠주세요."
          multiline
        />
        <FieldStack title="공개 범위" description="기도방 멤버에게만 공개" />
      </FormCard>
      <View>
        <BottomActions primary="요청하기" secondary="취소" />
      </View>
    </PrototypeScreen>
  );
}
