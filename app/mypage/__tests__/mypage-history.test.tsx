import { screen } from "@testing-library/react-native";
import PrayerHistoryScreen from "../prayer-history";
import LifeStudyHistoryScreen from "../life-study-history";
import { renderWithClient } from "../../../src/test/renderWithClient";
import * as prayerService from "../../../src/services/prayerService";

describe("mypage history screens", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders prayer activity history in mypage stack", async () => {
    jest.spyOn(prayerService, "fetchMyPrayerHistory").mockResolvedValue([
      {
        cohortId: 15,
        cohortName: "월요일 오전 기도방",
        cohortYear: 2026,
        yoil: 1,
        timeSlot: "AM",
        memberRole: "MEMBER",
        joinedAt: "2026-01-04",
        leftAt: null,
        leaveReason: null,
        active: true,
      },
      {
        cohortId: 9,
        cohortName: null,
        cohortYear: 2025,
        yoil: 4,
        timeSlot: "PM",
        memberRole: "LEADER",
        joinedAt: "2025-03-02",
        leftAt: "2025-12-28",
        leaveReason: "기수 종료",
        active: false,
      },
    ]);
    renderWithClient(<PrayerHistoryScreen />);

    expect(screen.getByText("중보기도 활동 이력")).toBeTruthy();
    expect(await screen.findByText("월요일 오전 기도방")).toBeTruthy();
    expect(screen.getByText("활동중")).toBeTruthy();
    expect(screen.getByText("2026-01-04 ~ 현재")).toBeTruthy();
    expect(screen.getByText("목요일 오후 기도방")).toBeTruthy();
    expect(screen.getByText("팀장")).toBeTruthy();
    expect(screen.getByText("종료 사유: 기수 종료")).toBeTruthy();
  });

  it("shows an empty state when there is no prayer history", async () => {
    jest.spyOn(prayerService, "fetchMyPrayerHistory").mockResolvedValue([]);
    renderWithClient(<PrayerHistoryScreen />);

    expect(await screen.findByTestId("prayer-history-empty")).toBeTruthy();
  });

  it("renders life study history in mypage stack", () => {
    renderWithClient(<LifeStudyHistoryScreen />);
    expect(screen.getByText("수강 내역")).toBeTruthy();
  });
});
