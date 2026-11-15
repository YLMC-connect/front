import { screen } from "@testing-library/react-native";
import PrayerHistoryScreen from "../prayer-history";
import LifeStudyHistoryScreen from "../life-study-history";
import { renderWithClient } from "../../../src/test/renderWithClient";
import * as prayerService from "../../../src/services/prayerService";
import * as mypageService from "../../../src/services/mypageService";

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

    expect(screen.getByText("중보기도 활동")).toBeTruthy();
    expect(await screen.findByText("월요일 오전 기도방")).toBeTruthy();
    expect(screen.getAllByText("활동 중").length).toBe(2);
    expect(screen.getByText("참여 기도방")).toBeTruthy();
    expect(screen.getByText("지난 기도방")).toBeTruthy();
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

  it("splits life study history into ongoing and completed", async () => {
    jest
      .spyOn(mypageService, "fetchMyPageActivityLifeStudies")
      .mockResolvedValue({
        completionCount: 1,
        applications: [],
        ongoing: [
          {
            cohortId: 3,
            lifeStudyId: 1,
            name: "새가족의 삶",
            cohortNumber: 12,
            period: "2026.09.01 ~ 2026.11.30",
            progress: null,
            week: null,
            status: null,
            nextClass: null,
            attendCount: null,
            totalClassCount: null,
          },
        ],
        completed: [
          {
            lifeStudyId: 2,
            name: "말씀통독의 삶",
            cohortId: 1,
            cohortNumber: 8,
            status: null,
            completedAt: "2026.02.15",
            attendCount: null,
            totalClassCount: null,
          },
        ],
      });
    renderWithClient(<LifeStudyHistoryScreen />);

    expect(screen.getByText("수강 내역")).toBeTruthy();
    expect(await screen.findByText("새가족의 삶")).toBeTruthy();
    expect(screen.getByText("12기 · 2026.09.01 ~ 2026.11.30")).toBeTruthy();
    expect(screen.getByText("수강중")).toBeTruthy();
    expect(screen.getByText("말씀통독의 삶")).toBeTruthy();
    expect(screen.getByText("8기 · 2026.02.15 수료")).toBeTruthy();
  });

  it("shows an empty state when there is no life study history", async () => {
    jest
      .spyOn(mypageService, "fetchMyPageActivityLifeStudies")
      .mockResolvedValue({
        completionCount: 0,
        applications: [],
        ongoing: [],
        completed: [],
      });
    renderWithClient(<LifeStudyHistoryScreen />);

    expect(await screen.findByTestId("life-study-history-empty")).toBeTruthy();
  });
});
