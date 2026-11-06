import { fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";
import { TopBar } from "../navigation";
import { ScreenHeader } from "../screen-header";

describe("TopBar variants", () => {
  beforeEach(() => {
    jest.mocked(useLocalSearchParams).mockReturnValue({});
  });

  it("shows a 44pt close button named 닫기 instead of back", () => {
    const onBack = jest.fn();
    render(
      <TopBar title="나눔 등록" close onBack={onBack} testID="modal-header" />,
    );

    expect(screen.queryByLabelText("뒤로")).toBeNull();
    const close = screen.getByLabelText("닫기");
    expect(StyleSheet.flatten(close.props.style)).toMatchObject({
      width: theme.layout.touchTarget,
      height: theme.layout.touchTarget,
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("modal-header-title").props.style),
    ).toMatchObject({ position: "absolute", alignItems: "center" });

    fireEvent.press(close);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("draws white text over a dark gradient on photos", () => {
    render(<TopBar title="나눔 상세" back overPhoto testID="photo-header" />);

    expect(screen.getByTestId("photo-header-gradient")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByText("나눔 상세").props.style),
    ).toMatchObject({ color: theme.colors.onPrimary });
    expect(
      StyleSheet.flatten(screen.getByText("뒤로").props.style),
    ).toMatchObject({ color: theme.colors.onPrimary });
  });

  it("keeps the plain bar free of the photo gradient", () => {
    render(<TopBar title="나눔 상세" back testID="plain-header" />);

    expect(screen.queryByTestId("plain-header-gradient")).toBeNull();
  });
});

describe("ScreenHeader bottom fade", () => {
  it("has no bottom edge gradient by default", () => {
    render(<ScreenHeader title="나눔" testID="root-header" />);

    expect(screen.queryByTestId("root-header-fade")).toBeNull();
  });

  it("adds a bottom edge gradient when asked", () => {
    render(<ScreenHeader title="나눔" bottomFade testID="root-header" />);

    expect(
      StyleSheet.flatten(screen.getByTestId("root-header-fade").props.style),
    ).toMatchObject({ top: "100%", height: 16 });
  });
});
