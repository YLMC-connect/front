import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../layout/Screen";
import { TopBar } from "../ui";
import { theme } from "../../constants/theme";

const body =
  '본 약관은 열린문커넥트(이하 "서비스")가 제공하는 모바일 애플리케이션 및 관련 제반 서비스의 이용과 관련하여 회사와 회원의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.';

export function LegalDocumentScreen({
  title = "이용약관",
  primary = "제1조 (목적)",
}: {
  title?: string;
  primary?: string;
}) {
  const router = useRouter();
  const sections = [
    { heading: primary, text: body },
    {
      heading: "제2조 (정의)",
      text: '1. "회원"이란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.\n2. "콘텐츠"란 회원이 서비스에 게시한 글, 사진, 댓글 등을 의미합니다.\n3. "교회 커뮤니티"란 동일 교회 소속 회원으로 구성된 폐쇄형 그룹을 말합니다.',
    },
    {
      heading: "제3조 (약관의 효력 및 변경)",
      text: "본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다. 회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.",
    },
    {
      heading: "제4조 (회원가입)",
      text: "회원이 되고자 하는 자는 회사가 정한 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.",
    },
    {
      heading: "제5조 (서비스의 제공 및 변경)",
      text: "회사는 다음과 같은 서비스를 제공합니다.\n- 교회 내 중고거래 및 나눔 플랫폼\n- 소모임 개설 및 참여\n- 중보기도 모임\n- 삶공부 과정 안내 및 수강 신청",
    },
  ];

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <TopBar title={title} back onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.effective}>시행일자: 2026년 1월 1일</Text>
          {sections.map((section) => (
            <View key={section.heading} style={styles.section}>
              <Text style={styles.heading}>{section.heading}</Text>
              <Text style={styles.text}>{section.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 24,
  },
  effective: {
    marginBottom: 18,
    color: theme.colors.inkMute,
    fontSize: theme.fontSize.xs,
  },
  section: {
    marginBottom: 22,
  },
  heading: {
    marginBottom: 8,
    color: theme.colors.ink,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
  },
  text: {
    color: theme.colors.inkSoft,
    fontSize: 13.5,
    lineHeight: 23.5,
  },
});
