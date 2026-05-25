import { screen } from "@testing-library/react-native";
import FaithScreen from "../faith";
import GroupScreen from "../group";
import HomeScreen from "../index";
import MarketScreen from "../market";
import MyPageScreen from "../mypage";
import { renderWithClient } from "../../../src/test/renderWithClient";

describe("v1 tab smoke screens", () => {
  it("renders the home screen with mock content", async () => {
    renderWithClient(<HomeScreen />);

    expect(screen.getByTestId("screen-home")).toBeTruthy();
    expect(await screen.findByText("최근 나눔 물품")).toBeTruthy();
  });

  it("renders the market screen with the active sharing tab", async () => {
    renderWithClient(<MarketScreen />);

    expect(screen.getByTestId("screen-market")).toBeTruthy();
    expect(await screen.findByText("나눔중")).toBeTruthy();
  });

  it("renders the group screen with mock groups", async () => {
    renderWithClient(<GroupScreen />);

    expect(screen.getByTestId("screen-group")).toBeTruthy();
    expect(await screen.findByText("소모임")).toBeTruthy();
  });

  it("renders the faith tab with prayer and study segments", async () => {
    renderWithClient(<FaithScreen />);

    expect(screen.getByTestId("screen-faith")).toBeTruthy();
    expect(await screen.findByText("중보기도")).toBeTruthy();
    expect(await screen.findByText("삶공부")).toBeTruthy();
    expect(await screen.findByText("다른 기도모임방")).toBeTruthy();
  });

  it("renders the my page screen with mock profile data", async () => {
    renderWithClient(<MyPageScreen />);

    expect(screen.getByTestId("screen-mypage")).toBeTruthy();
    expect(await screen.findByText("내 활동")).toBeTruthy();
    expect(await screen.findByText("회원탈퇴")).toBeTruthy();
  });
});
