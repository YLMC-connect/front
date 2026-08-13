import {
  mapCommunionDetail,
  mapCommunionMember,
  mapCommunionNotice,
  mapCommunionOverviewItem,
  mapCommunionServiceItem,
  toCommunionCategoryCode,
} from "../groupMapper";

const listItem = {
  id: 1,
  type: "SMALL_GROUP",
  title: "프론트 점검 소모임",
  categoryCode: "HOBBY_CULTURE",
  maxParticipants: 5,
  currentParticipants: 1,
  status: "RECRUITING",
  leaderName: "프론트점검",
  createdAt: "2026-08-13T11:26:07.252396",
};

describe("groupMapper", () => {
  it("maps observed common-code values to domain groups", () => {
    expect(mapCommunionOverviewItem(listItem, new Set(["1"]))).toEqual({
      id: "1",
      name: "프론트 점검 소모임",
      description: "",
      category: "hobby",
      currentMembers: 1,
      maxMembers: 5,
      status: "open",
      coverSeed: 1,
      isJoined: true,
    });
    expect(toCommunionCategoryCode("hobby")).toBe("HOBBY_CULTURE");
    expect(toCommunionCategoryCode("cell")).toBeUndefined();
  });

  it("drops list items whose category or status was not observed", () => {
    expect(
      mapCommunionOverviewItem(
        { ...listItem, categoryCode: "MUSIC" },
        new Set(),
      ),
    ).toBeNull();
  });

  it("maps volunteer list items without inventing schedule", () => {
    expect(
      mapCommunionServiceItem({
        ...listItem,
        id: 2,
        type: "VOLUNTEER",
        title: "프론트 점검 봉사",
        categoryCode: "OTHER",
      }),
    ).toEqual({
      id: "2",
      name: "프론트 점검 봉사",
      description: "",
      schedule: "",
      currentMembers: 1,
      maxMembers: 5,
      statusLabel: "모집중",
      coverSeed: 2,
      linkedGroupId: "2",
    });
  });

  it("maps detail membership from leaderId and member ids", () => {
    expect(
      mapCommunionDetail(
        {
          ...listItem,
          content: "라이브 계약 확인용 소모임입니다.",
          leaderId: "frontprobe",
        },
        [],
        [
          {
            userId: "frontprobe",
            userName: "프론트점검",
            joinedLabel: "방금 전",
            isLeader: true,
            isMine: true,
          },
        ],
        "frontprobe",
      ),
    ).toMatchObject({
      id: "1",
      description: "라이브 계약 확인용 소모임입니다.",
      categoryLabel: "취미·문화",
      isLeader: true,
      isJoined: true,
      members: ["프론트점검"],
    });
  });

  it("marks a notice edited only when updatedAt differs", () => {
    expect(
      mapCommunionNotice({
        id: 1,
        title: "점검 공지 수정",
        content: "라이브 공지 수정 확인입니다.",
        createdAt: "2026-08-13T11:26:07",
        updatedAt: "2026-08-13T11:26:08",
      }),
    ).toMatchObject({
      id: "1",
      isEdited: true,
      preview: "라이브 공지 수정 확인입니다.",
    });
  });

  it("marks the leader from detail leaderId", () => {
    expect(
      mapCommunionMember(
        {
          userId: "frontprobe",
          userName: "프론트점검",
          joinedAt: "2026-08-13T11:26:07",
        },
        "frontprobe",
        "other",
      ),
    ).toMatchObject({
      userId: "frontprobe",
      isLeader: true,
      isMine: false,
    });
  });
});
