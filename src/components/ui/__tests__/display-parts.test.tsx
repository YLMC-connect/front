import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, Text, type ViewStyle, type TextStyle } from "react-native";
import { theme } from "../../../constants/theme";
import { Accordion } from "../accordion";
import { DetailBadge } from "../detail-badge";
import { Avatar, Badge, Card } from "../display";
import { InfoBox } from "../info-box";
import { ListRow, PersonRow } from "../list-row";
import { ProgressBar } from "../progress-bar";

function flat(node: { props: { style?: unknown } }): ViewStyle & TextStyle {
  return (StyleSheet.flatten(node.props.style as ViewStyle) ??
    {}) as ViewStyle & TextStyle;
}

describe("display parts (design system v2)", () => {
  it("ProgressBar shows label and value together on a token track", () => {
    render(<ProgressBar testID="bar" label="이번 주 기도" value={64.4} />);

    expect(screen.getByText("이번 주 기도")).toBeTruthy();
    expect(screen.getByText("64%")).toBeTruthy();
    const bar = screen.getByTestId("bar");
    expect(bar.props.accessibilityRole).toBe("progressbar");
    expect(bar.props.accessibilityValue).toMatchObject({ now: 64, max: 100 });
    expect(flat(screen.getByTestId("bar-fill")).backgroundColor).toBe(
      theme.colors.primary,
    );
  });

  it("ProgressBar tones change the fill and accept a custom value text", () => {
    const { rerender } = render(
      <ProgressBar testID="bar" value={100} valueText="완료" tone="success" />,
    );
    expect(screen.getByText("완료")).toBeTruthy();
    expect(flat(screen.getByTestId("bar-fill")).backgroundColor).toBe(
      theme.colors.successIcon,
    );

    rerender(<ProgressBar testID="bar" value={140} tone="danger" />);
    expect(screen.getByText("100%")).toBeTruthy();
    expect(flat(screen.getByTestId("bar-fill")).backgroundColor).toBe(
      theme.colors.dangerIcon,
    );
  });

  it("Accordion toggles expanded state from the title row", () => {
    render(
      <Accordion title="모임은 언제 하나요?">매주 토요일이에요.</Accordion>,
    );

    const header = screen.getByRole("button", { name: /모임은 언제/ });
    expect(header.props.accessibilityState).toMatchObject({ expanded: false });

    fireEvent.press(header);
    expect(header.props.accessibilityState).toMatchObject({ expanded: true });
    expect(screen.getByText("매주 토요일이에요.")).toBeTruthy();

    fireEvent.press(header);
    expect(header.props.accessibilityState).toMatchObject({ expanded: false });
  });

  it("InfoBox uses subtle background, neutral text and one action", () => {
    const onPress = jest.fn();
    render(
      <InfoBox
        testID="box"
        tone="warning"
        title="확인이 필요해요"
        description="신청 전에 일정을 확인해 주세요."
        action={{ label: "보기", onPress }}
      />,
    );

    expect(flat(screen.getByTestId("box")).backgroundColor).toBe(
      theme.colors.warningSubtle,
    );
    expect(flat(screen.getByText("확인이 필요해요")).color).toBe(
      theme.colors.text,
    );
    expect(flat(screen.getByText("보기")).color).toBe(theme.colors.warningText);
    fireEvent.press(screen.getByText("보기"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("ListRow keeps spec geometry and leaves dimming to the caller", () => {
    const onPress = jest.fn();
    render(
      <ListRow
        testID="row"
        title="청년 소모임"
        meta="12명 · 토요일"
        onPress={onPress}
        style={{ opacity: theme.opacity.disabled }}
      />,
    );

    const row = flat(screen.getByTestId("row"));
    expect(row).toMatchObject({
      paddingVertical: 16,
      paddingHorizontal: 20,
      gap: 12,
      opacity: 0.5,
    });
    expect(flat(screen.getByText("청년 소모임"))).toMatchObject({
      fontSize: 16,
    });
    expect(flat(screen.getByText("12명 · 토요일"))).toMatchObject({
      fontSize: 12,
      color: theme.colors.textMuted,
    });
    fireEvent.press(screen.getByText("청년 소모임"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("ListRow does not dim itself without a caller style", () => {
    render(<ListRow testID="row" title="모집완료 모임" />);
    expect(flat(screen.getByTestId("row")).opacity).toBeUndefined();
  });

  it("PersonRow is a 64 tall row with a 40 avatar", () => {
    render(
      <PersonRow
        testID="person"
        name="김하늘"
        subtitle="소모임장"
        trailing={<Text>배지</Text>}
      />,
    );
    expect(flat(screen.getByTestId("person")).minHeight).toBe(64);
    expect(screen.getByText("소모임장")).toBeTruthy();
    expect(screen.getByText("배지")).toBeTruthy();
  });

  it("Badge supports new tone names, bordered and solid variants", () => {
    render(
      <>
        <Badge tone="neutral" bordered>
          선택
        </Badge>
        <Badge tone="warning">긴급</Badge>
        <Badge solid>참여중</Badge>
      </>,
    );

    expect(flat(screen.getByText("선택")).color).toBe(theme.colors.neutral700);
    expect(flat(screen.getByText("긴급")).color).toBe(theme.colors.warningText);
    expect(flat(screen.getByText("참여중")).color).toBe(theme.colors.onPrimary);
  });

  it("DetailBadge renders through the shared Badge", () => {
    render(
      <>
        <DetailBadge tone="primary">진행중</DetailBadge>
        <DetailBadge tone="warn" bordered>
          신청 가능
        </DetailBadge>
        <DetailBadge>필수</DetailBadge>
      </>,
    );

    const primary = flat(screen.getByText("진행중"));
    expect(primary).toMatchObject({
      color: theme.colors.onPrimary,
      fontFamily: theme.font.semibold,
    });
    expect(flat(screen.getByText("신청 가능")).color).toBe(
      theme.colors.warningText,
    );
    expect(flat(screen.getByText("필수")).color).toBe(theme.colors.neutral700);
  });

  it("Card becomes pressable when onPress is given", () => {
    const onPress = jest.fn();
    render(
      <Card testID="card" onPress={onPress} accessibilityLabel="오늘의 말씀">
        <Text>카드</Text>
      </Card>,
    );

    expect(screen.getByRole("button", { name: "오늘의 말씀" })).toBeTruthy();
    fireEvent.press(screen.getByText("카드"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("Avatar layers the photo over the initials when a uri is given", () => {
    const { rerender } = render(<Avatar name="김하늘" />);
    expect(screen.getByText("하늘")).toBeTruthy();
    expect(screen.queryByTestId("avatar-image")).toBeNull();

    rerender(<Avatar name="김하늘" uri="https://example.com/a.jpg" />);
    expect(screen.getByText("하늘")).toBeTruthy();
    expect(screen.getByTestId("avatar-image")).toBeTruthy();
  });
});
