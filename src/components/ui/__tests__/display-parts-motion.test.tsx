import { fireEvent, render, screen } from "@testing-library/react-native";
import * as Reanimated from "react-native-reanimated";
import { theme } from "../../../constants/theme";
import { Accordion } from "../accordion";
import { InfoBox } from "../info-box";
import { motionEasing } from "../motion";
import { ProgressBar } from "../progress-bar";

describe("표시 부품 motion.md 곡선·터치 영역", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("ProgressBar 는 300ms standard 곡선으로 늘어난다", () => {
    const timing = jest.spyOn(Reanimated, "withTiming");
    render(<ProgressBar value={40} label="진행" />);

    expect(timing).toHaveBeenCalledWith(40, {
      duration: theme.motion.duration.slow,
      easing: motionEasing.standard,
    });
  });

  it("Accordion 은 200ms standard 로 펼치고 120ms exit 로 닫는다", () => {
    const timing = jest.spyOn(Reanimated, "withTiming");
    render(<Accordion title="질문">답</Accordion>);
    const header = screen.getByRole("button", { name: /질문/ });

    timing.mockClear();
    fireEvent.press(header);
    expect(timing).toHaveBeenCalledWith(1, {
      duration: theme.motion.duration.base,
      easing: motionEasing.standard,
    });

    timing.mockClear();
    fireEvent.press(header);
    expect(timing).toHaveBeenCalledWith(0, {
      duration: 120,
      easing: motionEasing.exit,
    });
  });

  it("InfoBox 행동 버튼은 위아래 44 누르는 영역을 가진다", () => {
    render(
      <InfoBox title="안내" action={{ label: "보기", onPress: jest.fn() }} />,
    );
    const action = screen.getByRole("button", { name: "보기" });
    const { top, bottom } = action.props.hitSlop;

    expect(
      top + bottom + theme.typography.caption.lineHeight,
    ).toBeGreaterThanOrEqual(44);
  });
});
