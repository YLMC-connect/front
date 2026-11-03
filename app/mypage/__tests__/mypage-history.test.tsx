import { screen } from "@testing-library/react-native";
import PrayerHistoryScreen from "../prayer-history";
import LifeStudyHistoryScreen from "../life-study-history";
import { renderWithClient } from "../../../src/test/renderWithClient";

describe("mypage history screens", () => {
  it("renders prayer history in mypage stack", () => {
    renderWithClient(<PrayerHistoryScreen />);
    expect(screen.getByText("내 기도제목")).toBeTruthy();
  });

  it("renders life study history in mypage stack", () => {
    renderWithClient(<LifeStudyHistoryScreen />);
    expect(screen.getByText("수강 내역")).toBeTruthy();
  });
});
