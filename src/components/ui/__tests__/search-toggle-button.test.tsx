import { fireEvent, render, screen } from "@testing-library/react-native";
import { SearchToggleButton } from "../search-toggle-button";

describe("SearchToggleButton", () => {
  it("shows explicit search and close labels while preserving press behavior", () => {
    const onPress = jest.fn();
    const view = render(
      <SearchToggleButton
        accessibilityLabel="삶공부 검색"
        onPress={onPress}
        open={false}
      />,
    );

    expect(screen.getByText("검색")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("삶공부 검색"));
    expect(onPress).toHaveBeenCalledTimes(1);

    view.rerender(
      <SearchToggleButton
        accessibilityLabel="삶공부 검색 닫기"
        onPress={onPress}
        open
      />,
    );
    expect(screen.getByText("닫기")).toBeTruthy();
  });
});
