import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { theme } from "../../../constants/theme";
import { ShareCard, ShareList } from "../share-card";

describe("ShareCard", () => {
  it("renders category, title, meta and comment count in spec layout", () => {
    const onPress = jest.fn();
    render(
      <ShareCard
        title="원목 책상 나눔해요"
        category="가구"
        meta="김민수 · 3분 전"
        comments={4}
        onPress={onPress}
        testID="card"
      />,
    );

    expect(screen.getByText("가구")).toBeTruthy();
    expect(screen.getByText("원목 책상 나눔해요")).toBeTruthy();
    expect(screen.getByText("김민수 · 3분 전")).toBeTruthy();
    expect(screen.getByLabelText("댓글 4개")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByText("가구").props.style),
    ).toMatchObject({ fontSize: 12, color: theme.colors.primaryStrong });
    expect(
      StyleSheet.flatten(screen.getByTestId("card").props.style),
    ).toMatchObject({
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 14,
      backgroundColor: theme.colors.surface,
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("card-photo").props.style),
    ).toMatchObject({ width: 88, height: 88, borderRadius: 10 });

    fireEvent.press(screen.getByTestId("card"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows a gift placeholder without a photo and hides 1/N for one photo", () => {
    render(<ShareCard title="의자" photoCount={1} testID="card" />);

    expect(screen.getByTestId("card-placeholder")).toBeTruthy();
    expect(screen.queryByText("1/1")).toBeNull();
    expect(screen.queryByTestId("card-comments")).toBeNull();
  });

  it("shows 1/N on the photo when there are two or more photos", () => {
    render(<ShareCard title="의자" photo="file:///a.jpg" photoCount={3} />);

    expect(screen.getByText("1/3")).toBeTruthy();
  });

  it("puts a warning label on the photo while reserved", () => {
    render(<ShareCard title="의자" state="reserved" testID="card" />);

    expect(screen.getByText("예약중")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByTestId("card-reserved").props.style),
    ).toMatchObject({
      backgroundColor: theme.colors.warningText,
      borderRadius: 6,
    });
  });

  it("covers the photo and mutes the title when done, leaving dimming to the caller", () => {
    render(
      <ShareCard
        title="의자"
        state="done"
        style={{ opacity: theme.opacity.soft }}
        testID="card"
      />,
    );

    expect(screen.getByText("나눔완료")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByTestId("card-done").props.style),
    ).toMatchObject({ backgroundColor: theme.colors.sheetOverlay });
    expect(
      StyleSheet.flatten(screen.getByText("의자").props.style),
    ).toMatchObject({ color: theme.colors.textMuted });
    expect(
      StyleSheet.flatten(screen.getByTestId("card").props.style),
    ).toMatchObject({ opacity: theme.opacity.soft });
  });
});

describe("ShareList", () => {
  it("stacks rows on a white panel with dividers only between rows", () => {
    render(
      <ShareList testID="list">
        <ShareCard title="하나" />
        <ShareCard title="둘" />
        <ShareCard title="셋" />
      </ShareList>,
    );

    expect(
      StyleSheet.flatten(screen.getByTestId("list").props.style),
    ).toMatchObject({
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
    });
    const dividers = screen.getAllByTestId("list-divider");
    expect(dividers).toHaveLength(2);
    expect(StyleSheet.flatten(dividers[0].props.style)).toMatchObject({
      height: 1,
      backgroundColor: theme.colors.surfaceSubtle,
    });
  });
});
