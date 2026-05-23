import { router, useLocalSearchParams } from "expo-router";
import {
  MenuList,
  MenuRow,
  ProfileHero,
  PrototypeScreen,
  RadioOption,
  SectionLabel,
} from "../../src/components/design/PrototypeScaffold";
import { mockGroups } from "../../src/mocks/groups";

export default function GroupMembersModal() {
  const params = useLocalSearchParams<{ variant?: string }>();
  const variant = params.variant ?? "default";
  const group = mockGroups[0];

  return (
    <PrototypeScreen
      title="멤버 관리"
      toast={variant === "kick-toast" ? "멤버를 내보냈습니다." : undefined}
      dialog={{
        visible: variant === "kick-confirm" || variant === "transfer-confirm",
        title:
          variant === "transfer-confirm"
            ? "소모임장을 이관할까요?"
            : "멤버를 내보낼까요?",
        message:
          variant === "transfer-confirm"
            ? "이관 후에는 새 리더가 소모임을 관리합니다."
            : "내보낸 멤버는 다시 참여 신청을 해야 합니다.",
        confirmText: variant === "transfer-confirm" ? "이관" : "내보내기",
      }}
      testID="screen-group-members"
    >
      <ProfileHero
        name={group.name}
        subtitle={`${group.members.length} / ${group.maxMembers}명 참여`}
        value="모집중"
      />
      {variant === "transfer" || variant === "transfer-confirm" ? (
        <>
          <SectionLabel>이관할 멤버</SectionLabel>
          <MenuList>
            {group.members.map((member, index) => (
              <RadioOption
                key={member.id}
                label={member.name}
                subtitle={member.department}
                selected={index === 1}
              />
            ))}
          </MenuList>
          <MenuList>
            <MenuRow
              icon="swap-horiz"
              title="소모임장 이관"
              value="확인"
              onPress={() => router.setParams({ variant: "transfer-confirm" })}
            />
          </MenuList>
        </>
      ) : (
        <>
          <SectionLabel>현재 멤버</SectionLabel>
          <MenuList>
            {group.members.map((member) => (
              <MenuRow
                key={member.id}
                icon="person"
                title={member.name}
                subtitle={member.department}
                value={member.id === group.leader.id ? "리더" : "관리"}
                onPress={() => router.setParams({ variant: "kick-confirm" })}
              />
            ))}
          </MenuList>
          <MenuList>
            <MenuRow
              icon="swap-horiz"
              title="소모임장 이관"
              onPress={() => router.setParams({ variant: "transfer" })}
            />
          </MenuList>
        </>
      )}
    </PrototypeScreen>
  );
}
