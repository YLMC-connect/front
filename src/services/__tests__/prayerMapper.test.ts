import { ApiError } from "../../lib/apiClient";
import type { PrayerCohortDto, PrayerTopicDto } from "../../types/prayerApi";
import {
  buildPrayerOverview,
  readPrayerApplications,
  readPrayerCategories,
  readPrayerCohortDetail,
  readPrayerCohorts,
  readPrayerCohortStatus,
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

const cohortStatus = {
  cohortId: 15,
  cohortName: "월요일 오전 기도방",
  weekStartDate: "2026-11-02",
  scheduledDate: "2026-11-02",
  totalMembers: 2,
  completedCount: 1,
  notCompletedCount: 1,
  completionRate: 50,
  myCompleted: true,
  canComplete: true,
  completed: [],
  notCompleted: [],
};

describe("prayerMapper", () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

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

  it("reads board topics whose createdAt is null (live board response)", () => {
    const board = readPrayerTopicBoard({
      emergency: [],
      recentAnswers: [],
      ongoing: [{ ...topic, createdAt: null }],
    });

    expect(board?.ongoing).toEqual([{ ...topic, createdAt: null }]);
  });

  it("rejects shapes that are not the Notion data payload", () => {
    expect(() =>
      readPrayerCohorts({ code: "SUCCESS", message: "ok", data: [cohort] }),
    ).toThrow(ApiError);
    expect(() => readPrayerTopics({ data: [topic] })).toThrow(ApiError);
    expect(() => readPrayerCohortStatus([])).toThrow(ApiError);
    expect(() =>
      readPrayerCohortStatus({ ...cohortStatus, completed: null }),
    ).toThrow(ApiError);
    expect(() =>
      readPrayerCohortStatus({ ...cohortStatus, totalMembers: "3" }),
    ).toThrow(ApiError);
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
      { ...cohort, description: null },
    ]);
  });

  it("reads null or missing fields that no screen uses", () => {
    const {
      categoryId: _categoryId,
      mine: _mine,
      createdAt: _createdAt,
      ...topicWithout
    } = topic;
    expect(
      readPrayerTopics([
        { ...topicWithout, writerName: null, emergency: null, answeredAt: 1 },
      ]),
    ).toEqual([
      {
        ...topic,
        categoryId: null,
        writerName: null,
        mine: null,
        emergency: null,
        answeredAt: null,
        createdAt: null,
      },
    ]);
    expect(
      readPrayerCohorts([
        { ...cohort, startDate: null, status: "UNKNOWN", myCompleted: null },
      ]),
    ).toEqual([
      { ...cohort, startDate: null, status: null, myCompleted: null },
    ]);
    expect(
      readPrayerCohortStatus({
        ...cohortStatus,
        weekStartDate: null,
        canComplete: null,
        completed: [{ userId: "u-1", userName: "김성도" }],
      }),
    ).toMatchObject({
      weekStartDate: null,
      canComplete: null,
      completed: [
        {
          userId: "u-1",
          userName: "김성도",
          userPhone: null,
          memberRole: null,
          completionId: null,
          completedAt: null,
          likeCount: null,
          liked: null,
        },
      ],
    });
    expect(readPrayerApplications([{ id: 1 }])).toEqual([
      expect.objectContaining({ id: 1, cohortId: null, processedAt: null }),
    ]);
    expect(readPrayerCategories([{ id: 1, categoryName: "치유" }])).toEqual([
      { id: 1, categoryCode: null, categoryName: "치유", orderNum: null },
    ]);
    expect(warn).not.toHaveBeenCalled();
  });

  it("drops only the list items whose screen fields are wrong", () => {
    expect(
      readPrayerCohorts([
        cohort,
        { ...cohort, id: 16, yoil: "1" },
        { ...cohort, id: 17, timeSlot: "MORNING" },
        { ...cohort, id: 18, myRole: "ADMIN" },
        "행이 아님",
      ]),
    ).toEqual([cohort]);
    expect(
      readPrayerTopicBoard({
        emergency: [{ ...topic, title: null }],
        recentAnswers: [],
        ongoing: [topic, { ...topic, id: 8, status: "DRAFT" }],
      }),
    ).toEqual({ emergency: [], recentAnswers: [], ongoing: [topic] });
    expect(
      readPrayerCohortStatus({
        ...cohortStatus,
        notCompleted: [{ userId: "u-2" }],
      })?.notCompleted,
    ).toEqual([]);
    expect(readPrayerCategories([{ id: "1", categoryName: "치유" }])).toEqual(
      [],
    );

    expect(warn).toHaveBeenCalledWith(
      "[응답 형식] prayer.cohorts[1]: yoil 형식 오류",
    );
    expect(warn).toHaveBeenCalledWith(
      "[응답 형식] prayer.cohorts[4]: 항목 형식 오류",
    );
    expect(warn).toHaveBeenCalledWith(
      "[응답 형식] prayer.topicBoard.emergency[0]: title 형식 오류",
    );
    expect(warn).toHaveBeenCalledWith(
      "[응답 형식] prayer.topicBoard.ongoing[1]: status 형식 오류",
    );
    expect(warn).toHaveBeenCalledWith(
      "[응답 형식] prayer.cohortStatus.notCompleted[0]: userName 형식 오류",
    );
  });
});
