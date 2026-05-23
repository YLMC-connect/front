import { router, useLocalSearchParams } from "expo-router";
import {
  MenuList,
  MenuRow,
  ProfileHero,
  PrototypeScreen,
  SectionLabel,
  StatStrip,
} from "../../../src/components/design/PrototypeScaffold";
import { useAuth } from "../../../src/hooks/useAuth";
import { useMyPage } from "../../../src/hooks/useMyPage";

export default function MyPageScreen() {
  const { currentUser } = useAuth();
  const { data } = useMyPage();
  const params = useLocalSearchParams<{ variant?: string }>();
  const showLogout = params.variant === "logout-confirm";

  return (
    <PrototypeScreen
      title="마이페이지"
      back={false}
      testID="screen-mypage"
      dialog={{
        visible: showLogout,
        title: "로그아웃할까요?",
        message: "현재 계정에서 로그아웃합니다.",
        confirmText: "로그아웃",
      }}
    >
      <ProfileHero
        name={currentUser?.name ?? "김은혜"}
        subtitle={currentUser?.department ?? "청년 1부"}
        actionLabel="수정"
        onAction={() => router.push("/mypage/edit")}
      />
      <StatStrip
        items={[
          { label: "나눔", value: data?.marketItems.length ?? 0 },
          { label: "소모임", value: data?.groups.length ?? 0 },
          { label: "삶공부", value: data?.lifeStudyCourses.length ?? 0 },
          { label: "기도방", value: data?.prayerRooms.length ?? 0 },
        ]}
      />
      <SectionLabel>내 활동</SectionLabel>
      <MenuList>
        <MenuRow
          icon="redeem"
          title="활동 내역"
          subtitle="내 나눔 게시글, 댓글, 소모임 활동"
          onPress={() => router.push("/mypage/activity")}
        />
        <MenuRow
          icon="menu-book"
          title="삶공부 수강 내역"
          subtitle="신청/수료한 삶공부 과정"
          onPress={() => router.push("/life-study/history")}
        />
        <MenuRow
          icon="block"
          title="차단 사용자"
          subtitle="차단한 성도 목록 관리"
          onPress={() => router.push("/mypage/blocked")}
        />
      </MenuList>
      <SectionLabel>고객센터</SectionLabel>
      <MenuList>
        <MenuRow
          icon="help-outline"
          title="FAQ"
          onPress={() => router.push("/mypage/faq")}
        />
        <MenuRow
          icon="description"
          title="이용약관"
          onPress={() => router.push("/mypage/terms")}
        />
        <MenuRow
          icon="privacy-tip"
          title="개인정보처리방침"
          onPress={() => router.push("/mypage/privacy")}
        />
      </MenuList>
      <SectionLabel>계정</SectionLabel>
      <MenuList>
        <MenuRow
          icon="logout"
          title="로그아웃"
          onPress={() => router.setParams({ variant: "logout-confirm" })}
        />
        <MenuRow
          icon="person-remove"
          title="회원 탈퇴"
          danger
          onPress={() => router.push("/mypage/withdraw")}
        />
      </MenuList>
    </PrototypeScreen>
  );
}
