import { LegalDocumentScreen } from "../../src/components/mypage/LegalDocumentScreen";

/** 예전 주소 호환: 약관 · 정책 화면을 개인정보 처리방침 탭으로 연다. */
export default function PrivacyScreen() {
  return <LegalDocumentScreen initialTab="privacy" />;
}
