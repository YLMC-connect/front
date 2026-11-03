import {
  createLifeStudyService,
  type LifeStudyDataSource,
} from "../lifeStudyService";
import { createPrayerService, type PrayerDataSource } from "../prayerService";

describe("faith overview services", () => {
  it("delegates prayer overview through the service boundary", async () => {
    const mockOverview = {
      rooms: [
        {
          id: "15",
          title: "월요일 오전 기도방",
          weekday: "mon" as const,
          period: "morning" as const,
          memberCount: 24,
          completedCount: 16,
          participationRate: 67,
          status: "joined" as const,
        },
      ],
      requests: [
        {
          id: "1",
          title: "어머님 수술과 회복을 위해",
          category: "건강·치유",
          status: "reviewing" as const,
          description: "관리자 검토 후 공개됩니다",
        },
      ],
    };

    const dataSource = {
      getOverview: jest.fn().mockResolvedValue(mockOverview),
    } as unknown as PrayerDataSource;

    const service = createPrayerService(dataSource);
    const overview = await service.fetchOverview();

    expect(overview).toEqual(mockOverview);
    expect(dataSource.getOverview).toHaveBeenCalledTimes(1);
  });

  it("delegates life-study overview through the service boundary", async () => {
    const mockOverview = {
      path: {
        completedRequired: 1,
        totalRequired: 5,
        nextRecommendation: "생명언어의 삶",
        eligibility: "생명의 삶 이후 가능",
      },
      openCourses: [],
      courses: [],
    };

    const dataSource = {
      getOverview: jest.fn().mockResolvedValue(mockOverview),
    } as unknown as LifeStudyDataSource;

    const service = createLifeStudyService(dataSource);
    const overview = await service.fetchOverview();

    expect(overview).toEqual(mockOverview);
    expect(dataSource.getOverview).toHaveBeenCalledTimes(1);
  });
});
