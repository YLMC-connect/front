import { fireEvent, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import { renderWithClient } from "../../src/test/renderWithClient";
import NotFoundScreen from "../+not-found";

describe("NotFoundScreen", () => {
  it("renders not found state and navigates home when button is pressed", () => {
    renderWithClient(<NotFoundScreen />);

    expect(screen.getByTestId("not-found-empty")).toBeTruthy();
    const homeButton = screen.getByTestId("not-found-home-button");
    expect(homeButton).toBeTruthy();

    fireEvent.press(homeButton);
    expect(router.replace).toHaveBeenCalledWith("/");
  });
});
