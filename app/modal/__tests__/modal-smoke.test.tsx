import { screen } from "@testing-library/react-native";
import GroupNewModal from "../group-new";
import MarketNewModal from "../market-new";
import { renderWithClient } from "../../../src/test/renderWithClient";

describe("modal smoke screens", () => {
  it("renders the market create modal", () => {
    renderWithClient(<MarketNewModal />);

    expect(screen.getByText("나눔 등록")).toBeTruthy();
    expect(screen.getByText("사진 0/5")).toBeTruthy();
    expect(screen.getByText("사용감 있음")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("제목을 입력해주세요 (최대 30자)"),
    ).toBeTruthy();
  });

  it("renders the group create modal", () => {
    renderWithClient(<GroupNewModal />);

    expect(screen.getByText("소모임 개설")).toBeTruthy();
    expect(screen.getByText("운동·건강")).toBeTruthy();
    expect(
      screen.getByPlaceholderText("소모임 이름을 입력해주세요 (최대 20자)"),
    ).toBeTruthy();
  });
});
