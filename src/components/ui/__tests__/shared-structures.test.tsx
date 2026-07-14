import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import { createRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "../../../constants/theme";
import { StickyHeaderScreen } from "../../layout/StickyHeaderScreen";
import { TabBlurTargetContext } from "../../layout/TabBlurTargetContext";
import { GlassBackdrop } from "../glass-backdrop";
import {
  DetailAction,
  DetailBadge,
  ModalFormSection,
  ScreenHeader,
  SectionHeader,
  SectionDivider,
  TopBar,
  UnderlineTabs,
} from "../index";

describe("shared maintenance UI", () => {
  it("supports a distinct white glass tint for the bottom tab capsule", () => {
    render(
      <GlassBackdrop
        testID="bottom-glass"
        tintColor={theme.colors.white}
        tintOpacity={0.56}
      />,
    );

    expect(screen.getByTestId("bottom-glass-blur").props).toMatchObject({
      blurMethod: "dimezisBlurViewSdk31Plus",
      intensity: 32,
    });
    expect(
      StyleSheet.flatten(screen.getByTestId("bottom-glass-tint").props.style),
    ).toMatchObject({
      backgroundColor: theme.colors.white,
      opacity: 0.56,
    });
  });

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
    expect(
      StyleSheet.flatten(screen.getByTestId("detail-header-title").props.style),
    ).toMatchObject({
      position: "absolute",
      left: theme.layout.screenX + 68,
      right: theme.layout.screenX + 68,
      alignItems: "center",
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

  it("renders section view-all actions with a chevron and shared touch size", () => {
    const onViewAll = jest.fn();
    render(
      <SectionHeader
        title="내 기도제목"
        onViewAll={onViewAll}
        testID="request-section"
      />,
    );

    expect(screen.getByText("전체보기")).toBeTruthy();
    expect(
      within(screen.getByTestId("request-section-view-all")).getByText(
        "chevron-right",
      ),
    ).toBeTruthy();
    expect(
      StyleSheet.flatten(
        screen.getByTestId("request-section-view-all").props.style,
      ),
    ).toMatchObject({
      minHeight: theme.layout.touchTarget,
      flexDirection: "row",
    });

    fireEvent.press(screen.getByLabelText("내 기도제목 전체보기"));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it("covers the safe-area padding with the shared sticky glass header", () => {
    const sharedBlurTarget = createRef<View>();

    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 430, height: 932 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <TabBlurTargetContext.Provider value={sharedBlurTarget}>
          <StickyHeaderScreen testID="sticky-screen" title="나눔">
            <Text>스크롤 콘텐츠</Text>
          </StickyHeaderScreen>
        </TabBlurTargetContext.Provider>
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
    expect(screen.getByTestId("screen-header-blur").props).toMatchObject({
      blurMethod: "dimezisBlurViewSdk31Plus",
      blurTarget: sharedBlurTarget,
      intensity: 32,
      tint: "light",
    });
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

  it("uses the same glass treatment and scroll-direction visibility for sticky controls", () => {
    const sharedBlurTarget = createRef<View>();

    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 430, height: 932 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <TabBlurTargetContext.Provider value={sharedBlurTarget}>
          <StickyHeaderScreen
            stickyControls={<Text>세그먼트와 필터</Text>}
            stickyControlsHeight={60}
            testID="sticky-controls-screen"
            title="동행"
          >
            <Text>스크롤 콘텐츠</Text>
          </StickyHeaderScreen>
        </TabBlurTargetContext.Provider>
      </SafeAreaProvider>,
    );

    expect(
      StyleSheet.flatten(
        screen.getByTestId("sticky-controls-screen-scroll").props
          .contentContainerStyle,
      ),
    ).toMatchObject({ paddingTop: 149 });
    expect(
      screen.getByTestId("sticky-controls-screen-sticky-controls-glass-blur")
        .props,
    ).toMatchObject({
      blurTarget: sharedBlurTarget,
      intensity: 32,
      tint: "light",
    });
    expect(
      StyleSheet.flatten(
        screen.getByTestId("sticky-controls-screen-sticky-controls-glass-tint")
          .props.style,
      ),
    ).toMatchObject({
      backgroundColor: theme.colors.bg,
      opacity: 0.72,
    });

    fireEvent.scroll(screen.getByTestId("sticky-controls-screen-scroll"), {
      nativeEvent: { contentOffset: { y: 13 } },
    });
    expect(
      screen.getByTestId("sticky-controls-screen-sticky-controls", {
        includeHiddenElements: true,
      }).props.pointerEvents,
    ).toBe("none");

    fireEvent.scroll(screen.getByTestId("sticky-controls-screen-scroll"), {
      nativeEvent: { contentOffset: { y: 9 } },
    });
    expect(
      screen.getByTestId("sticky-controls-screen-sticky-controls").props
        .pointerEvents,
    ).toBe("auto");
  });

  it("keeps sticky controls visible when an intentional action pins them", () => {
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 430, height: 932 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <StickyHeaderScreen
          stickyControls={<Text>검색</Text>}
          stickyControlsAlwaysVisible
          stickyControlsHeight={56}
          testID="pinned-controls-screen"
          title="나눔"
        >
          <Text>스크롤 콘텐츠</Text>
        </StickyHeaderScreen>
      </SafeAreaProvider>,
    );

    fireEvent.scroll(screen.getByTestId("pinned-controls-screen-scroll"), {
      nativeEvent: { contentOffset: { y: 13 } },
    });

    expect(
      screen.getByTestId("pinned-controls-screen-sticky-controls").props
        .pointerEvents,
    ).toBe("auto");
  });
});
