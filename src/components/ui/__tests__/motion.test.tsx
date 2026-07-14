import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";
import { theme } from "../../../constants/theme";
import {
  BottomSheet,
  Card,
  ConfirmDialog,
  FilterChips,
  MotionPressable,
  SegmentedTabs,
} from "../index";

describe("common motion", () => {
  it("keeps the shared motion values short and subtle", () => {
    expect(theme.motion.duration).toEqual({
      fast: 140,
      base: 200,
      overlay: 220,
    });
    expect(theme.motion.scale).toEqual({ pressed: 0.97, tabIcon: 1.12 });
    expect(theme.motion.distance).toEqual({ xs: 4, sm: 8 });
  });

  it("preserves press callbacks and skips them while disabled", () => {
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    const screen = render(
      <MotionPressable
        testID="motion-button"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text>버튼</Text>
      </MotionPressable>,
    );

    fireEvent(screen.getByTestId("motion-button"), "pressIn");
    fireEvent(screen.getByTestId("motion-button"), "pressOut");
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);

    screen.rerender(
      <MotionPressable
        disabled
        testID="motion-button"
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Text>버튼</Text>
      </MotionPressable>,
    );
    fireEvent(screen.getByTestId("motion-button"), "pressIn");
    fireEvent(screen.getByTestId("motion-button"), "pressOut");
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it("renders card motion only when explicitly requested", () => {
    const screen = render(
      <Card>
        <Text>정적 카드</Text>
      </Card>,
    );
    expect(screen.getByText("정적 카드")).toBeTruthy();

    screen.rerender(
      <Card animated animationDelay={40}>
        <Text>움직이는 카드</Text>
      </Card>,
    );
    expect(screen.getByText("움직이는 카드")).toBeTruthy();
  });

  it("shares selection behavior through animated segmented tabs", () => {
    const onChange = jest.fn();
    const items = [
      { key: "sharing", label: "나눔중" },
      { key: "reserved", label: "예약중" },
    ] as const;
    const screen = render(
      <SegmentedTabs
        items={items}
        active="sharing"
        onChange={onChange}
        testIDPrefix="status"
      />,
    );

    expect(screen.getByTestId("status-indicator")).toBeTruthy();
    fireEvent.press(screen.getByTestId("status-sharing"));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId("status-reserved"));
    expect(onChange).toHaveBeenCalledWith("reserved");
  });

  it("shares a moving indicator across variable-width filter chips", () => {
    const onChange = jest.fn();
    const items = [
      { key: "all", label: "전체" },
      { key: "books", label: "도서·문구" },
    ] as const;
    const screen = render(
      <FilterChips
        items={items}
        active="all"
        onChange={onChange}
        testIDPrefix="category"
      />,
    );

    fireEvent(screen.getByTestId("category-all"), "layout", {
      nativeEvent: { layout: { height: 44, width: 54, x: 0, y: 0 } },
    });
    fireEvent(screen.getByTestId("category-books"), "layout", {
      nativeEvent: { layout: { height: 44, width: 82, x: 62, y: 0 } },
    });

    expect(
      StyleSheet.flatten(
        screen.getByTestId("category-scroll").props.contentContainerStyle,
      ),
    ).toMatchObject({ paddingHorizontal: theme.layout.screenX });
    expect(
      StyleSheet.flatten(screen.getByTestId("category-track").props.style),
    ).not.toHaveProperty("paddingHorizontal");
    expect(screen.getByTestId("category-indicator")).toBeTruthy();
    fireEvent.press(screen.getByTestId("category-all"));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId("category-books"));
    expect(onChange).toHaveBeenCalledWith("books");
    screen.rerender(
      <FilterChips
        items={items}
        active="books"
        onChange={onChange}
        testIDPrefix="category"
      />,
    );
    expect(
      screen.getByTestId("category-books").props.accessibilityState,
    ).toEqual({ selected: true });
  });

  it("keeps a dialog mounted for exit and unmounts after it finishes", async () => {
    const props = {
      title: "삭제 확인",
      onCancel: jest.fn(),
      onConfirm: jest.fn(),
    };
    const screen = render(<ConfirmDialog {...props} visible={false} />);
    expect(screen.queryByText("삭제 확인")).toBeNull();

    screen.rerender(<ConfirmDialog {...props} visible />);
    expect(screen.getByText("삭제 확인")).toBeTruthy();

    screen.rerender(<ConfirmDialog {...props} visible={false} />);
    await waitFor(() => expect(screen.queryByText("삭제 확인")).toBeNull());
  });

  it("unmounts a bottom sheet after its exit motion", async () => {
    const screen = render(
      <BottomSheet visible title="상태 변경" onClose={jest.fn()}>
        <Text>상태 선택</Text>
      </BottomSheet>,
    );
    expect(screen.getByText("상태 선택")).toBeTruthy();

    screen.rerender(
      <BottomSheet visible={false} title="상태 변경" onClose={jest.fn()}>
        <Text>상태 선택</Text>
      </BottomSheet>,
    );
    await waitFor(() => expect(screen.queryByText("상태 선택")).toBeNull());
  });
});
