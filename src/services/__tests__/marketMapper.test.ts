import {
  formatShareCreatedLabel,
  mapShareComment,
  mapShareCategories,
  mapShareDetail,
  mapShareOverviewItem,
  toShareItemStatus,
} from "../marketMapper";

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { extra: { apiUrl: "https://api.example.com/" } } },
}));

const listItem = {
  id: 1,
  title: "안쓰는 아기띠 나눔합니다",
  status: "AVAILABLE",
  categoryCode: "BABY_KIDS",
  itemStatus: "USED",
  authorId: "selah",
  createdAt: "2026-07-03T05:11:17",
};

const detail = {
  ...listItem,
  content: "1년 정도 썼고 상태 좋아요.",
  authorName: "찬양팀",
  images: [],
};

describe("marketMapper", () => {
  it("maps observed common-code values to domain status and category", () => {
    expect(
      mapShareOverviewItem(
        listItem,
        "frontprobe",
        new Date("2026-07-03T06:11:17"),
      ),
    ).toEqual({
      id: "1",
      thumbSeed: 1,
      title: "안쓰는 아기띠 나눔합니다",
      authorName: "selah",
      createdLabel: "1시간 전",
      status: "sharing",
      category: "BABY_KIDS",
      isMine: false,
    });
    expect(toShareItemStatus("사용감 있음")).toBe("USED");
  });

  it("marks overview items as mine by authorId", () => {
    expect(mapShareOverviewItem(listItem, "selah")?.isMine).toBe(true);
  });

  it("drops unknown statuses but keeps any server category code (#312)", () => {
    expect(
      mapShareOverviewItem({ ...listItem, status: "UNKNOWN" }, "selah"),
    ).toBeNull();
    expect(
      mapShareOverviewItem({ ...listItem, categoryCode: "NEW_CODE" }, "selah")
        ?.category,
    ).toBe("NEW_CODE");
    expect(
      mapShareOverviewItem({ ...listItem, categoryCode: "" }, "selah"),
    ).toBeNull();
  });

  it("maps share categories in display order and skips broken rows", () => {
    expect(
      mapShareCategories([
        { id: 2, code: "BOOK", name: "도서", orderNum: 2 },
        { id: 1, code: "CLOTH", name: " 의류 ", orderNum: 1 },
        { id: 3, code: "", name: "빈 코드", orderNum: 3 },
        { id: 4, code: "X", name: null, orderNum: 4 },
      ]),
    ).toEqual([
      { code: "CLOTH", name: "의류" },
      { code: "BOOK", name: "도서" },
    ]);
  });

  it("maps detail authorName and item status label from the live payload", () => {
    expect(mapShareDetail(detail, [], "selah")).toMatchObject({
      id: "1",
      content: "1년 정도 썼고 상태 좋아요.",
      categoryCode: "BABY_KIDS",
      conditionLabel: "사용감 있음",
      authorName: "찬양팀",
      isMine: true,
    });
  });

  it("resolves relative image paths against the configured API origin", () => {
    expect(
      mapShareDetail(
        {
          ...detail,
          images: [
            "/files/a.jpg",
            { imageUrl: "files/b.jpg" },
            "https://cdn.example.com/c.jpg",
          ],
        },
        [],
        "selah",
      )?.images,
    ).toEqual([
      "https://api.example.com/files/a.jpg",
      "https://api.example.com/files/b.jpg",
      "https://cdn.example.com/c.jpg",
    ]);
  });

  it("uses the list item imageUrl as the card thumbnail (#359)", () => {
    const now = new Date("2026-07-03T06:11:17");
    expect(
      mapShareOverviewItem(
        { ...listItem, imageUrl: "/images/share/2026/08/a.jpg" },
        "frontprobe",
        now,
      )?.thumbnailUrl,
    ).toBe("https://api.example.com/images/share/2026/08/a.jpg");
    expect(
      mapShareOverviewItem({ ...listItem, imageUrl: null }, "frontprobe", now),
    ).not.toHaveProperty("thumbnailUrl");
  });

  it("marks a comment edited only when updatedAt differs", () => {
    expect(
      mapShareComment(
        {
          id: 2,
          content: "수정 댓글",
          authorId: "frontprobe",
          authorName: "프론트점검",
          createdAt: "2026-08-13T10:37:37",
          updatedAt: "2026-08-13T10:37:49",
        },
        "frontprobe",
      ),
    ).toMatchObject({
      id: "2",
      isMine: true,
      isEdited: true,
      isDeleted: false,
    });
  });

  it("formats recent createdAt labels", () => {
    expect(
      formatShareCreatedLabel(
        "2026-08-13T10:00:00",
        new Date("2026-08-13T10:00:20"),
      ),
    ).toBe("방금 전");
  });
});
