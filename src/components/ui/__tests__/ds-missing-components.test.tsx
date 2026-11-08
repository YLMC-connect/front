import { onlineManager } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { theme } from "../../../constants/theme";
import { AvatarGroup } from "../avatar-group";
import { BarChart, groupChartData } from "../chart";
import { Calendar, monthGrid } from "../date-picker";
import { ImageViewer } from "../image-viewer";
import { PlaceCard } from "../info-row";
import { NotificationItem } from "../notification-item";
import { OfflineBanner } from "../offline-banner";
import { PasswordStrength, passwordStrengthOf } from "../password-strength";
import { LoadMoreFooter, RefreshIndicator } from "../spinner";
import { Stepper } from "../stepper";
import { SwitchRow } from "../switch";
import { Tooltip } from "../tooltip";

const safeArea = ({ children }: { children: ReactNode }) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { x: 0, y: 0, width: 390, height: 844 },
      insets: { top: 47, left: 0, right: 0, bottom: 34 },
    }}
  >
    {children}
  </SafeAreaProvider>
);

const flat = (testID: string) =>
  StyleSheet.flatten(screen.getByTestId(testID).props.style);

describe("PlaceCard", () => {
  it("shows the default 수령 장소 label with the value", () => {
    render(<PlaceCard value="교회 1층 로비" testID="place" />);
    expect(screen.getByText("수령 장소")).toBeTruthy();
    expect(screen.getByText("교회 1층 로비")).toBeTruthy();
    expect(flat("place")).toMatchObject({
      borderTopColor: theme.colors.surfaceSubtle,
      borderBottomColor: theme.colors.surfaceSubtle,
    });
  });

  it("drops the top line on a following row so rows share one line", () => {
    render(
      <PlaceCard value="중고" label="물품 상태" first={false} testID="p" />,
    );
    expect(flat("p").borderTopWidth).toBeUndefined();
  });
});

describe("PasswordStrength", () => {
  it("grades by the signup rule, then length 12+ or a symbol", () => {
    expect(passwordStrengthOf("abc")).toBe("weak");
    expect(passwordStrengthOf("abcdefgh")).toBe("weak");
    expect(passwordStrengthOf("abcd1234")).toBe("medium");
    expect(passwordStrengthOf("abcd1234!")).toBe("strong");
    expect(passwordStrengthOf("abcdefgh1234")).toBe("strong");
  });

  it("names the level in text, not color alone", () => {
    render(<PasswordStrength password="abcd1234" />);
    expect(screen.getByText("보통")).toBeTruthy();
    expect(screen.getByLabelText("비밀번호 강도 보통")).toBeTruthy();
    expect(flat("password-strength-bar-1-fill").backgroundColor).toBe(
      theme.colors.warningIcon,
    );
  });
});

describe("RefreshIndicator · LoadMoreFooter", () => {
  it("says 새로고침하는 중 while refreshing", () => {
    render(<RefreshIndicator />);
    expect(screen.getByText("새로고침하는 중")).toBeTruthy();
  });

  it("shows only the still spinner while pulling", () => {
    render(<RefreshIndicator refreshing={false} />);
    // 자리를 지키도록 문구는 남겨 두고 투명하게 숨긴다.
    expect(
      StyleSheet.flatten(screen.getByText("새로고침하는 중").props.style)
        .opacity,
    ).toBe(0);
  });

  it("shows retry on error, end text when there is no more", () => {
    const onRetry = jest.fn();
    const { rerender } = render(
      <LoadMoreFooter state="error" onRetry={onRetry} testID="more" />,
    );
    fireEvent.press(screen.getByTestId("more-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(<LoadMoreFooter state="end" testID="more" />);
    expect(screen.getByText("마지막 글이에요")).toBeTruthy();

    rerender(<LoadMoreFooter state="loading" testID="more" />);
    expect(screen.getByLabelText("더 불러오는 중")).toBeTruthy();

    rerender(<LoadMoreFooter state="idle" testID="more" />);
    expect(screen.queryByTestId("more")).toBeNull();
  });
});

describe("OfflineBanner", () => {
  afterEach(() => act(() => onlineManager.setOnline(true)));

  it("appears only while offline", () => {
    render(<OfflineBanner />);
    expect(screen.queryByTestId("offline-banner")).toBeNull();

    act(() => onlineManager.setOnline(false));
    expect(screen.getByText("인터넷 연결이 끊겼어요")).toBeTruthy();
    expect(flat("offline-banner")).toMatchObject({
      minHeight: 44,
      backgroundColor: theme.colors.warningSubtle,
    });

    act(() => onlineManager.setOnline(true));
    expect(screen.queryByTestId("offline-banner")).toBeNull();
  });
});

describe("ImageViewer", () => {
  it("shows N / total and closes from the close button", () => {
    const onClose = jest.fn();
    render(
      <ImageViewer
        visible
        images={["a.jpg", "b.jpg", "c.jpg"]}
        initialIndex={1}
        onClose={onClose}
      />,
      { wrapper: safeArea },
    );
    expect(screen.getByText("2 / 3")).toBeTruthy();
    fireEvent.press(screen.getByTestId("image-viewer-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the counter for a single photo", () => {
    render(<ImageViewer visible images={["a.jpg"]} onClose={jest.fn()} />, {
      wrapper: safeArea,
    });
    expect(screen.queryByTestId("image-viewer-counter")).toBeNull();
  });
});

describe("SwitchRow", () => {
  it("toggles from anywhere on the row", () => {
    const onValueChange = jest.fn();
    render(
      <SwitchRow
        label="알림 받기"
        description="새 댓글을 알려 드려요"
        value={false}
        onValueChange={onValueChange}
        testID="sw"
      />,
    );
    expect(screen.getByRole("switch")).toBeTruthy();
    fireEvent.press(screen.getByTestId("sw"));
    expect(onValueChange).toHaveBeenCalledWith(true);
    expect(flat("sw-track")).toMatchObject({ width: 48, height: 28 });
  });
});

describe("NotificationItem", () => {
  it("marks unread with a subtle background and a dot", () => {
    render(
      <NotificationItem
        name="김은혜"
        action="님이 댓글을 남겼어요."
        timeLabel="3분 전"
        unread
        testID="noti"
      />,
    );
    expect(screen.getByTestId("noti-unread-dot")).toBeTruthy();
    expect(screen.getByText("3분 전")).toBeTruthy();
  });
});

describe("AvatarGroup", () => {
  it("shows three people and +N for the rest", () => {
    render(
      <AvatarGroup
        people={[
          { name: "가" },
          { name: "나" },
          { name: "다" },
          { name: "라" },
          { name: "마" },
        ]}
        testID="ag"
      />,
    );
    expect(screen.getByText("+2")).toBeTruthy();
    expect(screen.getByLabelText("5명")).toBeTruthy();
  });
});

describe("Stepper", () => {
  it("fills done and current steps, outlines the rest", () => {
    render(<Stepper steps={["약관", "정보", "완료"]} current={1} />);
    expect(flat("stepper-dot-0").backgroundColor).toBe(theme.colors.primary);
    expect(flat("stepper-dot-1").backgroundColor).toBe(theme.colors.primary);
    expect(flat("stepper-dot-2").borderColor).toBe(theme.colors.borderButton);
    expect(screen.getByLabelText("3단계 중 2단계, 정보")).toBeTruthy();
  });
});

describe("BarChart", () => {
  it("groups more than six items into 기타", () => {
    const data = Array.from({ length: 8 }, (_, i) => ({
      label: `항목${i + 1}`,
      value: 1,
    }));
    const grouped = groupChartData(data);
    expect(grouped).toHaveLength(6);
    expect(grouped[5]).toEqual({ label: "기타", value: 3 });
  });

  it("colors bars from chart-1 in order with value labels", () => {
    render(
      <BarChart
        data={[
          { label: "나눔", value: 4 },
          { label: "기도", value: 2 },
        ]}
      />,
    );
    expect(flat("bar-chart-bar-0").backgroundColor).toBe(theme.colors.chart1);
    expect(flat("bar-chart-bar-1").backgroundColor).toBe(theme.colors.chart2);
    expect(screen.getByText("4")).toBeTruthy();
  });
});

describe("Calendar", () => {
  it("lays out a month starting on the right weekday", () => {
    // 2026년 11월 1일은 일요일
    const cells = monthGrid(2026, 10);
    expect(cells[0]?.getDate()).toBe(1);
    expect(cells).toHaveLength(30);
  });

  it("picks a day and moves between months", () => {
    const onChange = jest.fn();
    render(
      <Calendar
        value={null}
        onChange={onChange}
        today={new Date(2026, 10, 8)}
      />,
    );
    expect(screen.getByText("2026년 11월")).toBeTruthy();
    fireEvent.press(screen.getByTestId("calendar-day-20"));
    expect(onChange.mock.calls[0][0].getDate()).toBe(20);
    fireEvent.press(screen.getByTestId("calendar-next"));
    expect(screen.getByText("2026년 12월")).toBeTruthy();
  });
});

describe("Tooltip", () => {
  it("wraps its trigger and keeps the text as an accessibility hint", () => {
    render(
      <Tooltip text="공유하기">
        <></>
      </Tooltip>,
    );
    expect(screen.getByTestId("tooltip-trigger").props.accessibilityHint).toBe(
      "공유하기",
    );
  });
});
