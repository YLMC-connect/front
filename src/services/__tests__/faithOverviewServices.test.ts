import { fetchLifeStudyOverview } from "../lifeStudyService";
import { fetchPrayerOverview } from "../prayerService";

describe("faith overview services", () => {
  it("returns the prayer overview through the service boundary", async () => {
    const overview = await fetchPrayerOverview();

    expect(overview.rooms).toHaveLength(2);
    expect(overview.rooms[0]).toMatchObject({
      id: "prayer-overview-room-mon-am",
      weekday: "mon",
      period: "morning",
      status: "joined",
    });
    expect(overview.requests.map((request) => request.status)).toEqual([
      "reviewing",
      "published",
      "rejected",
    ]);
  });

  it("returns the life-study overview through the service boundary", async () => {
    const overview = await fetchLifeStudyOverview();

    expect(overview.path).toEqual({
      completedRequired: 1,
      totalRequired: 5,
      nextRecommendation: "생명언어의 삶",
      eligibility: "생명의 삶 이후 가능",
    });
    expect(overview.openCourses).toHaveLength(3);
    expect(overview.courses.map((course) => course.status)).toEqual([
      "completed",
      "recommended",
      "pending",
    ]);
  });
});
