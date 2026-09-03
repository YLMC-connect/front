import {
  formatShareCreatedLabel,
  mapShareComment,
  mapShareDetail,
  mapShareOverviewItem,
  toShareCategoryCode,
  toShareItemStatus,
} from "../marketMapper";

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
      category: "baby",
      isMine: false,
    });
    expect(toShareCategoryCode("baby")).toBe("BABY_KIDS");
    expect(toShareItemStatus("사용감 있음")).toBe("USED");
  });

  it("marks overview items as mine by authorId", () => {
    expect(mapShareOverviewItem(listItem, "selah")?.isMine).toBe(true);
  });

  it("drops list items whose status or category was not observed", () => {
    expect(
      mapShareOverviewItem({ ...listItem, status: "UNKNOWN" }, "selah"),
    ).toBeNull();
    expect(
      mapShareOverviewItem({ ...listItem, categoryCode: "UNKNOWN" }, "selah"),
    ).toBeNull();
  });

  it("maps detail authorName and item status label from the live payload", () => {
    expect(mapShareDetail(detail, [], "selah")).toMatchObject({
      id: "1",
      content: "1년 정도 썼고 상태 좋아요.",
      categoryLabel: "유아·아동용품",
      conditionLabel: "사용감 있음",
      authorName: "찬양팀",
      isMine: true,
    });
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
