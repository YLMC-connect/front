import { act, renderHook } from "@testing-library/react-native";
import { theme } from "../../constants/theme";
import { useMotionRouteParam } from "../useMotionRouteParam";

type Category = "all" | "book" | "etc";

describe("useMotionRouteParam", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("keeps the visual value immediate and commits only the latest selection", () => {
    jest.useFakeTimers();
    const onCommit = jest.fn();
    const { result } = renderHook(() =>
      useMotionRouteParam<Category>("all", onCommit),
    );

    act(() => result.current[1]("book"));
    expect(result.current[0]).toBe("book");
    expect(onCommit).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(theme.motion.duration.base / 2);
      result.current[1]("etc");
      jest.advanceTimersByTime(theme.motion.duration.base - 1);
    });
    expect(onCommit).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith("etc");
  });

  it("cancels a pending route update when the screen unmounts", () => {
    jest.useFakeTimers();
    const onCommit = jest.fn();
    const { result, unmount } = renderHook(() =>
      useMotionRouteParam<Category>("all", onCommit),
    );

    act(() => result.current[1]("book"));
    unmount();
    act(() => jest.runAllTimers());

    expect(onCommit).not.toHaveBeenCalled();
  });
});
