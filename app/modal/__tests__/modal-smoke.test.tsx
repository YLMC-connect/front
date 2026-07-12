import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import GroupNewModal from "../group-new";
import MarketNewModal from "../market-new";
import { renderWithClient } from "../../../src/test/renderWithClient";

describe("modal smoke screens", () => {
  const router = { back: jest.fn(), push: jest.fn(), replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useRouter).mockReturnValue(router as never);
  });

  it("renders the market create modal", () => {
    renderWithClient(<MarketNewModal />);

    expect(screen.getAllByText("나눔 등록")).toHaveLength(2);
    expect(screen.getByText("사진 0/5")).toBeTruthy();
    expect(screen.getByText("사용감 있음")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("제목을 입력해주세요 (최대 30자)"),
    ).toBeTruthy();
  });

  it("renders the group create modal", () => {
    renderWithClient(<GroupNewModal />);

    expect(screen.getAllByText("소모임 개설")).toHaveLength(2);
    expect(screen.getByText("운동·건강")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("소모임 이름을 입력해주세요 (최대 20자)"),
    ).toBeTruthy();
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
});
