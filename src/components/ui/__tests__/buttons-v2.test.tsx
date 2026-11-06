import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import * as Reanimated from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "../../../constants/theme";
import {
  Button,
  FAB_BOTTOM,
  FloatingActionButton,
  LoadingDots,
} from "../buttons";
import { FloatingBottomBar } from "../floating-bottom-bar";

const safeArea = ({ children }: { children: ReactNode }) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    }}
  >
    {children}
  </SafeAreaProvider>
);

const flat = (testID: string) =>
  StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe("Button (디자인 시스템 v2)", () => {
  it("shows three dots instead of a spinner or label while loading", () => {
    render(
      <Button loading testID="save">
        저장하기
      </Button>,
    );

    expect(screen.UNSAFE_queryAllByType(ActivityIndicator)).toHaveLength(0);
    expect(screen.queryByText("저장하기")).toBeNull();
    expect(screen.getByTestId("save-loading").children).toHaveLength(3);
    expect(
      screen.getByLabelText("저장하기").props.accessibilityState,
    ).toMatchObject({ busy: true });
  });

  it("covers the background with surface-subtle only while disabled", () => {
    const { rerender } = render(
      <Button disabled testID="submit">
        등록
      </Button>,
    );
    expect(flat("submit-disabled-cover")).toMatchObject({
      backgroundColor: theme.colors.surfaceSubtle,
      opacity: 1,
    });
    expect(flat("submit")).toMatchObject({
      backgroundColor: theme.colors.primary,
    });

    rerender(<Button testID="submit-2">등록</Button>);
    expect(flat("submit-2-disabled-cover")).toMatchObject({ opacity: 0 });
  });
});

describe("LoadingDots", () => {
  const reanimated = Reanimated as { useReducedMotion: () => boolean };
  const original = reanimated.useReducedMotion;

  afterEach(() => {
    reanimated.useReducedMotion = original;
  });

  it("holds all three dots fully visible when reduce motion is on", () => {
    reanimated.useReducedMotion = () => true;
    render(<LoadingDots testID="dots" color={theme.colors.primary} />);

    [0, 1, 2].forEach((index) =>
      expect(flat(`dots-${index}`)).toMatchObject({
        opacity: 1,
        backgroundColor: theme.colors.primary,
      }),
    );
  });
});

describe("FloatingBottomBar (디자인 시스템 v2)", () => {
  it("renders the shared lg Button with 24/20/32 padding on the header layer", () => {
    const onPress = jest.fn();
    render(
      <FloatingBottomBar label="나눔 등록" onPress={onPress} testID="bar" />,
      { wrapper: safeArea },
    );

    expect(flat("bar-container")).toMatchObject({
      paddingTop: 24,
      paddingHorizontal: 20,
      paddingBottom: 32,
      zIndex: theme.zIndex.header,
    });
    expect(flat("bar")).toMatchObject({
      minHeight: theme.size.buttonHeight,
      backgroundColor: theme.colors.primary,
    });
    expect(screen.getByTestId("bar-glass-blur")).toBeTruthy();

    fireEvent.press(screen.getByTestId("bar"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("supports danger, disabled and loading through Button", () => {
    const { rerender } = render(
      <FloatingBottomBar label="탈퇴하기" testID="bar" variant="danger" />,
      { wrapper: safeArea },
    );
    expect(flat("bar").backgroundColor).toBe(theme.colors.dangerBold);

    rerender(<FloatingBottomBar disabled label="탈퇴하기" testID="bar" />);
    expect(flat("bar-disabled-cover")).toMatchObject({ opacity: 1 });

    rerender(<FloatingBottomBar loading label="탈퇴하기" testID="bar" />);
    expect(screen.getByTestId("bar-loading")).toBeTruthy();
  });

  it("puts the secondary button on the left when there are two", () => {
    const onSecondary = jest.fn();
    render(
      <FloatingBottomBar
        label="저장하기"
        secondary={{
          label: "취소",
          onPress: onSecondary,
          testID: "bar-cancel",
        }}
        testID="bar"
      />,
      { wrapper: safeArea },
    );

    const labels = screen
      .getAllByRole("button")
      .map((button) => button.props.accessibilityLabel);
    expect(labels).toEqual(["취소", "저장하기"]);
    expect(flat("bar-cancel").backgroundColor).toBe(theme.colors.primarySubtle);

    fireEvent.press(screen.getByTestId("bar-cancel"));
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });
});

describe("FloatingActionButton (디자인 시스템 v2)", () => {
  it("floats 16 above the tab bar on the tabbar layer", () => {
    render(<FloatingActionButton label="나눔하기" />);

    expect(FAB_BOTTOM).toBe(94);
    expect(
      StyleSheet.flatten(screen.getByLabelText("나눔하기").props.style),
    ).toMatchObject({
      right: 20,
      bottom: 94,
      zIndex: theme.zIndex.tabbar,
      paddingLeft: 12,
      paddingRight: 16,
      gap: 8,
    });
  });
});
