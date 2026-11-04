import { fireEvent, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { renderWithClient } from "../../src/test/renderWithClient";
import NotFoundScreen from "../+not-found";

describe("NotFoundScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders not found state and navigates home when home button is pressed", () => {
    renderWithClient(<NotFoundScreen />);

    expect(screen.getByTestId("not-found-empty")).toBeTruthy();
    expect(screen.getByText("404 NOT FOUND")).toBeTruthy();
    expect(screen.getByText("페이지를 찾을 수 없어요")).toBeTruthy();

    const homeButton = screen.getByTestId("not-found-home-button");
    expect(homeButton).toBeTruthy();

    fireEvent.press(homeButton);
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("navigates back when back button is pressed and canGoBack is true", () => {
    const mockCanGoBack = jest.fn().mockReturnValue(true);
    (router as unknown as { canGoBack: typeof mockCanGoBack }).canGoBack =
      mockCanGoBack;

    renderWithClient(<NotFoundScreen />);

    const backButton = screen.getByTestId("not-found-back-button");
    fireEvent.press(backButton);

    expect(mockCanGoBack).toHaveBeenCalled();
    expect(router.back).toHaveBeenCalled();
  });

  it("navigates home when back button is pressed and canGoBack is false", () => {
    const mockCanGoBack = jest.fn().mockReturnValue(false);
    (router as unknown as { canGoBack: typeof mockCanGoBack }).canGoBack =
      mockCanGoBack;

    renderWithClient(<NotFoundScreen />);

    const backButton = screen.getByTestId("not-found-back-button");
    fireEvent.press(backButton);

    expect(mockCanGoBack).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/");
  });
});
