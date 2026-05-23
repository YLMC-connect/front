import { router } from "expo-router";
import {
  EmptyPanel,
  MenuList,
  MenuRow,
  PrototypeScreen,
  usePrototypeVariant,
} from "../../../src/components/design/PrototypeScaffold";

const blockedUsers = ["최민수", "오지훈", "익명 사용자"];

export default function BlockedUsersScreen() {
  const variant = usePrototypeVariant();
  const isEmpty = variant === "empty";

  return (
    <PrototypeScreen
      title="차단 사용자"
      toast={variant === "toast" ? "차단을 해제했습니다." : undefined}
      dialog={{
        visible: variant === "confirm",
        title: "차단을 해제할까요?",
        message: "해제하면 해당 사용자의 글과 댓글이 다시 보입니다.",
        confirmText: "해제",
      }}
      testID="screen-mypage-blocked"
    >
      {isEmpty ? (
        <EmptyPanel
          icon="block"
          title="차단한 사용자가 없습니다"
          body="불편한 사용자를 차단하면 이곳에서 관리할 수 있습니다."
        />
      ) : (
        <MenuList>
          {blockedUsers.map((user) => (
            <MenuRow
              key={user}
              icon="person"
              title={user}
              value="해제"
              onPress={() => router.setParams({ variant: "confirm" })}
            />
          ))}
        </MenuList>
      )}
    </PrototypeScreen>
  );
}
