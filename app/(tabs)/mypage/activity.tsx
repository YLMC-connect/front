import {
  EmptyPanel,
  MenuList,
  MenuRow,
  PrototypeScreen,
  SectionLabel,
  usePrototypeVariant,
} from "../../../src/components/design/PrototypeScaffold";
import { useMyPage } from "../../../src/hooks/useMyPage";

export default function ActivityScreen() {
  const { data } = useMyPage();
  const variant = usePrototypeVariant("posts");
  const items =
    variant === "comments"
      ? ["나눔 댓글: 주일 2부 예배 후 받을 수 있습니다", "기도방 댓글"]
      : variant === "groups"
        ? (data?.groups.map((group) => group.name) ?? [])
        : (data?.marketItems.map((item) => item.title) ?? []);

  return (
    <PrototypeScreen title="활동 내역" testID="screen-mypage-activity">
      <SectionLabel>
        {variant === "comments"
          ? "댓글"
          : variant === "groups"
            ? "소모임"
            : "나눔 게시글"}
      </SectionLabel>
      {variant === "empty" || items.length === 0 ? (
        <EmptyPanel
          icon="inbox"
          title="활동 내역이 없습니다"
          body="나눔, 댓글, 소모임 활동이 생기면 이곳에 모입니다."
        />
      ) : (
        <MenuList>
          {items.map((item, index) => (
            <MenuRow
              key={item}
              icon={variant === "groups" ? "groups" : "redeem"}
              title={item}
              value={index === 0 ? "최근" : "이전"}
            />
          ))}
        </MenuList>
      )}
    </PrototypeScreen>
  );
}
