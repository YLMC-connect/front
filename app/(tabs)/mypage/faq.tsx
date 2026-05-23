import {
  EmptyPanel,
  NoticeItem,
  PrototypeScreen,
  usePrototypeVariant,
} from "../../../src/components/design/PrototypeScaffold";
import { useMyPage } from "../../../src/hooks/useMyPage";

export default function FaqScreen() {
  const variant = usePrototypeVariant();
  const { data } = useMyPage();
  const faqs = data?.faqs ?? [];

  return (
    <PrototypeScreen title="FAQ" testID="screen-mypage-faq">
      {variant === "empty" ? (
        <EmptyPanel
          icon="help-outline"
          title="등록된 FAQ가 없습니다"
          body="자주 묻는 질문은 관리자 등록 후 표시됩니다."
        />
      ) : (
        faqs.map((faq) => (
          <NoticeItem
            key={faq.question}
            title={faq.question}
            body={faq.answer}
          />
        ))
      )}
    </PrototypeScreen>
  );
}
