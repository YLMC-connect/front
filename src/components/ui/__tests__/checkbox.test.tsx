import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";
import { Checkbox, Radio, RadioRow } from "../checkbox";

const flat = (testID: string) =>
  StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe("Checkbox", () => {
  it("draws a 22px box with a 1.5px borderButton edge and a full-row 44 touch area", () => {
    render(<Checkbox testID="save-id" checked={false} label="아이디 저장" />);

    expect(flat("save-id")).toMatchObject({
      minHeight: 44,
      flexDirection: "row",
      gap: theme.spacing["3"],
    });
    expect(flat("save-id-mark")).toMatchObject({
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: theme.colors.borderButton,
    });
    expect(flat("save-id-mark-fill")).toMatchObject({
      backgroundColor: theme.colors.primary,
      opacity: 0,
    });
    expect(
      StyleSheet.flatten(screen.getByText("아이디 저장").props.style),
    ).toMatchObject({
      fontSize: 16,
      fontFamily: "Pretendard-Regular",
      color: theme.colors.text,
    });
  });

  it("exposes checkbox role and checked state, and toggles from the whole row", () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <Checkbox
        testID="agree"
        checked={false}
        onChange={onChange}
        label="동의"
      />,
    );

    const row = screen.getByTestId("agree");
    expect(row.props.accessibilityRole).toBe("checkbox");
    expect(row.props.accessibilityState).toMatchObject({ checked: false });
    expect(screen.getByLabelText("동의")).toBeTruthy();

    fireEvent.press(row);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(
      <Checkbox testID="agree" checked onChange={onChange} label="동의" />,
    );
    expect(screen.getByTestId("agree").props.accessibilityState).toMatchObject({
      checked: true,
    });
    expect(flat("agree-mark-fill")).toMatchObject({ opacity: 1 });

    fireEvent.press(screen.getByTestId("agree"));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("does not respond when disabled", () => {
    const onChange = jest.fn();
    render(
      <Checkbox testID="off" checked={false} disabled onChange={onChange} />,
    );

    fireEvent.press(screen.getByTestId("off"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId("off").props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });
});

describe("Radio", () => {
  it("draws a circle that becomes surface + 2px primary edge with a 10px dot", () => {
    const onChange = jest.fn();
    render(
      <Radio testID="opt" checked onChange={onChange} label="새 소식만" />,
    );

    const row = screen.getByTestId("opt");
    expect(row.props.accessibilityRole).toBe("radio");
    expect(row.props.accessibilityState).toMatchObject({ checked: true });
    expect(flat("opt-mark")).toMatchObject({
      width: 22,
      height: 22,
      borderRadius: 11,
    });
    expect(flat("opt-mark-fill")).toMatchObject({
      borderWidth: 2,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
      opacity: 1,
    });

    fireEvent.press(row);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("RadioRow", () => {
  it("draws a 54 high option row with label, description and a right radio", () => {
    const onPress = jest.fn();
    render(
      <RadioRow
        testID="day-mon"
        label="월요일"
        description="저녁 7시"
        selected={false}
        onPress={onPress}
      />,
    );

    const row = screen.getByTestId("day-mon");
    expect(row.props.accessibilityRole).toBe("radio");
    expect(row.props.accessibilityState).toMatchObject({ checked: false });
    expect(flat("day-mon")).toMatchObject({
      minHeight: 54,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderButton,
      backgroundColor: theme.colors.surface,
    });
    expect(flat("day-mon-selected-layer")).toMatchObject({ opacity: 0 });
    expect(
      StyleSheet.flatten(screen.getByText("월요일").props.style),
    ).toMatchObject({ fontSize: 16, fontFamily: "Pretendard-Medium" });
    expect(
      StyleSheet.flatten(screen.getByText("저녁 7시").props.style),
    ).toMatchObject({
      fontSize: 14,
      fontFamily: "Pretendard-Regular",
      color: theme.colors.textMuted,
    });
    expect(flat("day-mon-mark")).toMatchObject({ width: 22, height: 22 });

    fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows infoSubtle + 2px primary and a bold primaryStrong label when selected", () => {
    render(<RadioRow testID="day-tue" label="화요일" selected />);

    expect(
      screen.getByTestId("day-tue").props.accessibilityState,
    ).toMatchObject({ checked: true });
    expect(flat("day-tue-selected-layer")).toMatchObject({
      backgroundColor: theme.colors.infoSubtle,
      borderColor: theme.colors.primary,
      borderWidth: 2,
      opacity: 1,
    });
    expect(
      StyleSheet.flatten(screen.getByText("화요일").props.style),
    ).toMatchObject({
      fontFamily: "Pretendard-Bold",
      color: theme.colors.primaryStrong,
    });
    expect(flat("day-tue-mark-fill")).toMatchObject({ opacity: 1 });
  });
});
