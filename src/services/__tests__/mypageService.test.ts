import { mockActivityPosts } from "../../mocks/mypageActivity";
import {
  fetchMyPageActivityComments,
  fetchMyPageActivityGroups,
  fetchMyPageActivityLifeStudies,
  fetchMyPageActivityPosts,
  fetchMyPageActivityPrayers,
  readLocalMyPageActivity,
  resolveMyPageAdapterMode,
} from "../mypageService";

describe("mypageService", () => {
  it("returns the local activity rows when the adapter is mock", async () => {
    expect(resolveMyPageAdapterMode()).toBe("mock");
    expect(readLocalMyPageActivity().posts).toBe(mockActivityPosts);

    const posts = await fetchMyPageActivityPosts();
    const comments = await fetchMyPageActivityComments();
    const groups = await fetchMyPageActivityGroups();

    expect(posts.currentPage).toBe(1);
    expect(posts.nextPage).toBeNull();
    expect(posts.items[0]).toMatchObject({
      title: "유아용 카시트 나눔해요",
    });
    expect(comments.items[0]).toMatchObject({
      content: "저희 목장 아이도 몇 달 전까지 이거 잘 썰어요! 공감이네요 ツ",
      date: "오늘",
    });
    expect(groups.items.map((group) => group.name)).toEqual([
      "토요 산악회",
      "독서 나눔",
      "엄마들의 수다방",
      "찬양 프도는 이와 함께",
    ]);
  });

  it("returns empty life-study and prayer histories from the local adapter", async () => {
    await expect(fetchMyPageActivityLifeStudies()).resolves.toEqual({
      completionCount: 0,
      applications: [],
      ongoing: [],
      completed: [],
    });
    await expect(fetchMyPageActivityPrayers()).resolves.toEqual({
      activeCount: 0,
      totalPeriod: "",
      totalPeriodDays: 0,
      totalRoomCount: 0,
      currentActivities: [],
      pastActivities: [],
    });
  });
});
