import { router, useLocalSearchParams } from "expo-router";
import {
  MenuList,
  MenuRow,
  ProfileHero,
  PrototypeScreen,
  SectionLabel,
  TextBlock,
} from "../../../src/components/design/PrototypeScaffold";
import { MOCK_MEMBERS } from "../../../src/mocks/auth";

export default function UserProfileScreen() {
  const params = useLocalSearchParams<{ id?: string; variant?: string }>();
  const variant = params.variant ?? "default";
  const user =
    MOCK_MEMBERS.find((member) => member.id === params.id) ??
    MOCK_MEMBERS[1] ??
    MOCK_MEMBERS[0];

  if (!user) {
    return null;
  }

  return (
    <PrototypeScreen
      title="성도 프로필"
      toast={variant === "block-toast" ? "사용자를 차단했습니다." : undefined}
      dialog={{
        visible: variant === "block-confirm",
        title: "이 사용자를 차단할까요?",
        message: "차단하면 해당 사용자의 글과 댓글이 보이지 않습니다.",
        confirmText: "차단",
      }}
      testID="screen-user-profile"
    >
      <ProfileHero
        name={variant === "withdrawn" ? "탈퇴한 사용자" : user.name}
        subtitle={
          variant === "blocked"
            ? "차단한 사용자"
            : (user.department ?? "부서 미등록")
        }
        value={variant === "blocked" ? "차단됨" : "성도"}
      />
      <TextBlock
        title="공개 정보"
        body={
          variant === "withdrawn"
            ? "탈퇴한 사용자의 프로필 정보는 표시되지 않습니다."
            : "사용자가 공개한 부서와 활동 정보를 확인할 수 있습니다."
        }
      />
      <SectionLabel>활동</SectionLabel>
      <MenuList>
        <MenuRow icon="redeem" title="나눔 활동" value="3건" />
        <MenuRow icon="groups" title="함께한 소모임" value="1개" />
      </MenuList>
      <SectionLabel>관리</SectionLabel>
      <MenuList>
        <MenuRow
          icon="block"
          title={variant === "blocked" ? "차단 해제" : "차단"}
          danger={variant !== "blocked"}
          onPress={() => router.setParams({ variant: "block-confirm" })}
        />
      </MenuList>
    </PrototypeScreen>
  );
}
