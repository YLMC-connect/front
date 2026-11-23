import { renderHook } from "@testing-library/react-native";
import { useNavigation } from "expo-router";
import { useTabReselect } from "../useTabReselect";

type Listener = (event: { defaultPrevented?: boolean }) => void;

function setupNavigation({ focused = true } = {}) {
  const listeners: Listener[] = [];
  const tab = {
    getState: () => ({ type: "tab" }),
    getParent: () => undefined,
    isFocused: () => true,
    addListener: jest.fn((_type: string, listener: Listener) => {
      listeners.push(listener);
      return () => listeners.splice(listeners.indexOf(listener), 1);
    }),
  };
  const stackScreen = {
    getState: () => ({ type: "stack" }),
    getParent: () => tab,
    isFocused: () => focused,
    addListener: jest.fn(() => () => undefined),
  };
  jest.mocked(useNavigation).mockReturnValue(stackScreen as never);
  return {
    tab,
    press: (event: { defaultPrevented?: boolean } = {}) =>
      listeners.forEach((listener) => listener(event)),
    listenerCount: () => listeners.length,
  };
}

describe("useTabReselect", () => {
  beforeEach(() => {
    jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls the callback when the focused tab is pressed again", () => {
    const nav = setupNavigation();
    const onReselect = jest.fn();
    renderHook(() => useTabReselect(onReselect));

    expect(nav.tab.addListener).toHaveBeenCalledWith(
      "tabPress",
      expect.any(Function),
    );
    nav.press();
    expect(onReselect).toHaveBeenCalledTimes(1);
  });

  it("does nothing when this screen is not focused (e.g. a detail screen is on top)", () => {
    const nav = setupNavigation({ focused: false });
    const onReselect = jest.fn();
    renderHook(() => useTabReselect(onReselect));

    nav.press();
    expect(onReselect).not.toHaveBeenCalled();
  });

  it("respects preventDefault and unsubscribes on unmount", () => {
    const nav = setupNavigation();
    const onReselect = jest.fn();
    const { unmount } = renderHook(() => useTabReselect(onReselect));

    nav.press({ defaultPrevented: true });
    expect(onReselect).not.toHaveBeenCalled();

    unmount();
    expect(nav.listenerCount()).toBe(0);
  });
});
