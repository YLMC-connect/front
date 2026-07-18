import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { router, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StyleSheet } from "react-native";
import MyPageScreen from "../../(tabs)/mypage";
import LoginScreenRoute from "../login";
import SignupScreenRoute from "../signup";
import SplashScreenRoute from "../splash";
import TermsSheetScreenRoute from "../terms-sheet";
import TermsScreenRoute from "../terms";
import { renderWithClient } from "../../../src/test/renderWithClient";
import { theme } from "../../../src/constants/theme";
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
    const back = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ back } as never);
    renderWithClient(<TermsScreenRoute />);

    expect(screen.getByText("약관에 동의해주세요")).toBeTruthy();
    expect(screen.getByText("전체 동의하기")).toBeTruthy();
    expect(screen.getAllByText("전문 보기").length).toBe(4);
    fireEvent.press(screen.getByLabelText("뒤로"));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("renders the terms sheet screen", () => {
    const back = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ back } as never);
    renderWithClient(<TermsSheetScreenRoute />);

    expect(screen.getAllByText("서비스 이용약관").length).toBeGreaterThan(0);
    expect(screen.getByText("시행일자: 2026년 1월 1일")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("닫기"));
    expect(screen.queryByText("시행일자: 2026년 1월 1일")).toBeNull();
    expect(back).not.toHaveBeenCalled();
  });

  it("validates login inputs before calling the session service", () => {
    renderWithClient(<LoginScreenRoute />);

    fireEvent.changeText(screen.getByTestId("login-id-input"), " ");
    fireEvent.changeText(screen.getByTestId("login-password-input"), " ");
    fireEvent.press(screen.getByText("로그인"));

    expect(screen.getByText("아이디를 입력해주세요.")).toBeTruthy();
    expect(screen.getByText("비밀번호를 입력해주세요.")).toBeTruthy();
    fireEvent(screen.getByTestId("login-id-input"), "focus");
    expect(
      StyleSheet.flatten(
        screen.getByTestId("login-id-input-focus-ring").props.style,
      ),
    ).toMatchObject({
      borderColor: theme.colors.danger,
      borderWidth: 2,
    });
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("places the login flow slightly above center with a scroll fallback", () => {
    renderWithClient(<LoginScreenRoute />);

    expect(screen.getByTestId("login-scroll").props).toMatchObject({
      keyboardShouldPersistTaps: "handled",
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("login-content").props.style),
    ).toMatchObject({
      flexGrow: 1,
      justifyContent: "center",
      paddingBottom: 72,
    });
  });

  it("draws login focus on the full input surface", () => {
    renderWithClient(<LoginScreenRoute />);

    const input = screen.getByTestId("login-id-input");
    const container = screen.getByTestId("login-id-input-container");

    expect(StyleSheet.flatten(input.props.style)).toMatchObject({
      outlineColor: "transparent",
      outlineWidth: 0,
    });
    fireEvent(input, "focus");
    expect(
      StyleSheet.flatten(
        screen.getByTestId("login-id-input-focus-ring").props.style,
      ),
    ).toMatchObject({
      borderColor: theme.colors.primary,
      borderWidth: 2,
    });
    expect(StyleSheet.flatten(container.props.style)).toMatchObject({
      height: 48,
    });
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

    fireEvent.changeText(screen.getByTestId("login-id-input"), "admin");
    fireEvent.changeText(
      screen.getByTestId("login-password-input"),
      "admin123",
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

  it("rejects the previous mock login credentials", async () => {
    renderWithClient(<LoginScreenRoute />);

    fireEvent.changeText(screen.getByTestId("login-id-input"), "gracekim");
    fireEvent.changeText(
      screen.getByTestId("login-password-input"),
      "password",
    );
    fireEvent.press(screen.getByText("로그인"));

    expect(
      await screen.findByText("아이디 또는 비밀번호가 올바르지 않습니다"),
    ).toBeTruthy();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalledWith("/");
  });

  it("shows that a new member id is available", async () => {
    renderWithClient(<SignupScreenRoute />);

    fireEvent.changeText(screen.getByPlaceholderText("아이디"), "new-member");
    fireEvent.press(screen.getByText("중복 확인"));

    await waitFor(() =>
      expect(screen.getByText("사용 가능한 아이디입니다")).toBeTruthy(),
    );
  });

  it("starts the signup form below the header with a scroll fallback", () => {
    renderWithClient(<SignupScreenRoute />);

    const signupScroll = screen.getByTestId("signup-scroll");
    expect(signupScroll.props.keyboardShouldPersistTaps).toBe("handled");
    expect(
      StyleSheet.flatten(signupScroll.props.contentContainerStyle),
    ).toMatchObject({
      paddingTop: theme.spacing[6],
    });
  });

  it("draws signup focus on the full input surface", () => {
    renderWithClient(<SignupScreenRoute />);

    const input = screen.getByTestId("signup-id-input");
    const container = screen.getByTestId("signup-id-input-container");

    expect(StyleSheet.flatten(input.props.style)).toMatchObject({
      outlineColor: "transparent",
      outlineWidth: 0,
    });
    fireEvent(input, "focus");
    expect(
      StyleSheet.flatten(
        screen.getByTestId("signup-id-input-focus-ring").props.style,
      ),
    ).toMatchObject({
      borderColor: theme.colors.primary,
      borderWidth: 2,
    });
    expect(StyleSheet.flatten(container.props.style)).toMatchObject({
      height: 48,
    });
  });

  it("toggles signup password visibility with accessible controls", () => {
    renderWithClient(<SignupScreenRoute />);
    const visibilityButtons = screen.getAllByLabelText("비밀번호 보기");

    expect(visibilityButtons).toHaveLength(2);
    expect(
      screen.getByTestId("signup-password-input").props.secureTextEntry,
    ).toBe(true);
    fireEvent.press(visibilityButtons[0]);
    expect(
      screen.getByTestId("signup-password-input").props.secureTextEntry,
    ).toBe(false);
  });

  it("shows that a known member id is unavailable", async () => {
    renderWithClient(<SignupScreenRoute />);

    fireEvent.changeText(screen.getByPlaceholderText("아이디"), "admin");
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
