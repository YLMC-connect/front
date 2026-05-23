import {
  NoticeItem,
  PrototypeScreen,
  SectionLabel,
} from "../../src/components/design/PrototypeScaffold";
import { useHome } from "../../src/hooks/useHome";

export default function NotificationsScreen() {
  const { data } = useHome();
  const notices = data?.notices ?? [];

  return (
    <PrototypeScreen title="알림" testID="screen-notifications">
      <SectionLabel>오늘</SectionLabel>
      {notices.map((notice) => (
        <NoticeItem
          key={notice.id}
          title={notice.title}
          body={notice.summary}
          meta="방금 전"
        />
      ))}
      <SectionLabel>이전 알림</SectionLabel>
      <NoticeItem
        title="나눔 댓글이 등록되었습니다"
        body="예약 가능한 시간을 댓글로 확인해주세요."
        meta="어제"
      />
      <NoticeItem
        title="소모임 공지가 올라왔습니다"
        body="토요 산악회 모임 장소가 교회 정문으로 변경되었습니다."
        meta="2일 전"
      />
    </PrototypeScreen>
  );
}
