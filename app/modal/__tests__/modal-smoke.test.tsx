import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Keyboard, StyleSheet } from "react-native";
import GroupNewModal from "../group-new";
import MarketNewModal from "../market-new";
import PrayerNewModal from "../prayer-new";
import { ConfirmDialog, ModalFormTextInput } from "../../../src/components/ui";
import { theme } from "../../../src/constants/theme";
import { renderWithClient } from "../../../src/test/renderWithClient";

describe("modal smoke screens", () => {
  const router = { back: jest.fn(), push: jest.fn(), replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue(router as never);
    jest.spyOn(Keyboard, "dismiss");
  });

  it("renders the market create modal", () => {
    renderWithClient(<MarketNewModal />);

    expect(screen.getAllByText("나눔 등록")).toHaveLength(2);
    expect(screen.getByLabelText("뒤로")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByLabelText("뒤로").props.style).marginLeft,
    ).toBeUndefined();
    expect(screen.queryByText("닫기")).toBeNull();
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
    fireEvent(titleInput, "focus");
    expect(StyleSheet.flatten(titleInput.props.style)).toMatchObject({
      borderColor: theme.colors.primary,
      borderWidth: 2,
      outlineColor: "transparent",
      outlineWidth: 0,
    });
  });

  it("renders the group create modal", () => {
    renderWithClient(<GroupNewModal />);

    expect(screen.getAllByText("소모임 개설")).toHaveLength(2);
    expect(screen.getByLabelText("뒤로")).toBeTruthy();
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
    const scheduleInput = screen.getByLabelText("소모임 일정");
    const locationInput = screen.getByLabelText("소모임 장소");
    expect(StyleSheet.flatten(capacityInput.props.style)).toMatchObject({
      height: 48,
    });
    expect(StyleSheet.flatten(scheduleInput.props.style)).toMatchObject({
      height: 48,
    });
    expect(StyleSheet.flatten(locationInput.props.style)).toMatchObject({
      height: 48,
    });
    expect(StyleSheet.flatten(capacityInput.props.style).height).toBe(
      StyleSheet.flatten(scheduleInput.props.style).height,
    );

    fireEvent(nameInput, "focus");
    expect(StyleSheet.flatten(nameInput.props.style)).toMatchObject({
      borderColor: theme.colors.primary,
      borderWidth: 2,
      outlineColor: "transparent",
      outlineWidth: 0,
    });
  });

  it("submits a valid market form and opens the created detail", async () => {
    jest
      .mocked(ImagePicker.requestMediaLibraryPermissionsAsync)
      .mockResolvedValue({ granted: true } as never);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://market.jpg" }],
    } as never);
    renderWithClient(<MarketNewModal />);

    fireEvent.press(screen.getByText("사진 추가"));
    await waitFor(() => expect(screen.getByText("사진 1/5")).toBeTruthy());
    fireEvent.changeText(screen.getByLabelText("나눔 제목"), "새 나눔");
    fireEvent.changeText(
      screen.getByLabelText("나눔 상세 설명"),
      "깨끗하게 사용한 물품입니다.",
    );
    fireEvent.changeText(screen.getByLabelText("나눔 수령 장소"), "교회 로비");
    fireEvent.press(screen.getAllByText("나눔 등록")[1]);

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith(
        expect.stringMatching(/^\/market\/mock-market-/),
      ),
    );
  });

  it("submits a valid group form and opens the created detail", async () => {
    renderWithClient(<GroupNewModal />);

    fireEvent.changeText(screen.getByLabelText("소모임 이름"), "새 소모임");
    fireEvent.changeText(
      screen.getByLabelText("소모임 설명"),
      "함께 말씀을 나누는 모임입니다.",
    );
    fireEvent.changeText(screen.getByLabelText("소모임 일정"), "매주 토요일");
    fireEvent.changeText(screen.getByLabelText("소모임 장소"), "교육관 2층");
    fireEvent.press(screen.getAllByText("소모임 개설")[1]);

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith(
        expect.stringMatching(/^\/group\/mock-group-/),
      ),
    );
  });

  it("renders the prayer create modal with top padding matching horizontal screen inset", () => {
    renderWithClient(<PrayerNewModal />);

    expect(screen.getByText("기도제목 등록")).toBeTruthy();
    expect(screen.getByLabelText("뒤로")).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByLabelText("뒤로").props.style).marginLeft,
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

  it("renders confirm dialog with horizontal padding matching bottom padding (16px)", () => {
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
      paddingHorizontal: 16,
      paddingBottom: 16,
    });
  });
});
