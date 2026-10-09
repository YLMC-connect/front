import { ApiError } from "../../lib/apiClient";
import { mockPrayerRooms, mockPrayerTopics } from "../../mocks/prayers";
import type {
  PrayerOverview,
  PrayerRoom,
  PrayerTopic,
} from "../../types/prayer";
import type { PrayerCohortDto, PrayerTopicDto } from "../../types/prayerApi";
import {
  applyCohortsToRooms,
  applyPrayerApiToOverview,
  applyTopicsToTopics,
  readPrayerApplications,
  readPrayerCategories,
  readPrayerCohortDetail,
  readPrayerCohorts,
  readPrayerHistory,
  readPrayerTopicBoard,
  readPrayerTopics,
  requireCreatedId,
} from "../prayerMapper";

const cohort: PrayerCohortDto = {
  id: 15,
  cohortYear: 2026,
  yoil: 1,
  timeSlot: "AM",
  cohortName: "월요일 오전 기도방",
  description: "한 주를 시작합니다",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  status: "CLOSED",
  memberCount: 40,
  weekCompletedCount: 30,
  completionRate: 75,
  myCompleted: true,
  myRole: "MEMBER",
  emergencyCount: 2,
};

const topic: PrayerTopicDto = {
  id: 7,
  categoryId: 2,
  categoryName: "치유",
  title: "어머니 회복",
  content: "수술이 잘 끝나기를",
  status: "OPEN",
  rejectReason: "개인정보",
  writerName: "김성도",
  mine: true,
  emergency: false,
  emergencyEndAt: "2026-10-10T00:00:00",
  answerContent: "회복되었습니다",
  answeredAt: "2026-10-08T00:00:00",
  createdAt: "2026-10-02T01:02:03",
};

const overview: PrayerOverview = {
  rooms: [
    {
      id: "15",
      weekday: "fri",
      period: "afternoon",
      memberCount: 10,
      status: "pending",
    },
    {
      id: "prayer-overview-room-thu-pm",
      weekday: "thu",
      period: "afternoon",
      memberCount: 10,
      status: "pending",
    },
  ],
  requests: [
    {
      id: "7",
      title: "기존 제목",
      category: "일반",
      status: "reviewing",
      description: "관리자 검토 후 공개됩니다",
    },
  ],
};

describe("prayerMapper", () => {
  it("overlays a matching cohort and leaves unknown rooms on the mock", () => {
    const mapped = applyPrayerApiToOverview(overview, [cohort], []);

    expect(mapped.rooms).toEqual([
      {
        id: "15",
        weekday: "mon",
        period: "morning",
        memberCount: 40,
        completedCount: 30,
        participationRate: 75,
        status: "joined",
      },
      overview.rooms[1],
    ]);
    expect(mapped.rooms).toHaveLength(2);
    expect(overview.rooms[0].status).toBe("pending");
    expect(overview.rooms[0].memberCount).toBe(10);
  });

  it("does not turn a missing role or weekend yoil into a new room status", () => {
    const mapped = applyPrayerApiToOverview(
      overview,
      [
        {
          ...cohort,
          yoil: 6,
          timeSlot: "PM",
          myRole: null,
          status: "ACTIVE",
        },
      ],
      [],
    );

    expect(mapped.rooms[0]).toEqual({
      ...overview.rooms[0],
      memberCount: 40,
      completedCount: 30,
      participationRate: 75,
    });
  });

  it("lets a later cohort with the same id win", () => {
    const mapped = applyPrayerApiToOverview(
      overview,
      [cohort, { ...cohort, memberCount: 3, myRole: "LEADER" }],
      [],
    );

    expect(mapped.rooms[0].memberCount).toBe(3);
    expect(mapped.rooms[0].status).toBe("joined");
  });

  it("maps only topic statuses the overview already has", () => {
    const published = applyPrayerApiToOverview(overview, [], [topic]);
    expect(published.requests).toEqual([
      {
        ...overview.requests[0],
        title: "어머니 회복",
        category: "치유",
        status: "published",
      },
    ]);

    const answered = applyPrayerApiToOverview(
      overview,
      [],
      [{ ...topic, status: "ANSWERED" }],
    );
    expect(answered.requests[0].status).toBe("reviewing");
    expect(answered.requests[0].description).toBe("관리자 검토 후 공개됩니다");

    const rejected = applyPrayerApiToOverview(
      overview,
      [],
      [{ ...topic, status: "REJECTED", id: 99 }],
    );
    expect(rejected.requests).toEqual([...overview.requests]);
  });

  it("maps room fields that exist and keeps the leader", () => {
    const room: PrayerRoom = { ...mockPrayerRooms[0], id: "15" };
    const [mapped] = applyCohortsToRooms(
      [room],
      [{ ...cohort, yoil: 0, myRole: null }],
    );

    expect(mapped).toEqual({
      ...room,
      title: "월요일 오전 기도방",
      description: "한 주를 시작합니다",
      memberCount: 40,
      isJoined: false,
    });
    expect(mapped.leader).toBe(room.leader);
    expect(mapped.weekday).toBe(room.weekday);
  });

  it("maps answered topic text without inventing the author or room", () => {
    const base: PrayerTopic = {
      ...mockPrayerTopics[0],
      id: "7",
      isAnswered: false,
      answer: "기존 응답",
    };
    const [answered] = applyTopicsToTopics(
      [base],
      [{ ...topic, status: "ANSWERED" }],
    );

    expect(answered).toEqual({
      ...base,
      title: "어머니 회복",
      content: "수술이 잘 끝나기를",
      isAnswered: true,
      answer: "회복되었습니다",
      createdAt: "2026-10-02T01:02:03",
    });
    expect(answered.author).toBe(base.author);
    expect(answered.roomId).toBe(base.roomId);
    expect(answered.isAnonymous).toBe(base.isAnonymous);
    expect(answered.prayerCount).toBe(base.prayerCount);
    expect(answered.hasPrayed).toBe(base.hasPrayed);

    const [open] = applyTopicsToTopics([base], [topic]);
    expect(open.isAnswered).toBe(false);
    expect(open.answer).toBeUndefined();
    expect(open.author).toBe(base.author);
  });

  it("reads named application and category fields without narrowing their values", () => {
    expect(
      readPrayerApplications([
        {
          id: "app-3",
          cohortId: null,
          cohortName: 1,
          yoil: "월",
          timeSlot: null,
          applicantName: null,
          applicantPhone: null,
          applyMemo: null,
          status: "WAITING",
          rejectReason: null,
          createdAt: null,
          processedAt: null,
          extra: "제외",
        },
      ]),
    ).toEqual([
      {
        id: "app-3",
        cohortId: null,
        cohortName: 1,
        yoil: "월",
        timeSlot: null,
        applicantName: null,
        applicantPhone: null,
        applyMemo: null,
        status: "WAITING",
        rejectReason: null,
        createdAt: null,
        processedAt: null,
      },
    ]);
    expect(
      readPrayerCategories([
        {
          id: 1,
          categoryCode: "HEAL",
          categoryName: "치유",
          orderNum: 2,
          note: "제외",
        },
      ]),
    ).toEqual([
      { id: 1, categoryCode: "HEAL", categoryName: "치유", orderNum: 2 },
    ]);
  });

  it("drops undocumented cohort detail fields and keeps history rows", () => {
    expect(
      readPrayerCohortDetail({
        id: 15,
        cohortName: "월요일 오전",
        memberCount: 40,
      }),
    ).toEqual({});
    expect(readPrayerCohortDetail(null)).toBeNull();
    expect(
      readPrayerHistory([
        {
          cohortId: 15,
          cohortName: "월요일 오전",
          cohortYear: 2026,
          yoil: 1,
          timeSlot: "AM",
          memberRole: "LEADER",
          joinedAt: "2026-01-05",
          leftAt: null,
          leaveReason: "",
          active: true,
          periodLabel: "제외",
        },
      ]),
    ).toEqual([
      {
        cohortId: 15,
        cohortName: "월요일 오전",
        cohortYear: 2026,
        yoil: 1,
        timeSlot: "AM",
        memberRole: "LEADER",
        joinedAt: "2026-01-05",
        leftAt: null,
        leaveReason: "",
        active: true,
      },
    ]);
  });

  it("reads a topic board and ignores fields that are not on the topic dto", () => {
    const board = readPrayerTopicBoard({
      emergency: [{ ...topic, privateNote: "제외" }],
      recentAnswers: [],
      ongoing: [],
    });

    expect(board).toEqual({
      emergency: [topic],
      recentAnswers: [],
      ongoing: [],
    });
  });

  it("rejects shapes that are not the Notion data payload", () => {
    expect(() =>
      readPrayerCohorts({ code: "SUCCESS", message: "ok", data: [cohort] }),
    ).toThrow(ApiError);
    expect(() => readPrayerCohorts([{ ...cohort, yoil: "1" }])).toThrow(
      ApiError,
    );
    expect(() =>
      readPrayerCohorts([{ ...cohort, timeSlot: "MORNING" }]),
    ).toThrow(ApiError);
    expect(() => readPrayerCohorts([{ ...cohort, myRole: "ADMIN" }])).toThrow(
      ApiError,
    );
    expect(() => readPrayerTopics([{ ...topic, status: "DRAFT" }])).toThrow(
      ApiError,
    );
    expect(() => readPrayerApplications([{ id: 1 }])).toThrow(ApiError);
    expect(() => readPrayerCohortDetail([])).toThrow(ApiError);
    expect(() => readPrayerTopicBoard({ emergency: [] })).toThrow(ApiError);
    expect(() => requireCreatedId("15")).toThrow(ApiError);
    expect(requireCreatedId(15)).toBe(15);
    expect(readPrayerCohorts(null)).toEqual([]);
    expect(readPrayerHistory(null)).toEqual([]);
  });
});
