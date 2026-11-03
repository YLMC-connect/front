import { ApiError } from "../../lib/apiClient";
import type { PrayerCohortDto, PrayerTopicDto } from "../../types/prayerApi";
import {
  buildPrayerOverview,
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

describe("prayerMapper", () => {
  it("builds prayer overview from cohorts and topics", () => {
    const mapped = buildPrayerOverview([cohort], [topic]);

    expect(mapped).toEqual({
      rooms: [
        {
          id: "15",
          title: "월요일 오전 기도방",
          weekday: "mon",
          period: "morning",
          memberCount: 40,
          completedCount: 30,
          participationRate: 75,
          status: "joined",
        },
      ],
      requests: [
        {
          id: "7",
          title: "어머니 회복",
          category: "치유",
          status: "published",
          description: "수술이 잘 끝나기를",
        },
      ],
    });
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

  it("safely reads topic with null nullable fields", () => {
    const raw = {
      id: 1,
      categoryId: 10,
      categoryName: "치유",
      title: "기도제목",
      content: "기도제목 내용",
      status: "OPEN",
      rejectReason: null,
      writerName: "작성자",
      mine: true,
      emergency: false,
      emergencyEndAt: null,
      answerContent: null,
      answeredAt: null,
      createdAt: "2026-10-15T12:00:00",
    };
    expect(readPrayerTopics([raw])).toEqual([
      {
        ...raw,
        rejectReason: null,
        emergencyEndAt: null,
        answerContent: null,
        answeredAt: null,
      },
    ]);
  });

  it("safely reads cohort with null description", () => {
    const raw = {
      ...cohort,
      description: null,
    };
    expect(readPrayerCohorts([raw])).toEqual([
      {
        ...cohort,
        description: "",
      },
    ]);
  });
});
