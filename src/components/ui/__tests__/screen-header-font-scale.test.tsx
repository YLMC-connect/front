import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { ScreenHeader } from "../screen-header";

// 글자 크기 설정 200% (fontScale 2)
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({ width: 402, height: 874, scale: 3, fontScale: 2 }),
}));

describe("ScreenHeader with a larger font size", () => {
  it("grows the header height so the title is not clipped", () => {
    render(
      <ScreenHeader title="나눔" subtitle="큰 글자" testID="big-header" />,
    );

    expect(
      StyleSheet.flatten(screen.getByTestId("big-header").props.style),
    ).toMatchObject({ height: 178 });
  });

  it("grows the compact header too", () => {
    render(<ScreenHeader title="나눔" compact testID="big-compact" />);

    expect(
      StyleSheet.flatten(screen.getByTestId("big-compact").props.style),
    ).toMatchObject({ height: 120 });
  });
});
