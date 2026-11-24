import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Keyboard, StyleSheet } from "react-native";
import GroupNewModal from "../group-new";
import MarketNewModal from "../market-new";
import PrayerNewModal from "../prayer-new";
import { ConfirmDialog, ModalFormTextInput } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { renderWithClient } from "../../../src/test/renderWithClient";
import * as groupService from "../../../src/services/groupService";
import * as marketService from "../../../src/services/marketService";
import * as prayerService from "../../../src/services/prayerService";

// 사진 축소는 resizeImage 단위 테스트에서 검증한다. 화면 테스트에선 원본 그대로.
jest.mock("../../../src/lib/resizeImage", () => ({
  prepareImageForUpload: jest.fn(),
  resizeImageForUpload: jest.fn(async (uri: string) => uri),
}));

function countFocusRings() {
  return screen.root.findAll(
    (node) =>
      typeof node.type === "string" &&
      StyleSheet.flatten(node.props.style)?.borderColor ===
        theme.colors.primary &&
      StyleSheet.flatten(node.props.style)?.borderWidth === 2,
  ).length;
}

describe("modal smoke screens", () => {
  const router = { back: jest.fn(), push: jest.fn(), replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue(router as never);
    jest.mocked(useLocalSearchParams).mockReturnValue({} as never);
    jest.spyOn(Keyboard, "dismiss");
    jest.spyOn(prayerService, "fetchPrayerCategories").mockResolvedValue([]);
    jest.spyOn(marketService, "fetchMarketCategories").mockResolvedValue([
      { code: "CLOTHING_ACC", name: "의류·잡화" },
      { code: "APPLIANCE_FURNITURE", name: "가전·가구" },
      { code: "BOOK_STATIONERY", name: "도서·문구" },
      { code: "BABY_KIDS", name: "유아·아동용품" },
      { code: "OTHER", name: "기타" },
    ]);
  });

  it("renders the market create modal", () => {
    renderWithClient(<MarketNewModal />);

    expect(screen.getAllByText("나눔 등록")).toHaveLength(2);
    // 입력 집중 화면이라 TopBar 는 뒤로 대신 닫기(×).
    expect(screen.getByLabelText("닫기")).toBeTruthy();
    expect(screen.queryByLabelText("뒤로")).toBeNull();
    expect(screen.getByLabelText("사진 추가")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByTestId("market-form-screen").props.style),
    ).toMatchObject({ paddingTop: theme.layout.screenX });
    expect(screen.getByText("사진 0/5")).toBeTruthy();
    expect(screen.getByText("사용감 있음")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("제목을 입력해주세요 (최대 30자)"),
    ).toBeTruthy();

    const titleInput = screen.getByLabelText("나눔 제목");
    expect(StyleSheet.flatten(titleInput.props.style)).toMatchObject({
      height: 48,
    });
    // 물품 상태 RadioRow 의 선택 층·라디오도 2px primary 라 포커스 전 개수를 기준으로 센다.
    const ringsBeforeFocus = countFocusRings();
    fireEvent(titleInput, "focus");
    expect(StyleSheet.flatten(titleInput.props.style)).toMatchObject({
      outlineColor: "transparent",
      outlineWidth: 0,
    });
    // 포커스 테두리는 입력창 위에 겹쳐 그리는 공통 InputSurface 고리(2px primary)
    expect(countFocusRings()).toBe(ringsBeforeFocus + 1);
  });

  it("renders the group create modal", () => {
    renderWithClient(<GroupNewModal />);

    expect(screen.getAllByText("소모임 개설")).toHaveLength(2);
    expect(screen.getByLabelText("닫기")).toBeTruthy();
    expect(screen.queryByText("닫기")).toBeNull();
    expect(
      StyleSheet.flatten(screen.getByTestId("group-form-screen").props.style),
    ).toMatchObject({ paddingTop: theme.layout.screenX });
    expect(screen.getByText("운동·건강")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("소모임 이름을 입력해주세요 (최대 20자)"),
    ).toBeTruthy();

    const nameInput = screen.getByLabelText("소모임 이름");
    expect(StyleSheet.flatten(nameInput.props.style)).toMatchObject({
      height: 48,
    });
    const capacityInput = screen.getByLabelText("소모임 최대인원");
    expect(StyleSheet.flatten(capacityInput.props.style)).toMatchObject({
      height: 48,
    });
    // 일정·장소는 선택 입력이고, 가입 승인은 기본 꺼짐이다 (#301 #317)
    expect(screen.getByLabelText("모임 일정").props.value).toBe("");
    expect(screen.getByLabelText("모임 장소").props.value).toBe("");
    fireEvent.press(screen.getByText("매주 토요일"));
    expect(screen.getByLabelText("모임 일정").props.value).toBe("매주 토요일");
    expect(
      screen.getByTestId("group-form-requires-approval").props
        .accessibilityState,
    ).toMatchObject({ checked: false });
    // 서버 코드가 없는 카테고리는 보이지 않는다.
    ["봉사", "목장", "선교", "카풀"].forEach((label) =>
      expect(screen.queryByText(label)).toBeNull(),
    );

    fireEvent(nameInput, "focus");
    expect(StyleSheet.flatten(nameInput.props.style)).toMatchObject({
      outlineColor: "transparent",
      outlineWidth: 0,
    });
    // 포커스 테두리는 입력창 위에 겹쳐 그리는 공통 InputSurface 고리(2px primary)
    expect(countFocusRings()).toBe(1);
  });

  it("shows a loading placeholder while market categories are loading", () => {
    jest
      .spyOn(marketService, "fetchMarketCategories")
      .mockReturnValue(new Promise(() => {}));
    renderWithClient(<MarketNewModal />);

    expect(screen.getByTestId("market-form-categories-loading")).toBeTruthy();
  });

  it("submits a valid market form and opens the created detail", async () => {
    jest.spyOn(marketService, "createMarketPost").mockResolvedValueOnce({
      id: "mock-market-1",
      thumbSeed: 1,
      images: ["file://market.jpg"],
      title: "새 나눔",
      content: "깨끗하게 사용한 물품입니다.",
      categoryCode: "OTHER",
      conditionLabel: "사용감 있음",
      status: "sharing",
      authorName: "김은혜",
      createdLabel: "방금 전",
      isMine: true,
      comments: [],
    });
    jest
      .mocked(ImagePicker.requestMediaLibraryPermissionsAsync)
      .mockResolvedValue({ granted: true } as never);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://market.jpg" }],
    } as never);
    renderWithClient(<MarketNewModal />);

    fireEvent.press(screen.getByLabelText("사진 추가"));
    await waitFor(() => expect(screen.getByText("사진 1/5")).toBeTruthy());
    expect(screen.getByLabelText("사진 1 삭제")).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText("나눔 제목"), "새 나눔");
    fireEvent.changeText(
      screen.getByLabelText("나눔 상세 설명"),
      "깨끗하게 사용한 물품입니다.",
    );
    fireEvent.changeText(screen.getByLabelText("나눔 수령 장소"), "교회 로비");
    // 카테고리 칩은 서버 목록으로 그린다
    fireEvent.press(await screen.findByText("기타"));
    fireEvent.press(screen.getAllByText("나눔 등록")[1]);

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith(
        expect.stringMatching(/^\/market\/mock-market-/),
      ),
    );
    expect(marketService.createMarketPost).toHaveBeenCalledWith(
      expect.objectContaining({ category: "OTHER" }),
    );
  });

  it("fills the market edit modal with the real post, not sample values", async () => {
    // id 가 넘어오면 수정 화면이고, 서버 글 내용으로 채운다
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "42" } as never);
    jest.spyOn(marketService, "fetchMarketDetail").mockResolvedValue({
      id: "42",
      thumbSeed: 1,
      images: ["https://example.com/share/42.jpg"],
      imageItems: [{ id: "7", url: "https://example.com/share/42.jpg" }],
      location: "교회 1층 로비",
      title: "겨울 패딩 나눔",
      content: "한 번 입은 패딩입니다.",
      categoryCode: "CLOTHING_ACC",
      conditionLabel: "새것",
      status: "sharing",
      authorName: "김은혜",
      createdLabel: "방금 전",
      isMine: true,
      comments: [],
    });
    const update = jest
      .spyOn(marketService, "updateMarketPost")
      .mockResolvedValue({} as never);

    renderWithClient(<MarketNewModal />);

    await waitFor(() =>
      expect(screen.getByLabelText("나눔 제목").props.value).toBe(
        "겨울 패딩 나눔",
      ),
    );
    expect(screen.getByLabelText("나눔 상세 설명").props.value).toBe(
      "한 번 입은 패딩입니다.",
    );
    expect(screen.getByText("나눔 수정")).toBeTruthy();
    // 수정에서도 사진을 더하거나 뺄 수 있다
    expect(screen.getByTestId("market-photo-0")).toBeTruthy();
    expect(screen.getByTestId("market-photo-add")).toBeTruthy();
    expect(screen.getByDisplayValue("교회 1층 로비")).toBeTruthy();
    expect(
      screen.queryByDisplayValue("아이 장난감 정리하면서 나눔합니다"),
    ).toBeNull();

    fireEvent.press(screen.getByText("수정 완료"));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        marketId: "42",
        title: "겨울 패딩 나눔",
        description: "한 번 입은 패딩입니다.",
        category: "CLOTHING_ACC",
        condition: "새것",
        location: "교회 1층 로비",
        images: ["https://example.com/share/42.jpg"],
        existingImages: [{ id: "7", url: "https://example.com/share/42.jpg" }],
      }),
    );
  });

  it("submits a valid group form and opens the created detail", async () => {
    jest.spyOn(groupService, "createGroup").mockResolvedValueOnce({
      id: "mock-group-1",
      name: "새 소모임",
      description: "함께 말씀을 나누는 모임입니다.",
      categoryLabel: "운동·건강",
      schedule: "",
      location: "",
      requiresApproval: false,
      pendingMembers: [],
      myApplicationStatus: null,
      currentMembers: 1,
      maxMembers: 10,
      status: "open",
      leaderName: "김은혜",
      isLeader: true,
      isJoined: true,
      members: ["김은혜"],
      notices: [],
    });
    renderWithClient(<GroupNewModal />);

    fireEvent.changeText(screen.getByLabelText("소모임 이름"), "새 소모임");
    fireEvent.changeText(
      screen.getByLabelText("소모임 설명"),
      "함께 말씀을 나누는 모임입니다.",
    );
    fireEvent.press(screen.getAllByText("소모임 개설")[1]);

    // 창을 닫고 목록 위에 상세를 쌓는다(뒤로가기가 목록으로 가게)
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith(
        expect.stringMatching(/^\/group\/mock-group-/),
      ),
    );
    expect(router.back).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("updates capacity with stepper buttons and quick preset chips", () => {
    renderWithClient(<GroupNewModal />);

    const capacityInput = screen.getByLabelText("소모임 최대인원");
    expect(capacityInput.props.value).toBe("10");

    fireEvent.press(screen.getByLabelText("정원 1명 증가"));
    expect(capacityInput.props.value).toBe("11");

    fireEvent.press(screen.getByLabelText("정원 1명 감소"));
    expect(capacityInput.props.value).toBe("10");

    fireEvent.press(screen.getByText("20명"));
    expect(capacityInput.props.value).toBe("20");
  });

  it("fills the group edit modal with the real group, not sample values", async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: "7" } as never);
    jest.spyOn(groupService, "fetchGroupDetail").mockResolvedValue({
      id: "7",
      name: "수요 기도회",
      description: "수요일 저녁에 함께 기도합니다.",
      categoryLabel: "기도모임",
      schedule: "매주 수요일 저녁 8시",
      location: "본당 2층",
      requiresApproval: true,
      pendingMembers: [],
      myApplicationStatus: null,
      currentMembers: 3,
      maxMembers: 12,
      status: "open",
      leaderName: "김은혜",
      isLeader: true,
      isJoined: true,
      members: ["김은혜"],
      notices: [],
    });
    const update = jest
      .spyOn(groupService, "updateGroup")
      .mockResolvedValue({} as never);

    renderWithClient(<GroupNewModal />);

    await waitFor(() =>
      expect(screen.getByLabelText("소모임 이름").props.value).toBe(
        "수요 기도회",
      ),
    );
    expect(screen.getByLabelText("소모임 설명").props.value).toBe(
      "수요일 저녁에 함께 기도합니다.",
    );
    expect(screen.getByLabelText("소모임 최대인원").props.value).toBe("12");
    expect(screen.queryByDisplayValue("토요 산악회")).toBeNull();
    expect(screen.getByLabelText("모임 일정").props.value).toBe(
      "매주 수요일 저녁 8시",
    );
    expect(screen.getByLabelText("모임 장소").props.value).toBe("본당 2층");

    fireEvent.press(screen.getByText("변경사항 저장"));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        groupId: "7",
        name: "수요 기도회",
        description: "수요일 저녁에 함께 기도합니다.",
        category: "pray",
        maxMembers: 12,
        schedule: "매주 수요일 저녁 8시",
        location: "본당 2층",
        requiresApproval: true,
      }),
    );
  });

  it("clears the preset chip highlight once capacity leaves the preset values", () => {
    renderWithClient(<GroupNewModal />);

    fireEvent.press(screen.getByText("8명"));
    expect(
      screen.getByTestId("group-form-capacity-8").props.accessibilityState,
    ).toEqual({ selected: true });

    // 9명은 빠른 선택에 없다. 8명 칩 강조가 남지 않는다.
    fireEvent.press(screen.getByLabelText("정원 1명 증가"));
    expect(
      screen.getByTestId("group-form-capacity-8").props.accessibilityState,
    ).toEqual({ selected: false });
  });

  it("renders the prayer create modal with top padding matching horizontal screen inset", () => {
    renderWithClient(<PrayerNewModal />);

    expect(screen.getAllByText("기도제목 등록")).toHaveLength(2);
    expect(screen.getByLabelText("닫기")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByLabelText("닫기").props.style).marginLeft,
    ).toBeUndefined();
    expect(
      StyleSheet.flatten(screen.getByTestId("prayer-form-screen").props.style),
    ).toMatchObject({ paddingTop: theme.layout.screenX });
  });

  it("supports size options in 4px increments and custom height prop on ModalFormTextInput", () => {
    renderWithClient(
      <>
        <ModalFormTextInput accessibilityLabel="sm-input" size="sm" />
        <ModalFormTextInput accessibilityLabel="md-input" size="md" />
        <ModalFormTextInput accessibilityLabel="lg-input" size="lg" />
        <ModalFormTextInput accessibilityLabel="custom-input" height={60} />
      </>,
    );

    expect(
      StyleSheet.flatten(screen.getByLabelText("sm-input").props.style),
    ).toMatchObject({ height: 44 });
    expect(
      StyleSheet.flatten(screen.getByLabelText("md-input").props.style),
    ).toMatchObject({ height: 48 });
    expect(
      StyleSheet.flatten(screen.getByLabelText("lg-input").props.style),
    ).toMatchObject({ height: 52 });
    expect(
      StyleSheet.flatten(screen.getByLabelText("custom-input").props.style),
    ).toMatchObject({ height: 60 });
  });

  it("renders confirm dialog with horizontal padding matching bottom padding (20px)", () => {
    renderWithClient(
      <ConfirmDialog
        visible
        title="작성을 그만둘까요?"
        message="입력한 내용은 저장되지 않습니다."
        confirmText="나가기"
        cancelText="취소"
        danger
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(screen.getByText("작성을 그만둘까요?")).toBeTruthy();
    expect(screen.getByText("나가기")).toBeTruthy();
    expect(screen.getByText("취소")).toBeTruthy();
    expect(
      StyleSheet.flatten(
        screen.getByTestId("confirm-dialog-panel").props.style,
      ),
    ).toMatchObject({
      paddingHorizontal: 20,
      paddingBottom: 20,
    });
  });
});
