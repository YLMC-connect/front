import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import SignupScreenRoute from "../signup";
import SplashScreenRoute from "../splash";
import TermsSheetScreenRoute from "../terms-sheet";
import TermsScreenRoute from "../terms";
import { renderWithClient } from "../../../src/test/renderWithClient";

describe("auth smoke screens", () => {
  it("renders the splash screen", () => {
    renderWithClient(<SplashScreenRoute />);

    expect(screen.getByText("열린문 커넥트")).toBeTruthy();
    expect(screen.getByText("성도와 성도, 마음과 마음을 이어요")).toBeTruthy();
  });

  it("renders the terms agreement screen", () => {
    renderWithClient(<TermsScreenRoute />);

    expect(screen.getByText("약관에 동의해주세요")).toBeTruthy();
    expect(screen.getByText("전체 동의하기")).toBeTruthy();
    expect(screen.getAllByText("전문 보기").length).toBe(4);
  });

  it("renders the terms sheet screen", () => {
    renderWithClient(<TermsSheetScreenRoute />);

    expect(screen.getAllByText("서비스 이용약관").length).toBeGreaterThan(0);
    expect(screen.getByText("시행일자: 2026년 1월 1일")).toBeTruthy();
  });

  it("shows that a new member id is available", async () => {
    renderWithClient(<SignupScreenRoute />);

    fireEvent.changeText(screen.getByPlaceholderText("아이디"), "new-member");
    fireEvent.press(screen.getByText("중복 확인"));

    await waitFor(() =>
      expect(screen.getByText("사용 가능한 아이디입니다")).toBeTruthy(),
    );
  });

  it("shows that a known member id is unavailable", async () => {
    renderWithClient(<SignupScreenRoute />);

    fireEvent.changeText(screen.getByPlaceholderText("아이디"), "gracekim");
    fireEvent.press(screen.getByText("중복 확인"));

    await waitFor(() =>
      expect(screen.getByText("이미 사용 중인 아이디입니다")).toBeTruthy(),
    );
  });
});
