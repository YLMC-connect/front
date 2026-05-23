import {
  PrototypeScreen,
  TextBlock,
} from "../../../src/components/design/PrototypeScaffold";

export default function PrivacyScreen() {
  return (
    <PrototypeScreen title="개인정보처리방침" testID="screen-mypage-privacy">
      <TextBlock
        title="수집 항목"
        body="성도 인증과 서비스 이용을 위해 이름, 부서, 연락처, 앱 활동 정보가 사용될 수 있습니다. 실제 API 연결 전까지는 mock 데이터로만 표시합니다."
      />
      <TextBlock
        title="보관과 삭제"
        body="회원 탈퇴 요청은 관리자 확인이 필요한 soft delete 흐름으로 설계합니다. 실제 보관 기간과 삭제 정책은 백엔드 확정 후 ADR에 기록합니다."
      />
    </PrototypeScreen>
  );
}
