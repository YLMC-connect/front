import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import LoginScreenRoute from "../login";
import SignupScreenRoute from "../signup";
import SplashScreenRoute from "../splash";
import TermsSheetScreenRoute from "../terms-sheet";
import TermsScreenRoute from "../terms";
import { renderWithClient } from "../../../src/test/renderWithClient";
import { useAuthStore } from "../../../src/store/authStore";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

describe("auth smoke screens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.getState().setAnonymous();
  });

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

  it("validates login inputs before calling the session service", () => {
    renderWithClient(<LoginScreenRoute />);

    fireEvent.changeText(screen.getByTestId("login-id-input"), " ");
    fireEvent.changeText(screen.getByTestId("login-password-input"), " ");
    fireEvent.press(screen.getByText("로그인"));

    expect(screen.getByText("아이디를 입력해주세요.")).toBeTruthy();
    expect(screen.getByText("비밀번호를 입력해주세요.")).toBeTruthy();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("stores the login session before entering the home screen", async () => {
    renderWithClient(<LoginScreenRoute />);

    fireEvent.changeText(screen.getByTestId("login-id-input"), "gracekim");
    fireEvent.changeText(
      screen.getByTestId("login-password-input"),
      "password",
    );
    fireEvent.press(screen.getByText("로그인"));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"), {
      timeout: 5000,
    });
    expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(
      1,
      "ylmc.access_token",
      "mock-access-token",
    );
    expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(
      2,
      "ylmc.refresh_token",
      "mock-refresh-token",
    );
    expect(useAuthStore.getState()).toMatchObject({
      isLoggedIn: true,
      status: "authenticated",
    });
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

  it("invalidates an available id result when the input changes", async () => {
    renderWithClient(<SignupScreenRoute />);

    fireEvent.changeText(screen.getByTestId("signup-id-input"), "new-member");
    fireEvent.press(screen.getByTestId("signup-check-id"));
    await screen.findByText("사용 가능한 아이디입니다");

    fireEvent.changeText(
      screen.getByTestId("signup-id-input"),
      "another-member",
    );
    fireEvent.changeText(
      screen.getByTestId("signup-password-input"),
      "password1",
    );
    fireEvent.changeText(
      screen.getByTestId("signup-password-confirm-input"),
      "password1",
    );
    fireEvent.changeText(screen.getByTestId("signup-name-input"), "새성도");
    fireEvent.changeText(
      screen.getByTestId("signup-phone-input"),
      "01012345678",
    );
    fireEvent.press(screen.getByTestId("signup-submit"));

    expect(screen.getByText("아이디 중복 확인이 필요합니다.")).toBeTruthy();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("stores a signup session after checking id availability", async () => {
    renderWithClient(<SignupScreenRoute />);

    fireEvent.changeText(screen.getByTestId("signup-id-input"), "new-member");
    fireEvent.press(screen.getByTestId("signup-check-id"));
    await screen.findByText("사용 가능한 아이디입니다");
    fireEvent.changeText(
      screen.getByTestId("signup-password-input"),
      "password1",
    );
    fireEvent.changeText(
      screen.getByTestId("signup-password-confirm-input"),
      "password1",
    );
    fireEvent.changeText(screen.getByTestId("signup-name-input"), "새성도");
    fireEvent.changeText(
      screen.getByTestId("signup-phone-input"),
      "01012345678",
    );
    fireEvent.press(screen.getByTestId("signup-submit"));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"), {
      timeout: 5000,
    });
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(2);
    expect(useAuthStore.getState()).toMatchObject({
      currentUser: { id: "member-new-member", name: "새성도" },
      isLoggedIn: true,
      status: "authenticated",
    });
  });
});
