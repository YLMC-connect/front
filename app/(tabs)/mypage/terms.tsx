import {
  PrototypeScreen,
  TextBlock,
} from "../../../src/components/design/PrototypeScaffold";

export default function MyTermsScreen() {
  return (
    <PrototypeScreen title="이용약관" testID="screen-mypage-terms">
      <TextBlock
        title="열린문커넥트 이용약관"
        body="열린문커넥트는 열린문교회 성도 간 안전한 교류를 돕는 서비스입니다. 회원은 나눔, 소모임, 삶공부, 중보기도 기능을 사용할 때 서로를 존중하고 교회 공동체의 질서를 지켜야 합니다."
      />
      <TextBlock
        title="커뮤니티 운영"
        body="부적절한 게시글, 허위 정보, 개인정보 노출, 금전 거래 유도는 제한될 수 있습니다. 신고와 차단 기능은 v1 mock-first 범위에서 UI를 제공합니다."
      />
    </PrototypeScreen>
  );
}
