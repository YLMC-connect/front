import { render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import designTokens from "../../../constants/designTokens.json";
import { appFont } from "../../../constants/fonts";
import { theme } from "../../../constants/theme";
import { AppText, Card, ListSkeleton, Skeleton } from "../index";

describe("design system foundations", () => {
  it("keeps semantic colors and radii on the shared token source", () => {
    expect(theme.colors).toEqual(designTokens.colors);
    expect(theme.radius).toEqual(designTokens.radius);
    expect(Object.keys(theme.typography)).toEqual([
      "display",
      "screenTitle",
      "sectionTitle",
      "cardTitle",
      "body",
      "caption",
    ]);
    expect(theme.font).toEqual(appFont);
  });

  it("renders role typography and semantic color through AppText", () => {
    render(
      <AppText variant="sectionTitle" tone="brand">
        내 활동 요약
      </AppText>,
    );

    const style = StyleSheet.flatten(
      screen.getByText("내 활동 요약").props.style,
    );
    expect(style).toMatchObject({
      fontSize: theme.typography.sectionTitle.fontSize,
      lineHeight: theme.typography.sectionTitle.lineHeight,
      fontFamily: appFont.semibold,
      color: theme.colors.primaryDeep,
    });
  });

  it("keeps shared cards visually separated from the canvas", () => {
    const { toJSON } = render(
      <Card>
        <AppText>카드 내용</AppText>
      </Card>,
    );

    const card = toJSON();
    expect(card).not.toBeNull();
    expect(Array.isArray(card)).toBe(false);
    const cardStyle = StyleSheet.flatten(
      !Array.isArray(card) ? card?.props.style : undefined,
    );
    expect(cardStyle).toMatchObject({
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.line,
      borderRadius: theme.radius.lg,
    });
  });

  it("exposes list loading as one accessible progress state", () => {
    render(
      <>
        <Skeleton testID="single-skeleton" width={80} height={20} />
        <ListSkeleton rows={2} />
      </>,
    );

    expect(screen.getByTestId("list-skeleton")).toBeTruthy();
    expect(
      screen.getByLabelText("콘텐츠 불러오는 중").props.accessibilityRole,
    ).toBe("progressbar");
  });
});
