import { ApiError } from "../../lib/apiClient";
import {
  formatMyPageActivityDate,
  normalizeMyPageActivityQuery,
  normalizeMyPageGroupQuery,
  readMyPageCommentList,
  readMyPageGroupList,
  readMyPageLifeStudyHistory,
  readMyPagePostList,
  readMyPagePrayerHistory,
} from "../mypageMapper";

const pageMeta = {
  totalElements: 11,
  totalPages: 2,
  currentPage: 1,
  size: 10,
  hasNext: true,
};

const post = {
  id: 4,
  title: "유아용 카시트",
  content: "본문",
  status: "RESERVED",
  statusName: "예약완료",
  categoryCode: "BABY",
  itemStatus: "GOOD",
  viewCount: 3,
  thumbnailUrl: "https://example.test/a.jpg",
  createdAt: "2026-05-12T09:00:00",
  extra: "무시",
};

describe("mypageMapper", () => {
  it("maps a 1-based post page onto the activity row and the next 0-based page", () => {
    expect(readMyPagePostList({ ...pageMeta, content: [post] })).toEqual({
      items: [
        {
          id: "4",
          thumb: 4,
          title: "유아용 카시트",
          status: "예약완료",
          tone: "warn",
          date: "2026.05.12",
        },
      ],
      currentPage: 1,
      size: 10,
      totalElements: 11,
      totalPages: 2,
      hasNext: true,
      nextPage: 1,
    });
    expect(formatMyPageActivityDate("그대로")).toBe("그대로");
  });

  it("rejects a 0-based currentPage", () => {
    expect(() =>
      readMyPagePostList({ ...pageMeta, currentPage: 0, content: [post] }),
    ).toThrow(ApiError);
  });

  it("keeps the request page 0-based and does not rewrite page 2", () => {
    expect(normalizeMyPageActivityQuery(undefined, "id,desc")).toEqual({
      page: 0,
      size: 10,
      sort: "id,desc",
    });
    expect(
      normalizeMyPageActivityQuery(
        { page: 2, size: 5, sort: "id,asc" },
        "id,desc",
      ),
    ).toEqual({ page: 2, size: 5, sort: "id,asc" });
    expect(() => normalizeMyPageActivityQuery({ page: -1 }, "id,desc")).toThrow(
      "활동 목록 page는 0부터입니다.",
    );
  });

  it("maps a comment onto the source title", () => {
    expect(
      readMyPageCommentList({
        ...pageMeta,
        hasNext: false,
        content: [
          {
            id: 8,
            shareId: 4,
            shareTitle: "유아용 카시트 나눔해요",
            content: "내일 들르겠습니다",
            createdAt: "2026-05-13T01:02:03",
          },
        ],
      }),
    ).toMatchObject({
      items: [
        {
          id: "8",
          content: "내일 들르겠습니다",
          src: "유아용 카시트 나눔해요",
          date: "2026.05.13",
        },
      ],
      nextPage: null,
    });
  });

  it("maps a group without closing the status list", () => {
    const group = {
      id: 3,
      title: "토요 산악회",
      type: "GROUP",
      categoryCode: "HOBBY",
      maxParticipants: 20,
      currentParticipants: 18,
      status: "PAUSED",
      leaderId: "leader-1",
      leaderName: "김모임",
      joinedAt: "2024-11-02T10:00:00",
    };

    expect(
      readMyPageGroupList({ ...pageMeta, content: [group] }),
    ).toMatchObject({
      items: [
        {
          id: "3",
          name: "토요 산악회",
          members: 18,
          joined: "2024.11.02",
          seed: 3,
        },
      ],
    });
    expect(() =>
      readMyPageGroupList({
        ...pageMeta,
        content: [{ ...group, type: "OTHER" }],
      }),
    ).toThrow(ApiError);
    expect(normalizeMyPageGroupQuery({ type: "VOLUNTEER" })).toMatchObject({
      page: 0,
      size: 10,
      sort: "joinedAt,desc",
      type: "VOLUNTEER",
    });
  });

  it("reads life-study names without inventing nested types", () => {
    const history = readMyPageLifeStudyHistory({
      completionCount: 1,
      applications: [
        {
          cohortId: 9,
          lifeStudyId: "과정",
          name: "경건의 삶",
          cohortNumber: null,
          startDate: "2026-03-01",
          status: "APPLIED",
          description: "대기",
          appliedAt: "2026-02-01",
          extra: "버림",
        },
      ],
      ongoing: [
        {
          cohortId: 9,
          lifeStudyId: 3,
          name: "경건의 삶",
          cohortNumber: 2,
          period: "3월",
          progress: "50%",
          week: 4,
          status: "ONGOING",
          nextClass: "다음 주",
          attendCount: 3,
          totalClassCount: 8,
        },
      ],
      completed: [
        {
          lifeStudyId: 3,
          name: "경건의 삶",
          cohortId: 0,
          cohortNumber: null,
          status: "COMPLETED",
          completedAt: "2026-04-16",
          attendCount: null,
          totalClassCount: null,
        },
      ],
    });

    expect(history.completionCount).toBe(1);
    expect(history.applications[0]).toEqual({
      cohortId: 9,
      lifeStudyId: "과정",
      name: "경건의 삶",
      cohortNumber: null,
      startDate: "2026-03-01",
      status: "APPLIED",
      description: "대기",
      appliedAt: "2026-02-01",
    });
    expect(history.ongoing[0]).not.toHaveProperty("extra");
    expect(history.completed).toHaveLength(1);
    expect(() => readMyPageLifeStudyHistory(null)).toThrow(ApiError);
  });

  it("reads prayer history and rejects a weekday outside 0 through 6", () => {
    const item = {
      cohortId: 15,
      cohortName: "2026년 화요일 오전 기도방",
      cohortYear: 2026,
      yoil: 2,
      yoilName: "화",
      timeSlot: "AM",
      timeSlotName: "오전",
      memberRole: "LEADER",
      memberRoleName: "팀장",
      joinedAt: "2026-01-04",
      leftAt: null,
      period: "2026.01 ~ 현재",
      leaveReason: null,
      active: true,
    };

    expect(
      readMyPagePrayerHistory({
        activeCount: 1,
        totalPeriod: "3개월",
        totalPeriodDays: 90,
        totalRoomCount: 2,
        currentActivities: [item],
        pastActivities: [
          { ...item, active: false, leftAt: "2025-12-31", leaveReason: "종료" },
        ],
      }).currentActivities[0],
    ).toMatchObject({ yoil: 2, leftAt: null, leaveReason: null });
    expect(() =>
      readMyPagePrayerHistory({
        activeCount: 1,
        totalPeriod: "3개월",
        totalPeriodDays: 90,
        totalRoomCount: 1,
        currentActivities: [{ ...item, yoil: 7 }],
        pastActivities: [],
      }),
    ).toThrow(ApiError);
  });
});
