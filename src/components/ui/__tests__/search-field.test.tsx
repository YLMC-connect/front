import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";
import { SearchField } from "../search-field";

describe("SearchField", () => {
  it("moves the focus outline from the input to the full outer surface", () => {
    render(
      <SearchField
        accessibilityLabel="검색어"
        onChangeText={jest.fn()}
        placeholder="검색"
        testID="search-field"
        value=""
      />,
    );

    const input = screen.getByTestId("search-field");
    const container = screen.getByTestId("search-field-container");

    expect(StyleSheet.flatten(input.props.style)).toMatchObject({
      outlineColor: "transparent",
      outlineWidth: 0,
    });
    expect(StyleSheet.flatten(container.props.style)).toMatchObject({
      borderColor: theme.colors.lineStrong,
      borderRadius: theme.radius.md,
    });

    fireEvent(input, "focus");
    expect(StyleSheet.flatten(container.props.style)).toMatchObject({
      borderColor: theme.colors.primary,
      borderWidth: 2,
      paddingHorizontal: 13,
    });

    fireEvent(input, "blur");
    expect(StyleSheet.flatten(container.props.style)).toMatchObject({
      borderColor: theme.colors.lineStrong,
    });
  });
});
