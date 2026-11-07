import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react-native";
import {
  router,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { Alert, Linking, StyleSheet } from "react-native";
import GroupDetailScreen from "../group/[id]";
import GroupMembersScreen from "../group/members";
import GroupScreen from "../group";
import GroupNoticesScreen from "../group/notices";
import HomeScreen from "../index";
import LifeStudyDetailScreen from "../life-study/[id]";
import LifeStudyApplyScreenRoute from "../life-study/apply";
import LifeStudyHistoryScreen from "../life-study/history";
import LifeStudyScreen from "../life-study";
import MarketScreen from "../market";
import MarketDetailScreen from "../market/[id]";
import MyPageScreen from "../../mypage";
import ActivityScreen from "../../mypage/activity";
import BlockedScreen from "../../mypage/blocked";
import EditProfileScreen from "../../mypage/edit";
import FaqScreen from "../../mypage/faq";
import MyPageTermsScreen from "../../mypage/terms";
import UserProfileScreen from "../../mypage/user/[id]";
import WithdrawScreen from "../../mypage/withdraw";
import PrayerDetailScreen from "../prayer/[id]";
import PrayerApplyScreenRoute from "../prayer/apply";
import PrayerScreen from "../prayer";
import PrayerRequestScreenRoute from "../prayer/request";
import { theme } from "../../../src/constants/theme";
import { renderWithClient } from "../../../src/test/renderWithClient";
import * as authService from "../../../src/services/authService";
import * as groupService from "../../../src/services/groupService";
import * as homeService from "../../../src/services/homeService";
import * as lifeStudyService from "../../../src/services/lifeStudyService";
import * as marketService from "../../../src/services/marketService";
import * as mypageService from "../../../src/services/mypageService";
import * as prayerService from "../../../src/services/prayerService";
import * as siteContentService from "../../../src/services/siteContentService";
import type { GroupDetail, GroupOverview } from "../../../src/types/group";
import type {
  MarketDetail,
  MarketOverviewItem,
} from "../../../src/types/market";

describe("v1 tab smoke screens", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.mocked(useLocalSearchParams).mockReturnValue({});

    jest.spyOn(homeService, "fetchHomeOverview").mockResolvedValue({
      dailyPrayer: {
        dateLabel: "4월 16일 목요일",
        weekday: "thu",
        weekdayLabel: "목요일의 기도",
        title: "일터와 가정을 지키는 지혜",
        summary: "우리의 계획보다 주님의 인도하심을 신뢰하게 하소서.",
        href: "/prayer",
      },
      dawnPrayer: {
        id: "dawn-1",
        title: "고린도후서 1:23~2:17",
        summary: "2026. 11. 3. 화요일 ㅡ 고린도후서 1:23~2:17",
        timeLabel: "새벽기도 말씀요약 · 11월 3일",
        body: "본문",
        href: "/dawn?id=1",
      },
      sundaySermon: {
        id: "1",
        timeLabel: "이번 주일 말씀 · 11월 1일",
        title: "넘쳐 흐르는 위로(고후1:1~11)",
        summary: "고린도후서 1장 1 ~ 11절 · 이재홍 전도사",
        thumbnailUrl: "https://img.youtube.com/vi/1t5SPGmJxsg/hqdefault.jpg",
        videoUrl: "https://www.youtube.com/watch?v=1t5SPGmJxsg",
      },
      todos: [],
      progressSteps: [],
    });

    const marketItems: MarketOverviewItem[] = [
      {
        id: "1",
        thumbSeed: 0,
        title: "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
        authorName: "김은혜",
        createdLabel: "10분 전",
        status: "sharing",
        category: "baby",
        isMine: true,
      },
      {
        id: "2",
        thumbSeed: 1,
        title: "토스터기·전기주전자 세트 나눔해요",
        authorName: "이요셉",
        createdLabel: "1시간 전",
        status: "sharing",
        category: "home",
        isMine: false,
      },
      {
        id: "3",
        thumbSeed: 2,
        title: "어린이 동화책 30권 묶음 나눔",
        authorName: "박한나",
        createdLabel: "2시간 전",
        status: "sharing",
        category: "book",
        isMine: false,
      },
      {
        id: "4",
        thumbSeed: 3,
        title: "유아용 카시트 (사용감 있음)",
        authorName: "최성도",
        createdLabel: "어제",
        status: "reserved",
        category: "baby",
        isMine: false,
      },
    ];
    let marketDetailState: MarketDetail = {
      id: "1",
      thumbSeed: 0,
      title: "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
      content: "아이가 커서 정리합니다.",
      categoryLabel: "육아·아동",
      conditionLabel: "상태 좋음",
      status: "sharing",
      authorName: "김은혜",
      createdLabel: "10분 전",
      isMine: true,
      comments: [
        {
          id: "comment-1",
          authorName: "이요셉",
          createdLabel: "8분 전",
          content: "나눔 감사합니다!",
          isMine: false,
          isEdited: false,
          isDeleted: false,
        },
        {
          id: "comment-2",
          authorName: "박한나",
          createdLabel: "5분 전",
          content: "혹시 주일 예배 후 수령 가능할까요?",
          isMine: false,
          isEdited: false,
          isDeleted: false,
        },
        {
          id: "comment-3",
          authorName: "최성도",
          createdLabel: "3분 전",
          isMine: false,
          isEdited: false,
          isDeleted: true,
        },
        {
          id: "comment-4",
          authorName: "김은혜",
          createdLabel: "1분 전",
          content: "아직 남아있을까요? 늦었지만 가능하면 부탁드려요.",
          isMine: true,
          isEdited: false,
          isDeleted: false,
        },
      ],
    };

    jest.spyOn(marketService, "fetchMarketOverview").mockResolvedValue({
      items: marketItems,
    });
    jest.spyOn(marketService, "fetchMarketOverviewPage").mockResolvedValue({
      items: marketItems,
      hasNext: false,
      nextCursor: null,
    });
    jest
      .spyOn(marketService, "fetchMyMarketOverviewPage")
      .mockImplementation(async () => ({
        items: marketItems.filter((item) => item.isMine),
        hasNext: false,
        nextCursor: null,
      }));
    jest
      .spyOn(marketService, "fetchMarketDetail")
      .mockImplementation(async (id) => {
        if (id === "missing") throw new Error("존재하지 않는 나눔입니다.");
        return {
          ...marketDetailState,
          comments: marketDetailState.comments.map((c) => ({ ...c })),
        };
      });
    jest
      .spyOn(marketService, "createMarketComment")
      .mockImplementation(async (input) => {
        const created = {
          id: `comment-${Date.now()}`,
          authorName: "김은혜",
          createdLabel: "방금 전",
          content: input.content,
          isMine: true,
          isEdited: false,
          isDeleted: false,
        };
        marketDetailState = {
          ...marketDetailState,
          comments: [...marketDetailState.comments, created],
        };
        return created;
      });
    jest
      .spyOn(marketService, "updateMarketComment")
      .mockImplementation(async (input) => {
        const updated = {
          id: input.commentId,
          authorName: "김은혜",
          createdLabel: "1분 전",
          content: input.content,
          isMine: true,
          isEdited: true,
          isDeleted: false,
        };
        marketDetailState = {
          ...marketDetailState,
          comments: marketDetailState.comments.map((c) =>
            c.id === input.commentId ? updated : c,
          ),
        };
        return updated;
      });
    jest
      .spyOn(marketService, "deleteMarketComment")
      .mockImplementation(async (input) => {
        marketDetailState = {
          ...marketDetailState,
          comments: marketDetailState.comments.map((c) =>
            c.id === input.commentId
              ? { ...c, content: undefined, isDeleted: true }
              : c,
          ),
        };
      });
    jest.spyOn(marketService, "deleteMarketPost").mockResolvedValue(undefined);

    const groupOverviewData: GroupOverview = {
      groups: [
        {
          id: "1",
          name: "토요 산악회",
          description: "함께 산을 오르며 교제해요",
          category: "hobby",
          currentMembers: 6,
          maxMembers: 12,
          status: "open",
          coverSeed: 0,
          isJoined: true,
        },
        {
          id: "2",
          name: "독서 나눔",
          description: "신앙 서적을 함께 읽어요",
          category: "bible",
          currentMembers: 8,
          maxMembers: 10,
          status: "open",
          coverSeed: 1,
          isJoined: true,
        },
        {
          id: "3",
          name: "엄마들의 수다방",
          description: "육아와 신앙을 나눠요",
          category: "cell",
          currentMembers: 10,
          maxMembers: 15,
          status: "open",
          coverSeed: 2,
          isJoined: true,
        },
        {
          id: "4",
          name: "화요 새벽기도회",
          description: "화요일 새벽을 깨워요",
          category: "pray",
          currentMembers: 5,
          maxMembers: 20,
          status: "open",
          coverSeed: 3,
          isJoined: false,
        },
        {
          id: "5",
          name: "찬양 동아리",
          description: "찬양으로 하나되는 모임",
          category: "hobby",
          currentMembers: 18,
          maxMembers: 24,
          status: "open",
          coverSeed: 4,
          isJoined: false,
        },
      ],
      services: [
        {
          id: "service-1",
          linkedGroupId: "5",
          name: "주방 봉사팀",
          schedule: "주일 10:30",
          description: "성도들의 식사를 섬겨요",
          currentMembers: 18,
          maxMembers: 24,
          statusLabel: "모집중",
          coverSeed: 0,
        },
      ],
    };
    let groupDetailState: GroupDetail = {
      id: "1",
      name: "토요 산악회",
      description: "함께 산을 오르며 교제해요",
      categoryLabel: "취미·문화",
      currentMembers: 6,
      maxMembers: 12,
      status: "open",
      leaderName: "김은혜",
      isLeader: true,
      isJoined: true,
      members: ["김은혜", "이요셉", "박한나", "최성도", "정다윗", "한수연"],
      notices: [
        {
          id: "notice-1",
          title: "5월 18일 토요일 모임 안내",
          content: "오전 8시에 집결합니다.",
          preview: "오전 8시에 집결합니다.",
          createdLabel: "2일 전",
          isEdited: false,
        },
        {
          id: "notice-2",
          title: "신규 멤버 환영합니다",
          content: "함께하게 되어 기쁩니다.",
          preview: "함께하게 되어 기쁩니다.",
          createdLabel: "1주 전",
          isEdited: false,
        },
      ],
    };

    jest
      .spyOn(groupService, "fetchGroupOverview")
      .mockResolvedValue(groupOverviewData);
    jest.spyOn(groupService, "fetchGroupOverviewPage").mockResolvedValue({
      ...groupOverviewData,
      myGroups: groupOverviewData.groups.filter((group) => group.isJoined),
      hasNext: false,
      nextCursor: null,
    });
    jest
      .spyOn(groupService, "fetchGroupDetail")
      .mockImplementation(async () => ({
        ...groupDetailState,
        notices: groupDetailState.notices.map((n) => ({ ...n })),
      }));
    jest.spyOn(groupService, "fetchGroupMembers").mockResolvedValue([
      {
        userId: "member-001",
        userName: "김은혜",
        joinedLabel: "2026.01",
        isLeader: true,
        isMine: true,
      },
      {
        userId: "member-002",
        userName: "이요셉",
        joinedLabel: "2026.02",
        isLeader: false,
        isMine: false,
      },
      {
        userId: "member-003",
        userName: "박한나",
        joinedLabel: "2026.02",
        isLeader: false,
        isMine: false,
      },
      {
        userId: "member-004",
        userName: "최성도",
        joinedLabel: "2026.03",
        isLeader: false,
        isMine: false,
      },
      {
        userId: "member-005",
        userName: "정다윗",
        joinedLabel: "2026.03",
        isLeader: false,
        isMine: false,
      },
      {
        userId: "member-006",
        userName: "한수연",
        joinedLabel: "2026.03",
        isLeader: false,
        isMine: false,
      },
      {
        userId: "member-007",
        userName: "강다니엘",
        joinedLabel: "2026.04",
        isLeader: false,
        isMine: false,
      },
      {
        userId: "member-008",
        userName: "윤사라",
        joinedLabel: "2026.04",
        isLeader: false,
        isMine: false,
      },
    ]);
    jest
      .spyOn(groupService, "createGroupNotice")
      .mockImplementation(async (input) => {
        const notice = {
          id: `notice-${Date.now()}`,
          title: input.title,
          content: input.content,
          preview: input.content,
          createdLabel: "방금 전",
          isEdited: false,
        };
        groupDetailState = {
          ...groupDetailState,
          notices: [notice, ...groupDetailState.notices],
        };
        return notice;
      });
    jest
      .spyOn(groupService, "updateGroupNotice")
      .mockImplementation(async (input) => {
        const updated = {
          id: input.noticeId,
          title: input.title,
          content: input.content,
          preview: input.content,
          createdLabel: "방금 전",
          isEdited: true,
        };
        groupDetailState = {
          ...groupDetailState,
          notices: groupDetailState.notices.map((n) =>
            n.id === input.noticeId ? updated : n,
          ),
        };
        return updated;
      });
    jest
      .spyOn(groupService, "deleteGroupNotice")
      .mockImplementation(async (input) => {
        groupDetailState = {
          ...groupDetailState,
          notices: groupDetailState.notices.filter(
            (n) => n.id !== input.noticeId,
          ),
        };
      });

    jest.spyOn(prayerService, "fetchPrayerOverview").mockResolvedValue({
      rooms: [
        {
          id: "prayer-overview-room-mon-am",
          weekday: "mon",
          period: "morning",
          memberCount: 24,
          completedCount: 16,
          participationRate: 67,
          status: "joined",
        },
        {
          id: "prayer-overview-room-thu-pm",
          weekday: "thu",
          period: "afternoon",
          memberCount: 19,
          status: "pending",
        },
      ],
      requests: [
        {
          id: "prayer-overview-request-1",
          title: "어머님 수술과 회복을 위해",
          category: "건강·치유",
          status: "reviewing",
          description: "관리자 검토 후 공개됩니다",
        },
      ],
    });
    jest
      .spyOn(prayerService, "fetchPrayerCohortStatus")
      .mockResolvedValue(null);
    jest.spyOn(prayerService, "fetchPrayerTopicBoard").mockResolvedValue(null);
    jest.spyOn(prayerService, "fetchMyPrayerTopics").mockResolvedValue([]);

    jest.spyOn(lifeStudyService, "fetchLifeStudyOverview").mockResolvedValue({
      path: {
        completedRequired: 1,
        totalRequired: 5,
        nextRecommendation: "생명언어의 삶",
        eligibility: "생명의 삶 이후 가능",
      },
      openCourses: [
        {
          id: "life-overview-open-1",
          title: "생명의 삶",
          kind: "required",
          weekCount: 13,
          instructorName: "박귀원",
          summary: "신앙의 근본을 바로 세우는 가장 기본 과정",
          applicationPeriod: "6.24 ~ 7.05",
          capacity: 24,
          enrolledCount: 18,
        },
      ],
      courses: [
        {
          id: "life-overview-course-1",
          title: "생명의 삶",
          kind: "required",
          weekCount: 13,
          instructorName: "박귀원",
          status: "completed",
          summary: "구원의 확신과 신앙의 기본을 세우는 과정",
          target: "등록교인 누구나",
        },
      ],
    });
    jest
      .spyOn(lifeStudyService, "fetchMyLifeStudyCompletions")
      .mockResolvedValue([
        {
          id: "1-1",
          courseId: "1",
          title: "말씀통독의 삶",
          enrolledAt: "2025-03-01",
          completedSessions: 12,
          completedAt: "2026-02-15",
          certificateIssued: true,
        },
      ]);

    jest.spyOn(mypageService, "fetchMyPageActivityPosts").mockResolvedValue({
      items: [
        {
          id: "post-1",
          thumb: 0,
          title: "유아용 카시트 나눔해요",
          status: "나눔중",
          tone: "primary",
          date: "2026.10.22",
        },
      ],
      currentPage: 1,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      hasNext: false,
      nextPage: null,
    });
    jest.spyOn(mypageService, "fetchMyPageActivityComments").mockResolvedValue({
      items: [],
      currentPage: 1,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
      nextPage: null,
    });
    jest.spyOn(mypageService, "fetchMyPageActivityGroups").mockResolvedValue({
      items: [
        {
          id: "group-1",
          name: "토요 산악회",
          members: 6,
          joined: "2026.10.21 가입",
          seed: 0,
        },
      ],
      currentPage: 1,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      hasNext: false,
      nextPage: null,
    });
  });
  it("renders the home screen", async () => {
    renderWithClient(<HomeScreen />);

    expect(screen.getByText("열린문 커넥트")).toBeTruthy();
    expect(screen.queryByText("홈")).toBeNull();
    expect(screen.getByLabelText(/내 정보/)).toBeTruthy();
    expect(screen.getByTestId("home-open-mypage")).toBeTruthy();
    expect(await screen.findByTestId("home-greeting")).toBeTruthy();
    expect(
      within(screen.getByTestId("home-greeting")).getAllByText("성도").length,
    ).toBeGreaterThanOrEqual(1);
    expect(await screen.findByTestId("home-daily-prayer")).toBeTruthy();
    expect(screen.getByTestId("home-dawn-prayer")).toBeTruthy();
    expect(screen.getByText("새벽기도 말씀요약")).toBeTruthy();
    expect(screen.getByText("11월 3일")).toBeTruthy();
    expect(screen.getByTestId("home-sunday-sermon")).toBeTruthy();
    expect(screen.getByTestId("home-sunday-sermon-thumbnail")).toBeTruthy();
    expect(screen.getByText("이번 주일 말씀")).toBeTruthy();
    expect(screen.getByText("11월 1일")).toBeTruthy();
    expect(screen.getByText("넘쳐 흐르는 위로(고후1:1~11)")).toBeTruthy();
    expect(screen.queryByText("내 활동 요약")).toBeNull();
  });

  it("opens mypage from the home profile action", async () => {
    const push = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ push } as never);
    renderWithClient(<HomeScreen />);

    await screen.findByTestId("home-daily-prayer");
    fireEvent.press(screen.getByTestId("home-open-mypage"));
    expect(push).toHaveBeenCalledWith("/mypage");
  });

  it("opens prayer routes and youtube sermon link from home cards", async () => {
    const push = jest.fn();
    const openURLSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValueOnce(true);
    jest.mocked(useRouter).mockReturnValue({ push } as never);
    renderWithClient(<HomeScreen />);

    await screen.findByTestId("home-daily-prayer");
    fireEvent.press(screen.getByTestId("home-dawn-prayer"));
    expect(push).toHaveBeenCalledWith("/dawn?id=1");
    fireEvent.press(screen.getByTestId("home-sunday-sermon"));
    expect(openURLSpy).toHaveBeenCalledWith(
      "https://www.youtube.com/watch?v=1t5SPGmJxsg",
    );
    openURLSpy.mockRestore();
  });

  it("renders the market screen", async () => {
    const push = jest.fn();
    jest
      .mocked(useRouter)
      .mockReturnValue({ push, setParams: jest.fn() } as never);
    renderWithClient(<MarketScreen />);

    expect(screen.getByText("나눔")).toBeTruthy();
    expect(screen.getByTestId("screen-market-sticky-controls")).toBeTruthy();
    expect(
      screen.getByText("이웃과 물건을 나누며 따뜻함을 전해요"),
    ).toBeTruthy();
    expect(screen.getByTestId("market-status-all")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("나눔하기"));
    expect(push).toHaveBeenCalledWith("/modal/market-new");
    expect(screen.getByTestId("market-status-sharing")).toBeTruthy();
    expect(screen.getByTestId("market-status-mine")).toBeTruthy();
    expect(screen.queryByTestId("market-status-reserved")).toBeNull();
    expect(screen.queryByTestId("market-status-done")).toBeNull();
    expect(
      await screen.findByText(
        "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
      ),
    ).toBeTruthy();
    expect(screen.getByText("토스터기·전기주전자 세트 나눔해요")).toBeTruthy();
  });

  it("filters and searches market posts", async () => {
    const setParams = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ setParams } as never);
    renderWithClient(<MarketScreen />);
    await screen.findByText(
      "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
    );

    // 카드 맨 위 카테고리 줄에도 같은 이름이 있어 필터 칩은 testID 로 고른다.
    fireEvent.press(screen.getByTestId("market-category-book"));
    await waitFor(() =>
      expect(setParams).toHaveBeenCalledWith({ category: "book" }),
    );
    expect(screen.getByText("어린이 동화책 30권 묶음 나눔")).toBeTruthy();
    expect(
      screen.queryByText("아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)"),
    ).toBeNull();

    // 내릴 때 숨김
    fireEvent.scroll(screen.getByTestId("screen-market-scroll"), {
      nativeEvent: { contentOffset: { y: 13 } },
    });
    expect(
      screen.getByTestId("screen-market-sticky-controls", {
        includeHiddenElements: true,
      }).props.pointerEvents,
    ).toBe("none");

    // 위로 살짝 올리면 세그먼트·필터 다시 표시
    fireEvent.scroll(screen.getByTestId("screen-market-scroll"), {
      nativeEvent: { contentOffset: { y: 9 } },
    });
    expect(
      screen.getByTestId("screen-market-sticky-controls").props.pointerEvents,
    ).toBe("auto");
  });

  it("restores a market category from the list route", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ category: "book" });
    renderWithClient(<MarketScreen />);

    expect(
      await screen.findByText("어린이 동화책 30권 묶음 나눔"),
    ).toBeTruthy();
    expect(
      screen.getByTestId("market-category-book").props.accessibilityState,
    ).toEqual({ selected: true });
    expect(
      screen.queryByText("아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)"),
    ).toBeNull();

    jest.mocked(useLocalSearchParams).mockReturnValue({});
  });

  it("shows only owned posts in the my market segment", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ status: "mine" });
    renderWithClient(<MarketScreen />);

    expect(
      await screen.findByText(
        "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
      ),
    ).toBeTruthy();
    expect(
      screen.getByTestId("market-status-mine").props.accessibilityState,
    ).toEqual({ selected: true });
    expect(screen.queryByText("유아용 카시트 (사용감 있음)")).toBeNull();

    jest.mocked(useLocalSearchParams).mockReturnValue({});
  });

  it("updates filter params while keeping detail navigation on the back stack", async () => {
    const navigation = {
      back: jest.fn(),
      push: jest.fn(),
      setParams: jest.fn(),
    };
    jest.mocked(useRouter).mockReturnValue(navigation as never);
    jest.mocked(useLocalSearchParams).mockReturnValue({});
    const list = renderWithClient(<MarketScreen />);

    await screen.findByText(
      "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
    );
    fireEvent.press(screen.getByTestId("market-status-mine"));
    await waitFor(() =>
      expect(navigation.setParams).toHaveBeenCalledWith({ status: "mine" }),
    );

    fireEvent.press(
      screen.getByText("아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)"),
    );
    expect(navigation.push).toHaveBeenCalledWith("/market/1");

    list.unmount();
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "1" });
    renderWithClient(<MarketDetailScreen />);
    fireEvent.press(await screen.findByLabelText("뒤로"));
    expect(navigation.back).toHaveBeenCalledTimes(1);

    jest.mocked(useLocalSearchParams).mockReturnValue({});
  });

  it("renders the market detail screen", async () => {
    renderWithClient(<MarketDetailScreen />);

    expect(
      await screen.findByText(
        "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
      ),
    ).toBeTruthy();
    expect(screen.getByText("댓글 3개")).toBeTruthy();
    expect(screen.getByPlaceholderText("댓글을 입력해주세요")).toBeTruthy();
  });

  it("centers the market detail error state in the available screen", async () => {
    const back = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ back } as never);
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "missing" });
    renderWithClient(<MarketDetailScreen />);

    expect(await screen.findByText("나눔 상세")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("뒤로"));
    expect(back).toHaveBeenCalledTimes(1);
    expect(screen.getByText("불러오지 못했습니다")).toBeTruthy();
    expect(screen.getByText("나눔 정보를 다시 불러와주세요.")).toBeTruthy();
    expect(screen.getByText("다시 시도")).toBeTruthy();
    expect(
      StyleSheet.flatten(
        screen.getByTestId("market-detail-error-center").props.style,
      ),
    ).toMatchObject({
      flex: 1,
      justifyContent: "center",
    });

    jest.mocked(useLocalSearchParams).mockReturnValue({});
  });

  it("uses a compact vertical gradient on the market detail hero", async () => {
    renderWithClient(<MarketDetailScreen />);
    await screen.findByText(
      "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
    );

    const scrim = screen.getByTestId("market-hero-scrim");
    expect(scrim.props.colors).toEqual([
      "rgba(25,31,40,0.22)",
      "rgba(25,31,40,0.10)",
      "rgba(25,31,40,0)",
    ]);
    expect(scrim.props.locations).toEqual([0, 0.52, 1]);
    expect(StyleSheet.flatten(scrim.props.style)).toMatchObject({ height: 88 });
    const backStyle = StyleSheet.flatten(
      screen.getByLabelText("뒤로").props.style,
    );
    expect(backStyle).toMatchObject({
      minWidth: 68,
      height: 44,
    });
    expect(backStyle.borderWidth).toBeUndefined();
    expect(backStyle.backgroundColor).toBeUndefined();
    expect(backStyle.shadowOpacity).toBeUndefined();
    expect(backStyle.elevation).toBeUndefined();
  });

  it("switches sticky header background when scrolling past the market hero image", async () => {
    renderWithClient(<MarketDetailScreen />);
    await screen.findByText(
      "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
    );

    const header = screen.getByTestId("market-detail-sticky-header");
    expect(StyleSheet.flatten(header.props.style)).toMatchObject({
      backgroundColor: "transparent",
    });
    expect(screen.queryByText("나눔 상세")).toBeNull();

    fireEvent.scroll(screen.getByTestId("market-detail-scroll"), {
      nativeEvent: { contentOffset: { y: 800 } },
    });

    expect(StyleSheet.flatten(header.props.style)).toMatchObject({
      backgroundColor: theme.colors.bg,
      borderBottomColor: theme.colors.border,
    });
    expect(screen.getByText("나눔 상세")).toBeTruthy();

    fireEvent.scroll(screen.getByTestId("market-detail-scroll"), {
      nativeEvent: { contentOffset: { y: 0 } },
    });

    expect(StyleSheet.flatten(header.props.style)).toMatchObject({
      backgroundColor: "transparent",
    });
    expect(screen.queryByText("나눔 상세")).toBeNull();
  });

  it("creates a comment from the market detail screen", async () => {
    renderWithClient(<MarketDetailScreen />);

    await screen.findByText(
      "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("댓글을 입력해주세요"),
      "새로 등록한 댓글",
    );
    fireEvent.press(screen.getByLabelText("댓글 등록"));

    expect(await screen.findByText("새로 등록한 댓글")).toBeTruthy();
    expect(screen.getByText("댓글 4개")).toBeTruthy();
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText("댓글을 입력해주세요").props.value,
      ).toBe(""),
    );
  });

  it("edits an owned comment from the market detail screen", async () => {
    renderWithClient(<MarketDetailScreen />);

    await screen.findByText("아직 남아있을까요? 늦었지만 가능하면 부탁드려요.");
    fireEvent.press(screen.getByTestId("market-comment-edit-comment-4"));
    fireEvent.changeText(
      screen.getByPlaceholderText("댓글을 수정해주세요"),
      "수정된 댓글 내용",
    );
    fireEvent.press(screen.getByLabelText("댓글 수정"));

    expect(await screen.findByText("수정된 댓글 내용")).toBeTruthy();
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText("댓글을 입력해주세요").props.value,
      ).toBe(""),
    );
  });

  it("deletes an owned comment after confirmation", async () => {
    const alert = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title, _message, buttons) => {
        buttons?.find(({ text }) => text === "삭제")?.onPress?.();
      });
    renderWithClient(<MarketDetailScreen />);

    await screen.findByTestId("market-comment-delete-comment-4");
    const deletedBefore = screen.getAllByText("삭제된 댓글입니다").length;
    fireEvent.press(screen.getByTestId("market-comment-delete-comment-4"));

    await waitFor(
      () =>
        expect(screen.getAllByText("삭제된 댓글입니다")).toHaveLength(
          deletedBefore + 1,
        ),
      { timeout: 5000 },
    );
    expect(screen.queryByTestId("market-comment-delete-comment-4")).toBeNull();
    alert.mockRestore();
  });

  it("deletes an owned market post and returns to the market list", async () => {
    const replace = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ replace } as never);
    renderWithClient(<MarketDetailScreen />);

    await screen.findByTestId("market-delete-post");
    fireEvent.press(screen.getByTestId("market-delete-post"));
    expect(screen.getByText("게시글을 삭제하시겠습니까?")).toBeTruthy();
    fireEvent.press(screen.getAllByText("삭제").at(-1)!);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/market"), {
      timeout: 5000,
    });
  });

  it("renders the group screen", async () => {
    const push = jest.fn();
    jest
      .mocked(useRouter)
      .mockReturnValue({ push, setParams: jest.fn() } as never);
    renderWithClient(<GroupScreen />);

    expect(screen.getByText("동행")).toBeTruthy();
    expect(screen.getByText("소모임과 봉사로 함께 걸어가요")).toBeTruthy();
    expect(screen.getAllByText("소모임").length).toBeGreaterThan(0);
    expect(screen.getAllByText("봉사").length).toBeGreaterThan(0);
    expect(screen.getAllByText("내 모임").length).toBeGreaterThan(0);
    fireEvent.press(screen.getByLabelText("소모임 개설"));
    expect(push).toHaveBeenCalledWith("/modal/group-new");
  });

  it("renders the joined groups when mine segment is selected", async () => {
    renderWithClient(<GroupScreen />);
    await screen.findByText("내 모임");

    fireEvent.press(screen.getByTestId("group-section-mine"));

    const myList = await screen.findByTestId("group-my-list");
    expect(myList).toBeTruthy();
    expect(within(myList).getByText("토요 산악회")).toBeTruthy();
    expect(within(myList).getByText("독서 나눔")).toBeTruthy();
    expect(within(myList).getByText("엄마들의 수다방")).toBeTruthy();
  });

  it("filters groups by category and toggles sticky controls on scroll", async () => {
    const setParams = jest.fn();
    jest
      .mocked(useRouter)
      .mockReturnValue({ push: jest.fn(), setParams } as never);
    renderWithClient(<GroupScreen />);
    await screen.findByTestId("group-card-1");

    fireEvent.press(screen.getByTestId("group-category-pray"));
    await waitFor(() =>
      expect(setParams).toHaveBeenCalledWith({ category: "pray" }),
    );

    // 내릴 때 숨김
    fireEvent.scroll(screen.getByTestId("screen-group-scroll"), {
      nativeEvent: { contentOffset: { y: 13 } },
    });
    expect(
      screen.getByTestId("screen-group-sticky-controls", {
        includeHiddenElements: true,
      }).props.pointerEvents,
    ).toBe("none");

    // 위로 살짝 올리면 세그먼트·필터 다시 표시
    fireEvent.scroll(screen.getByTestId("screen-group-scroll"), {
      nativeEvent: { contentOffset: { y: 9 } },
    });
    expect(
      screen.getByTestId("screen-group-sticky-controls").props.pointerEvents,
    ).toBe("auto");
  });

  it("resets the existing group list without remounting it for detail", async () => {
    const dispatch = jest.fn();
    let blurGroupList: (() => void) | undefined;
    let focusGroupList: (() => void) | undefined;
    let finishGroupTransition:
      | ((event: { data: { closing: boolean } }) => void)
      | undefined;
    const addListener = jest.fn((event: string, listener: never) => {
      if (event === "blur") blurGroupList = listener;
      if (event === "focus") focusGroupList = listener;
      if (event === "transitionEnd") finishGroupTransition = listener;
      return jest.fn();
    });
    jest.mocked(useNavigation).mockReturnValue({
      addListener,
      dispatch,
      isFocused: () => true,
    } as never);
    jest
      .mocked(useRouter)
      .mockReturnValue({ push: jest.fn(), setParams: jest.fn() } as never);
    try {
      renderWithClient(<GroupScreen />);
      await screen.findByTestId("group-card-1");

      const previousScroll = screen.getByTestId("screen-group-scroll");
      const previousSegmentIndicator = screen.getByTestId(
        "group-section-indicator",
      );
      const previousCategoryIndicator = screen.getByTestId(
        "group-category-indicator",
      );

      dispatch.mockImplementation(() => {
        expect(screen.getByTestId("screen-group-scroll")).toBe(previousScroll);
        expect(screen.getByTestId("group-section-indicator")).toBe(
          previousSegmentIndicator,
        );
        expect(screen.getByTestId("group-category-indicator")).toBe(
          previousCategoryIndicator,
        );
      });

      fireEvent.press(screen.getByTestId("group-card-1"));

      expect(dispatch).toHaveBeenCalledWith({
        type: "PUSH",
        payload: { name: "[id]", params: { id: "1" } },
      });
      expect(blurGroupList).toBeDefined();
      expect(focusGroupList).toBeDefined();
      expect(finishGroupTransition).toBeDefined();

      act(() => blurGroupList?.());
      act(() => finishGroupTransition?.({ data: { closing: true } }));
      expect(screen.getByTestId("screen-group-scroll")).toBe(previousScroll);
      expect(screen.getByTestId("group-section-indicator")).toBe(
        previousSegmentIndicator,
      );
      expect(screen.getByTestId("group-category-indicator")).toBe(
        previousCategoryIndicator,
      );

      act(() => focusGroupList?.());
      expect(screen.getByTestId("screen-group-scroll")).toBe(previousScroll);
    } finally {
      jest.mocked(useNavigation).mockReturnValue({
        addListener: () => () => undefined,
        dispatch: jest.fn(),
        isFocused: () => true,
      } as never);
    }
  });

  it("applies the group category filter to the groups list", async () => {
    const setParams = jest.fn();
    jest
      .mocked(useRouter)
      .mockReturnValue({ push: jest.fn(), setParams } as never);
    renderWithClient(<GroupScreen />);
    await screen.findByTestId("group-card-1");

    fireEvent.press(screen.getByTestId("group-category-pray"));

    expect(screen.getByText("화요 새벽기도회")).toBeTruthy();
    expect(screen.queryByText("찬양 동아리")).toBeNull();
    await waitFor(() =>
      expect(setParams).toHaveBeenCalledWith({ category: "pray" }),
    );
  });

  it("updates the group segment without replacing the screen", async () => {
    const dispatch = jest.fn();
    const setParams = jest.fn();
    jest.mocked(useNavigation).mockReturnValue({
      addListener: () => () => undefined,
      dispatch,
      isFocused: () => true,
    } as never);
    jest.mocked(useRouter).mockReturnValue({ setParams } as never);
    renderWithClient(<GroupScreen />);
    await screen.findByTestId("group-card-1");
    const groupCardStyle = StyleSheet.flatten(
      screen.getByTestId("group-card-1").props.style,
    );

    fireEvent.press(screen.getByTestId("group-section-service"));

    const serviceCard = await screen.findByTestId(
      "group-service-card-service-1",
    );
    expect(StyleSheet.flatten(serviceCard.props.style)).toEqual(groupCardStyle);
    expect(groupCardStyle).toMatchObject({ minHeight: 120 });
    expect(screen.getByText("주방 봉사팀")).toBeTruthy();
    expect(screen.getByText("주일 10:30")).toBeTruthy();
    const serviceCount = screen.getByTestId(
      "group-service-card-service-1-member-count",
    );
    expect(within(serviceCount).getByText("18")).toBeTruthy();
    expect(within(serviceCount).getByText(/24명/)).toBeTruthy();
    fireEvent.press(serviceCard);
    expect(dispatch).toHaveBeenCalledWith({
      type: "PUSH",
      payload: { name: "[id]", params: { id: "5" } },
    });
    await waitFor(() =>
      expect(setParams).toHaveBeenCalledWith({ section: "service" }),
    );
  });

  it("renders the group detail screen", async () => {
    renderWithClient(<GroupDetailScreen />);

    expect(await screen.findByText("토요 산악회")).toBeTruthy();
    expect(screen.getByText("멤버 6명")).toBeTruthy();
    expect(screen.getByText("공지사항")).toBeTruthy();
  });

  it("renders the group notice editor screen", () => {
    renderWithClient(<GroupNoticesScreen />);

    expect(screen.getByText("공지 작성")).toBeTruthy();
    expect(screen.getByLabelText("닫기")).toBeTruthy();
    expect(screen.queryByText("닫기")).toBeNull();
    expect(screen.getByText("소모임 멤버에게만 공개됩니다.")).toBeTruthy();
    expect(screen.getByPlaceholderText("공지 제목 (최대 30자)")).toBeTruthy();
  });

  it("creates a group notice and persists it in the detail", async () => {
    const replace = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ replace } as never);
    const editor = renderWithClient(<GroupNoticesScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("공지 제목 (최대 30자)"),
      "새 모임 공지",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("공지 내용을 입력해주세요"),
      "이번 주 모임 장소가 변경되었습니다.",
    );
    fireEvent.press(screen.getByTestId("group-notice-submit"));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/group/1"), {
      timeout: 5000,
    });
    editor.unmount();
    renderWithClient(<GroupDetailScreen />);
    expect(await screen.findByText("새 모임 공지")).toBeTruthy();
  });

  it("updates and deletes a group notice from the editor", async () => {
    const replace = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ replace } as never);
    jest.mocked(useLocalSearchParams).mockReturnValue({
      id: "1",
      noticeId: "notice-1",
    });
    const editor = renderWithClient(<GroupNoticesScreen />);

    await waitFor(() =>
      expect(
        screen.getByPlaceholderText("공지 제목 (최대 30자)").props.value,
      ).toBe("5월 18일 토요일 모임 안내"),
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("공지 제목 (최대 30자)"),
      "수정된 산악회 공지",
    );
    fireEvent.press(screen.getByTestId("group-notice-submit"));
    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1), {
      timeout: 5000,
    });
    editor.unmount();

    const deleteEditor = renderWithClient(<GroupNoticesScreen />);
    await screen.findByTestId("group-notice-delete");
    fireEvent.press(screen.getByTestId("group-notice-delete"));
    fireEvent.press(screen.getAllByText("삭제").at(-1)!);
    await waitFor(() => expect(replace).toHaveBeenCalledTimes(2), {
      timeout: 5000,
    });
    deleteEditor.unmount();

    jest.mocked(useLocalSearchParams).mockReturnValue({});
    renderWithClient(<GroupDetailScreen />);
    await screen.findByText("토요 산악회");
    expect(screen.queryByText("수정된 산악회 공지")).toBeNull();
  });

  it("deletes a group notice directly from the detail", async () => {
    renderWithClient(<GroupDetailScreen />);

    await screen.findByTestId("group-notice-delete-notice-2");
    fireEvent.press(screen.getByTestId("group-notice-delete-notice-2"));
    expect(screen.getByText("공지를 삭제하시겠습니까?")).toBeTruthy();
    fireEvent.press(screen.getAllByText("삭제").at(-1)!);

    await waitFor(
      () =>
        expect(screen.queryByTestId("group-notice-delete-notice-2")).toBeNull(),
      { timeout: 5000 },
    );
    expect(screen.queryByText("신규 멤버 환영합니다")).toBeNull();
  });

  it("renders the group members screen", async () => {
    renderWithClient(<GroupMembersScreen />);

    expect(screen.getByText("멤버 관리")).toBeTruthy();
    expect(await screen.findByText("전체 8명")).toBeTruthy();
    expect(screen.getByText("소모임장")).toBeTruthy();
  });

  it("renders the group leader transfer screen and selects a member", async () => {
    jest
      .mocked(useLocalSearchParams)
      .mockReturnValue({ id: "1", mode: "transfer" });
    renderWithClient(<GroupMembersScreen />);

    expect(screen.getByText("소모임장 이관")).toBeTruthy();
    expect(
      await screen.findByText(
        "이관 후에는 일반 멤버로 변경되며 권한이 즉시 사라집니다.",
      ),
    ).toBeTruthy();

    const transferButton = screen.getByTestId("group-transfer-submit");
    expect(transferButton).toBeTruthy();

    const transferLeader = jest
      .spyOn(groupService, "transferGroupLeader")
      .mockResolvedValue(undefined);
    const memberCandidate = await screen.findByTestId(
      "member-transfer-member-002",
    );
    fireEvent.press(memberCandidate);
    fireEvent.press(transferButton);

    expect(
      screen.getByText(
        "이관 즉시 본인은 일반 멤버로 변경되며 되돌릴 수 없습니다.",
      ),
    ).toBeTruthy();
    fireEvent.press(screen.getByText("이관"));
    await waitFor(() =>
      expect(transferLeader).toHaveBeenCalledWith({
        groupId: "1",
        newLeaderUserId: "member-002",
      }),
    );

    jest.mocked(useLocalSearchParams).mockReturnValue({});
  });

  it("renders the prayer detail screen in empty state", () => {
    renderWithClient(<PrayerDetailScreen />);

    expect(screen.getByText("월요일 오전 기도방")).toBeTruthy();
    expect(screen.getByText("기도할 제목이 없어요")).toBeTruthy();
    expect(
      screen.getByText("새 기도제목이 승인되면 이곳에 표시됩니다."),
    ).toBeTruthy();

    // Switch to answers tab
    fireEvent.press(screen.getByRole("tab", { name: "응답" }));
    expect(screen.getByText("응답완료된 기도제목이 없어요")).toBeTruthy();

    // Switch to status tab
    fireEvent.press(screen.getByRole("tab", { name: "현황" }));
    expect(screen.getByText("기도 현황")).toBeTruthy();
    expect(screen.getByText("기도 완료한 성도")).toBeTruthy();
    expect(screen.getByText("기도 완료 현황이 없어요")).toBeTruthy();
  });

  it("shows an error with retry instead of an empty list when the prayer topic board fails", async () => {
    jest
      .spyOn(prayerService, "fetchPrayerTopicBoard")
      .mockRejectedValueOnce(new Error("INVALID_RESPONSE"));
    renderWithClient(<PrayerDetailScreen />);

    expect(
      await screen.findByText(
        "기도제목을 불러오지 못했어요. 다시 시도해주세요.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("기도할 제목이 없어요")).toBeNull();
  });

  it("shows an error with retry instead of an empty status when the prayer status fails", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "1" });
    jest
      .spyOn(prayerService, "fetchPrayerCohortStatus")
      .mockRejectedValue(new Error("INVALID_RESPONSE"));
    renderWithClient(<PrayerDetailScreen />);

    fireEvent.press(screen.getByRole("tab", { name: "현황" }));
    expect(
      await screen.findByText(
        "기도 현황을 불러오지 못했어요. 다시 시도해주세요.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("기도 완료 현황이 없어요")).toBeNull();
  });

  it("renders the prayer detail screen with topics and completion toggle", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "1" });
    jest.spyOn(prayerService, "fetchPrayerCohortStatus").mockResolvedValueOnce({
      cohortId: 1,
      cohortName: "화요일 오후 기도방",
      weekStartDate: "2026-10-26",
      scheduledDate: "2026-10-27",
      myCompleted: false,
      canComplete: true,
      completedCount: 3,
      notCompletedCount: 1,
      totalMembers: 4,
      completionRate: 75,
      completed: [
        {
          userId: "1",
          userName: "김은혜",
          userPhone: "010-0000-0001",
          memberRole: "MEMBER",
          completionId: 10,
          completedAt: "2026-10-27T10:00:00Z",
          likeCount: 0,
          liked: false,
        },
      ],
      notCompleted: [
        {
          userId: "2",
          userName: "한수연",
          userPhone: "010-0000-0002",
          memberRole: "MEMBER",
          completionId: null,
          completedAt: null,
          likeCount: 0,
          liked: false,
        },
      ],
    });
    jest.spyOn(prayerService, "fetchPrayerTopicBoard").mockResolvedValue({
      emergency: [
        {
          id: 1,
          categoryId: 1,
          categoryName: "건강",
          title: "긴급 수술 회복",
          content: "회복을 위해 기도 부탁드립니다.",
          status: "OPEN",
          rejectReason: null,
          writerName: "이성도",
          mine: false,
          emergency: true,
          emergencyEndAt: null,
          answerContent: null,
          answeredAt: null,
          createdAt: "2026-10-28",
        },
      ],
      ongoing: [
        {
          id: 2,
          categoryId: 2,
          categoryName: "진로",
          title: "새로운 자리 적응",
          content: "진행 중인 기도제목입니다.",
          status: "OPEN",
          rejectReason: null,
          writerName: "박성도",
          mine: false,
          emergency: false,
          emergencyEndAt: null,
          answerContent: null,
          answeredAt: null,
          createdAt: "2026-10-28",
        },
      ],
      recentAnswers: [
        {
          id: 3,
          categoryId: 3,
          categoryName: "직장",
          title: "취업 응답 감사",
          content: "새로운 부서로 발령받아 적응 중입니다.",
          status: "ANSWERED",
          rejectReason: null,
          writerName: "최성도",
          mine: false,
          emergency: false,
          emergencyEndAt: null,
          answerContent:
            "첫 주를 잘 마쳤고 팀 안에서 좋은 도움을 받고 있습니다.",
          answeredAt: "2026-10-28",
          createdAt: "2026-10-28",
        },
      ],
    });

    renderWithClient(<PrayerDetailScreen />);

    expect(await screen.findByText("화요일 오후 기도방")).toBeTruthy();
    expect(screen.getByText("긴급 기도제목")).toBeTruthy();
    expect(screen.getByText("오늘 기도 완료")).toBeTruthy();
    expect(screen.getByText("75%")).toBeTruthy();

    // Toggle prayer completion
    const completedStatus = {
      cohortId: 1,
      cohortName: "화요일 오후 기도방",
      weekStartDate: "2026-10-26",
      scheduledDate: "2026-10-27",
      myCompleted: true,
      canComplete: true,
      completedCount: 4,
      notCompletedCount: 0,
      totalMembers: 4,
      completionRate: 100,
      completed: [
        {
          userId: "1",
          userName: "김은혜",
          userPhone: "010-0000-0001",
          memberRole: "MEMBER" as const,
          completionId: 10,
          completedAt: "2026-10-27T10:00:00Z",
          likeCount: 0,
          liked: false,
        },
      ],
      notCompleted: [
        {
          userId: "2",
          userName: "한수연",
          userPhone: "010-0000-0002",
          memberRole: "MEMBER" as const,
          completionId: null,
          completedAt: null,
          likeCount: 0,
          liked: false,
        },
      ],
    };
    jest
      .spyOn(prayerService, "completePrayerCohort")
      .mockResolvedValueOnce(completedStatus);
    jest
      .spyOn(prayerService, "fetchPrayerCohortStatus")
      .mockResolvedValueOnce(completedStatus);
    fireEvent.press(screen.getByText("오늘 기도 완료"));
    expect(await screen.findByText("오늘 기도 완료됨")).toBeTruthy();

    // Switch to answers tab
    fireEvent.press(screen.getByRole("tab", { name: "응답" }));
    expect(screen.getByText("취업 응답 감사")).toBeTruthy();
    expect(
      screen.getByText(
        "첫 주를 잘 마쳤고 팀 안에서 좋은 도움을 받고 있습니다.",
      ),
    ).toBeTruthy();

    // Switch to status tab
    fireEvent.press(screen.getByRole("tab", { name: "현황" }));
    expect(screen.getByText("기도 현황")).toBeTruthy();
    expect(screen.getByText("기도 완료한 성도")).toBeTruthy();
    expect(screen.getByText("김은혜")).toBeTruthy();
    expect(screen.getByText("아직 완료 전")).toBeTruthy();
    expect(screen.getByText("한수연")).toBeTruthy();

    jest.mocked(useLocalSearchParams).mockReturnValue({});
  });

  it("renders the direct prayer screen", async () => {
    jest.mocked(router.push).mockClear();
    renderWithClient(<PrayerScreen />);

    expect(screen.getByText("함께 기도하고 응답을 나눠요")).toBeTruthy();
    expect(await screen.findByText("내 기도방")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("기도 신청 메뉴"));
    expect(screen.getByTestId("prayer-fab-backdrop")).toBeTruthy();
    fireEvent.press(screen.getByTestId("prayer-fab-backdrop"));
    expect(screen.queryByTestId("prayer-fab-backdrop")).toBeNull();

    fireEvent.press(screen.getByLabelText("기도 신청 메뉴"));
    fireEvent.press(screen.getByLabelText("기도제목 작성"));
    expect(router.push).toHaveBeenCalledWith("/modal/prayer-new");
    expect(
      screen.getByTestId("prayer-request-section-header-view-all-icon"),
    ).toBeTruthy();
    expect(screen.queryByText("삶공부")).toBeNull();
  });

  it("opens prayer cards and application actions", async () => {
    jest.mocked(router.push).mockClear();
    renderWithClient(<PrayerScreen />);
    await screen.findByText("내 기도방");

    expect(screen.getAllByText("기도방 보기")).toHaveLength(2);
    expect(
      screen.getByTestId("prayer-room-prayer-overview-room-mon-am-action"),
    ).toBeTruthy();

    fireEvent.press(screen.getByText("월요일 오전"));
    expect(router.push).toHaveBeenCalledWith(
      "/prayer/prayer-overview-room-mon-am",
    );
    fireEvent.press(screen.getByLabelText("기도 신청 메뉴"));
    fireEvent.press(screen.getByLabelText("중보기도 신청"));
    expect(router.push).toHaveBeenCalledWith("/prayer/apply");
    fireEvent.press(screen.getByLabelText("내 기도제목 전체보기"));
    expect(router.push).toHaveBeenCalledWith("/prayer/request");

    const requestCard = screen.getByTestId(
      "prayer-request-card-prayer-overview-request-1",
    );
    expect(requestCard.props.accessibilityRole).toBeUndefined();
    expect(requestCard.props.onPress).toBeUndefined();
  });

  it("renders empty states when prayer rooms and requests are empty", async () => {
    jest.spyOn(prayerService, "fetchPrayerOverview").mockResolvedValueOnce({
      rooms: [],
      requests: [],
    });

    renderWithClient(<PrayerScreen />);

    expect(await screen.findByTestId("prayer-rooms-empty")).toBeTruthy();
    expect(screen.getByText("참여 중인 기도방이 없어요")).toBeTruthy();
    expect(screen.getByTestId("prayer-requests-empty")).toBeTruthy();
    expect(screen.getByText("등록된 기도제목이 없어요")).toBeTruthy();
  });

  it("renders the prayer apply screen", () => {
    renderWithClient(<PrayerApplyScreenRoute />);

    expect(screen.getByText("기도방 참여 신청")).toBeTruthy();
    expect(screen.getByText("1. 요일 선택")).toBeTruthy();
    expect(screen.getByText("월요일 오전 기도방 신청하기")).toBeTruthy();
  });

  it("renders the prayer request screen", () => {
    renderWithClient(<PrayerRequestScreenRoute />);

    expect(screen.getByText("내 기도제목")).toBeTruthy();
    expect(screen.getByText("기도제목은 승인 후 공개됩니다")).toBeTruthy();
    expect(screen.getByText("응답완료 요청하기")).toBeTruthy();
  });

  it("renders the life study detail screen", async () => {
    renderWithClient(<LifeStudyDetailScreen />);

    expect(await screen.findByText("생명의 삶")).toBeTruthy();
    expect(screen.getByText("신청 안내")).toBeTruthy();
    expect(screen.getByText("커리큘럼")).toBeTruthy();
  });

  it("shows an error instead of an empty curriculum when the cohort detail fails", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({
      id: "life-overview-open-1",
      cohortId: "cohort-1",
    });
    jest
      .spyOn(lifeStudyService, "fetchLifeStudyCohortDetail")
      .mockRejectedValue(new Error("INVALID_RESPONSE"));
    renderWithClient(<LifeStudyDetailScreen />);

    expect(
      await screen.findByText(
        "커리큘럼을 불러오지 못했어요. 다시 시도해주세요.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("등록된 커리큘럼이 없어요")).toBeNull();
  });

  it("renders the direct life study screen", async () => {
    jest.mocked(router.push).mockClear();
    renderWithClient(<LifeStudyScreen />);

    expect(screen.getByText("말씀으로 배우고 삶으로 자라가요")).toBeTruthy();
    expect(await screen.findByText("내 학습경로")).toBeTruthy();
    expect(screen.queryByText("중보기도")).toBeNull();
    expect(screen.queryByLabelText("삶공부 신청")).toBeNull();
    expect(screen.getAllByText("수강 신청").length).toBeGreaterThan(0);
    expect(screen.getAllByText("과정 확인").length).toBeGreaterThan(0);
  });

  it("shows two open cohorts of the same course without a duplicate key warning", async () => {
    const openCohort = {
      id: "4",
      title: "생명의 삶",
      kind: "required" as const,
      weekCount: 13,
      instructorName: "박귀원",
      summary: "신앙의 근본을 바로 세우는 가장 기본 과정",
      applicationPeriod: "6.24 ~ 7.05",
      capacity: 24,
      enrolledCount: 18,
    };
    jest
      .spyOn(lifeStudyService, "fetchLifeStudyOverview")
      .mockResolvedValueOnce({
        path: {
          completedRequired: 1,
          totalRequired: 5,
          nextRecommendation: "생명언어의 삶",
          eligibility: "생명의 삶 이후 가능",
        },
        openCourses: [
          { ...openCohort, cohortId: "1", cohortNumber: 1 },
          { ...openCohort, cohortId: "2", cohortNumber: 2 },
        ],
        courses: [],
      });
    const consoleError = jest.spyOn(console, "error");

    renderWithClient(<LifeStudyScreen />);
    await screen.findByText("내 학습경로");

    expect(screen.getAllByText("생명의 삶").length).toBeGreaterThanOrEqual(2);
    expect(
      consoleError.mock.calls.some((args) =>
        String(args[0]).includes("same key"),
      ),
    ).toBe(false);
    consoleError.mockRestore();
  });

  it("opens a life study course", async () => {
    jest.mocked(router.push).mockClear();
    renderWithClient(<LifeStudyScreen />);
    await screen.findByText("내 학습경로");

    fireEvent.press(screen.getAllByText("생명의 삶")[0]);
    expect(router.push).toHaveBeenCalledWith(
      "/life-study/life-overview-open-1",
    );
  });

  it("renders the life study apply screen", () => {
    renderWithClient(<LifeStudyApplyScreenRoute />);

    expect(screen.getByText("수강 신청")).toBeTruthy();
    expect(screen.getByText("신앙 연차")).toBeTruthy();
    expect(screen.getByText("수강 신청하기")).toBeTruthy();
  });

  it("renders the life study history screen", async () => {
    renderWithClient(<LifeStudyHistoryScreen />);

    expect(screen.getByText("수강 내역")).toBeTruthy();
    expect(screen.getByText("내 수료 기록")).toBeTruthy();
    expect(await screen.findByText("말씀통독의 삶")).toBeTruthy();
  });

  it("renders the my page screen", () => {
    const back = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ back } as never);
    renderWithClient(<MyPageScreen />);

    expect(screen.getByText("마이페이지")).toBeTruthy();
    expect(screen.getByText("활동 관리")).toBeTruthy();
    expect(screen.getByText("개인정보 처리방침")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("뒤로"));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("shows confirmation dialog and clears the session on confirmed logout", async () => {
    const logout = jest
      .spyOn(authService, "logout")
      .mockRejectedValueOnce(new Error("keystore delete failed"));
    const replace = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ replace } as never);
    renderWithClient(<MyPageScreen />);

    fireEvent.press(screen.getByTestId("mypage-logout"));
    expect(screen.getByText("로그아웃 하시겠어요?")).toBeTruthy();

    const logoutButtons = screen.getAllByText("로그아웃");
    fireEvent.press(logoutButtons[logoutButtons.length - 1]);

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith("/login");
    });
  });

  it("closes the logout dialog when cancelled", () => {
    renderWithClient(<MyPageScreen />);

    fireEvent.press(screen.getByTestId("mypage-logout"));
    expect(screen.getByText("로그아웃 하시겠어요?")).toBeTruthy();

    fireEvent.press(screen.getByText("취소"));
    expect(screen.queryByText("로그아웃 하시겠어요?")).toBeNull();
  });

  it("renders the profile edit screen", () => {
    renderWithClient(<EditProfileScreen />);

    expect(screen.getByText("프로필 수정")).toBeTruthy();
    expect(screen.getByText("이름과 프로필은 변경할 수 없어요")).toBeTruthy();
    expect(screen.getByPlaceholderText("현재 비밀번호")).toBeTruthy();
  });

  it("renders the activity screen", async () => {
    renderWithClient(<ActivityScreen />);

    expect(screen.getByText("활동 내역")).toBeTruthy();
    expect(screen.getByText("나눔 게시글")).toBeTruthy();
    expect(await screen.findByText("유아용 카시트 나눔해요")).toBeTruthy();
  });

  it("renders the user profile screen", () => {
    renderWithClient(<UserProfileScreen />);

    expect(screen.getByText("프로필")).toBeTruthy();
    expect(screen.getByText("박정아")).toBeTruthy();
  });

  it("renders the FAQ screen", async () => {
    jest.spyOn(siteContentService, "getFaqs").mockResolvedValueOnce([
      {
        id: 1,
        name: "계정",
        faqs: [
          {
            id: 1,
            question: "회원가입은 어떻게 하나요?",
            answer:
              "로그인 화면에서 회원가입을 선택한 뒤 약관 동의와 기본 정보를 입력하면 가입할 수 있습니다.",
          },
        ],
      },
    ]);

    renderWithClient(<FaqScreen />);

    expect(screen.getByText("자주 묻는 질문")).toBeTruthy();
    expect(await screen.findByText("회원가입은 어떻게 하나요?")).toBeTruthy();
    expect(screen.getByText("전체")).toBeTruthy();
    expect(screen.getByText("계정")).toBeTruthy();
  });

  it("shows an error instead of an empty FAQ list when the FAQ fetch fails", async () => {
    jest
      .spyOn(siteContentService, "getFaqs")
      .mockRejectedValue(new Error("INVALID_RESPONSE"));
    renderWithClient(<FaqScreen />);

    expect(
      await screen.findByText(
        "자주 묻는 질문을 불러오지 못했어요. 다시 시도해주세요.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("등록된 FAQ가 없어요")).toBeNull();
  });

  it("renders the blocked users screen", () => {
    renderWithClient(<BlockedScreen />);

    expect(screen.getByText("차단 사용자")).toBeTruthy();
    expect(screen.getByText("이모씨")).toBeTruthy();
    expect(screen.getAllByText("차단 해제").length).toBeGreaterThan(0);
  });

  it("renders the withdraw screen", () => {
    renderWithClient(<WithdrawScreen />);

    expect(screen.getByText("회원 탈퇴")).toBeTruthy();
    expect(screen.getByText("정말 떠나시나요?")).toBeTruthy();
    expect(screen.getByText("탈퇴하기")).toBeTruthy();
  });

  it("renders the legal document screen", async () => {
    jest
      .spyOn(siteContentService, "getActiveSitePolicy")
      .mockResolvedValueOnce({
        id: 1,
        policyType: 1,
        title: "서비스 이용약관",
        content: "제1조 (목적)\n약관 내용입니다.",
        enforcedAt: "2026-01-01",
      });

    renderWithClient(<MyPageTermsScreen />);

    expect(await screen.findByText("서비스 이용약관")).toBeTruthy();
    expect(screen.getByText("시행일자: 2026년 1월 1일")).toBeTruthy();
    expect(screen.getByText(/제1조 \(목적\)/)).toBeTruthy();
  });

  it("shows an error instead of an empty document when the policy fetch fails", async () => {
    jest
      .spyOn(siteContentService, "getActiveSitePolicy")
      .mockRejectedValue(new Error("INVALID_RESPONSE"));
    renderWithClient(<MyPageTermsScreen />);

    expect(
      await screen.findByText("약관을 불러오지 못했어요. 다시 시도해주세요."),
    ).toBeTruthy();
    expect(screen.queryByText("등록된 약관이 없어요")).toBeNull();
  });
});
