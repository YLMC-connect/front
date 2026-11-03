import { fireEvent, screen } from "@testing-library/react-native";
import FaqScreen from "../faq";
import { renderWithClient } from "../../../src/test/renderWithClient";
import * as siteContentService from "../../../src/services/siteContentService";

describe("FaqScreen", () => {
  const mockFaqCategories = [
    {
      id: 1,
      name: "계정",
      faqs: [
        {
          id: 1,
          question: "회원가입은 어떻게 하나요?",
          answer: "회원가입은 가입 버튼을 누르고 진행합니다.",
        },
      ],
    },
    {
      id: 2,
      name: "소모임",
      faqs: [
        {
          id: 2,
          question: "소모임 개설은 어떻게 하나요?",
          answer: "소모임 탭의 + 버튼을 눌러 개설할 수 있습니다.",
        },
      ],
    },
  ];

  it("renders categories and filters FAQs by selected category", async () => {
    jest
      .spyOn(siteContentService, "getFaqs")
      .mockResolvedValueOnce(mockFaqCategories);

    renderWithClient(<FaqScreen />);

    // 로드 후 질문 확인
    expect(await screen.findByText("회원가입은 어떻게 하나요?")).toBeTruthy();
    expect(screen.getByText("소모임 개설은 어떻게 하나요?")).toBeTruthy();

    // 카테고리 칩 확인
    expect(screen.getByText("전체")).toBeTruthy();
    expect(screen.getByText("계정")).toBeTruthy();
    expect(screen.getByText("소모임")).toBeTruthy();

    // 소모임 카테고리 필터 선택
    fireEvent.press(screen.getByText("소모임"));

    expect(screen.getByText("소모임 개설은 어떻게 하나요?")).toBeTruthy();
    expect(screen.queryByText("회원가입은 어떻게 하나요?")).toBeNull();

    // 아코디언 토글 클릭 -> 답변 노출
    fireEvent.press(screen.getByText("소모임 개설은 어떻게 하나요?"));
    expect(
      screen.getByText("소모임 탭의 + 버튼을 눌러 개설할 수 있습니다."),
    ).toBeTruthy();
  });

  it("renders empty state when faq list is empty", async () => {
    jest.spyOn(siteContentService, "getFaqs").mockResolvedValueOnce([]);

    renderWithClient(<FaqScreen />);

    expect(await screen.findByText("등록된 FAQ가 없어요")).toBeTruthy();
  });
});
