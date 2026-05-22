import { screen } from "@testing-library/react-native";
import GroupScreen from "../group";
import HomeScreen from "../index";
import LifeStudyScreen from "../life-study";
import MarketScreen from "../market";
import MyPageScreen from "../mypage";
import PrayerScreen from "../prayer";
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

  it("renders the life study screen with course sections", async () => {
    renderWithClient(<LifeStudyScreen />);

    expect(screen.getByTestId("screen-life-study")).toBeTruthy();
    expect(await screen.findByText("신청가능·진행중")).toBeTruthy();
  });

  it("renders the prayer screen with prayer room sections", async () => {
    renderWithClient(<PrayerScreen />);

    expect(screen.getByTestId("screen-prayer")).toBeTruthy();
    expect(await screen.findByText("다른 기도모임방")).toBeTruthy();
  });

  it("renders the my page screen with mock profile data", async () => {
    renderWithClient(<MyPageScreen />);

    expect(screen.getByTestId("screen-mypage")).toBeTruthy();
    expect(await screen.findByText("활동 관리")).toBeTruthy();
  });
});
