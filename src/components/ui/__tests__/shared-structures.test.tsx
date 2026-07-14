import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "../../../constants/theme";
import { StickyHeaderScreen } from "../../layout/StickyHeaderScreen";
import {
  DetailAction,
  DetailBadge,
  ModalFormSection,
  ScreenHeader,
  SectionDivider,
  TopBar,
  UnderlineTabs,
} from "../index";

describe("shared maintenance UI", () => {
  it("keeps detail action press behavior in the shared component", () => {
    const onPress = jest.fn();
    render(
      <DetailAction
        icon="edit"
        label="수정"
        testID="detail-action"
        onPress={onPress}
      />,
    );

    fireEvent.press(screen.getByTestId("detail-action"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("changes underline tabs only when a different tab is selected", () => {
    const onChange = jest.fn();
    render(
      <UnderlineTabs
        items={[
          { key: "posts", label: "게시글" },
          { key: "comments", label: "댓글" },
        ]}
        active="posts"
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByText("게시글"));
    fireEvent.press(screen.getByText("댓글"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("comments");
  });

  it("renders shared modal form and detail badge variants", () => {
    render(
      <>
        <ModalFormSection label="제목" required hint="1/30">
          <DetailBadge bordered tone="warn">
            확인 필요
          </DetailBadge>
        </ModalFormSection>
        <SectionDivider />
      </>,
    );

    expect(screen.getByText("제목 *")).toBeTruthy();
    expect(screen.getByText("1/30")).toBeTruthy();
    expect(screen.getByText("확인 필요")).toBeTruthy();
  });

  it("keeps root headers and back navigation on shared geometry", () => {
    const onBack = jest.fn();
    render(
      <>
        <ScreenHeader
          title="나눔"
          subtitle="이웃과 물건을 나눠요"
          testID="root-header"
        />
        <TopBar title="나눔 상세" back onBack={onBack} testID="detail-header" />
      </>,
    );

    expect(
      StyleSheet.flatten(screen.getByTestId("root-header").props.style),
    ).toMatchObject({
      height: 89,
      paddingHorizontal: theme.layout.screenX,
      paddingTop: 20,
      paddingBottom: 20,
      justifyContent: "center",
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("detail-header").props.style),
    ).toMatchObject({
      height: 56,
      paddingHorizontal: theme.layout.screenX,
    });
    expect(screen.getByText("뒤로")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByLabelText("뒤로").props.style),
    ).toMatchObject({
      height: theme.layout.touchTarget,
      borderWidth: 1,
      borderColor: theme.colors.line,
      backgroundColor: theme.colors.surface2,
    });

    fireEvent.press(screen.getByLabelText("뒤로"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("covers the safe-area padding with the shared sticky glass header", () => {
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 430, height: 932 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <StickyHeaderScreen testID="sticky-screen" title="나눔">
          <Text>스크롤 콘텐츠</Text>
        </StickyHeaderScreen>
      </SafeAreaProvider>,
    );

    const headerStyle = StyleSheet.flatten(
      screen.getByTestId("screen-header").props.style,
    );
    expect(headerStyle).toMatchObject({
      position: "absolute",
      top: 0,
      height: 89,
      paddingTop: 20,
      paddingBottom: 20,
      justifyContent: "center",
      zIndex: 20,
    });
    expect(headerStyle).not.toHaveProperty("borderBottomWidth");
    expect(
      StyleSheet.flatten(
        screen.getByTestId("sticky-screen-scroll").props.contentContainerStyle,
      ),
    ).toMatchObject({ paddingTop: 89 });
    expect(
      StyleSheet.flatten(screen.getByTestId("screen-header-tint").props.style),
    ).toMatchObject({
      backgroundColor: theme.colors.bg,
      opacity: 0.72,
    });
  });
});
