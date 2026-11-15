import { useLocalSearchParams } from "expo-router";
import { LegalDocumentScreen } from "../../src/components/mypage/LegalDocumentScreen";

export default function MyPageTermsScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  return (
    <LegalDocumentScreen
      initialTab={params.tab === "privacy" ? "privacy" : "terms"}
    />
  );
}
