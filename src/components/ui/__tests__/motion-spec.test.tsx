import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, Text } from "react-native";
import { theme } from "../../../constants/theme";
import { ConfirmDialog } from "../dialog";
import { Toast } from "../feedback";
import { MotionFadeIn, motionEasing, motionExitDuration } from "../motion";
import { UnderlineTabs } from "../underline-tabs";

describe("motion.md 규격", () => {
  it("곡선 토큰을 motion.md 값으로 둔다", () => {
    expect(theme.motion.easing).toEqual({
      fast: [0, 0, 0.58, 1],
      standard: [0.2, 0, 0, 1],
      exit: [0.4, 0, 1, 1],
    });
    expect(motionEasing.fast).toBeTruthy();
    expect(motionEasing.standard).toBeTruthy();
    expect(motionEasing.exit).toBeTruthy();
  });

  it("퇴장 시간은 등장의 60%", () => {
    expect(theme.motion.exitRatio).toBe(0.6);
    expect(motionExitDuration(theme.motion.duration.base)).toBe(120);
    expect(motionExitDuration(theme.motion.duration.slow)).toBe(180);
  });

  it("오류 문구는 아래에서 떠오른다", () => {
    render(
      <MotionFadeIn testID="fade">
        <Text>오류</Text>
      </MotionFadeIn>,
    );
    const style = StyleSheet.flatten(screen.getByTestId("fade").props.style);
    expect(style.transform).toEqual([{ translateY: expect.any(Number) }]);
  });

  it("토스트는 아래에서 올라오는 이동만 쓴다", () => {
    // jest 의 reanimated mock 은 interpolate 값을 계산하지 않아 16px 값은 토큰 테스트로 본다.
    expect(theme.motion.distance.lg).toBe(16);
    render(<Toast message="저장했어요" />);
    const style = StyleSheet.flatten(
      screen.getByTestId("motion-toast").props.style,
    );
    expect(style.transform).toHaveLength(1);
    expect(style.transform[0]).toHaveProperty("translateY");
  });

  it("다이얼로그 패널은 이동 없이 4% 작은 크기에서 커진다", () => {
    render(
      <ConfirmDialog
        visible
        title="삭제할까요?"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    const style = StyleSheet.flatten(
      screen.getByTestId("confirm-dialog-panel").props.style,
    );
    expect(style.transform).toHaveLength(1);
    expect(style.transform[0]).toHaveProperty("scale");
  });

  it("밑줄은 하나로 그려지고 고른 탭 위치에 놓인다", () => {
    const items = [
      { key: "posts", label: "게시글" },
      { key: "comments", label: "댓글" },
    ] as const;
    render(
      <UnderlineTabs
        items={items}
        active="posts"
        onChange={jest.fn()}
        testIDPrefix="tabs"
      />,
    );
    fireEvent(screen.getByTestId("tabs-track"), "layout", {
      nativeEvent: { layout: { height: 44, width: 236, x: 0, y: 0 } },
    });
    // (236 - 18*2) / 2 = 100 → 밑줄 너비 100 - 16*2 = 68, 시작 18 + 16 = 34
    expect(
      StyleSheet.flatten(screen.getByTestId("tabs-indicator").props.style),
    ).toMatchObject({
      opacity: 1,
      width: 68,
      transform: [{ translateX: 34 }],
    });

    screen.rerender(
      <UnderlineTabs
        items={items}
        active="comments"
        onChange={jest.fn()}
        testIDPrefix="tabs"
      />,
    );
    expect(screen.getAllByTestId("tabs-indicator")).toHaveLength(1);
  });

  it("border 변형은 따로 밑줄 막대를 그리지 않는다", () => {
    render(
      <UnderlineTabs
        items={[{ key: "a", label: "가" }]}
        active="a"
        variant="border"
        testIDPrefix="border"
      />,
    );
    expect(screen.queryByTestId("border-indicator")).toBeNull();
  });
});
