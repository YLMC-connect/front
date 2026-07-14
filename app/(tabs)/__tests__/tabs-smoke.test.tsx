import {
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react-native";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, StyleSheet } from "react-native";
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
import MyPageScreen from "../mypage";
import ActivityScreen from "../mypage/activity";
import BlockedScreen from "../mypage/blocked";
import EditProfileScreen from "../mypage/edit";
import FaqScreen from "../mypage/faq";
import MyPageTermsScreen from "../mypage/terms";
import UserProfileScreen from "../mypage/user/[id]";
import WithdrawScreen from "../mypage/withdraw";
import NotificationsScreen from "../notifications";
import PrayerDetailScreen from "../prayer/[id]";
import PrayerApplyScreenRoute from "../prayer/apply";
import PrayerScreen from "../prayer";
import PrayerRequestScreenRoute from "../prayer/request";
import { renderWithClient } from "../../../src/test/renderWithClient";
import * as authService from "../../../src/services/authService";

describe("v1 tab smoke screens", () => {
  it("renders the home screen", () => {
    renderWithClient(<HomeScreen />);

    expect(screen.getByText("열린문 커넥트")).toBeTruthy();
    expect(screen.getByText("오늘의 기도제목")).toBeTruthy();
    expect(screen.getByText("내 활동 요약")).toBeTruthy();
  });

  it("opens a home activity from the summary card", () => {
    const push = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ push } as never);
    renderWithClient(<HomeScreen />);

    fireEvent.press(screen.getByText("청년 1부 큐티모임 외 2개"));

    expect(push).toHaveBeenCalledWith("/group");
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
    fireEvent.press(screen.getByLabelText("글쓰기"));
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
  });

  it("filters and searches market posts", async () => {
    const setParams = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ setParams } as never);
    renderWithClient(<MarketScreen />);
    await screen.findByText(
      "아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)",
    );

    fireEvent.press(screen.getByText("도서·문구"));
    await waitFor(() =>
      expect(setParams).toHaveBeenCalledWith({ category: "book" }),
    );
    expect(screen.getByText("어린이 동화책 30권 묶음 나눔")).toBeTruthy();
    expect(
      screen.queryByText("아이 장난감 정리하면서 나눔합니다 (블록·인형 30점)"),
    ).toBeNull();

    fireEvent.scroll(screen.getByTestId("screen-market-scroll"), {
      nativeEvent: { contentOffset: { y: 13 } },
    });
    expect(
      screen.getByTestId("screen-market-sticky-controls", {
        includeHiddenElements: true,
      }).props.pointerEvents,
    ).toBe("none");

    fireEvent.press(screen.getByLabelText("나눔 검색"));
    expect(
      screen.getByTestId("screen-market-sticky-controls").props.pointerEvents,
    ).toBe("auto");
    expect(
      within(screen.getByTestId("market-sticky-controls-content")).getByTestId(
        "market-search-field-container",
      ),
    ).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText("나눔 검색어"), "동화책");
    expect(screen.getByText("어린이 동화책 30권 묶음 나눔")).toBeTruthy();
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
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "missing" });
    renderWithClient(<MarketDetailScreen />);

    expect(await screen.findByText("불러오지 못했습니다")).toBeTruthy();
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
      "rgba(20,30,18,0.22)",
      "rgba(20,30,18,0.10)",
      "rgba(20,30,18,0)",
    ]);
    expect(scrim.props.locations).toEqual([0, 0.52, 1]);
    expect(StyleSheet.flatten(scrim.props.style)).toMatchObject({ height: 88 });
    expect(
      StyleSheet.flatten(screen.getByLabelText("뒤로").props.style),
    ).toMatchObject({
      minWidth: 68,
      height: 44,
    });
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

  it("reports another member's comment and handles a duplicate", async () => {
    renderWithClient(<MarketDetailScreen />);

    await screen.findByTestId("market-comment-report-comment-1");
    fireEvent.press(screen.getByTestId("market-comment-report-comment-1"));
    fireEvent.press(screen.getByText("나눔을 빙자한 홍보·광고"));
    fireEvent.press(screen.getByText("신고하기"));

    expect(await screen.findByText("신고가 접수되었습니다")).toBeTruthy();

    fireEvent.press(screen.getByTestId("market-comment-report-comment-1"));
    fireEvent.press(screen.getByText("신고하기"));

    expect(await screen.findByText("이미 신고한 콘텐츠입니다")).toBeTruthy();
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
    expect(await screen.findByText("내 소모임")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("소모임 개설"));
    expect(push).toHaveBeenCalledWith("/modal/group-new");
    expect(
      within(screen.getByLabelText("내 소모임 전체보기")).getByText(
        "chevron-right",
      ),
    ).toBeTruthy();
    expect(screen.getByText("전체 모임")).toBeTruthy();
  });

  it("does not stack extra spacing below the group segment", async () => {
    renderWithClient(<GroupScreen />);
    await screen.findByText("내 소모임");

    expect(screen.getByTestId("group-my-section").props.style).toBeUndefined();
    expect(
      StyleSheet.flatten(
        screen.getByTestId("group-my-section-header").props.style,
      ),
    ).not.toHaveProperty("paddingTop");
  });

  it("joins the group category filter to sticky controls at its content anchor", async () => {
    renderWithClient(<GroupScreen />);
    await screen.findByText("내 소모임");

    fireEvent(screen.getByTestId("group-category-anchor"), "layout", {
      nativeEvent: { layout: { x: 0, y: 300, width: 430, height: 56 } },
    });
    fireEvent.scroll(screen.getByTestId("screen-group-scroll"), {
      nativeEvent: { contentOffset: { y: 299 } },
    });
    expect(screen.queryByTestId("group-sticky-controls-filter")).toBeNull();

    fireEvent.scroll(screen.getByTestId("screen-group-scroll"), {
      nativeEvent: { contentOffset: { y: 300 } },
    });
    expect(
      screen.getByTestId("screen-group-sticky-controls", {
        includeHiddenElements: true,
      }).props.pointerEvents,
    ).toBe("none");
    expect(
      screen.getByTestId("group-sticky-controls-filter", {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();

    fireEvent.scroll(screen.getByTestId("screen-group-scroll"), {
      nativeEvent: { contentOffset: { y: 295 } },
    });
    expect(screen.queryByTestId("group-sticky-controls-filter")).toBeNull();
    expect(screen.getByTestId("group-content-filter")).toBeTruthy();
    expect(
      screen.getByTestId("screen-group-sticky-controls").props.pointerEvents,
    ).toBe("auto");
    expect(screen.getByTestId("group-category-anchor")).toBeTruthy();
  });

  it("applies the group category filter only to the all-groups list", async () => {
    const setParams = jest.fn();
    jest
      .mocked(useRouter)
      .mockReturnValue({ push: jest.fn(), setParams } as never);
    renderWithClient(<GroupScreen />);
    await screen.findByText("내 소모임");

    const mySection = screen.getByTestId("group-my-section");
    expect(within(mySection).getByText("토요 산악회")).toBeTruthy();
    expect(within(mySection).getByText("독서 나눔")).toBeTruthy();
    expect(within(mySection).getByText("엄마들의 수다방")).toBeTruthy();

    fireEvent.press(screen.getByTestId("group-category-pray"));

    expect(within(mySection).getByText("토요 산악회")).toBeTruthy();
    expect(within(mySection).getByText("독서 나눔")).toBeTruthy();
    expect(within(mySection).getByText("엄마들의 수다방")).toBeTruthy();
    expect(screen.getByText("화요 새벽기도회")).toBeTruthy();
    expect(screen.queryByText("찬양 동아리")).toBeNull();
    await waitFor(() =>
      expect(setParams).toHaveBeenCalledWith({ category: "pray" }),
    );
  });

  it("updates the group segment without replacing the screen", async () => {
    const setParams = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ setParams } as never);
    renderWithClient(<GroupScreen />);
    await screen.findByText("내 소모임");

    fireEvent.press(screen.getByTestId("group-section-service"));

    await waitFor(() =>
      expect(setParams).toHaveBeenCalledWith({ section: "service" }),
    );
  });

  it("opens group search and filters the visible list", async () => {
    renderWithClient(<GroupScreen />);
    await screen.findByText("내 소모임");

    fireEvent.scroll(screen.getByTestId("screen-group-scroll"), {
      nativeEvent: { contentOffset: { y: 13 } },
    });
    expect(
      screen.getByTestId("screen-group-sticky-controls", {
        includeHiddenElements: true,
      }).props.pointerEvents,
    ).toBe("none");

    fireEvent.press(screen.getByLabelText("동행 검색"));
    expect(
      screen.getByTestId("screen-group-sticky-controls").props.pointerEvents,
    ).toBe("auto");
    expect(
      within(screen.getByTestId("group-sticky-controls-content")).getByTestId(
        "group-search-field-container",
      ),
    ).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText("동행 검색어"), "없는 모임");
    expect(screen.getAllByText("검색 결과가 없어요").length).toBeGreaterThan(0);
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
    expect(screen.getByLabelText("뒤로")).toBeTruthy();
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

  it("renders the prayer detail screen", () => {
    renderWithClient(<PrayerDetailScreen />);

    expect(screen.getByText("월요일 오전 기도방")).toBeTruthy();
    expect(screen.getByText("긴급 기도제목")).toBeTruthy();
    expect(screen.getByText("오늘 기도 완료")).toBeTruthy();
  });

  it("renders the direct prayer screen", async () => {
    jest.mocked(router.push).mockClear();
    renderWithClient(<PrayerScreen />);

    expect(screen.getByText("함께 기도하고 응답을 나눠요")).toBeTruthy();
    expect(await screen.findByText("내 기도방")).toBeTruthy();
    expect(screen.getByText("오늘의 기도 진행")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("기도제목 작성"));
    expect(router.push).toHaveBeenCalledWith("/modal/prayer-new");
    expect(
      within(screen.getByLabelText("내 기도제목 전체보기")).getByText(
        "chevron-right",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("삶공부")).toBeNull();
  });

  it("opens prayer cards and application actions", async () => {
    jest.mocked(router.push).mockClear();
    renderWithClient(<PrayerScreen />);
    await screen.findByText("내 기도방");

    fireEvent.press(screen.getByText("월요일 오전"));
    expect(router.push).toHaveBeenCalledWith(
      "/prayer/prayer-overview-room-mon-am",
    );
    fireEvent.press(screen.getAllByText("중보기도 신청").at(-1)!);
    expect(router.push).toHaveBeenCalledWith("/prayer/apply");
    fireEvent.press(screen.getByLabelText("내 기도제목 전체보기"));
    expect(router.push).toHaveBeenCalledWith("/prayer/request");
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

  it("renders the life study detail screen", () => {
    renderWithClient(<LifeStudyDetailScreen />);

    expect(screen.getByText("생명의 삶")).toBeTruthy();
    expect(screen.getByText("신청 안내")).toBeTruthy();
    expect(screen.getByText("커리큘럼")).toBeTruthy();
  });

  it("renders the direct life study screen", async () => {
    renderWithClient(<LifeStudyScreen />);

    expect(screen.getByText("말씀으로 배우고 삶으로 자라가요")).toBeTruthy();
    expect(await screen.findByText("내 학습경로")).toBeTruthy();
    expect(screen.queryByText("중보기도")).toBeNull();
  });

  it("searches life study courses and opens a course", async () => {
    jest.mocked(router.push).mockClear();
    renderWithClient(<LifeStudyScreen />);
    await screen.findByText("내 학습경로");

    fireEvent.press(screen.getByLabelText("삶공부 검색"));
    fireEvent.changeText(screen.getByLabelText("삶공부 검색어"), "생명의 삶");
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

  it("renders the life study history screen", () => {
    renderWithClient(<LifeStudyHistoryScreen />);

    expect(screen.getByText("수강 내역")).toBeTruthy();
    expect(screen.getByText("신청중")).toBeTruthy();
    expect(screen.getByText("수료 과목 2개")).toBeTruthy();
  });

  it("renders the my page screen", () => {
    renderWithClient(<MyPageScreen />);

    expect(screen.getByText("마이페이지")).toBeTruthy();
    expect(screen.getByText("활동 관리")).toBeTruthy();
    expect(screen.getByText("개인정보 처리방침")).toBeTruthy();
  });

  it("clears the session before leaving my page on logout", async () => {
    const logout = jest
      .spyOn(authService, "logout")
      .mockRejectedValueOnce(new Error("keystore delete failed"));
    const replace = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ replace } as never);
    renderWithClient(<MyPageScreen />);

    fireEvent.press(screen.getByText("로그아웃"));

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith("/login");
    });
  });

  it("renders the profile edit screen", () => {
    renderWithClient(<EditProfileScreen />);

    expect(screen.getByText("프로필 수정")).toBeTruthy();
    expect(screen.getByText("이름과 프로필은 변경할 수 없어요")).toBeTruthy();
    expect(screen.getByPlaceholderText("현재 비밀번호")).toBeTruthy();
  });

  it("renders the activity screen", () => {
    renderWithClient(<ActivityScreen />);

    expect(screen.getByText("활동 내역")).toBeTruthy();
    expect(screen.getByText("나눔 게시글")).toBeTruthy();
    expect(screen.getByText("유아용 카시트 나눔해요")).toBeTruthy();
  });

  it("renders the user profile screen", () => {
    renderWithClient(<UserProfileScreen />);

    expect(screen.getByText("프로필")).toBeTruthy();
    expect(screen.getByText("박정아")).toBeTruthy();
    expect(screen.getByText("차단")).toBeTruthy();
  });

  it("renders the FAQ screen", () => {
    renderWithClient(<FaqScreen />);

    expect(screen.getByText("자주 묻는 질문")).toBeTruthy();
    expect(screen.getByText("회원가입은 어떻게 하나요?")).toBeTruthy();
    expect(screen.getByText("전체")).toBeTruthy();
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

  it("renders the legal document screen", () => {
    renderWithClient(<MyPageTermsScreen />);

    expect(screen.getByText("이용약관")).toBeTruthy();
    expect(screen.getByText("시행일자: 2026년 1월 1일")).toBeTruthy();
    expect(screen.getByText("제1조 (목적)")).toBeTruthy();
  });

  it("renders the notifications screen", () => {
    renderWithClient(<NotificationsScreen />);

    expect(screen.getByText("알림")).toBeTruthy();
    expect(screen.getByText("오늘")).toBeTruthy();
    expect(screen.getByText("지난 알림")).toBeTruthy();
  });
});
