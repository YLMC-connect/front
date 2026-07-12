import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import MyPageScreen from "../../(tabs)/mypage";
import LoginScreenRoute from "../login";
import SignupScreenRoute from "../signup";
import SplashScreenRoute from "../splash";
import TermsSheetScreenRoute from "../terms-sheet";
import TermsScreenRoute from "../terms";
import { renderWithClient } from "../../../src/test/renderWithClient";
import { MOCK_USER } from "../../../src/mocks/auth";
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

  it("toggles password visibility and explains the unavailable recovery flow", () => {
    renderWithClient(<LoginScreenRoute />);
    const password = screen.getByTestId("login-password-input");

    expect(password.props.secureTextEntry).toBe(true);
    fireEvent.press(screen.getByLabelText("비밀번호 보기"));
    expect(
      screen.getByTestId("login-password-input").props.secureTextEntry,
    ).toBe(false);

    fireEvent.press(screen.getByText("비밀번호 찾기"));
    expect(screen.getByText("비밀번호 찾기는 준비 중입니다")).toBeTruthy();
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

  it("clears both tokens and becomes anonymous when logout cleanup partially fails", async () => {
    const replace = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ replace } as never);
    jest
      .mocked(SecureStore.deleteItemAsync)
      .mockRejectedValueOnce(new Error("keystore delete failed"))
      .mockResolvedValueOnce(undefined);
    useAuthStore.getState().setAuthenticated(MOCK_USER);
    renderWithClient(<MyPageScreen />);

    fireEvent.press(screen.getByTestId("mypage-logout"));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "ylmc.access_token",
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      "ylmc.refresh_token",
    );
    expect(useAuthStore.getState()).toMatchObject({
      currentUser: null,
      isLoggedIn: false,
      status: "anonymous",
    });
  });
});
