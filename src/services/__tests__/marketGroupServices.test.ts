import {
  createGroupService,
  fetchGroupDetail,
  fetchGroupMembers,
  fetchGroupOverview,
  type GroupDataSource,
} from "../groupService";
import {
  createMarketService,
  fetchMarketDetail,
  fetchMarketOverview,
  type MarketDataSource,
} from "../marketService";

describe("market and group service boundaries", () => {
  it("returns market overview and detail through the default data source", async () => {
    const overview = await fetchMarketOverview();
    const detail = await fetchMarketDetail("1");

    expect(overview.items).toHaveLength(6);
    expect(overview.items.map((item) => item.status)).toEqual([
      "sharing",
      "reserved",
      "sharing",
      "sharing",
      "done",
      "sharing",
    ]);
    expect(detail).toMatchObject({
      id: "1",
      status: "sharing",
      authorName: "김은혜",
      isMine: true,
    });
    expect(detail.comments).toHaveLength(4);
  });

  it("switches the market data source without changing service consumers", async () => {
    const dataSource: MarketDataSource = {
      getOverview: jest.fn().mockResolvedValue({ items: [] }),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createMarketService(dataSource);

    await expect(service.fetchOverview()).resolves.toEqual({ items: [] });
    expect(dataSource.getOverview).toHaveBeenCalledTimes(1);
  });

  it("returns group overview and detail through the default data source", async () => {
    const overview = await fetchGroupOverview();
    const detail = await fetchGroupDetail("1");
    const members = await fetchGroupMembers("1");

    expect(overview.groups).toHaveLength(6);
    expect(overview.groups.filter((group) => group.isJoined)).toHaveLength(3);
    expect(overview.services).toHaveLength(3);
    expect(detail).toMatchObject({
      id: "1",
      status: "open",
      leaderName: "김은혜",
      isLeader: true,
    });
    expect(detail.notices).toHaveLength(2);
    expect(members).toHaveLength(8);
    expect(members[0]).toMatchObject({
      userName: "김은혜",
      isLeader: true,
      isMine: true,
    });
  });

  it("switches the group data source without changing service consumers", async () => {
    const dataSource: GroupDataSource = {
      getOverview: jest.fn().mockResolvedValue({ groups: [], services: [] }),
      getDetail: jest.fn().mockRejectedValue(new Error("not used")),
      getMembers: jest.fn().mockRejectedValue(new Error("not used")),
    };
    const service = createGroupService(dataSource);

    await expect(service.fetchOverview()).resolves.toEqual({
      groups: [],
      services: [],
    });
    expect(dataSource.getOverview).toHaveBeenCalledTimes(1);
  });
});
